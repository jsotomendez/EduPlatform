import { api } from '../utils/api';

export const communityService = {
  /**
   * Obtiene la lista de debates del foro desde el servidor.
   * @returns {Promise<Array>}
   */
  async getPosts() {
    return api.get('/api/community/posts');
  },

  /**
   * Obtiene el detalle de un post específico.
   * @param {string} postId
   * @returns {Promise<object>}
   */
  async getPostById(postId) {
    const posts = await api.get('/api/community/posts');
    const post = posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post no encontrado.');
    return post;
  },

  /**
   * Crea un nuevo post en el foro de la comunidad.
   * @param {{ title: string, content: string, course: string }} postData
   * @returns {Promise<object>}
   */
  async createPost(postData) {
    return api.post('/api/community/posts', postData);
  },

  /**
   * Incrementa el contador de Likes de una publicación.
   * @param {string} postId
   * @returns {Promise<boolean>}
   */
  async likePost(postId) {
    await api.post(`/api/community/posts/${postId}/like`);
    return true;
  },

  /**
   * Obtiene las etiquetas de tendencias del foro.
   * @returns {Promise<Array>}
   */
  async getTrendingTopics() {
    return api.get('/api/community/trends');
  },
};
