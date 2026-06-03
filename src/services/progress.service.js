import { api } from '../utils/api';

export const progressService = {
  /**
   * Obtiene el progreso semanal de tiempo de estudio.
   */
  async getWeeklyProgress(_userId) {
    const data = await api.get('/api/progress');
    return data.weekly;
  },

  /**
   * Obtiene el progreso mensual de tiempo de estudio.
   */
  async getMonthlyProgress(_userId) {
    const data = await api.get('/api/progress');
    return data.monthly;
  },

  /**
   * Obtiene las medallas/insignias del usuario.
   */
  async getBadges(_userId) {
    const data = await api.get('/api/progress');
    return data.badges;
  },

  /**
   * Obtiene el historial de actividades académicas recientes.
   */
  async getRecentActivities(_userId) {
    const data = await api.get('/api/progress');
    return data.activities;
  },

  /**
   * Obtiene el listado de tareas pendientes.
   */
  async getUpcomingTasks(_userId) {
    const data = await api.get('/api/progress');
    return data.tasks;
  },

  /**
   * Genera dinámicamente el progreso por curso basado en la base de datos real.
   */
  async getCourseProgress(_userId) {
    const courses = await api.get('/api/courses');
    return courses.map((c) => ({
      id: c.id,
      course: c.title,
      progress: Math.round(c.progress * 100),
      color: c.color,
      icon: c.icon,
    }));
  },

  /**
   * Genera dinámicamente el radar VAK usando las calificaciones diagnósticas reales del usuario.
   */
  async getVAKRadar(_userId) {
    const user = await api.get('/api/auth/me');
    if (user && user.cognitiveProfile) {
      const { scores } = user.cognitiveProfile;
      return [
        { subject: 'Visual', A: Math.round((scores.visual || 0) * 10), fullMark: 100 },
        { subject: 'Auditivo', A: Math.round((scores.auditory || 0) * 10), fullMark: 100 },
        { subject: 'Kinestésico', A: Math.round((scores.kinesthetic || 0) * 10), fullMark: 100 },
      ];
    }
    return [
      { subject: 'Visual', A: 0, fullMark: 100 },
      { subject: 'Auditivo', A: 0, fullMark: 100 },
      { subject: 'Kinestésico', A: 0, fullMark: 100 },
    ];
  },

  /**
   * Registra la aprobación de un quiz.
   */
  async recordQuizPassed(lessonId, score, courseId) {
    // El servidor maneja automáticamente los cambios al calificar el quiz
    return { success: true, lessonId, score, courseId };
  },

  /**
   * Registra la finalización del diagnóstico.
   */
  async recordDiagnosticCompleted(scores) {
    // Sincronizado dinámicamente al enviar el diagnóstico
    return { success: true, scores };
  },

  /**
   * Cambia el estado completada/pendiente de una tarea en el servidor.
   */
  async toggleTaskStatus(taskId) {
    return api.post(`/api/progress/tasks/${taskId}/toggle`);
  },
};
