import { describe, it, expect } from 'vitest';
import { calculateDropoutRisk, riskLabel } from '../utils/riskCalculator.js';

describe('Calculador de Riesgo de Deserción', () => {
  it('debe clasificar como Bajo (low) cuando la puntuación acumulada es menor a 0.3', () => {
    const stats = {
      daysSinceLastLogin: 2,
      completedLessonsThisWeek: 3,
      avgQuizScore: 0.85,
      missedDeadlines: 0,
    };

    const result = calculateDropoutRisk(stats);

    expect(result.level).toBe('low');
    expect(result.score).toBe(0);
    expect(result.factors.length).toBe(0);
  });

  it('debe clasificar como Medio (medium) cuando la puntuación acumulada está entre 0.3 y 0.6', () => {
    // daysSinceLastLogin > 7 añade +0.3
    const stats = {
      daysSinceLastLogin: 10,
      completedLessonsThisWeek: 2,
      avgQuizScore: 0.75,
      missedDeadlines: 0,
    };

    const result = calculateDropoutRisk(stats);

    expect(result.level).toBe('medium');
    expect(result.score).toBe(0.3);
    expect(result.factors).toContain('low_engagement');
  });

  it('debe clasificar como Alto (high) cuando la puntuación acumulada es mayor a 0.6', () => {
    // low_engagement (+0.3), no_progress (+0.25), low_performance (+0.25) -> score 0.8
    const stats = {
      daysSinceLastLogin: 12,
      completedLessonsThisWeek: 0,
      avgQuizScore: 0.35,
      missedDeadlines: 0,
    };

    const result = calculateDropoutRisk(stats);

    expect(result.level).toBe('high');
    expect(result.score).toBe(0.8);
    expect(result.factors).toContain('low_engagement');
    expect(result.factors).toContain('no_progress');
    expect(result.factors).toContain('low_performance');
  });

  it('debe limitar el score máximo a 1.0', () => {
    // Todos los factores desencadenados -> 0.3 + 0.25 + 0.25 + 0.2 = 1.0
    const stats = {
      daysSinceLastLogin: 15,
      completedLessonsThisWeek: 0,
      avgQuizScore: 0.2,
      missedDeadlines: 3,
    };

    const result = calculateDropoutRisk(stats);

    expect(result.level).toBe('high');
    expect(result.score).toBe(1.0);
    expect(result.factors.length).toBe(4);
  });

  it('debe mapear correctamente las etiquetas de riesgo en español', () => {
    expect(riskLabel('low')).toBe('Bajo');
    expect(riskLabel('medium')).toBe('Medio');
    expect(riskLabel('high')).toBe('Alto');
    expect(riskLabel('invalid')).toBe('Desconocido');
  });
});
