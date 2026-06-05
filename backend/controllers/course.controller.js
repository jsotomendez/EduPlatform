import fs from 'fs';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';
import { db } from '../db.js';
import { calculateDropoutRisk } from '../utils.js';
import { callGeminiWithRetry } from '../utils/gemini.helper.js';

import { JWT_SECRET } from '../middlewares/auth.middleware.js';

// Helper local para actualizar alertas de riesgo en segundo plano
function checkAndRegisterAlert(student) {
  if (!student.stats) return;
  const risk = calculateDropoutRisk(student.stats);
  const existingAlertIdx = db.data.alerts.findIndex((a) => a.studentId === student.id);

  if (risk.level === 'high' || risk.level === 'medium') {
    const priority = risk.level;
    const message = `${student.name} tiene un riesgo de deserción ${priority === 'high' ? 'Alto' : 'Medio'} (${Math.round(risk.score * 100)}%). Factores: ${risk.factors.join(', ')}.`;
    const action = student.cognitiveProfile?.primary === 'visual'
      ? 'Enviar infografía resumen y plan de estudio visual.'
      : student.cognitiveProfile?.primary === 'auditory'
      ? 'Enviar mensaje motivacional por canal auditivo o podcast.'
      : 'Sugerir reto práctico kinestésico o simulación física.';

    const newAlert = {
      id: `al_${student.id}_${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      message,
      action,
      priority,
    };

    if (existingAlertIdx !== -1) {
      db.data.alerts[existingAlertIdx] = newAlert;
    } else {
      db.data.alerts.push(newAlert);
    }
    db.save();
  } else {
    if (existingAlertIdx !== -1) {
      db.data.alerts.splice(existingAlertIdx, 1);
      db.save();
    }
  }
}

export const getCourses = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (e) {
        // Ignorar token inválido, continuar sin perfil
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
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los cursos.' });
  }
};

export const getCourseById = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el curso.' });
  }
};

export const getLessonById = async (req, res) => {
  try {
    const lesson = db.data.lessons.find((l) => l.id === req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lección no encontrada.' });
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la lección.' });
  }
};

export const getLessonsByCourseId = async (req, res) => {
  try {
    const courseLessons = db.data.lessons.filter((l) => l.courseId === req.params.id);
    res.json(courseLessons);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las lecciones.' });
  }
};

export const createModule = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el módulo.' });
  }
};

export const createLesson = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la lección.' });
  }
};

function recalculateProgress(userId, courseId) {
  const user = db.data.users.find((u) => u.id === userId);
  if (!user) return;

  const course = db.data.courses.find((c) => c.id === courseId);
  if (!course) return;

  // Obtener todas las lecciones del curso
  const courseLessons = db.data.lessons.filter((l) => l.courseId === courseId);
  if (courseLessons.length === 0) return;

  // Coleccionar lecciones completadas
  const completedLessonIds = new Set();
  
  (db.data.activities || []).forEach((act) => {
    if (act.userId === userId) {
      if (act.type === 'lesson_complete') {
        const match = act.description.match(/l_\d+/);
        if (match) completedLessonIds.add(match[0]);
      }
    }
  });

  (db.data.submissions || []).forEach((sub) => {
    if (sub.userId === userId) {
      completedLessonIds.add(sub.lessonId);
    }
  });

  (db.data.activities || []).forEach((act) => {
    if (act.userId === userId && act.type === 'quiz_pass') {
      const match = act.description.match(/quiz de:\s*(.*?)\s*con/);
      if (match) {
        const lessonName = match[1].trim();
        const lesson = courseLessons.find((l) => l.title === lessonName);
        if (lesson) completedLessonIds.add(lesson.id);
      }
    }
  });

  let completedCount = 0;
  courseLessons.forEach((l) => {
    if (completedLessonIds.has(l.id)) {
      completedCount++;
    }
  });

  const progressVal = Number((completedCount / courseLessons.length).toFixed(2));
  
  if (!user.courseProgress) user.courseProgress = {};
  user.courseProgress[courseId] = progressVal;
  db.save();
}

export const completeLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user.id;

    const lesson = db.data.lessons.find((l) => l.id === lessonId);

    const activity = {
      id: `a_${Date.now()}`,
      userId,
      type: 'lesson_complete',
      description: `Completaste la lección: ${lessonId}`,
      timestamp: new Date().toISOString(),
    };

    db.data.activities.push(activity);
    db.save();

    if (lesson) {
      recalculateProgress(userId, lesson.courseId);
    }

    res.json({ success: true, lessonId });
  } catch (error) {
    res.status(500).json({ error: 'Error al completar la lección.' });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const lesson = db.data.lessons.find((l) => l.id === req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lección no encontrada.' });

    let correct = 0;
    lesson.quiz.forEach((q, i) => {
      if (answers[i] === q.correct) correct++;
    });

    const score = correct / lesson.quiz.length;
    const passed = score >= 0.6;

    if (passed) {
      const userIdx = db.data.users.findIndex((u) => u.id === req.user.id);
      if (userIdx !== -1) {
        const user = db.data.users[userIdx];
        
        const totalQuizzes = (user.stats.completedLessonsThisWeek || 0) + 1;
        const prevAvg = user.stats.avgQuizScore || 0;
        user.stats.avgQuizScore = Number(((prevAvg * (totalQuizzes - 1) + score) / totalQuizzes).toFixed(2));
        user.stats.completedLessonsThisWeek = totalQuizzes;
        user.stats.totalStudyMinutes += lesson.duration || 10;
        user.stats.streak = (user.stats.streak || 0) + 1;
        user.stats.daysSinceLastLogin = 0;

        db.data.users[userIdx] = user;

        db.data.activities.push({
          id: `a_${Date.now()}`,
          userId: req.user.id,
          type: 'quiz_pass',
          description: `Aprobaste el quiz de: ${lesson.title} con ${Math.round(score * 100)}%`,
          timestamp: new Date().toISOString(),
        });

        // Registrar lección como completada
        db.data.activities.push({
          id: `a_comp_${Date.now()}`,
          userId: req.user.id,
          type: 'lesson_complete',
          description: `Completaste la lección: ${lesson.id}`,
          timestamp: new Date().toISOString(),
        });

        // Revisar insignias
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

        // Recalcular alertas de deserción en tiempo real tras la calificación
        checkAndRegisterAlert(user);

        // Recalcular el progreso del curso
        recalculateProgress(req.user.id, lesson.courseId);
      }
    } else {
      // Si el estudiante no aprueba el quiz, sus estadísticas no mejoran, lo que incrementa el riesgo
      const userIdx = db.data.users.findIndex((u) => u.id === req.user.id);
      if (userIdx !== -1) {
        const user = db.data.users[userIdx];
        user.stats.daysSinceLastLogin = 0;
        // La racha se rompe por no pasar o simplemente no se incrementa. En este caso no incrementa.
        db.data.users[userIdx] = user;
        db.save();
        
        checkAndRegisterAlert(user);
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
  } catch (error) {
    console.error('Error al calificar quiz:', error);
    res.status(500).json({ error: 'Error al enviar y procesar el quiz.' });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lessonId } = req.query;

    let list = db.data.submissions.filter((s) => s.userId === userId);
    if (lessonId) {
      list = list.filter((s) => s.lessonId === lessonId);
    }

    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Error al recuperar las entregas.' });
  }
};

export const submitTask = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ error: 'Debes proporcionar un archivo PDF.' });
    }

    const lesson = db.data.lessons.find((l) => l.id === lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lección no encontrada.' });
    }

    const user = db.data.users.find((u) => u.id === userId);
    const style = user?.cognitiveProfile?.primary || 'visual';

    const filePath = `/uploads/${req.file.filename}`;

    const apiKey = process.env.GEMINI_API_KEY || req.headers['x-gemini-key'];
    let score = 4.0;
    let feedback = 'Tu tarea ha sido recibida correctamente. (Calificación de simulación local)';

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const fileBuffer = fs.readFileSync(req.file.path);
        const base64File = fileBuffer.toString('base64');

        const filePart = {
          inlineData: {
            data: base64File,
            mimeType: 'application/pdf'
          }
        };

        const systemInstruction = `Eres 'EduAI Evaluador', un tutor y calificador automatizado del proyecto EduPlatform de la Universidad de Córdoba.
Tu tarea es leer el archivo PDF subido por el estudiante para la lección "${lesson.title}" ("${lesson.description}").
Analiza su contenido de forma académica y emite una calificación numérica del 1.0 al 5.0 (donde 3.0 es la nota mínima para aprobar).
Adapta la retroalimentación al estilo cognitivo ${style.toUpperCase()} del estudiante:
- Visual: Muy estructurada, usando listas con viñetas, negritas y emojis explicativos.
- Auditivo: Narración fluida y explicativa, con sugerencias socráticas para leer en voz alta.
- Kinestésico: Enfoque práctico, sugiriendo mejoras experimentales y siguientes pasos aplicables.

Debes responder ÚNICAMENTE en el siguiente formato JSON válido (no incluyas markdown de bloques tipo \`\`\`json, solo el JSON puro):
{
  "score": <número entre 1.0 y 5.0>,
  "feedback": "<Retroalimentación constructiva y adaptada>"
}`;

        // Consumir Gemini con reintentos para evitar 429
        const response = await callGeminiWithRetry(() =>
          ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [
              filePart,
              { text: 'Por favor, evalúa la tarea contenida en este PDF.' }
            ],
            config: {
              systemInstruction,
              temperature: 0.5,
              responseMimeType: 'application/json'
            }
          })
        );

        if (response.text) {
          try {
            const parsed = JSON.parse(response.text.trim());
            if (parsed.score && parsed.feedback) {
              score = Number(parsed.score);
              feedback = parsed.feedback;
            }
          } catch (e) {
            console.error('Error parseando JSON de Gemini:', e);
            const text = response.text.trim();
            const scoreMatch = text.match(/"score"\s*:\s*([\d.]+)/);
            const feedbackMatch = text.match(/"feedback"\s*:\s*"([^"]+)"/);
            if (scoreMatch) score = Number(scoreMatch[1]);
            if (feedbackMatch) feedback = feedbackMatch[1];
          }
        }
      } catch (error) {
        console.error('Error calificando la tarea con Gemini:', error);
        feedback = `El archivo PDF se subió correctamente, pero ocurrió un error al consultar a Gemini: ${error.message}. Se asignó una calificación tentativa.`;
      }
    } else {
      feedback = `El archivo PDF se subió correctamente. Se asignó una calificación provisional de simulador local (Estilo VAK: ${style.toUpperCase()}).`;
    }

    const newSubmission = {
      id: `sub_${Date.now()}`,
      userId,
      lessonId,
      lessonTitle: lesson.title,
      fileName: req.file.originalname,
      filePath,
      score,
      feedback,
      timestamp: new Date().toISOString()
    };

    db.data.submissions.push(newSubmission);

    db.data.activities.push({
      id: `act_${Date.now()}`,
      userId,
      type: 'assignment_complete',
      description: `Entregaste la tarea de: ${lesson.title}. Nota: ${score.toFixed(1)}/5.0`,
      timestamp: new Date().toISOString()
    });

    // Registrar lección como completada
    db.data.activities.push({
      id: `a_comp_${Date.now()}`,
      userId,
      type: 'lesson_complete',
      description: `Completaste la lección: ${lesson.id}`,
      timestamp: new Date().toISOString()
    });

    db.save();

    // Actualizar alertas del docente basadas en la entrega
    if (user) {
      if (user.stats) {
        user.stats.totalStudyMinutes += 20; // 20 minutos estimados de estudio de tarea
        db.save();
        checkAndRegisterAlert(user);
      }
    }

    // Recalcular progreso
    recalculateProgress(userId, lesson.courseId);

    res.json(newSubmission);
  } catch (error) {
    console.error('Error en submitTask:', error);
    res.status(500).json({ error: 'Error al subir o calificar la entrega de tarea.' });
  }
};

export const getProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = db.data.users.find((u) => u.id === userId);

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
  } catch (error) {
    res.status(500).json({ error: 'Error al recuperar progreso del usuario.' });
  }
};

export const toggleTask = async (req, res) => {
  try {
    const task = db.data.tasks.find((t) => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada.' });

    task.status = task.status === 'completed' ? 'pending' : 'completed';
    db.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Error al cambiar estado de la tarea.' });
  }
};

