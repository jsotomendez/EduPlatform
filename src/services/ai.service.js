import { api } from '../utils/api';

export const aiService = {
  /**
   * Devuelve un mensaje contextual del tutor IA.
   * @param {{ consecutiveCorrect: number, consecutiveWrong: number, minutesInLesson: number, cognitiveProfile: string }} context
   * @returns {Promise<{ message: string, type: string }>}
   */
  async getTutorMessage(context) {
    // Al ser un saludo o incentivo contextual rápido de baja complejidad,
    // se procesa localmente para ahorrar latencia del servidor
    const { consecutiveCorrect = 0, consecutiveWrong = 0, minutesInLesson = 0 } = context;

    let type, message;

    const BREAK_SUGGESTIONS = [
      'Llevas más de 20 minutos en esta lección. ¡Te sugiero hacer una pausa de 5 minutos, estirarte y tomar un vaso de agua! 💧',
      '¡Hora de un respiro! Haz una pausa Pomodoro para recargar energías y consolidar lo aprendido. 🚶‍♂️',
    ];

    const ENCOURAGEMENTS = [
      '¡Increíble racha! Has acertado 3 respuestas seguidas. ¡Sigue con esa excelente concentración! 🚀',
      '¡Brillante! Estás demostrando un gran dominio del tema hoy. ¡Continúa así! ✨',
    ];

    const STRUGGLES = [
      'Veo que esta pregunta ha sido un reto. ¡No te preocupes! Intenta enfocar el problema paso a paso. Si necesitas ayuda, pregúntame en el chat. 💡',
      'El aprendizaje requiere ensayo y error. ¿Quieres que repasemos el concepto de otra forma en el chat del tutor? 🤝',
    ];

    const INACTIVITY_MESSAGES = [
      'Veo que te has tomado un momento. ¡No hay prisa! Si hay algún concepto confuso, cuéntame en el chat y lo resolveremos juntos. 💡',
      '¿Todo bien por ahí? Si necesitas un ejemplo práctico o que te explique un término de otra forma, solo pregúntame. 🤖',
      'Hacer pausas es parte de aprender, pero si te trabaste en alguna parte, recuerda que puedes preguntarme para guiarte. 🤝',
    ];

    const GREETINGS = [
      '¡Hola! Estoy aquí para acompañarte en tu estudio hoy. ¿En qué concepto te gustaría profundizar? 🤖',
      '¡Qué bueno verte estudiando! Si te surge alguna duda con el material, solo escríbeme. 📝',
    ];

    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    if (context.inactive) {
      type = 'inactivity';
      message = pickRandom(INACTIVITY_MESSAGES);
    } else if (minutesInLesson > 20) {
      type = 'break';
      message = pickRandom(BREAK_SUGGESTIONS);
    } else if (consecutiveCorrect >= 3) {
      type = 'encouragement';
      message = pickRandom(ENCOURAGEMENTS);
    } else if (consecutiveWrong >= 2) {
      type = 'struggle';
      message = pickRandom(STRUGGLES);
    } else {
      type = 'greeting';
      message = pickRandom(GREETINGS);
    }

    return { message, type };
  },

  async getNextTopicSuggestion(_lessonId) {
    return {
      message: 'Te sugiero continuar con "Ecuaciones de Primer Grado". Es el paso natural en tu ruta de aprendizaje adaptada.',
      type: 'next',
    };
  },

  async getRiskAlert(userId) {
    return {
      message: 'Alerta de riesgo de deserción detectada debido a inactividad prolongada.',
      type: 'risk',
      userId,
    };
  },

  /**
   * Obtiene el historial de chat persistente para un usuario y lección específica.
   */
  async getChatHistory(cognitiveProfile, lessonId = null) {
    try {
      const url = lessonId
        ? `/api/ai/chat/history?lessonId=${lessonId}`
        : '/api/ai/chat/history';
      const history = await api.get(url);
      return history || [];
    } catch (error) {
      console.error('Error al obtener historial del chat:', error);
      return [];
    }
  },

  /**
   * Genera una respuesta del tutor de IA llamando al servidor de backend.
   * Pasa el mensaje, el perfil, el historial de chat y el ID de la lección para RAG contextual.
   */
  async getChatResponse(message, cognitiveProfile, chatHistory = [], lessonId = null) {
    const userApiKey = localStorage.getItem('edu_gemini_api_key') || '';
    const style = cognitiveProfile?.primary || 'visual';

    const headers = {};
    if (userApiKey) {
      headers['x-gemini-key'] = userApiKey;
    }

    try {
      const data = await api.post(
        '/api/ai/chat',
        {
          message,
          chatHistory,
          lessonId,
          activeStyle: style,
        },
        { headers }
      );

      return data.response;
    } catch (error) {
      console.error('Error al obtener respuesta de la IA del servidor:', error);
      return `⚠️ *[Error de conexión con el tutor IA: ${error.message}]. Por favor, comprueba que el servidor esté activo.*`;
    }
  },
};
