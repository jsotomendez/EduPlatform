import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiService } from '../services/ai.service.js';
import { api } from '../utils/api.js';

// Mock del helper de peticiones de red
vi.mock('../utils/api.js', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
vi.stubGlobal('localStorage', localStorageMock);

describe('aiService - Tutor de IA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTutorMessage (Lógica Contextual Local)', () => {
    it('debe dar sugerencias de pausa si lleva más de 20 minutos en la lección', async () => {
      const res = await aiService.getTutorMessage({ minutesInLesson: 25 });
      expect(res.type).toBe('break');
      expect(res.message).toMatch(/(pausa|respiro|Pomodoro)/);
    });

    it('debe motivar al estudiante si tiene una racha de 3 aciertos', async () => {
      const res = await aiService.getTutorMessage({ consecutiveCorrect: 3 });
      expect(res.type).toBe('encouragement');
      expect(res.message).toMatch(/(acertado|racha|brillante)/i);
    });

    it('debe ofrecer ayuda si se equivoca 2 veces seguidas', async () => {
      const res = await aiService.getTutorMessage({ consecutiveWrong: 2 });
      expect(res.type).toBe('struggle');
      expect(res.message).toMatch(/(reto|error|ayuda)/i);
    });

    it('debe disparar un mensaje de inactividad si context.inactive es verdadero', async () => {
      const res = await aiService.getTutorMessage({ inactive: true });
      expect(res.type).toBe('inactivity');
      expect(res.message).toMatch(/(inactivo|pausas|momento|ejemplo|preguntar)/i);
    });
  });

  describe('getChatResponse (Llamadas a API de Backend)', () => {
    it('debe realizar un POST al servidor inyectando la llave de Gemini si existe en localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('mi_api_key_secreta');
      api.post.mockResolvedValue({ response: 'Respuesta del tutor' });

      const reply = await aiService.getChatResponse('Hola', { primary: 'visual' }, []);
      
      expect(api.post).toHaveBeenCalledWith(
        '/api/ai/chat',
        expect.objectContaining({ message: 'Hola', activeStyle: 'visual' }),
        expect.objectContaining({
          headers: { 'x-gemini-key': 'mi_api_key_secreta' }
        })
      );
      expect(reply).toBe('Respuesta del tutor');
    });

    it('debe capturar errores del servidor y devolver un mensaje de error constructivo', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      api.post.mockRejectedValue(new Error('Servidor inactivo (500)'));

      const reply = await aiService.getChatResponse('Hola', { primary: 'visual' }, []);
      expect(reply).toContain('Error de conexión con el tutor IA');
    });
  });
});
