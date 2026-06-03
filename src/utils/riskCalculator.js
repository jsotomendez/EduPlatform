import { RISK_LEVELS } from '../constants/config';

/**
 * Calcula el nivel de riesgo de deserción a partir de métricas de comportamiento.
 *
 * @param {{ daysSinceLastLogin: number, completedLessonsThisWeek: number, avgQuizScore: number, missedDeadlines: number }} metrics
 * @returns {{ level: string, score: number, factors: string[] }}
 */
export function calculateDropoutRisk(metrics) {
  const { daysSinceLastLogin, completedLessonsThisWeek, avgQuizScore, missedDeadlines } = metrics;
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

/** @param {string} level @returns {string} */
export function riskLabel(level) {
  return { low: 'Bajo', medium: 'Medio', high: 'Alto' }[level] ?? 'Desconocido';
}
