import { describe, it, expect } from 'vitest';
import { classifyVAK } from '../utils/vakClassifier.js';

describe('Clasificador VAK', () => {
  it('debe clasificar correctamente cuando hay un ganador claro', () => {
    const answers = [
      { questionId: 1, style: 'visual' },
      { questionId: 2, style: 'visual' },
      { questionId: 3, style: 'visual' },
      { questionId: 4, style: 'auditory' },
      { questionId: 5, style: 'auditory' },
      { questionId: 6, style: 'kinesthetic' },
    ];

    const result = classifyVAK(answers);

    expect(result.primary).toBe('visual');
    expect(result.secondary).toBe('auditory');
    expect(result.scores.visual).toBe(3);
    expect(result.scores.auditory).toBe(2);
    expect(result.scores.kinesthetic).toBe(1);
  });

  it('debe desempatar en favor de Visual sobre Auditivo y Kinestésico', () => {
    // Empate a 2 entre todos los estilos
    const answers = [
      { questionId: 1, style: 'visual' },
      { questionId: 2, style: 'visual' },
      { questionId: 3, style: 'auditory' },
      { questionId: 4, style: 'auditory' },
      { questionId: 5, style: 'kinesthetic' },
      { questionId: 6, style: 'kinesthetic' },
    ];

    const result = classifyVAK(answers);

    // Visual > Auditory > Kinesthesic
    expect(result.primary).toBe('visual');
    expect(result.secondary).toBe('auditory');
  });

  it('debe desempatar en favor de Auditivo sobre Kinestésico en caso de empate', () => {
    // Empate a 3 entre auditivo y kinestésico (visual = 0)
    const answers = [
      { questionId: 1, style: 'auditory' },
      { questionId: 2, style: 'auditory' },
      { questionId: 3, style: 'auditory' },
      { questionId: 4, style: 'kinesthetic' },
      { questionId: 5, style: 'kinesthetic' },
      { questionId: 6, style: 'kinesthetic' },
    ];

    const result = classifyVAK(answers);

    expect(result.primary).toBe('auditory');
    expect(result.secondary).toBe('kinesthetic');
  });

  it('debe retornar puntuaciones de cero para estilos que no fueron elegidos', () => {
    const answers = [
      { questionId: 1, style: 'visual' },
      { questionId: 2, style: 'visual' },
    ];

    const result = classifyVAK(answers);

    expect(result.primary).toBe('visual');
    expect(result.scores.visual).toBe(2);
    expect(result.scores.auditory).toBe(0);
    expect(result.scores.kinesthetic).toBe(0);
  });
});
