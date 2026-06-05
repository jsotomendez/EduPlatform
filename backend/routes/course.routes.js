import { Router } from 'express';
import {
  getCourses,
  getCourseById,
  getLessonById,
  getLessonsByCourseId,
  createModule,
  createLesson,
  completeLesson,
  submitQuiz,
  getSubmissions,
  submitTask,
  getProgress,
  toggleTask
} from '../controllers/course.controller.js';
import { submitDiagnostic } from '../controllers/auth.controller.js';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware.js';
import { upload } from '../config/upload.config.js';

const router = Router();

// Rutas de lectura de Cursos y Lecciones
router.get('/courses', getCourses);
router.get('/courses/:id', getCourseById);
router.get('/lessons/:id', getLessonById);
router.get('/courses/:id/lessons', getLessonsByCourseId);

// Creación de contenido (protegida para docentes)
router.post('/courses/:id/modules', authenticateToken, authorizeRole('teacher'), createModule);
router.post('/courses/:id/modules/:moduleId/lessons', authenticateToken, authorizeRole('teacher'), createLesson);

// Lógica de avance del alumno (protegida para estudiantes)
router.post('/lessons/:id/complete', authenticateToken, completeLesson);
router.post('/lessons/:id/quiz', authenticateToken, submitQuiz);
router.get('/submissions', authenticateToken, getSubmissions);
router.post('/lessons/:id/submit', authenticateToken, upload.single('taskFile'), submitTask);

// Diagnóstico VAK (sometimiento directo)
router.post('/diagnostic/submit', authenticateToken, submitDiagnostic);

// Progreso general del tablero del alumno
router.get('/progress', authenticateToken, getProgress);
router.post('/progress/tasks/:id/toggle', authenticateToken, toggleTask);

export default router;
