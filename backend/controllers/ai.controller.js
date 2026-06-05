import { GoogleGenAI } from '@google/genai';
import { db } from '../db.js';
import { callGeminiWithRetry } from '../utils/gemini.helper.js';

export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lessonId } = req.query;
    const chat = db.data.chats.find(
      (c) => c.userId === userId && c.lessonId === (lessonId || null)
    );
    res.json(chat ? chat.messages : []);
  } catch (error) {
    res.status(500).json({ error: 'Error al cargar el historial del chat.' });
  }
};

export const postChat = async (req, res) => {
  try {
    const { message, lessonId, activeStyle } = req.body;
    const user = db.data.users.find((u) => u.id === req.user.id);
    
    const isTeacher = user?.role === 'teacher';
    const style = activeStyle || user?.cognitiveProfile?.primary || 'visual';

    // 1. Obtener o inicializar historial de chat en la BD
    let chat = db.data.chats.find(
      (c) => c.userId === req.user.id && c.lessonId === (lessonId || null)
    );
    if (!chat) {
      chat = {
        id: `chat_${Date.now()}`,
        userId: req.user.id,
        lessonId: lessonId || null,
        messages: []
      };
      db.data.chats.push(chat);
    }

    // 2. Guardar mensaje del estudiante o docente
    const studentMsg = {
      id: `msg_${Date.now()}`,
      text: message,
      sender: 'student', // Mantenemos sender: 'student' para compatibilidad
      timestamp: new Date().toISOString()
    };
    chat.messages.push(studentMsg);
    db.save();

    const apiKey = process.env.GEMINI_API_KEY || req.headers['x-gemini-key'];

    let systemInstruction = '';

    if (isTeacher) {
      // Construir contexto detallado del docente para la IA
      const teacherCoursesDetails = (user?.courses || []).map(courseId => {
        const course = db.data.courses.find(c => c.id === courseId);
        return course ? `- **${course.title}** (Código: ${course.id}): ${course.description}` : null;
      }).filter(Boolean).join('\n');

      const activeAlertsDetails = (db.data.alerts || []).map(alert => {
        return `- **Estudiante:** ${alert.studentName} | **Alerta:** ${alert.message} | **Acción recomendada:** ${alert.action} | **Prioridad:** ${alert.priority}`;
      }).join('\n');

      const teacherProfileContext = `
INFORMACIÓN DEL DOCENTE:
- Nombre: ${user?.name || 'Profesor'}
- Universidad: ${user?.university || 'Universidad de Córdoba'}
- Departamento: ${user?.department || 'N/A'}

CURSOS A CARGO:
${teacherCoursesDetails || '- Ningún curso a cargo actualmente.'}

ALERTAS ACADÉMICAS ACTIVAS DE SUS ESTUDIANTES:
${activeAlertsDetails || '- No hay alertas académicas registradas actualmente.'}
      `;

      systemInstruction = `Eres 'EduAI', un Asistente de Inteligencia Artificial para Profesores de la plataforma educativa EduPlatform de la Universidad de Córdoba.
Tu rol es actuar como un asesor pedagógico, diseñador de clases y asistente de gestión de aula.

INSTRUCCIONES DE COMPORTAMIENTO:
- Responde de manera DIRECTA, clara, resolutiva y sumamente profesional. NO utilices el método socrático con el profesor.
- Ayuda al docente a diseñar quices (preguntas evaluativas de opción múltiple con opciones, clave de respuesta y explicaciones), estructurar contenidos de lecciones, redactar anuncios para la cartelera y responder a las alertas académicas.
- Al redactar anuncios o mensajes de intervención para estudiantes con bajo rendimiento, adáptate al estilo cognitivo recomendado en las alertas (VAK: Visual, Auditivo, Kinestésico).
- Utiliza títulos, negrita y viñetas para que tus sugerencias sean legibles y fáciles de copiar y pegar.
- Responde siempre en español.

${teacherProfileContext}`;

    } else {
      // Construir contexto detallado del estudiante para la IA
      const enrolledCoursesDetails = (user?.enrolledCourses || []).map(courseId => {
        const course = db.data.courses.find(c => c.id === courseId);
        const progress = user?.courseProgress?.[courseId] !== undefined ? user.courseProgress[courseId] : 0;
        return course ? `- **${course.title}** (Progreso: ${Math.round(progress * 100)}%): ${course.description}` : null;
      }).filter(Boolean).join('\n');

      const studentProfileContext = `
INFORMACIÓN DEL ESTUDIANTE:
- Nombre: ${user?.name || 'Estudiante'}
- Universidad: ${user?.university || 'Universidad de Córdoba'}
- Programa Académico: ${user?.program || 'N/A'}
- Semestre: ${user?.semester || 'N/A'}

PERFIL COGNITIVO / METODOLOGÍA DE APRENDIZAJE:
- Estilo de aprendizaje principal: ${style.toUpperCase()}
- Estilo secundario: ${user?.cognitiveProfile?.secondary?.toUpperCase() || 'Ninguno'}
- Puntajes de canales (VAK):
  * Visual: ${user?.cognitiveProfile?.scores?.visual || 0}
  * Auditivo: ${user?.cognitiveProfile?.scores?.auditory || 0}
  * Kinestésico (Haciendo): ${user?.cognitiveProfile?.scores?.kinesthetic || 0}

ESTADÍSTICAS DE ESTUDIO:
- Racha de días de estudio: ${user?.stats?.streak || 0} días
- Minutos totales de estudio: ${user?.stats?.totalStudyMinutes || 0} minutos
- Promedio general de Quices: ${Math.round((user?.stats?.avgQuizScore || 0) * 100)}%

CURSOS MATRICULADOS Y SU PROGRESO:
${enrolledCoursesDetails || '- Ningún curso matriculado actualmente.'}
      `;

      // Obtener contexto de la lección activa para RAG simple
      let lessonContextText = '';
      if (lessonId) {
        const lesson = db.data.lessons.find((l) => l.id === lessonId);
        if (lesson) {
          const content = lesson.contentByStyle[style] || lesson.contentByStyle.visual || {};
          lessonContextText = `
El estudiante está estudiando actualmente la lección: "${lesson.title}".
Resumen de la lección: "${lesson.description}".
Contenido o transcripción pedagógica de la lección en modalidad ${style.toUpperCase()}:
"${content.transcript || content.description || 'Simulación práctica interactiva'}"
          `;
        }
      }

      // Definir instrucciones adaptativas por estilo VAK
      if (style === 'visual') {
        systemInstruction = `Eres 'EduAI', un Tutor de IA Adaptativo hiper-personalizado de la plataforma educativa EduPlatform.
El perfil de aprendizaje de este estudiante es VISUAL.
INSTRUCCIONES DE COMPORTAMIENTO:
- Utiliza analogías gráficas, esquemas conceptuales sencillos expresados con emojis, viñetas y saltos de línea claros.
- Enfatiza la conexión espacial de las ideas y flujos de información.
- Divide explicaciones en pasos usando emojis coloreados (🔴, 🔵, 🟢, 🟡).
- Usa negrita para destacar palabras clave de forma que el alumno escanee visualmente tu respuesta.`;
      } else if (style === 'auditory') {
        systemInstruction = `Eres 'EduAI', un Tutor de IA Adaptativo hiper-personalizado de la plataforma de la Universidad de Córdoba.
El perfil de aprendizaje de este estudiante es AUDITIVO.
INSTRUCCIONES DE COMPORTAMIENTO:
- Explica los conceptos de manera secuencial, rítmica y narrativa (estilo audio o podcast).
- Utiliza acrónimos memorables, rimas explicativas o analogías verbales para recordar fórmulas.
- Motiva activamente al estudiante sugiriéndole leer en voz alta o debatir las soluciones contigo.
- Usa palabras de transición temporal claras ("En primer lugar...", "Escucha con atención...", "Esto suena como...").`;
      } else {
        systemInstruction = `Eres 'EduAI', un Tutor de IA Adaptativo de la Universidad de Córdoba.
El perfil de aprendizaje de este estudiante es KINESTÉSICO (aprende haciendo).
INSTRUCCIONES DE COMPORTAMIENTO:
- Propón mini-retos, problemas interactivos rápidos, o dinámicas que pueda realizar físicamente con objetos.
- Utiliza analogías activas de la vida real (deportes, construcción, videojuegos, cocina, etc.).
- Invítalo a resolver un paso de un ejercicio práctico y pídele su respuesta en el chat para avanzar.
- Usa un tono dinámico y motivador enfocado en la acción física ("¡Pruébalo tú mismo!", "Manos a la obra!").`;
      }

      systemInstruction += `\n${studentProfileContext}`;
      systemInstruction += `\n${lessonContextText}`;
      systemInstruction += `\nINSTRUCCIONES PEDAGÓGICAS IMPORTANTES (SOCRÁTICAS):
- Tienes ESTRICTAMENTE PROHIBIDO resolver quices, exámenes, tareas o dar respuestas directas al estudiante. NUNCA escribas la solución final de los ejercicios evaluativos.
- Si el estudiante te pide la respuesta a una pregunta o te comparte un ejercicio evaluativo, debes guiarlo de forma socrática utilizando preguntas de andamiaje.
- En lugar de dar la solución, guíalo con preguntas como: "¿Qué crees que sucedería si...?", "¿Cuál crees que es el primer paso de la ecuación?", o "¿Qué operación matemática anula una suma?".
- Explica la lógica conceptual básica, da pistas constructivas cortas y haz que el alumno deduzca la solución por sí mismo.
- Responde siempre en español. Mantén explicaciones cortas (máximo 3 párrafos medianos por mensaje). Completa siempre tus ideas.`;
    }

    if (apiKey) {
      try {
        // Formatear historial completo guardado en la BD al formato de turnos de Gemini
        const chatMessages = chat.messages.filter((msg) => msg.id !== 'msg_init' && !msg.id.includes('key_alert'));
        
        // Optimización 429: Recortar para enviar sólo los últimos 6 turnos
        const maxHistoryTurns = 6;
        const trimmedMessages = chatMessages.slice(-maxHistoryTurns);
        
        const geminiHistory = [];
        let lastRole = null;

        for (const msg of trimmedMessages) {
          const role = msg.sender === 'student' ? 'user' : 'model';
          if (role === lastRole) {
            if (geminiHistory.length > 0) {
              geminiHistory[geminiHistory.length - 1].parts[0].text += `\n${msg.text}`;
            }
          } else {
            geminiHistory.push({ role, parts: [{ text: msg.text }] });
            lastRole = role;
          }
        }

        // Asegurar que el último turno en la lista de contenidos sea de tipo 'user'
        if (geminiHistory.length > 0 && geminiHistory[geminiHistory.length - 1].role !== 'user') {
          geminiHistory.push({ role: 'user', parts: [{ text: message }] });
        }

        const ai = new GoogleGenAI({ apiKey });
        
        // Llamada con control de reintentos
        const response = await callGeminiWithRetry(() =>
          ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: geminiHistory,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          })
        );

        if (response.text) {
          const tutorReply = response.text.trim();

          const tutorMsg = {
            id: `msg_${Date.now() + 1}`,
            text: tutorReply,
            sender: 'tutor',
            timestamp: new Date().toISOString()
          };
          chat.messages.push(tutorMsg);
          db.save();

          return res.json({ response: tutorReply });
        }
      } catch (error) {
        const isRateLimit = error.status === 429 || error.message?.includes('429') || error.message?.toLowerCase().includes('quota');
        if (isRateLimit) {
          console.warn('[Gemini API] Límite de cuota superado (429) o API Key no válida. Aplicando fallback de motor local.');
        } else {
          console.error('Error llamando a Gemini en servidor:', error);
        }
      }
    }

    // --- MOTOR LOCAL HEURÍSTICO DE RESPALDO ---
    let fallbackReply = '';
    if (isTeacher) {
      fallbackReply = await getLocalTeacherResponse(message, user);
    } else {
      fallbackReply = await getLocalHeuristicResponse(message, style, user);
    }

    // Si se especificó una API Key pero falló por cuota/límites, avisar al usuario de forma clara
    if (apiKey) {
      fallbackReply += `\n\n---\n*⚠️ Nota de EduPlatform: Tu API Key de Gemini ha superado el límite de cuota (429) o está inactiva. He activado temporalmente el motor local de respaldo para seguir ayudándote.*`;
    }

    const tutorMsg = {
      id: `msg_${Date.now() + 1}`,
      text: fallbackReply,
      sender: 'tutor',
      timestamp: new Date().toISOString()
    };
    chat.messages.push(tutorMsg);
    db.save();

    res.json({ response: fallbackReply });
  } catch (error) {
    console.error('Error en postChat:', error);
    res.status(500).json({ error: 'Error interno del servidor en el Tutor de IA.' });
  }
};

async function getLocalTeacherResponse(message, user) {
  const input = (message || '').toLowerCase().trim();
  const name = user?.name || 'Profesor';

  // Obtener cursos a cargo del profesor
  const teacherCourses = (user?.courses || []).map(courseId => {
    return db.data.courses.find(c => c.id === courseId);
  }).filter(Boolean);

  const coursesStr = teacherCourses.length > 0
    ? teacherCourses.map(c => `• **${c.title}** (ID: ${c.id})`).join('\n')
    : 'No tienes cursos a cargo registrados en este momento.';

  // 1. Saludos
  if (input.includes('hola') || input.includes('buenos dias') || input.includes('buenas tardes') || input.includes('saludos')) {
    return `¡Hola, **${name}**! Es un gusto saludarte. 🧑‍🏫\n\nComo tu **Asistente de IA (EduAI)** para docentes de la Universidad de Córdoba, estoy a tu disposición para ayudarte con las labores académicas de tus cursos:\n${coursesStr}\n\nPuedo ayudarte con las siguientes tareas:\n- 🚨 **Revisar alertas** académicas y de riesgo de tus estudiantes.\n- 📢 **Redactar anuncios** de bienvenida, motivación o recordatorios.\n- 📝 **Diseñar quices** y preguntas evaluativas adaptadas.\n- 📚 **Estructurar lecciones** o módulos de aprendizaje.\n\n¿Con qué tarea pedagógica te gustaría que comencemos?`;
  }

  // 2. Revisar alertas de estudiantes
  if (input.includes('alerta') || input.includes('alertas') || input.includes('riesgo') || input.includes('estudiantes') || input.includes('alumnos') || input.includes('desercion')) {
    const alerts = db.data.alerts || [];
    
    if (alerts.length === 0) {
      return `### 🚨 Alertas Académicas y de Riesgo\n\nActualmente no se registran alertas de riesgo académico o inactividad en tus cursos. ¡Tus estudiantes están al día! 👏`;
    }

    let response = `### 🚨 Alertas Académicas Detectadas (${alerts.length})\n\nHe escaneado las asignaturas a tu cargo. Aquí tienes el reporte de los estudiantes que requieren atención y una plantilla de intervención recomendada:\n\n`;

    alerts.forEach((alert, index) => {
      response += `#### ${index + 1}. ${alert.studentName} (Prioridad: **${alert.priority.toUpperCase()}**)\n`;
      response += `- **Problema:** ${alert.message}\n`;
      response += `- **Recomendación:** ${alert.action}\n`;
      
      // Borrador de mensaje de intervención personalizado
      let messageDraft = '';
      if (alert.studentId === 'u_002') { // Carlos Andrade (auditivo)
        messageDraft = `> *"Hola Carlos, espero que estés muy bien. Me he dado cuenta de que hace unos días no ingresas a la plataforma. Recuerda que puedes apoyarte en nuestros recursos explicativos en formato de audio y podcasts si te resulta más cómodo estudiar así. Si tienes alguna duda, escríbeme y la discutimos en voz alta. ¡Tu avance en Matemáticas Básicas es del 42%, vamos por más!"*`;
      } else if (alert.studentId === 'u_003') { // María Fernanda (kinestésico)
        messageDraft = `> *"Hola María Fernanda, espero que vayas excelente. Veo que tienes una tarea pendiente por vencer. Te animo a realizar las dinámicas y retos prácticos de esta semana para fijar los conocimientos. Tu avance en Desarrollo Sostenible es del 78%, ¡estás a un paso de completar el módulo!"*`;
      } else {
        messageDraft = `> *"Hola ${alert.studentName.split(' ')[0]}, espero que te encuentres bien. Noto que has tenido dificultades en las últimas actividades de nuestro curso. Quería recordarte que cuentas con mi apoyo y con el asistente de aprendizaje de EduPlatform para repasar los temas de forma adaptada. Cuéntame si podemos programar una tutoría."*`;
      }
      
      response += `- **Borrador de Intervención (Copia y pega):**\n${messageDraft}\n\n`;
    });

    response += `*Consejo de EduAI: Puedes copiar cualquiera de estos borradores y enviárselos por la bandeja de mensajes internos o correo institucional al estudiante.*`;
    return response;
  }

  // 3. Redactar anuncios de clase
  if (input.includes('anuncio') || input.includes('anuncios') || input.includes('comunicado') || input.includes('cartelera')) {
    const courseTitle = teacherCourses.length > 0 ? teacherCourses[0].title : '[Nombre de tu Asignatura]';
    return `### 📢 Plantillas de Anuncios de Clase\n\nAquí tienes dos opciones listas para personalizar y publicar en la sección de anuncios de tus cursos:\n\n---\n\n#### Opción 1: Recordatorio Semanal y Motivación\n**Asunto:** 🚀 ¡Iniciamos nueva semana en ${courseTitle}!\n\n**Cuerpo del anuncio:**\n> Estimados estudiantes de **${courseTitle}**,\n>\n> Espero que hayan tenido un excelente fin de semana. Esta semana nos adentraremos en temas clave y prácticos de nuestro curso. \n>\n> Los invito a ingresar a la plataforma, revisar sus rutas de aprendizaje adaptadas y completar los mini-retos interactivos. Recuerden que si se encuentran con un concepto difícil, su Tutor de IA (**EduAI**) está disponible 24/7 en la esquina inferior del tablero de estudio para guiarles de forma personalizada.\n>\n> ¡Mucho éxito en sus actividades!\n\n---\n\n#### Opción 2: Alerta de Cuestionario / Quiz\n**Asunto:** ⚠️ Recordatorio: Cuestionario evaluativo activo\n\n**Cuerpo del anuncio:**\n> Estimado grupo,\n>\n> Les recuerdo que ya se encuentra habilitada la evaluación correspondiente al módulo actual en la plataforma. Este cuestionario estará disponible hasta el próximo [Fecha Límite].\n>\n> Les sugiero repasar sus notas y realizar las simulaciones prácticas de antemano. El objetivo es consolidar lo aprendido, ¡así que den su mejor esfuerzo!\n>\n> Si tienen dudas sobre las bases conceptuales, recuerden que pueden consultar al chat adaptado en la plataforma.\n>\n> Saludos cordiales,\n> **${name}**`;
  }

  // 4. Diseñar preguntas para un quiz
  if (input.includes('quiz') || input.includes('quices') || input.includes('pregunta') || input.includes('preguntas') || input.includes('evaluar') || input.includes('evaluacion') || input.includes('evaluaciones')) {
    return `### 📝 Propuesta de Preguntas para Quiz (Ejemplos)\n\nHe preparado estas preguntas evaluativas estructuradas con opciones múltiples, indicación de la clave correcta y su debida justificación pedagógica, listas para que las agregues a tus cursos:\n\n---\n\n#### 🧮 Pregunta para "Matemáticas Básicas" (Álgebra)\n* **Enunciado:** Si sumamos las expresiones algebraicas $$(3x + 4)$$ y $$(2x - 7)$$, ¿cuál es el término simplificado resultante?\n* **Opciones:**\n  * A) $$5x + 11$$\n  * B) $$5x - 3$$\n  * C) $$x - 3$$\n  * D) $$6x - 28$$\n* **Clave Correcta:** B) $$5x - 3$$\n* **Explicación Pedagógica:** Se deben agrupar los términos semejantes: $$(3x + 2x) = 5x$$ y los números constantes: $$(4 - 7) = -3$$. El resultado final simplificado es $$5x - 3$$.\n\n---\n\n#### 💻 Pregunta para "Programación Inicial" (Algoritmos)\n* **Enunciado:** ¿Cuál es la función principal de una estructura condicional \`if-else\` en un lenguaje de programación como Python?\n* **Opciones:**\n  * A) Repetir un bloque de código indefinidamente hasta que el usuario se canse.\n  * B) Almacenar colecciones de datos ordenados numéricamente.\n  * C) Tomar decisiones lógicas ejecutando distintos bloques de código según si una condición se evalúa como verdadera o falsa.\n  * D) Importar librerías matemáticas avanzadas de forma automática.\n* **Clave Correcta:** C\n* **Explicación Pedagógica:** La estructura \`if-else\` bifurca el flujo de ejecución del algoritmo dependiendo de si la condición lógica inicial es \`True\` o \`False\`.\n\n---\n\n#### 📈 Pregunta para "Cálculo Diferencial" (Límites)\n* **Enunciado:** ¿Qué representa geométricamente el límite de una función $$f(x)$$ cuando $$x$$ se aproxima a un valor $$a$$?\n* **Opciones:**\n  * A) El valor al cual se acercan las alturas de la función (el eje $$y$$) a medida que la variable independiente $$x$$ se acerca indefinidamente al valor $$a$$.\n  * B) El área exacta bajo la curva entre dos puntos especificados.\n  * C) La pendiente de la recta tangente a la curva en el punto exacto $$a$$.\n  * D) La intersección exacta de la función con el origen $$(0,0)$$.\n* **Clave Correcta:** A\n* **Explicación Pedagógica:** El límite describe el comportamiento local de la función cerca de $$a$$, evaluando hacia qué valor se proyectan las coordenadas $$y$$, sin importar si la función está definida o no en el punto exacto $$a$$.\n\n---\n\n*Nota: Estos ejemplos están adaptados a las asignaturas que tienes registradas en tu perfil de docente.*`;
  }

  // 5. Ayuda o No entiendo
  if (input.includes('ayuda') || input.includes('duda') || input.includes('no entiendo') || input.includes('opciones') || input.includes('que haces')) {
    return `Entendido, **${name}**. Estoy aquí para aligerar tu carga docente.\n\nPuedes pedirme:\n- *"Revisar alertas"* para ver qué estudiantes tienen riesgo de rezago académico y obtener borradores de mensaje.\n- *"Redactar un anuncio de clase"* para obtener comunicados listos para compartir con tus alumnos.\n- *"Diseñar preguntas para un quiz"* si necesitas ideas de reactivos evaluativos.\n- O simplemente dime sobre qué tema quieres estructurar una nueva lección y te daré un borrador.\n\n¿Qué te gustaría hacer a continuación?`;
  }

  // 6. Respuesta por defecto
  return `Estimado **${name}**, he recibido tu consulta. Desde el motor local de soporte para docentes, estoy a tu disposición.\n\nActualmente tienes a cargo la asignatura:\n${coursesStr}\n\nPara poder ayudarte de forma más precisa, te recomiendo probar con alguna de estas solicitudes directas:\n1. 🚨 **Revisar alertas**: Muestra los estudiantes con bajo ingreso o tareas pendientes y te redacta mensajes motivadores personalizados.\n2. 📢 **Redactar un anuncio**: Genera plantillas de anuncios semanales o de evaluaciones para copiar y pegar.\n3. 📝 **Diseñar quices**: Te muestra ideas de preguntas de opción múltiple estructuradas.\n\n¿Cuál de estas opciones prefieres utilizar hoy?`;
}

async function getLocalHeuristicResponse(message, style, user) {
  const input = (message || '').toLowerCase().trim();
  const name = user?.name || 'estudiante';
  
  // Obtener cursos matriculados del estudiante y sus avances
  const enrolledCourses = (user?.enrolledCourses || []).map(courseId => {
    const course = db.data.courses.find(c => c.id === courseId);
    const progress = user?.courseProgress?.[courseId] !== undefined ? user.courseProgress[courseId] : 0;
    return course ? { title: course.title, progress: Math.round(progress * 100) } : null;
  }).filter(Boolean);

  const coursesStr = enrolledCourses.length > 0
    ? enrolledCourses.map(c => `• **${c.title}** (${c.progress}% completado)`).join('\n')
    : 'No tienes cursos matriculados actualmente.';

  // 1. Saludos
  if (input.includes('hola') || input.includes('buenos dias') || input.includes('buenas tardes')) {
    let response = `¡Hola, **${name}**! Qué alegría saludarte. 😊\n\n`;
    
    if (style === 'visual') {
      response += `Como tutor de la Universidad de Córdoba, estoy listo para guiarte en tus cursos con esquemas visuales y resúmenes estructurados.\n\n`;
      if (enrolledCourses.length > 0) {
        response += `Veo que estás participando en:\n${coursesStr}\n\n`;
      }
      response += `¿Qué tema te gustaría repasar o graficar mediante pasos lógicos hoy?`;
    } else if (style === 'auditory') {
      response += `Como tutor de la Universidad de Córdoba, estoy aquí para que conversemos y analicemos tus materias con explicaciones secuenciales paso a paso.\n\n`;
      if (enrolledCourses.length > 0) {
        response += `Veo tus cursos activos en la plataforma:\n${coursesStr}\n\n`;
      }
      response += `¿Qué te parece si debatimos algún concepto o repasamos oralmente alguna duda?`;
    } else {
      response += `¡Qué bueno tenerte por aquí listo para la acción! Como tutor kinestésico, me encanta aprender haciendo cosas prácticas y resolviendo retos.\n\n`;
      if (enrolledCourses.length > 0) {
        response += `Actualmente estás trabajando en:\n${coursesStr}\n\n`;
      }
      response += `¿Con qué mini-reto o ejercicio práctico de tus materias empezamos hoy?`;
    }
    return response;
  }

  // 2. Interceptar intenciones de respuestas directas a quices o tareas (Socrático local)
  if (input.includes('respuesta') || input.includes('examen') || input.includes('resolver') || input.includes('quiz') || input.includes('tarea')) {
    let response = `⚠️ *[Tutor Local - Modo de Respaldo]*\n\nHola **${name}**, veo que estás preguntando por respuestas o soluciones directas. `;
    response += `Mi labor como tutor de la Universidad de Córdoba es ayudarte a razonar para que aprendas por ti mismo, no resolver las tareas por ti.\n\n`;
    
    if (style === 'visual') {
      response += `Vamos a desglosar el problema visualmente: \n`;
      response += `1. Dibuja o imagina un diagrama con los datos conocidos.\n`;
      response += `2. Identifica la incógnita o variable que te piden encontrar.\n`;
      response += `3. ¿Qué fórmula o relación conceptual conecta estos elementos? ¡Analicémosla juntos!`;
    } else if (style === 'auditory') {
      response += `Te sugiero desglosar la duda rítmicamente: \n`;
      response += `- Primero, ¿cuál es el enunciado general y qué nos pide?\n`;
      response += `- Segundo, ¿qué reglas teóricas o conceptos clave recuerdas?\n`;
      response += `Cuéntame qué paso crees que sigue y lo discutimos en voz alta.`;
    } else {
      response += `¡Hagamos una simulación práctica de este ejercicio! \n`;
      response += `- Toma lápiz y papel o abre un editor de código.\n`;
      response += `- Escribe la operación inicial y realiza solo el primer paso.\n`;
      response += `¿Qué resultado te da ese primer paso? Respóndeme por aquí y avanzamos juntos paso a paso.`;
    }
    return response;
  }

  // 3. Explicar / Ayuda / No entiendo
  if (input.includes('ayuda') || input.includes('duda') || input.includes('no entiendo') || input.includes('explicar')) {
    let response = `Entiendo, **${name}**. A veces un concepto se vuelve difícil, pero con el enfoque adecuado lo resolveremos rápido.\n\n`;
    
    if (style === 'visual') {
      response += `Visualiza la idea como un mapa de flujo:\n`;
      response += `🔴 **Entrada/Causa:** Una situación inicial o valor base.\n`;
      response += `🔵 **Proceso/Transformación:** La regla o fórmula que aplica un cambio.\n`;
      response += `🟢 **Salida/Efecto:** El resultado final que obtenemos.\n\n`;
      response += `¿En cuál de estos tres pasos lógicos sientes que está la confusión?`;
    } else if (style === 'auditory') {
      response += `Vamos a explicarlo de forma narrativa y secuencial:\n`;
      response += `1. *En primer lugar*, definimos la idea central en palabras sencillas.\n`;
      response += `2. *Escucha con atención*: cada término se conecta de forma lógica con el siguiente.\n`;
      response += `3. *En tercer lugar*, aplicamos este concepto con una analogía cotidiana.\n\n`;
      response += `¿Cuál de estos puntos te gustaría que repitamos con otros términos?`;
    } else {
      response += `No te preocupes, ¡vamos a experimentar para entenderlo!\n`;
      response += `Imagina que estás construyendo una estructura. Si pones una base inestable (error conceptual), todo lo de arriba se cae. Por eso debemos ir paso a paso.\n\n`;
      response += `¡Hagamos una prueba rápida! Intenta resolver un caso súper simple y dime qué pasa. ¿Te animas a que te plantee un mini-ejercicio?`;
    }
    return response;
  }

  // 4. Consejos de Estudio / Tips
  if (input.includes('consejo') || input.includes('tip') || input.includes('estudiar')) {
    let response = `¡Claro que sí, **${name}**! Aquí tienes consejos personalizados de estudio basados en tus materias y tu metodología de aprendizaje:\n\n`;
    
    if (style === 'visual') {
      response += `### 🎯 Consejos para tu Perfil Visual (Puntaje: ${user?.cognitiveProfile?.scores?.visual || 7}/10)\n`;
      response += `1. **Mapas conceptuales con colores:** Te ayudarán a memorizar términos y conectar ideas jerárquicamente.\n`;
      response += `2. **Resaltado inteligente:** Usa colores específicos para fórmulas (verde), conceptos (amarillo) y ejemplos (azul) en tus apuntes.\n`;
      if (enrolledCourses.length > 0) {
        response += `\n3. **Aplicación para tus cursos activos:**\n`;
        enrolledCourses.forEach(c => {
          response += `   - Para **${c.title}** (${c.progress}%): Dibuja diagramas de flujo de los procesos o esquemas de las fórmulas clave.\n`;
        });
      }
    } else if (style === 'auditory') {
      response += `### 🎧 Consejos para tu Perfil Auditivo (Puntaje: ${user?.cognitiveProfile?.scores?.auditory || 8}/10)\n`;
      response += `1. **Lectura en voz alta:** Lee tus apuntes e intenta explicárselos a alguien más (¡o a mí en este chat!).\n`;
      response += `2. **Acrónimos y rimas:** Inventa palabras clave cortas o rimas pegajosas para recordar secuencias o fórmulas matemáticas.\n`;
      if (enrolledCourses.length > 0) {
        response += `\n3. **Aplicación para tus cursos activos:**\n`;
        enrolledCourses.forEach(c => {
          response += `   - Para **${c.title}** (${c.progress}%): Lee los contenidos grabados en voz alta y hazte preguntas grabándote para escucharte después.\n`;
        });
      }
    } else {
      response += `### 🛠️ Consejos para tu Perfil Kinestésico (Puntaje: ${user?.cognitiveProfile?.scores?.kinesthetic || 9}/10)\n`;
      response += `1. **Técnica de la acción:** Estudia en bloques Pomodoro de 25 minutos y camina por la habitación en los descansos de 5 minutos repitiendo lo aprendido.\n`;
      response += `2. **Escribe y dibuja físicamente:** Escribir a mano en papel o una pizarra ayuda a que tu cuerpo fije el conocimiento mucho mejor que solo leer en pantalla.\n`;
      if (enrolledCourses.length > 0) {
        response += `\n3. **Aplicación para tus cursos activos:**\n`;
        enrolledCourses.forEach(c => {
          response += `   - Para **${c.title}** (${c.progress}%): Plantea ejercicios reales o casos prácticos de la vida cotidiana donde se aplique este conocimiento.\n`;
        });
      }
    }
    return response;
  }

  // 5. Respuestas por defecto
  let response = `He recibido tu mensaje, **${name}**. Desde el motor local de respaldo de la Universidad de Córdoba, analicemos tu inquietud:\n\n`;
  if (style === 'visual') {
    response += `Podemos organizar este tema en un esquema mental de causa y efecto. `;
    if (enrolledCourses.length > 0) {
      response += `Es muy útil para avanzar en cursos como **${enrolledCourses[0].title}** (donde llevas un ${enrolledCourses[0].progress}%). `;
    }
    response += `¿Deseas que desglosemos el tema en un esquema paso a paso?`;
  } else if (style === 'auditory') {
    response += `Este tema plantea una secuencia de lógica muy interesante. `;
    if (enrolledCourses.length > 0) {
      response += `Ideal para debatir y consolidar tu avance en **${enrolledCourses[0].title}** (llevas el ${enrolledCourses[0].progress}%). `;
    }
    response += `¿Quieres que te explique las definiciones básicas secuencialmente?`;
  } else {
    response += `La mejor forma de comprender esto es resolver un pequeño reto práctico de inmediato. `;
    if (enrolledCourses.length > 0) {
      response += `Esto te ayudará a subir tu progreso en **${enrolledCourses[0].title}** (actualmente en ${enrolledCourses[0].progress}%). `;
    }
    response += `¿Creamos un ejercicio sencillo para que pruebes tu conocimiento haciendo?`;
  }
  return response;
}
