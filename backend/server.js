import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { db } from './db.js';
import { classifyVAK, calculateDropoutRisk } from './utils.js';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'edu_platform_secret_jwt_key_12345';

app.use(cors());
app.use(express.json());

// --- MIDDLEWARE DE AUTENTICACIÓN ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado. Token no provisto.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
    req.user = user;
    next();
  });
}

// --- ENDPOINTS DE AUTENTICACIÓN ---

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos.' });
  }

  const user = db.data.users.find((u) => u.email === email);
  if (!user) {
    return res.status(400).json({ error: 'Credenciales incorrectas.' });
  }

  // Verificar la contraseña cifrada
  const isMatch = bcrypt.compareSync(password, user.passwordHash || bcrypt.hashSync(user.password || 'demo1234', 10));
  if (!isMatch) {
    return res.status(400).json({ error: 'Credenciales incorrectas.' });
  }

  // Generar token JWT
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });

  const { passwordHash: _, password: _p, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// Registro
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, program, semester } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });
  }

  const existing = db.data.users.find((u) => u.email === email);
  if (existing) {
    return res.status(400).json({ error: 'Este correo ya está registrado.' });
  }

  const newUser = {
    id: `u_${Date.now()}`,
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role: role || 'student',
    avatar: null,
    university: 'Universidad de Córdoba',
    program: program || 'Sin asignar',
    semester: Number(semester) || 1,
    cognitiveProfile: null,
    preferences: { theme: 'light', fontSize: 'normal', reducedMotion: false },
    stats: {
      daysSinceLastLogin: 0,
      completedLessonsThisWeek: 0,
      avgQuizScore: 0,
      missedDeadlines: 0,
      totalStudyMinutes: 0,
      streak: 0,
    },
    enrolledCourses: ['c_001', 'c_002'], // Autodeclarar algunos cursos por defecto
    courseProgress: {
      c_001: 0,
      c_002: 0,
      c_003: 0,
      c_004: 0,
      c_005: 0,
      c_006: 0
    },
    joinedAt: new Date().toISOString(),
  };

  db.data.users.push(newUser);
  db.save();

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, {
    expiresIn: '7d',
  });

  const { passwordHash: _, ...safeUser } = newUser;
  res.json({ token, user: safeUser });
});

// Demo Estudiante
app.post('/api/auth/demo-student', (req, res) => {
  const user = db.data.users.find((u) => u.id === 'u_001');
  if (!user) return res.status(404).json({ error: 'Demo estudiante no encontrado.' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });
  const { passwordHash: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// Demo Docente
app.post('/api/auth/demo-teacher', (req, res) => {
  const user = db.data.users.find((u) => u.id === 'u_004');
  if (!user) return res.status(404).json({ error: 'Demo docente no encontrado.' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });
  const { passwordHash: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// Perfil de Usuario Actual
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.data.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

  const { passwordHash: _, ...safeUser } = user;
  res.json(safeUser);
});

// Actualizar Preferencias de Perfil
app.post('/api/auth/profile', authenticateToken, (req, res) => {
  const userIdx = db.data.users.findIndex((u) => u.id === req.user.id);
  if (userIdx === -1) return res.status(404).json({ error: 'Usuario no encontrado.' });

  const user = db.data.users[userIdx];
  if (req.body.preferences) {
    user.preferences = { ...user.preferences, ...req.body.preferences };
  }
  if (req.body.name) user.name = req.body.name;
  if (req.body.program) user.program = req.body.program;

  db.data.users[userIdx] = user;
  db.save();

  const { passwordHash: _, ...safeUser } = user;
  res.json(safeUser);
});

// --- ENDPOINTS DE DIAGNÓSTICO ---
app.post('/api/diagnostic/submit', authenticateToken, (req, res) => {
  const { answers } = req.body;
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Respuestas diagnósticas requeridas.' });
  }

  const userIdx = db.data.users.findIndex((u) => u.id === req.user.id);
  if (userIdx === -1) return res.status(404).json({ error: 'Usuario no encontrado.' });

  // Clasificar estilo cognitivo
  const cognitiveProfile = classifyVAK(answers);
  cognitiveProfile.diagnosedAt = new Date().toISOString();

  // Actualizar usuario
  db.data.users[userIdx].cognitiveProfile = cognitiveProfile;
  db.save();

  res.json({ success: true, cognitiveProfile });
});

// --- ENDPOINTS DE CURSOS Y LECCIONES ---

// Listar Cursos
app.get('/api/courses', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let userId = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch (e) {
      // Ignorar token inválido
    }
  }

  let user = null;
  if (userId) {
    user = db.data.users.find((u) => u.id === userId);
  }

  const courses = db.data.courses.map((c) => {
    let progress = 0;
    if (user) {
      progress = (user.courseProgress && user.courseProgress[c.id] !== undefined)
        ? user.courseProgress[c.id]
        : 0;
    } else {
      progress = c.progress || 0;
    }
    return {
      ...c,
      progress,
      status: user && user.enrolledCourses?.includes(c.id) ? 'in_progress' : c.status
    };
  });

  res.json(courses);
});

// Detalle de un Curso
app.get('/api/courses/:id', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let userId = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch (e) {}
  }

  const course = db.data.courses.find((c) => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Curso no encontrado.' });

  let progress = course.progress || 0;
  let status = course.status;
  if (userId) {
    const user = db.data.users.find((u) => u.id === userId);
    if (user) {
      if (user.courseProgress && user.courseProgress[course.id] !== undefined) {
        progress = user.courseProgress[course.id];
      } else {
        progress = 0;
      }
      if (user.enrolledCourses?.includes(course.id)) {
        status = 'in_progress';
      }
    }
  }

  res.json({ ...course, progress, status });
});

// Detalle de una Lección
app.get('/api/lessons/:id', (req, res) => {
  const lesson = db.data.lessons.find((l) => l.id === req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Lección no encontrada.' });
  res.json(lesson);
});

// Listar lecciones de un curso
app.get('/api/courses/:id/lessons', (req, res) => {
  const courseLessons = db.data.lessons.filter((l) => l.courseId === req.params.id);
  res.json(courseLessons);
});

// Crear Módulo (Profesor)
app.post('/api/courses/:id/modules', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Permisos insuficientes.' });

  const { title, description } = req.body;
  const courseIdx = db.data.courses.findIndex((c) => c.id === req.params.id);
  if (courseIdx === -1) return res.status(404).json({ error: 'Curso no encontrado.' });

  const newModule = {
    id: `m_${Date.now()}`,
    title,
    description: description || '',
    lessons: [],
    completed: false,
  };

  db.data.courses[courseIdx].modules.push(newModule);
  db.save();

  res.json(db.data.courses[courseIdx]);
});

// Crear Lección (Profesor)
app.post('/api/courses/:id/modules/:moduleId/lessons', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Permisos insuficientes.' });

  const { title, description, contentByStyle } = req.body;
  const courseIdx = db.data.courses.findIndex((c) => c.id === req.params.id);
  if (courseIdx === -1) return res.status(404).json({ error: 'Curso no encontrado.' });

  const course = db.data.courses[courseIdx];
  const moduleIdx = course.modules.findIndex((m) => m.id === req.params.moduleId);
  if (moduleIdx === -1) return res.status(404).json({ error: 'Módulo no encontrado.' });

  const lessonId = `l_${Date.now()}`;
  const newLesson = {
    id: lessonId,
    courseId: req.params.id,
    moduleId: req.params.moduleId,
    title,
    description,
    duration: 15,
    completed: false,
    quiz: [
      {
        id: `q_${Date.now()}_1`,
        question: `¿Cuál es el concepto principal de ${title}?`,
        options: [title, 'Otro tema secundario', 'Ninguno'],
        correct: 0,
        explanation: 'Se deduce directamente de la lección.',
      },
    ],
    contentByStyle: contentByStyle || {
      visual: { title: `${title} - Visual`, description: 'Contenido visual explicativo.', duration: '15 min' },
      auditory: { title: `${title} - Auditivo`, description: 'Contenido auditivo explicativo.', transcript: 'Explicación del tema de la lección...', duration: '15 min' },
      kinesthetic: { title: `${title} - Kinestésico`, description: 'Actividad interactiva práctica.', steps: ['Paso 1', 'Paso 2'], duration: '15 min' }
    },
    order: course.modules[moduleIdx].lessons.length + 1,
  };

  db.data.lessons.push(newLesson);
  db.data.courses[courseIdx].modules[moduleIdx].lessons.push(lessonId);
  db.save();

  res.json({ course: db.data.courses[courseIdx], lesson: newLesson });
});

// Completar Lección (Progreso)
app.post('/api/lessons/:id/complete', authenticateToken, (req, res) => {
  const lessonId = req.params.id;
  const userId = req.user.id;

  const activity = {
    id: `a_${Date.now()}`,
    userId,
    type: 'lesson_complete',
    description: `Completaste la lección: ${lessonId}`,
    timestamp: new Date().toISOString(),
  };

  db.data.activities.push(activity);
  db.save();

  res.json({ success: true, lessonId });
});

// Enviar Quiz y Calcular Puntaje
app.post('/api/lessons/:id/quiz', authenticateToken, (req, res) => {
  const { answers } = req.body;
  const lesson = db.data.lessons.find((l) => l.id === req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Lección no encontrada.' });

  let correct = 0;
  lesson.quiz.forEach((q, i) => {
    if (answers[i] === q.correct) correct++;
  });

  const score = correct / lesson.quiz.length;
  const passed = score >= 0.6;

  // Registrar actividad si aprobó
  if (passed) {
    const userIdx = db.data.users.findIndex((u) => u.id === req.user.id);
    if (userIdx !== -1) {
      const user = db.data.users[userIdx];
      // Actualizar promedio
      const totalQuizzes = user.stats.completedLessonsThisWeek + 1;
      const prevAvg = user.stats.avgQuizScore || 0;
      user.stats.avgQuizScore = Number(((prevAvg * (totalQuizzes - 1) + score) / totalQuizzes).toFixed(2));
      user.stats.completedLessonsThisWeek = totalQuizzes;
      user.stats.totalStudyMinutes += lesson.duration || 10;
      user.stats.streak = (user.stats.streak || 0) + 1;
      user.stats.daysSinceLastLogin = 0;

      db.data.users[userIdx] = user;

      // Crear actividad de logro
      db.data.activities.push({
        id: `a_${Date.now()}`,
        userId: req.user.id,
        type: 'quiz_pass',
        description: `Aprobaste el quiz de: ${lesson.title} con ${Math.round(score * 100)}%`,
        timestamp: new Date().toISOString(),
      });

      // Si no tiene esta medalla de quiz, se la agregamos
      const hasStarBadge = db.data.badges.some((b) => b.name === 'Estrella Matemática' && b.userId === req.user.id);
      if (!hasStarBadge && score === 1) {
        db.data.badges.push({
          id: `b_${Date.now()}`,
          userId: req.user.id,
          name: 'Estrella Matemática',
          description: 'Aprobaste un examen con puntaje perfecto.',
          icon: 'fa-star',
          unlockedAt: new Date().toISOString(),
        });
      }

      db.save();
    }
  }

  res.json({
    score,
    correct,
    total: lesson.quiz.length,
    passed,
    feedback: lesson.quiz.map((q, i) => ({
      questionId: q.id,
      isCorrect: answers[i] === q.correct,
      explanation: q.explanation,
    })),
  });
});

// --- ENDPOINTS DE FORO / COMUNIDAD ---
app.get('/api/community/posts', (req, res) => {
  res.json(db.data.posts);
});

app.get('/api/community/trends', (req, res) => {
  res.json(db.data.trends);
});

app.post('/api/community/posts', authenticateToken, (req, res) => {
  const { title, content, course } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Título y contenido requeridos.' });
  }

  const user = db.data.users.find((u) => u.id === req.user.id);

  const newPost = {
    id: `p_${Date.now()}`,
    authorId: req.user.id,
    authorName: user ? user.name : 'Estudiante anónimo',
    authorAvatar: null,
    course: course || 'General',
    courseId: 'c_001', // Predeterminado
    title,
    content,
    tags: ['estudio', course ? course.toLowerCase() : 'general'],
    likes: 0,
    replies: 0,
    solved: false,
    aiResponse: null,
    timestamp: new Date().toISOString(),
  };

  db.data.posts.unshift(newPost);
  db.save();

  res.json(newPost);
});

app.post('/api/community/posts/:id/like', authenticateToken, (req, res) => {
  const post = db.data.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Publicación no encontrada.' });

  post.likes = (post.likes || 0) + 1;
  db.save();

  res.json({ success: true, likes: post.likes });
});

// --- ENDPOINTS DE PROGRESO DE USUARIO ---
app.get('/api/progress', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const user = db.data.users.find((u) => u.id === userId);

  // Filtrar actividades y medallas por este usuario
  const userBadges = db.data.badges.filter((b) => !b.userId || b.userId === userId);
  const userActivities = db.data.activities.filter((a) => !a.userId || a.userId === userId);
  const userTasks = db.data.tasks.filter((t) => !t.userId || t.userId === userId);

  res.json({
    weekly: db.data.weeklyProgress,
    monthly: db.data.monthlyProgress,
    tasks: userTasks.length > 0 ? userTasks : db.data.tasks,
    badges: userBadges,
    activities: userActivities,
  });
});

app.post('/api/progress/tasks/:id/toggle', authenticateToken, (req, res) => {
  const task = db.data.tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Tarea no encontrada.' });

  task.status = task.status === 'completed' ? 'pending' : 'completed';
  db.save();

  res.json(task);
});

// --- ENDPOINTS DE DOCENTE / ANALÍTICAS ---

// Listar Estudiantes con sus Riesgos Calculados Dinámicamente
app.get('/api/teacher/students', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Acceso denegado.' });

  const students = db.data.users
    .filter((u) => u.role === 'student')
    .map((s) => {
      // Calcular riesgo sobre la marcha usando las estadísticas reales en la BD
      const risk = calculateDropoutRisk(s.stats);
      return {
        ...s,
        risk,
      };
    });

  res.json(students);
});

// KPIs del Aula
app.get('/api/teacher/kpis', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Acceso denegado.' });

  const students = db.data.users.filter((u) => u.role === 'student');
  const atRiskStudents = students.filter((s) => calculateDropoutRisk(s.stats).level === 'high' || calculateDropoutRisk(s.stats).level === 'medium');

  const total = students.length;
  const atRiskCount = atRiskStudents.length;
  const atRiskPercent = total > 0 ? Math.round((atRiskCount / total) * 100) : 0;

  let sumProgress = 0;
  students.forEach((s) => {
    sumProgress += s.stats.avgQuizScore || 0;
  });
  const avgProgress = total > 0 ? sumProgress / total : 0;

  const activeAlerts = db.data.alerts.length;

  res.json({
    totalStudents: total,
    atRiskCount,
    atRiskPercent,
    avgProgress,
    activeAlerts,
  });
});

// Distribución VAK del Aula
app.get('/api/teacher/distribution', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Acceso denegado.' });

  const students = db.data.users.filter((u) => u.role === 'student');
  const counts = { visual: 0, auditory: 0, kinesthetic: 0, diagnostic_pending: 0 };

  students.forEach((s) => {
    if (s.cognitiveProfile?.primary) {
      counts[s.cognitiveProfile.primary]++;
    } else {
      counts.diagnostic_pending++;
    }
  });

  const total = students.length || 1;

  res.json([
    { name: 'Visual', count: counts.visual, percent: Math.round((counts.visual / total) * 100) },
    { name: 'Auditivo', count: counts.auditory, percent: Math.round((counts.auditory / total) * 100) },
    { name: 'Kinestésico', count: counts.kinesthetic, percent: Math.round((counts.kinesthetic / total) * 100) },
  ]);
});

// Listar Alertas
app.get('/api/teacher/alerts', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Acceso denegado.' });
  res.json(db.data.alerts);
});

// Resolver/Intervenir Alerta
app.post('/api/teacher/intervene', authenticateToken, (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Acceso denegado.' });
  const { alertId, message, studentId } = req.body;

  // Registrar notificación en el alumno
  const alertIndex = db.data.alerts.findIndex((a) => a.id === alertId);
  if (alertIndex !== -1) {
    db.data.alerts.splice(alertIndex, 1);
  }

  // Guardar mensaje de intervención como logro/actividad del docente
  db.data.activities.push({
    id: `act_${Date.now()}`,
    userId: studentId,
    type: 'intervention',
    description: `El docente te envió un mensaje de apoyo adaptado: "${message.substring(0, 40)}..."`,
    timestamp: new Date().toISOString(),
  });

  db.save();
  res.json({ success: true });
});


// --- ENDPOINTS DE INTELIGENCIA ARTIFICIAL (AI TUTOR & RAG) ---

app.post('/api/ai/chat', authenticateToken, async (req, res) => {
  const { message, chatHistory = [], lessonId, activeStyle } = req.body;
  const user = db.data.users.find((u) => u.id === req.user.id);
  const style = activeStyle || user?.cognitiveProfile?.primary || 'visual';

  // Buscar API Key de Gemini. Primero busca en variables de entorno, sino lee de los headers (si el cliente la pasa)
  const apiKey = process.env.GEMINI_API_KEY || req.headers['x-gemini-key'];

  if (apiKey) {
    try {
      // 1. Obtener contexto de la lección activa para RAG simple
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

      // 2. Definir instrucciones adaptativas por estilo VAK
      let systemInstruction = '';
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

      // Agregar RAG e indicaciones generales de comportamiento en widget de chat
      systemInstruction += `\n${lessonContextText}`;
      systemInstruction += `\nResponde siempre en español. Mantén explicaciones cortas (máximo 3 párrafos medianos por mensaje). Completa siempre tus ideas.`;

      // 3. Formatear historial al formato de turnos de Gemini
      const chatMessages = chatHistory.filter((msg) => msg.id !== 'msg_init' && !msg.id.includes('key_alert'));
      const geminiHistory = [];
      let lastRole = null;

      for (const msg of chatMessages) {
        const role = msg.sender === 'student' ? 'user' : 'model';
        if (role === lastRole) {
          if (geminiHistory.length > 0) {
            geminiHistory[geminiHistory.length - 1].parts[0].text += `\n${msg.text}`;
          }
        } else {
          if (geminiHistory.length === 0 && role !== 'user') continue;
          geminiHistory.push({ role, parts: [{ text: msg.text }] });
          lastRole = role;
        }
      }

      if (geminiHistory.length === 0) {
        geminiHistory.push({ role: 'user', parts: [{ text: message }] });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: geminiHistory,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      if (response.text) {
        return res.json({ response: response.text.trim() });
      }
      throw new Error('Sin texto devuelto por la API.');
    } catch (error) {
      console.error('Error llamando a Gemini en servidor, aplicando fallback:', error);
      // Aplicar el fallback local si falla
    }
  }

  // --- MOTOR LOCAL HEURÍSTICO DE RESPALDO ---
  const response = await getLocalHeuristicResponse(message, style);
  res.json({ response });
});

async function getLocalHeuristicResponse(message, style) {
  const input = (message || '').toLowerCase().trim();

  // 1. Saludos
  if (input.includes('hola') || input.includes('buenos dias') || input.includes('buenas tardes')) {
    if (style === 'visual') {
      return '¡Hola! Qué gusto saludarte. Estoy listo para ayudarte hoy con esquemas lógicos y resúmenes visuales sobre tu lección activa. ¿Qué tema te gustaría repasar hoy?';
    }
    if (style === 'auditory') {
      return '¡Hola! Es un placer conversar contigo. Estoy listo para explicarte paso a paso la lección, o podemos debatir las soluciones. ¿Qué tema analizamos hoy?';
    }
    return '¡Hola! Qué bueno tenerte por acá con tanta energía. Estoy listo para que hagamos retos prácticos y ejemplos interactivos hoy. ¿Con qué ejercicio empezamos?';
  }

  // 2. Explicar / Ayuda / No entiendo
  if (input.includes('ayuda') || input.includes('duda') || input.includes('no entiendo') || input.includes('explicar')) {
    if (style === 'visual') {
      return 'Entiendo perfectamente. A veces leer mucho texto lo hace complejo. Imagina el concepto actual como una fábrica: entra materia prima (X), pasa por un proceso de producción y sale un producto final (Y). ¡Esa es la representación de una función!';
    }
    if (style === 'auditory') {
      return 'Comprendo tu inquietud. Vamos a desglosarlo secuencialmente. En primer lugar, tomamos la variable. En segundo lugar, aplicamos la regla operativa. En tercer lugar, obtenemos el resultado. ¿Tiene más sentido al oírlo así paso a paso?';
    }
    return '¡No te preocupes! Todo se aclara con la práctica. Imagina que tienes una máquina de refrescos: presionas el botón A (entrada X) y sale refresco de Cola (salida Y). Si presionas A, ¡nunca debería salir Limón! ¿Quieres que inventemos un ejemplo práctico juntos?';
  }

  // 3. Consejos
  if (input.includes('consejo') || input.includes('tip') || input.includes('estudiar')) {
    if (style === 'visual') {
      return '¡Claro! Como tu estilo es Visual, te aconsejo usar mapas conceptuales, resaltar fórmulas con diferentes colores y apoyarte en diagramas de flujo para memorizar los pasos.';
    }
    if (style === 'auditory') {
      return '¡Claro que sí! Al tener un estilo Auditivo, te sugiero leer tus notas en voz alta, escuchar explicaciones con los ojos cerrados para concentrarte y buscar explicaciones narrativas.';
    }
    return '¡Por supuesto! Al ser Kinestésico, aprendes haciendo. Mi consejo: haz descansos de 5 minutos cada 25 de estudio, escribe a mano tus fórmulas y siempre experimenta aplicando la matemática a situaciones cotidianas.';
  }

  // Por defecto
  if (style === 'visual') {
    return 'Interesante tu pregunta. Desde una perspectiva visual, podemos organizar los conceptos en un diagrama conceptual de causa-efecto. ¿Deseas que profundicemos en este tema?';
  }
  if (style === 'auditory') {
    return '¡Es un buen punto! Plantea un debate lógico muy instructivo. ¿Prefieres que desglosemos este concepto en pasos secuenciales o revisamos definiciones?';
  }
  return '¡Excelente pregunta! Lo mejor de esto es ponerlo en práctica. Si realizamos un reto interactivo con esto, lo entenderemos al instante. ¿Diseñamos un mini ejercicio práctico?';
}

app.listen(PORT, () => {
  console.log(`Servidor de EduPlatform corriendo en http://localhost:${PORT}`);
});
