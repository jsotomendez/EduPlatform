export const AI_RESPONSES = {
  encouragement: [
    '¡Excelente trabajo! Respondiste 3 preguntas seguidas correctamente. ¿Pasamos al siguiente concepto?',
    '¡Vas muy bien! Tu constancia está dando resultados. Sigue con ese ritmo.',
    '¡Increíble! Dominas este tema. Creo que estás listo para un desafío mayor.',
    '¡Perfecto! Tu estilo visual te ayuda mucho aquí. Aprovechemos eso.',
  ],
  struggle: [
    'Noto que esta sección está siendo desafiante. Probemos con un enfoque diferente, ¿te parece?',
    'No te preocupes, este tema es difícil para muchos. Te recomiendo ver el video explicativo antes de continuar.',
    'Tomemos un paso atrás. A veces revisar el concepto anterior ayuda a entender este mejor.',
    'Tu perfil kinestésico sugiere que un ejercicio práctico te ayudaría más que leer. ¿Lo intentamos?',
  ],
  breakSuggestion: [
    'Llevas más de 20 minutos en esta lección. Un descanso de 5 minutos mejorará tu concentración.',
    '¡Tu cerebro necesita oxigenarse! Toma un descanso breve y vuelve con energía renovada.',
    'La ciencia demuestra que los descansos mejoran la retención. ¿Qué tal 5 minutos?',
  ],
  nextTopic: [
    '¡Has completado esta lección con éxito! La siguiente lección profundiza en este tema. ¿Seguimos?',
    '¡Lección dominada! El próximo módulo conecta esto con aplicaciones del mundo real.',
    '¡Bien hecho! Avancemos antes de que se enfríe el entusiasmo.',
  ],
  reviewSuggestion: [
    'Te recomiendo revisar los conceptos del módulo anterior antes de continuar. ¡Va a facilitar mucho este nuevo tema!',
    'Este concepto es la base de los siguientes. Asegúrate de que esté claro.',
    'Si algo no quedó claro, el tutor en vivo puede ayudarte. No dudes en preguntar.',
  ],
  riskAlert: [
    'He notado que no has ingresado en varios días. ¡Te esperamos! ¿Todo bien?',
    'Tu progreso es valioso. Solo faltan unos minutos al día para mantener el ritmo.',
    'Cada pequeño avance cuenta. ¿Empezamos con algo corto hoy?',
  ],
  greeting: [
    '¡Hola! Soy tu tutor de IA. Estoy aquí para ayudarte a aprender a tu propio ritmo.',
    '¡Bienvenido de nuevo! ¿Listo para continuar donde lo dejamos?',
    '¡Qué bueno verte! Tu sesión de hoy está lista. ¿Comenzamos?',
  ],
};

export const TEACHER_AI_INSIGHTS = [
  {
    id: 'ai_t_001',
    type: 'risk_alert',
    studentId: 'u_002',
    message:
      'Carlos Andrade lleva 9 días sin ingresar. Riesgo de abandono elevado. Recomendación: contacto personalizado.',
    priority: 'high',
    timestamp: '2026-05-25T08:00:00Z',
  },
  {
    id: 'ai_t_002',
    type: 'performance',
    studentId: 'u_003',
    message:
      'María Soto mejoró su puntaje promedio un 15% esta semana. El contenido kinestésico está siendo efectivo.',
    priority: 'low',
    timestamp: '2026-05-25T07:00:00Z',
  },
  {
    id: 'ai_t_003',
    type: 'engagement',
    studentId: 'u_001',
    message:
      'Brigitte Pico tiene una racha de 7 días. Es el momento ideal para asignar un reto de mayor complejidad.',
    priority: 'medium',
    timestamp: '2026-05-24T20:00:00Z',
  },
];
