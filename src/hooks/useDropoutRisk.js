import { useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { calculateDropoutRisk, riskLabel } from '../utils/riskCalculator';

/**
 * Calcula el riesgo de deserción del usuario autenticado.
 */
export function useDropoutRisk() {
  const { user } = useUser();

  return useMemo(() => {
    if (!user?.stats) return { level: 'low', score: 0, factors: [], label: 'Bajo' };
    const risk = calculateDropoutRisk(user.stats);
    return { ...risk, label: riskLabel(risk.level) };
  }, [user?.stats]);
}
