import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { classifyVAK, calculateDropoutRisk } from '../utils.js';
import { JWT_SECRET } from '../middlewares/auth.middleware.js';

// Función helper para generar alertas basadas en riesgo
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
    // Si el riesgo bajó a low, removemos la alerta si existía
    if (existingAlertIdx !== -1) {
      db.data.alerts.splice(existingAlertIdx, 1);
      db.save();
    }
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos.' });
    }

    const user = db.data.users.find((u) => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Credenciales incorrectas.' });
    }

    const isMatch = bcrypt.compareSync(
      password,
      user.passwordHash || bcrypt.hashSync(user.password || 'demo1234', 10)
    );
    if (!isMatch) {
      return res.status(400).json({ error: 'Credenciales incorrectas.' });
    }

    // Al iniciar sesión, re-evaluamos riesgo del estudiante si corresponde
    if (user.role === 'student') {
      // Incrementar días de login o actualizar estadísticas de racha
      if (user.stats) {
        user.stats.daysSinceLastLogin = 0;
        user.stats.streak = (user.stats.streak || 0) + 1;
        checkAndRegisterAlert(user);
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const { passwordHash: _, password: _p, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor al autenticar.' });
  }
};

export const register = async (req, res) => {
  try {
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
        streak: 1,
      },
      enrolledCourses: ['c_001', 'c_002'],
      courseProgress: {
        c_001: 0,
        c_002: 0,
        c_003: 0,
        c_004: 0,
        c_005: 0,
        c_006: 0,
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
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar.' });
  }
};

export const demoStudent = async (req, res) => {
  try {
    const user = db.data.users.find((u) => u.id === 'u_001');
    if (!user) return res.status(404).json({ error: 'Demo estudiante no encontrado.' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });
    const { passwordHash: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

export const demoTeacher = async (req, res) => {
  try {
    const user = db.data.users.find((u) => u.id === 'u_004');
    if (!user) return res.status(404).json({ error: 'Demo docente no encontrado.' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });
    const { passwordHash: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = db.data.users.find((u) => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const { passwordHash: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

export const updateProfile = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el perfil.' });
  }
};

export const submitDiagnostic = async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Respuestas diagnósticas requeridas.' });
    }

    const userIdx = db.data.users.findIndex((u) => u.id === req.user.id);
    if (userIdx === -1) return res.status(404).json({ error: 'Usuario no encontrado.' });

    const user = db.data.users[userIdx];
    const cognitiveProfile = classifyVAK(answers);
    cognitiveProfile.diagnosedAt = new Date().toISOString();

    user.cognitiveProfile = cognitiveProfile;
    
    // Almacenar diagnóstico y recalcular alertas por si cambia el canal recomendado
    db.data.users[userIdx] = user;
    db.save();

    checkAndRegisterAlert(user);

    res.json({ success: true, cognitiveProfile });
  } catch (error) {
    console.error('Error en submitDiagnostic:', error);
    res.status(500).json({ error: 'Error al guardar el diagnóstico VAK.' });
  }
};
