import { STYLE_ORDER } from '../constants/learningStyles';

/**
 * Clasifica el estilo cognitivo VAK a partir de las respuestas del diagnóstico.
 * En caso de empate, se prefiere el orden: Visual > Auditivo > Kinestésico.
 *
 * @param {Array<{questionId: number, style: string}>} answers
 * @returns {{ primary: string, secondary: string, scores: {visual: number, auditory: number, kinesthetic: number} }}
 */
export function classifyVAK(answers) {
  const scores = { visual: 0, auditory: 0, kinesthetic: 0 };

  answers.forEach(({ style }) => {
    if (style in scores) scores[style]++;
  });

  // Ordena respetando el desempate por STYLE_ORDER
  const sorted = STYLE_ORDER.slice().sort((a, b) => scores[b] - scores[a]);

  return {
    primary: sorted[0],
    secondary: sorted[1],
    scores,
  };
}
