import { MOCK_USERS } from './users.mock';
import { calculateDropoutRisk } from '../utils/riskCalculator';

const students = MOCK_USERS.filter((u) => u.role === 'student');

export const MOCK_TEACHER_STUDENTS = students.map((s) => ({
  ...s,
  risk: calculateDropoutRisk(s.stats),
  lastAccessFormatted: new Date(Date.now() - s.stats.daysSinceLastLogin * 86400000).toISOString(),
}));

export const MOCK_TEACHER_KPIS = {
  totalStudents: 24,
  atRiskCount: 6,
  atRiskPercent: 25,
  avgProgress: 0.53,
  activeAlerts: 3,
  completionRate: 0.41,
};

export const MOCK_VAK_DISTRIBUTION = [
  { name: 'Visual', count: 11, percent: 46 },
  { name: 'Auditivo', count: 7, percent: 29 },
  { name: 'Kinestésico', count: 6, percent: 25 },
];

export const MOCK_TEACHER_ALERTS = [
  {
    id: 'al_001',
    studentId: 'u_002',
    studentName: 'Carlos Andrade Muñoz',
    type: 'high_risk',
    message: '9 días sin actividad. Riesgo de abandono alto.',
    action: 'Programar llamada motivacional',
    priority: 'high',
    timestamp: '2026-05-25T08:00:00Z',
  },
  {
    id: 'al_002',
    studentId: 'u_003',
    studentName: 'María Fernanda Soto',
    type: 'medium_risk',
    message: 'Puntaje promedio inferior al 65% en los últimos quizzes.',
    action: 'Revisar rutas de aprendizaje kinestésicas',
    priority: 'medium',
    timestamp: '2026-05-24T10:00:00Z',
  },
];
