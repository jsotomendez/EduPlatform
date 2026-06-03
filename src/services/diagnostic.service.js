import { api } from '../utils/api';
import { LEARNING_STYLES } from '../constants/learningStyles';
import { diagnosticQuestions } from '../mocks/diagnosticQuestions.mock';

export const diagnosticService = {
  /**
   * Obtiene las preguntas del diagnóstico académico.
   * @returns {Promise<Array>}
   */
  async getQuestions() {
    // Las preguntas son constantes y se mantienen locales por eficiencia
    return [...diagnosticQuestions];
  },

  /**
   * Envía las respuestas diagnósticas al servidor para clasificar el estilo cognitivo.
   * @param {Array<{questionId: number, style: string}>} answers
   * @returns {Promise<object>}
   */
  async submitAnswers(answers) {
    const { cognitiveProfile } = await api.post('/api/diagnostic/submit', { answers });
    const styleInfo = LEARNING_STYLES[cognitiveProfile.primary];

    return {
      profile: cognitiveProfile.primary,
      secondary: cognitiveProfile.secondary,
      scores: cognitiveProfile.scores,
      styleInfo,
      recommendations: styleInfo?.tips || [],
      diagnosedAt: cognitiveProfile.diagnosedAt,
    };
  },
};
