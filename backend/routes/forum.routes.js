import { Router } from 'express';
import {
  getPosts,
  getTrends,
  createPost,
  likePost,
  replyPost
} from '../controllers/forum.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Lectura pública del foro
router.get('/posts', getPosts);
router.get('/trends', getTrends);

// Acciones del estudiante (protegidas)
router.post('/posts', authenticateToken, createPost);
router.post('/posts/:id/like', authenticateToken, likePost);
router.post('/posts/:id/reply', authenticateToken, replyPost);

export default router;
