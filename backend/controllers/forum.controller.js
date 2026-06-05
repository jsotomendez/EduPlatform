import { db } from '../db.js';

export const getPosts = async (req, res) => {
  try {
    res.json(db.data.posts || []);
  } catch (error) {
    res.status(500).json({ error: 'Error al recuperar publicaciones.' });
  }
};

export const getTrends = async (req, res) => {
  try {
    res.json(db.data.trends || []);
  } catch (error) {
    res.status(500).json({ error: 'Error al recuperar tendencias.' });
  }
};

export const createPost = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la publicación.' });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = db.data.posts.find((p) => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: 'Publicación no encontrada.' });

    post.likes = (post.likes || 0) + 1;
    db.save();

    res.json({ success: true, likes: post.likes });
  } catch (error) {
    res.status(500).json({ error: 'Error al dar like a la publicación.' });
  }
};

export const replyPost = async (req, res) => {
  try {
    const post = db.data.posts.find((p) => p.id === req.params.id);
    if (!post) return res.status(404).json({ error: 'Publicación no encontrada.' });

    post.replies = (post.replies || 0) + 1;
    db.save();

    res.json({ success: true, replies: post.replies });
  } catch (error) {
    res.status(500).json({ error: 'Error al responder a la publicación.' });
  }
};
