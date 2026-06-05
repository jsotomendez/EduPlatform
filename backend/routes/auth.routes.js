import { Router } from 'express';
import {
  login,
  register,
  demoStudent,
  demoTeacher,
  getMe,
  updateProfile
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas públicas de autenticación
router.post('/login', login);
router.post('/register', register);
router.post('/demo-student', demoStudent);
router.post('/demo-teacher', demoTeacher);

// Rutas protegidas de autenticación
router.get('/me', authenticateToken, getMe);
router.post('/profile', authenticateToken, updateProfile);

export default router;
