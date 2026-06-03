export const STYLE_ORDER = ['visual', 'auditory', 'kinesthetic'];

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

/**
 * Clasifica el estilo cognitivo VAK a partir de las respuestas del diagnóstico.
 * @param {Array<{questionId: number, style: string}>} answers
 * @returns {{ primary: string, secondary: string, scores: {visual: number, auditory: number, kinesthetic: number} }}
 */
export function classifyVAK(answers) {
  const scores = { visual: 0, auditory: 0, kinesthetic: 0 };

  answers.forEach(({ style }) => {
    if (style in scores) scores[style]++;
  });

  const sorted = STYLE_ORDER.slice().sort((a, b) => scores[b] - scores[a]);

  return {
    primary: sorted[0],
    secondary: sorted[1],
    scores,
  };
}

/**
 * Calcula el nivel de riesgo de deserción a partir de métricas de comportamiento.
 * @param {{ daysSinceLastLogin: number, completedLessonsThisWeek: number, avgQuizScore: number, missedDeadlines: number }} metrics
 * @returns {{ level: string, score: number, factors: string[] }}
 */
export function calculateDropoutRisk(metrics) {
  const { daysSinceLastLogin = 0, completedLessonsThisWeek = 0, avgQuizScore = 0, missedDeadlines = 0 } = metrics;
  let score = 0;
  const factors = [];

  if (daysSinceLastLogin > 7) {
    score += 0.3;
    factors.push('low_engagement');
  }
  if (completedLessonsThisWeek === 0) {
    score += 0.25;
    factors.push('no_progress');
  }
  if (avgQuizScore < 0.5) {
    score += 0.25;
    factors.push('low_performance');
  }
  if (missedDeadlines > 1) {
    score += 0.2;
    factors.push('missed_deadlines');
  }

  const level =
    score < 0.3 ? RISK_LEVELS.LOW : score <= 0.6 ? RISK_LEVELS.MEDIUM : RISK_LEVELS.HIGH;

  return { level, score: Math.min(score, 1), factors };
}
