import { Router } from 'express';
import { getChatHistory, postChat } from '../controllers/ai.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Chat del Tutor Inteligente con IA (protegidas)
router.get('/chat/history', authenticateToken, getChatHistory);
router.post('/chat', authenticateToken, postChat);

export default router;
