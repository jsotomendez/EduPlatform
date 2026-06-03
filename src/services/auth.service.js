import { api } from '../utils/api';

export const authService = {
  /**
   * Inicia sesión en el servidor y almacena el token JWT.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} - Datos del usuario
   */
  async login(email, password) {
    const { token, user } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('edu_token', token);
    return user;
  },

  /**
   * Registra un nuevo usuario en el servidor y almacena el token JWT.
   * @param {{ name: string, email: string, password: string, role: string, program: string, semester: number }} data
   * @returns {Promise<object>} - Datos del usuario registrado
   */
  async register(data) {
    const { token, user } = await api.post('/api/auth/register', data);
    localStorage.setItem('edu_token', token);
    return user;
  },

  /**
   * Carga el usuario de demostración de estudiante del servidor.
   * @returns {Promise<object>}
   */
  async loadDemoStudent() {
    const { token, user } = await api.post('/api/auth/demo-student');
    localStorage.setItem('edu_token', token);
    return user;
  },

  /**
   * Carga el usuario de demostración de docente del servidor.
   * @returns {Promise<object>}
   */
  async loadDemoTeacher() {
    const { token, user } = await api.post('/api/auth/demo-teacher');
    localStorage.setItem('edu_token', token);
    return user;
  },

  /**
   * Limpia el token local del servidor.
   * @returns {Promise<boolean>}
   */
  async logout() {
    localStorage.removeItem('edu_token');
    return true;
  },
};
