export const MOCK_LESSONS = [
  {
    id: 'l_001',
    courseId: 'c_001',
    moduleId: 'm_001',
    title: 'Introducción al Álgebra',
    type: 'video',
    duration: 12,
    completed: true,
    quiz: [
      {
        id: 'q_001',
        question: '¿Cuál es el resultado de resolver 2x + 4 = 10?',
        options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
        correct: 1,
        explanation: 'Restando 4 a ambos lados: 2x = 6, dividiendo entre 2: x = 3.',
      },
      {
        id: 'q_002',
        question: '¿Cuál expresión representa "el doble de un número menos 5"?',
        options: ['2x + 5', '2x - 5', 'x/2 - 5', '5 - 2x'],
        correct: 1,
        explanation: '"El doble de x" es 2x, "menos 5" se resta: 2x - 5.',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Álgebra en imágenes: Variables y operaciones',
        description: 'Aprende álgebra mediante diagramas visuales y animaciones paso a paso.',
        thumbnail: null,
        duration: '12 min',
      },
      auditory: {
        title: 'Podcast: ¿Qué es el álgebra y para qué sirve?',
        description: 'Explicación oral con ejemplos de la vida real en Colombia.',
        transcript:
          'El álgebra es la rama de las matemáticas que usa símbolos para representar cantidades desconocidas...',
        duration: '15 min',
      },
      kinesthetic: {
        title: 'Reto práctico: Descubre la variable oculta',
        description:
          'Resuelve 5 acertijos algebraicos interactivos y construye tu propio "balanza de ecuaciones".',
        steps: [
          'Representa una ecuación con objetos reales',
          'Identifica la variable desconocida',
          'Aplica operaciones inversas para despejarla',
        ],
        duration: '20 min',
      },
    },
    order: 1,
  },
  {
    id: 'l_002',
    courseId: 'c_001',
    moduleId: 'm_001',
    title: 'Operaciones con Expresiones Algebraicas',
    type: 'interactive',
    duration: 18,
    completed: true,
    quiz: [
      {
        id: 'q_003',
        question: '¿Cuánto es (3x + 2) + (x - 5)?',
        options: ['4x - 3', '4x + 3', '2x - 3', '4x - 7'],
        correct: 0,
        explanation: 'Se suman los términos semejantes: (3x + x) + (2 - 5) = 4x - 3.',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Tablero interactivo: Suma y resta algebraica',
        description: 'Agrupa términos semejantes con bloques de colores.',
        thumbnail: null,
        duration: '18 min',
      },
      auditory: {
        title: 'Clase grabada: Simplificando expresiones',
        description: 'El profesor explica paso a paso cómo combinar términos semejantes.',
        transcript:
          'Cuando sumamos expresiones algebraicas, lo primero es identificar los términos semejantes...',
        duration: '20 min',
      },
      kinesthetic: {
        title: 'Construye tu expresión: Juego de fichas',
        description: 'Usa fichas virtuales de colores para representar y simplificar expresiones.',
        steps: ['Identifica cada término', 'Agrupa los de igual grado', 'Realiza la operación'],
        duration: '25 min',
      },
    },
    order: 2,
  },
  {
    id: 'l_003',
    courseId: 'c_001',
    moduleId: 'm_001',
    title: 'Ecuaciones de Primer Grado',
    type: 'reading',
    duration: 10,
    completed: true,
    quiz: [
      {
        id: 'q_004',
        question: 'Resuelve: 5x - 3 = 22',
        options: ['x = 4', 'x = 5', 'x = 3.8', 'x = 6'],
        correct: 1,
        explanation: '5x = 22 + 3 = 25, x = 25/5 = 5.',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Infografía: Método para resolver ecuaciones',
        description: 'Guía visual paso a paso con ejemplos gráficos.',
        thumbnail: null,
        duration: '10 min',
      },
      auditory: {
        title: 'Audio-guía: Resolviendo ecuaciones con el método de la balanza',
        description: 'Escucha la analogía de la balanza mientras sigues los pasos.',
        transcript: 'Imagina que una ecuación es como una balanza perfectamente equilibrada...',
        duration: '12 min',
      },
      kinesthetic: {
        title: 'Simulador de balanza: Equilibra la ecuación',
        description: 'Arrastra pesos en una balanza virtual para resolver ecuaciones.',
        steps: [
          'Coloca los pesos en ambos lados',
          'Elimina los términos iguales',
          'Despeja la variable',
        ],
        duration: '15 min',
      },
    },
    order: 3,
  },
  {
    id: 'l_004',
    courseId: 'c_001',
    moduleId: 'm_002',
    title: 'Concepto de Función',
    type: 'video',
    duration: 15,
    completed: false,
    quiz: [
      {
        id: 'q_005',
        question: '¿Cuál de estas relaciones NO es una función?',
        options: [
          'A cada x le corresponde exactamente un y',
          'A un x le corresponden dos valores de y',
          'La gráfica pasa la prueba de la línea vertical',
          'Cada elemento del dominio tiene exactamente una imagen',
        ],
        correct: 1,
        explanation:
          'Una función asigna exactamente UN valor de y por cada x. Si hay dos, no es función.',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Animación: ¿Qué es una función matemática?',
        description: 'Visualiza cómo una máquina transforma entradas en salidas únicas.',
        thumbnail: null,
        duration: '15 min',
      },
      auditory: {
        title: 'Debate: Funciones en el mundo real',
        description:
          'Escucha cómo las funciones describen el precio del café, la velocidad del viento y más.',
        transcript:
          'Las funciones son relaciones entre conjuntos que cumplen una condición especial...',
        duration: '18 min',
      },
      kinesthetic: {
        title: 'Construye tu máquina de funciones',
        description: 'Crea reglas matemáticas y comprueba si son funciones con casos de prueba.',
        steps: [
          'Define tu regla',
          'Prueba 3 entradas',
          'Verifica que cada entrada da una sola salida',
        ],
        duration: '22 min',
      },
    },
    order: 4,
  },
  {
    id: 'l_009',
    courseId: 'c_002',
    moduleId: 'm_004',
    title: 'Introducción a la Economía Circular',
    type: 'video',
    duration: 14,
    completed: true,
    quiz: [
      {
        id: 'q_010',
        question: '¿Cuál es la diferencia principal entre economía lineal y circular?',
        options: [
          'La circular reutiliza los recursos, la lineal los desecha',
          'La lineal es más sostenible',
          'Solo difieren en la escala de producción',
          'La circular solo aplica a la agricultura',
        ],
        correct: 0,
        explanation:
          'La economía circular mantiene los recursos en uso el mayor tiempo posible, reduciendo el desperdicio.',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Documental: Del residuo al recurso',
        description: 'Casos reales de empresas colombianas que cerraron el ciclo de producción.',
        thumbnail: null,
        duration: '14 min',
      },
      auditory: {
        title: 'Podcast: Economía circular con expertos del MEN',
        description: 'Conversación con especialistas sobre el futuro sostenible de Colombia.',
        transcript:
          'La economía circular surge como respuesta a los límites del modelo lineal de producción...',
        duration: '18 min',
      },
      kinesthetic: {
        title: 'Mapa de ciclo de vida: Traza el camino de un producto',
        description: 'Sigue el recorrido de un objeto desde su fabricación hasta su reutilización.',
        steps: [
          'Elige un producto cotidiano',
          'Traza cada etapa de su ciclo',
          'Identifica dónde se puede "cerrar el ciclo"',
        ],
        duration: '20 min',
      },
    },
    order: 1,
  },
];
