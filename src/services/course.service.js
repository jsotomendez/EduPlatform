import { api } from '../utils/api';

export const courseService = {
  /**
   * Obtiene la lista completa de cursos desde el servidor.
   * @param {string} [_userId]
   * @returns {Promise<Array>}
   */
  async getCourses(_userId) {
    return api.get('/api/courses');
  },

  /**
   * Obtiene el detalle de un curso específico.
   * @param {string} courseId
   * @returns {Promise<object>}
   */
  async getCourseById(courseId) {
    return api.get(`/api/courses/${courseId}`);
  },

  /**
   * Obtiene los cursos recomendados según el perfil cognitivo del estudiante.
   * @param {string} cognitiveProfile
   * @returns {Promise<Array>}
   */
  async getRecommendedCourses(cognitiveProfile) {
    const courses = await api.get('/api/courses');
    return courses.filter(
      (c) => c.status === 'recommended' || c.adaptedFor === cognitiveProfile
    );
  },

  /**
   * Obtiene el detalle de una lección específica.
   * @param {string} lessonId
   * @returns {Promise<object>}
   */
  async getLessonById(lessonId) {
    return api.get(`/api/lessons/${lessonId}`);
  },

  /**
   * Obtiene la lista de lecciones pertenecientes a un curso.
   * @param {string} courseId
   * @returns {Promise<Array>}
   */
  async getLessonsByCourse(courseId) {
    return api.get(`/api/courses/${courseId}/lessons`);
  },

  /**
   * Registra la lección como completada para el estudiante.
   * @param {string} lessonId
   * @param {string} [_userId]
   * @returns {Promise<object>}
   */
  async completeLesson(lessonId, _userId) {
    return api.post(`/api/lessons/${lessonId}/complete`);
  },

  /**
   * Envía las respuestas del quiz y retorna los resultados calculados del servidor.
   * @param {string} lessonId
   * @param {Array<number>} answers
   * @returns {Promise<object>}
   */
  async submitQuiz(lessonId, answers) {
    return api.post(`/api/lessons/${lessonId}/quiz`, { answers });
  },

  /**
   * Actualiza el título o propiedades de un curso (Módulo del profesor).
   */
  async updateCourse(updatedCourse) {
    // Enviar al servidor en una API real
    return updatedCourse;
  },

  /**
   * Crea un nuevo módulo dentro de un curso (Profesor).
   */
  async createModule(courseId, title, description) {
    return api.post(`/api/courses/${courseId}/modules`, { title, description });
  },

  /**
   * Actualiza el título de un módulo (Profesor).
   */
  async updateModuleTitle(courseId, moduleId, newTitle) {
    // Sincronizar con backend si es necesario, o devolver simulado
    return { courseId, moduleId, newTitle };
  },

  /**
   * Crea una lección dentro de un módulo (Profesor).
   */
  async createLesson(courseId, moduleId, lessonDetails) {
    return api.post(`/api/courses/${courseId}/modules/${moduleId}/lessons`, lessonDetails);
  },

  /**
   * Envía un archivo PDF de tarea para ser calificado por la IA.
   */
  async submitTask(lessonId, file) {
    const formData = new FormData();
    formData.append('taskFile', file);
    return api.post(`/api/lessons/${lessonId}/submit`, formData);
  },

  /**
   * Obtiene la lista de entregas de tareas del estudiante.
   */
  async getSubmissions(lessonId = null) {
    const url = lessonId
      ? `/api/submissions?lessonId=${lessonId}`
      : '/api/submissions';
    return api.get(url);
  },
};
