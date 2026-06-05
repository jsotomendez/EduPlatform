import { Router } from 'express';
import {
  getStudents,
  getKpis,
  getDistribution,
  getAlerts,
  interveneAlert,
  getStudentChats
} from '../controllers/teacher.controller.js';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Panel del docente (rutas protegidas para rol de profesor)
router.get('/students', authenticateToken, authorizeRole('teacher'), getStudents);
router.get('/kpis', authenticateToken, authorizeRole('teacher'), getKpis);
router.get('/distribution', authenticateToken, authorizeRole('teacher'), getDistribution);
router.get('/alerts', authenticateToken, authorizeRole('teacher'), getAlerts);
router.post('/intervene', authenticateToken, authorizeRole('teacher'), interveneAlert);
router.get('/students/:studentId/chats', authenticateToken, authorizeRole('teacher'), getStudentChats);

export default router;

