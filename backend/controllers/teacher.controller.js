import { db } from '../db.js';
import { calculateDropoutRisk } from '../utils.js';

export const getStudents = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Acceso denegado. Rol de docente requerido.' });
    }

    const students = db.data.users
      .filter((u) => u.role === 'student')
      .map((s) => {
        const risk = calculateDropoutRisk(s.stats);
        return {
          ...s,
          risk,
        };
      });

    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener listado de estudiantes.' });
  }
};

export const getKpis = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Acceso denegado. Rol de docente requerido.' });
    }

    const students = db.data.users.filter((u) => u.role === 'student');
    const atRiskStudents = students.filter(
      (s) => calculateDropoutRisk(s.stats).level === 'high' || calculateDropoutRisk(s.stats).level === 'medium'
    );

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
  } catch (error) {
    res.status(500).json({ error: 'Error al recuperar KPIs del aula.' });
  }
};

export const getDistribution = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Acceso denegado. Rol de docente requerido.' });
    }

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
  } catch (error) {
    res.status(500).json({ error: 'Error al recuperar la distribución VAK.' });
  }
};

export const getAlerts = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Acceso denegado. Rol de docente requerido.' });
    }
    res.json(db.data.alerts || []);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener alertas del docente.' });
  }
};

export const interveneAlert = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Acceso denegado. Rol de docente requerido.' });
    }

    const { alertId, message, studentId } = req.body;

    const alertIndex = db.data.alerts.findIndex((a) => a.id === alertId);
    if (alertIndex !== -1) {
      db.data.alerts.splice(alertIndex, 1);
    }

    // Registrar intervención como actividad/notificación del estudiante
    db.data.activities.push({
      id: `act_${Date.now()}`,
      userId: studentId,
      type: 'intervention',
      description: `El docente te envió un mensaje de apoyo adaptado: "${message.substring(0, 40)}..."`,
      timestamp: new Date().toISOString(),
    });

    db.save();

    // Actualizar racha y stats del estudiante tras recibir apoyo del docente (mejora motivación)
    const studentIdx = db.data.users.findIndex((u) => u.id === studentId);
    if (studentIdx !== -1) {
      const student = db.data.users[studentIdx];
      if (student.stats) {
        student.stats.daysSinceLastLogin = 0; // Se asume acción inmediata
        db.save();
      }
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al realizar la intervención de la alerta.' });
  }
};

export const getStudentChats = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Acceso denegado. Rol de docente requerido.' });
    }

    const { studentId } = req.params;
    const studentChats = (db.data.chats || []).filter((c) => c.userId === studentId);

    const formattedChats = studentChats.map((c) => {
      const lesson = db.data.lessons.find((l) => l.id === c.lessonId);
      return {
        id: c.id,
        userId: c.userId,
        lessonId: c.lessonId,
        lessonTitle: lesson ? lesson.title : 'Chat de Consulta General',
        messages: c.messages || [],
      };
    });

    res.json(formattedChats);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los chats del estudiante.' });
  }
};

