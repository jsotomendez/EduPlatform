import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { UPLOADS_DIR } from './config/upload.config.js';
import authRoutes from './routes/auth.routes.js';
import courseRoutes from './routes/course.routes.js';
import forumRoutes from './routes/forum.routes.js';
import aiRoutes from './routes/ai.routes.js';
import teacherRoutes from './routes/teacher.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// --- ENRUTADORES MODULARES ---
app.use('/api/auth', authRoutes);
app.use('/api', courseRoutes);
app.use('/api/community', forumRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/teacher', teacherRoutes);

// --- CAPTURA DE ERRORES GLOBAL / MULTER ---
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Error en la subida del archivo: ${err.message}` });
  } else if (err && err.message === 'Solo se permiten archivos PDF.') {
    return res.status(400).json({ error: err.message });
  }
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor.' });
});

app.listen(PORT, () => {
  console.log(`Servidor de EduPlatform corriendo en http://localhost:${PORT}`);
});
