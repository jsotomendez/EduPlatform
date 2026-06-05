import { api } from '../utils/api';

export const teacherService = {
  /**
   * Obtiene la lista de estudiantes con sus perfiles e indicadores de riesgo.
   */
  async getStudents(_teacherId) {
    return api.get('/api/teacher/students');
  },

  /**
   * Obtiene los KPIs globales de la clase (riesgo, progreso, alertas).
   */
  async getKPIs(_teacherId) {
    return api.get('/api/teacher/kpis');
  },

  /**
   * Obtiene la distribución de perfiles de aprendizaje VAK de los estudiantes.
   */
  async getVAKDistribution(_teacherId) {
    return api.get('/api/teacher/distribution');
  },

  /**
   * Obtiene la lista de alertas predictivas del aula.
   */
  async getAlerts(_teacherId) {
    return api.get('/api/teacher/alerts');
  },

  /**
   * Obtiene la ficha de detalle de un estudiante en particular.
   */
  async getStudentDetail(studentId) {
    const students = await api.get('/api/teacher/students');
    const student = students.find((s) => s.id === studentId);
    if (!student) throw new Error('Estudiante no encontrado.');
    return student;
  },

  /**
   * Envía un mensaje de intervención personalizado del profesor al estudiante.
   */
  async intervene(alertId, studentId, message) {
    return api.post('/api/teacher/intervene', { alertId, studentId, message });
  },

  /**
   * Obtiene el historial de chats de un estudiante con el Tutor IA.
   */
  async getStudentChats(studentId) {
    return api.get(`/api/teacher/students/${studentId}/chats`);
  },
};
