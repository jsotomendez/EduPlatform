import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

let prisma = null;
if (process.env.DATABASE_URL) {
  try {
    prisma = new PrismaClient();
  } catch (err) {
    console.error('Error instanciando PrismaClient:', err);
  }
}


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'data', 'db.json');

// Mocks locales para inicializar la base de datos (con contraseñas hasheadas)
const DEFAULT_USERS = [
  {
    id: 'u_001',
    name: 'Brigitte Pico Peralta',
    email: 'brigitte@unicordoba.edu.co',
    passwordHash: bcrypt.hashSync('demo1234', 10),
    role: 'student',
    avatar: null,
    university: 'Universidad de Córdoba',
    program: 'Ingeniería de Sistemas',
    semester: 9,
    cognitiveProfile: {
      primary: 'visual',
      secondary: 'kinesthetic',
      scores: { visual: 7, auditory: 2, kinesthetic: 5 },
      diagnosedAt: '2026-03-15T10:00:00Z',
    },
    preferences: { theme: 'light', fontSize: 'normal', reducedMotion: false },
    stats: {
      daysSinceLastLogin: 1,
      completedLessonsThisWeek: 4,
      avgQuizScore: 0.78,
      missedDeadlines: 0,
      totalStudyMinutes: 1840,
      streak: 7,
    },
    enrolledCourses: ['c_001', 'c_002', 'c_003', 'c_005'],
    courseProgress: {
      c_001: 0.62,
      c_002: 0.78,
      c_003: 0.15,
      c_005: 0
    },
    joinedAt: '2026-02-01T08:00:00Z',
  },
  {
    id: 'u_002',
    name: 'Carlos Andrade Muñoz',
    email: 'carlos@unicordoba.edu.co',
    passwordHash: bcrypt.hashSync('demo1234', 10),
    role: 'student',
    avatar: null,
    university: 'Universidad de Córdoba',
    program: 'Administración de Empresas',
    semester: 5,
    cognitiveProfile: {
      primary: 'auditory',
      secondary: 'visual',
      scores: { visual: 3, auditory: 8, kinesthetic: 3 },
      diagnosedAt: '2026-03-10T09:00:00Z',
    },
    preferences: { theme: 'light', fontSize: 'normal', reducedMotion: false },
    stats: {
      daysSinceLastLogin: 9,
      completedLessonsThisWeek: 0,
      avgQuizScore: 0.42,
      missedDeadlines: 2,
      totalStudyMinutes: 640,
      streak: 0,
    },
    enrolledCourses: ['c_001', 'c_004'],
    courseProgress: {
      c_001: 0.42,
      c_004: 1.0
    },
    joinedAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'u_003',
    name: 'María Fernanda Soto',
    email: 'maria@unicordoba.edu.co',
    passwordHash: bcrypt.hashSync('demo1234', 10),
    role: 'student',
    avatar: null,
    university: 'Universidad de Córdoba',
    program: 'Psicología',
    semester: 3,
    cognitiveProfile: {
      primary: 'kinesthetic',
      secondary: 'auditory',
      scores: { visual: 2, auditory: 4, kinesthetic: 9 },
      diagnosedAt: '2026-03-20T11:00:00Z',
    },
    preferences: { theme: 'dark', fontSize: 'large', reducedMotion: false },
    stats: {
      daysSinceLastLogin: 3,
      completedLessonsThisWeek: 2,
      avgQuizScore: 0.65,
      missedDeadlines: 1,
      totalStudyMinutes: 920,
      streak: 3,
    },
    enrolledCourses: ['c_002', 'c_006'],
    courseProgress: {
      c_002: 0.78,
      c_006: 0
    },
    joinedAt: '2026-02-20T08:00:00Z',
  },
  {
    id: 'u_004',
    name: 'Prof. José Gil Soto Méndez',
    email: 'jgil@unicordoba.edu.co',
    passwordHash: bcrypt.hashSync('demo1234', 10),
    role: 'teacher',
    avatar: null,
    university: 'Universidad de Córdoba',
    department: 'Ciencias de la Computación',
    courses: ['c_001', 'c_003', 'c_005'],
    preferences: { theme: 'light', fontSize: 'normal', reducedMotion: false },
    joinedAt: '2026-01-15T08:00:00Z',
  },
];

const DEFAULT_COURSES = [
  {
    id: 'c_001',
    title: 'Matemáticas Básicas',
    description: 'Fundamentos matemáticos esenciales para la vida universitaria colombiana: álgebra, geometría y aritmética aplicada.',
    category: 'mathematics',
    icon: 'fa-calculator',
    color: '#4f46e5',
    instructor: 'Prof. José Gil Soto Méndez',
    instructorAvatar: null,
    estimatedHours: { visual: 18, auditory: 22, kinesthetic: 20 },
    modules: [
      {
        id: 'm_001',
        title: 'Módulo 1: Álgebra Fundamental',
        description: 'Operaciones con variables y expresiones algebraicas.',
        lessons: ['l_001', 'l_002', 'l_003'],
        completed: true,
      },
      {
        id: 'm_002',
        title: 'Módulo 2: Funciones y Gráficas',
        description: 'Representación y análisis de funciones matemáticas.',
        lessons: ['l_004', 'l_005'],
        completed: false,
      },
      {
        id: 'm_003',
        title: 'Módulo 3: Trigonometría Aplicada',
        description: 'Relaciones trigonométricas y sus aplicaciones reales.',
        lessons: ['l_006', 'l_007', 'l_008'],
        completed: false,
      },
    ],
    progress: 0.62,
    status: 'in_progress',
    adaptedFor: 'visual',
    curriculumAligned: true,
    tags: ['MEN', 'ICFES', 'Fundamentos'],
    rating: 4.7,
    enrolled: 248,
  },
  {
    id: 'c_002',
    title: 'Desarrollo Sostenible',
    description: 'Innovación ecológica, economía circular y ODS en el contexto colombiano. Transforma tu entorno con conocimiento.',
    category: 'sustainability',
    icon: 'fa-leaf',
    color: '#10b981',
    instructor: 'Prof. Frank García Pernett',
    instructorAvatar: null,
    estimatedHours: { visual: 14, auditory: 16, kinesthetic: 12 },
    modules: [
      {
        id: 'm_004',
        title: 'Módulo 1: Introducción a la Sostenibilidad',
        description: 'Conceptos clave y contexto global.',
        lessons: ['l_009', 'l_010'],
        completed: true,
      },
      {
        id: 'm_005',
        title: 'Módulo 2: Economía Circular',
        description: 'Del residuo al recurso: modelos de negocio sostenibles.',
        lessons: ['l_011', 'l_012', 'l_013'],
        completed: false,
      },
    ],
    progress: 0.78,
    status: 'in_progress',
    adaptedFor: 'visual',
    curriculumAligned: true,
    tags: ['ODS', 'Medio Ambiente', 'Colombia'],
    rating: 4.9,
    enrolled: 193,
  },
  {
    id: 'c_003',
    title: 'Programación Inicial',
    description: 'Aprende a programar desde cero con Python. Lógica computacional, algoritmos y tu primer proyecto real.',
    category: 'programming',
    icon: 'fa-code',
    color: '#3b82f6',
    instructor: 'Prof. Tomás González López',
    instructorAvatar: null,
    estimatedHours: { visual: 20, auditory: 24, kinesthetic: 16 },
    modules: [
      {
        id: 'm_006',
        title: 'Módulo 1: Pensamiento Computacional',
        description: 'Algoritmos, pseudocódigo y lógica básica.',
        lessons: ['l_014', 'l_015'],
        completed: false,
      },
      {
        id: 'm_007',
        title: 'Módulo 2: Python Desde Cero',
        description: 'Variables, condicionales, bucles y funciones.',
        lessons: ['l_016', 'l_017', 'l_018'],
        completed: false,
      },
    ],
    progress: 0.15,
    status: 'in_progress',
    adaptedFor: 'kinesthetic',
    curriculumAligned: true,
    tags: ['Python', 'Algoritmos', 'Tecnología'],
    rating: 4.8,
    enrolled: 312,
  },
  {
    id: 'c_004',
    title: 'Comunicación Académica',
    description: 'Escritura, argumentación y presentación para el éxito universitario. Habla y escribe con confianza.',
    category: 'communication',
    icon: 'fa-comments',
    color: '#a78bfa',
    instructor: 'Prof. Ana María Restrepo',
    instructorAvatar: null,
    estimatedHours: { visual: 16, auditory: 12, kinesthetic: 18 },
    modules: [
      {
        id: 'm_008',
        title: 'Módulo 1: Escritura Académica',
        description: 'Estructura, coherencia y normas APA.',
        lessons: ['l_019', 'l_020', 'l_021'],
        completed: true,
      },
    ],
    progress: 1.0,
    status: 'completed',
    adaptedFor: 'auditory',
    curriculumAligned: true,
    tags: ['Escritura', 'APA', 'Argumentación'],
    rating: 4.6,
    enrolled: 178,
  },
  {
    id: 'c_005',
    title: 'Cálculo Diferencial',
    description: 'Límites, derivadas y aplicaciones de la diferenciación para ingeniería y ciencias exactas.',
    category: 'mathematics',
    icon: 'fa-infinity',
    color: '#f59e0b',
    instructor: 'Prof. José Gil Soto Méndez',
    instructorAvatar: null,
    estimatedHours: { visual: 28, auditory: 30, kinesthetic: 26 },
    modules: [
      {
        id: 'm_009',
        title: 'Módulo 1: Límites y Continuidad',
        description: 'Concepto de límite y continuidad de funciones.',
        lessons: ['l_022', 'l_023'],
        completed: false,
      },
    ],
    progress: 0,
    status: 'recommended',
    adaptedFor: 'visual',
    curriculumAligned: true,
    tags: ['Cálculo', 'Ingeniería', 'STEM'],
    rating: 4.5,
    enrolled: 267,
  },
  {
    id: 'c_006',
    title: 'Economía Circular',
    description: 'Modelos de negocio regenerativos, gestión de residuos y oportunidades de emprendimiento sostenible en Colombia.',
    category: 'business',
    icon: 'fa-recycle',
    color: '#10b981',
    instructor: 'Prof. Carlos Vélez',
    instructorAvatar: null,
    estimatedHours: { visual: 12, auditory: 14, kinesthetic: 10 },
    modules: [
      {
        id: 'm_010',
        title: 'Módulo 1: Fundamentos de Economía Circular',
        description: 'Del modelo lineal al circular.',
        lessons: ['l_024', 'l_025'],
        completed: false,
      },
    ],
    progress: 0,
    status: 'locked',
    adaptedFor: 'kinesthetic',
    curriculumAligned: true,
    tags: ['Emprendimiento', 'Sostenibilidad', 'Negocios'],
    rating: 4.4,
    enrolled: 134,
  },
];

const DEFAULT_LESSONS = [
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
        transcript: 'El álgebra es la rama de las matemáticas que usa símbolos para representar cantidades desconocidas. Permite formular modelos lógicos en base a letras y números.',
        duration: '15 min',
      },
      kinesthetic: {
        title: 'Reto práctico: Descubre la variable oculta',
        description: 'Resuelve acertijos algebraicos interactivos y construye tu propio balanza de ecuaciones.',
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
        transcript: 'Cuando sumamos expresiones algebraicas, lo primero es identificar los términos semejantes. Los sumamos o restamos conservando sus variables e incrementando o decrementando sus coeficientes.',
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
        transcript: 'Imagina que una ecuación es como una balanza perfectamente equilibrada. Lo que agregas o quitas de un platillo debes hacerlo en el otro para mantener la igualdad.',
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
        explanation: 'Una función asigna exactamente UN valor de y por cada x. Si hay dos, no es función.',
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
        description: 'Escucha cómo las funciones describen el precio del café, la velocidad del viento y más.',
        transcript: 'Las funciones son relaciones entre conjuntos que cumplen una condición especial: a cada elemento del dominio le pertenece una sola imagen en el codominio.',
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
        explanation: 'La economía circular mantiene los recursos en uso el mayor tiempo posible, reduciendo el desperdicio.',
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
        transcript: 'La economía circular surge como respuesta a los límites del modelo lineal de producción. Busca un flujo cerrado de materiales reutilizando residuos.',
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
  // ===== LECCIONES l_005 a l_008: Matemáticas Básicas (c_001) =====
  {
    id: 'l_005',
    courseId: 'c_001',
    moduleId: 'm_002',
    title: 'Gráficas de Funciones Lineales',
    type: 'video',
    duration: 16,
    completed: false,
    quiz: [
      {
        id: 'q_006',
        question: '¿Cuál es la pendiente de la función f(x) = 3x - 2?',
        options: ['m = -2', 'm = 3', 'm = 2', 'm = -3'],
        correct: 1,
        explanation: 'En la forma y = mx + b, el coeficiente de x es la pendiente. Aquí m = 3.',
      },
      {
        id: 'q_007',
        question: '¿En qué punto corta el eje Y la función f(x) = 3x - 2?',
        options: ['(0, 3)', '(0, -2)', '(-2, 0)', '(3, 0)'],
        correct: 1,
        explanation: 'El intercepto en Y se obtiene cuando x = 0: f(0) = 3(0) - 2 = -2. El punto es (0, -2).',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Animación: Cómo graficar funciones lineales paso a paso',
        description: 'Aprende a construir gráficas en el plano cartesiano usando pendiente e intercepto.',
        thumbnail: null,
        duration: '16 min',
      },
      auditory: {
        title: 'Podcast: La recta y su pendiente en la vida real',
        description: 'Descubre cómo la pendiente describe el crecimiento del precio de los alimentos o la velocidad de un vehículo.',
        transcript: 'La gráfica de una función lineal siempre es una línea recta. Para dibujarla necesitamos dos cosas: la pendiente que nos dice qué tan inclinada está, y el intercepto que nos dice dónde cruza el eje Y. Imagina que cada peso que gastas en transporte aumenta linealmente con los kilómetros recorridos.',
        duration: '18 min',
      },
      kinesthetic: {
        title: 'Laboratorio gráfico: Construye tu función',
        description: 'Arma la gráfica de funciones usando puntos en un plano cartesiano interactivo.',
        steps: [
          'Elige valores de x para evaluar la función',
          'Calcula f(x) para cada valor',
          'Ubica los puntos (x, f(x)) en el plano',
          'Une los puntos con una línea recta',
        ],
        duration: '22 min',
      },
    },
    order: 5,
  },
  {
    id: 'l_006',
    courseId: 'c_001',
    moduleId: 'm_003',
    title: 'Razones Trigonométricas',
    type: 'video',
    duration: 18,
    completed: false,
    quiz: [
      {
        id: 'q_008',
        question: '¿Qué razón trigonométrica se define como cateto opuesto / hipotenusa?',
        options: ['Coseno', 'Tangente', 'Seno', 'Secante'],
        correct: 2,
        explanation: 'El seno de un ángulo se define como la razón entre el cateto opuesto y la hipotenusa (SOH).',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Infografía animada: SOH-CAH-TOA',
        description: 'Visualiza las tres razones trigonométricas con triángulos interactivos y colores.',
        thumbnail: null,
        duration: '18 min',
      },
      auditory: {
        title: 'Audio-clase: Entendiendo seno, coseno y tangente',
        description: 'Explicación oral clara con la regla mnemotécnica SOH-CAH-TOA.',
        transcript: 'Las razones trigonométricas son relaciones entre los lados de un triángulo rectángulo. El seno es el cateto opuesto dividido entre la hipotenusa. El coseno es el cateto adyacente dividido entre la hipotenusa. Y la tangente es el cateto opuesto dividido entre el adyacente. Para recordar esto usamos SOH-CAH-TOA.',
        duration: '20 min',
      },
      kinesthetic: {
        title: 'Construye triángulos: Mide y calcula',
        description: 'Dibuja triángulos rectángulos con diferentes ángulos y verifica las razones trigonométricas.',
        steps: [
          'Dibuja un triángulo rectángulo con un ángulo de 30°',
          'Mide los tres lados del triángulo',
          'Calcula seno, coseno y tangente del ángulo',
          'Verifica con la tabla de valores trigonométricos',
        ],
        duration: '25 min',
      },
    },
    order: 1,
  },
  {
    id: 'l_007',
    courseId: 'c_001',
    moduleId: 'm_003',
    title: 'Funciones Trigonométricas y sus Gráficas',
    type: 'interactive',
    duration: 20,
    completed: false,
    quiz: [
      {
        id: 'q_009',
        question: '¿Cuál es el período de la función sen(x)?',
        options: ['π', '2π', 'π/2', '4π'],
        correct: 1,
        explanation: 'La función seno completa un ciclo completo cada 2π radianes (360 grados).',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Simulación: Las ondas del seno y coseno',
        description: 'Observa cómo se generan las curvas sinusoidales a partir del círculo unitario.',
        thumbnail: null,
        duration: '20 min',
      },
      auditory: {
        title: 'Clase grabada: Las funciones trigonométricas y el sonido',
        description: 'Aprende cómo las ondas sinusoidales describen fenómenos acústicos y de radio.',
        transcript: 'Las funciones trigonométricas como el seno y el coseno generan curvas onduladas que se repiten. A esta repetición le llamamos período. Estas funciones son fundamentales para describir fenómenos ondulatorios como el sonido, la luz y las señales de radio.',
        duration: '22 min',
      },
      kinesthetic: {
        title: 'Reto: Dibuja la onda perfecta',
        description: 'Traza manualmente la gráfica de sen(x) y cos(x) punto por punto.',
        steps: [
          'Evalúa sen(x) para x = 0°, 30°, 60°, 90°, ..., 360°',
          'Ubica cada punto en el plano',
          'Une los puntos suavemente para formar la onda',
          'Compara tu gráfica con la de cos(x)',
        ],
        duration: '28 min',
      },
    },
    order: 2,
  },
  {
    id: 'l_008',
    courseId: 'c_001',
    moduleId: 'm_003',
    title: 'Aplicaciones de la Trigonometría',
    type: 'reading',
    duration: 14,
    completed: false,
    quiz: [
      {
        id: 'q_008b',
        question: 'Un edificio proyecta una sombra de 15 metros. Si el ángulo de elevación del sol es 60°, ¿cuánto mide el edificio?',
        options: ['15 m', '15√3 m', '15/2 m', '30 m'],
        correct: 1,
        explanation: 'Usando tangente: tan(60°) = altura/15. Como tan(60°) = √3, la altura = 15√3 ≈ 25.98 metros.',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Casos reales: Trigonometría en arquitectura y navegación',
        description: 'Infografías de cómo se usa la trigonometría para medir edificios, puentes y distancias.',
        thumbnail: null,
        duration: '14 min',
      },
      auditory: {
        title: 'Podcast: Trigonometría para ingenieros del mañana',
        description: 'Historias de cómo los ingenieros colombianos usan trigonometría en proyectos reales.',
        transcript: 'La trigonometría no se queda en el salón de clases. Los topógrafos la usan para medir terrenos, los arquitectos para calcular ángulos de techos, y los navegantes para trazar rutas en el mar. En Colombia, la construcción del túnel de la Línea requirió cálculos trigonométricos precisos para atravesar la cordillera.',
        duration: '16 min',
      },
      kinesthetic: {
        title: 'Proyecto de campo: Mide la altura de tu universidad',
        description: 'Usa un transportador casero y trigonometría para calcular alturas reales.',
        steps: [
          'Construye un clinómetro con un transportador y una cuerda',
          'Mide el ángulo de elevación hacia el tope de un edificio',
          'Mide la distancia horizontal al edificio',
          'Aplica tangente para calcular la altura',
        ],
        duration: '20 min',
      },
    },
    order: 3,
  },
  // ===== LECCIONES l_010 a l_013: Desarrollo Sostenible (c_002) =====
  {
    id: 'l_010',
    courseId: 'c_002',
    moduleId: 'm_004',
    title: 'Los ODS y la Agenda 2030',
    type: 'reading',
    duration: 12,
    completed: true,
    quiz: [
      {
        id: 'q_011',
        question: '¿Cuántos Objetivos de Desarrollo Sostenible (ODS) existen?',
        options: ['10', '15', '17', '20'],
        correct: 2,
        explanation: 'La Agenda 2030 de la ONU estableció 17 Objetivos de Desarrollo Sostenible en 2015.',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Mapa interactivo de los 17 ODS',
        description: 'Explora cada objetivo con iconografías oficiales de la ONU y datos de Colombia.',
        thumbnail: null,
        duration: '12 min',
      },
      auditory: {
        title: 'Podcast: Colombia y los ODS - ¿Dónde estamos?',
        description: 'Análisis del cumplimiento de la Agenda 2030 en el contexto colombiano.',
        transcript: 'Los Objetivos de Desarrollo Sostenible son un llamado universal a la acción para poner fin a la pobreza, proteger el planeta y garantizar la paz y prosperidad. Colombia ha avanzado especialmente en el ODS 4 de educación de calidad y el ODS 7 de energía limpia, pero aún enfrenta retos en el ODS 10 de reducción de desigualdades.',
        duration: '15 min',
      },
      kinesthetic: {
        title: 'Mapa de impacto: Tu huella en los ODS',
        description: 'Identifica qué ODS impactas con tus acciones diarias y diseña un plan de mejora.',
        steps: [
          'Lista 5 acciones que haces diariamente',
          'Relaciona cada acción con un ODS',
          'Identifica un ODS que puedas mejorar',
          'Diseña un compromiso personal de 30 días',
        ],
        duration: '18 min',
      },
    },
    order: 2,
  },
  {
    id: 'l_011',
    courseId: 'c_002',
    moduleId: 'm_005',
    title: 'Diseño Circular de Productos',
    type: 'video',
    duration: 16,
    completed: false,
    quiz: [
      {
        id: 'q_012',
        question: '¿Cuál de los siguientes NO es un principio del diseño circular?',
        options: [
          'Diseñar para el desarme y reciclaje',
          'Usar materiales biodegradables',
          'Planificar la obsolescencia programada',
          'Maximizar la vida útil del producto',
        ],
        correct: 2,
        explanation: 'La obsolescencia programada es lo opuesto al diseño circular, que busca maximizar la durabilidad y la reutilización.',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Documental: Diseño sin desperdicios',
        description: 'Conoce empresas que diseñan productos pensando en su segunda vida útil.',
        thumbnail: null,
        duration: '16 min',
      },
      auditory: {
        title: 'Entrevista: Diseñadores circulares en Colombia',
        description: 'Escucha a emprendedores colombianos que diseñan moda y muebles con enfoque circular.',
        transcript: 'El diseño circular significa pensar en el final de la vida del producto desde el momento en que lo diseñas. En lugar de crear productos que terminen en el basurero, diseñas para que puedan ser reparados, reutilizados o convertidos en materia prima para nuevos productos.',
        duration: '18 min',
      },
      kinesthetic: {
        title: 'Taller: Rediseña un producto de tu hogar',
        description: 'Elige un producto cotidiano y propon un rediseño con criterios circulares.',
        steps: [
          'Elige un producto de uso diario (cepillo de dientes, envase, etc.)',
          'Analiza sus materiales y proceso de fabricación',
          'Identifica qué partes podrían ser reciclables o compostables',
          'Dibuja tu rediseño circular del producto',
        ],
        duration: '25 min',
      },
    },
    order: 1,
  },
  {
    id: 'l_012',
    courseId: 'c_002',
    moduleId: 'm_005',
    title: 'Cadenas de Valor Sostenibles',
    type: 'interactive',
    duration: 18,
    completed: false,
    quiz: [
      {
        id: 'q_013',
        question: '¿Qué significa "logística inversa" en una cadena de valor sostenible?',
        options: [
          'Producir al revés del proceso normal',
          'Recuperar productos al final de su vida útil para reutilizarlos',
          'Vender directamente al consumidor sin intermediarios',
          'Importar materias primas del extranjero',
        ],
        correct: 1,
        explanation: 'La logística inversa es el proceso de recuperar productos usados del consumidor para repararlos, reciclarlos o reutilizar sus componentes.',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Diagrama interactivo: Del residuo al recurso',
        description: 'Sigue el flujo de materiales en una cadena de valor circular vs. lineal.',
        thumbnail: null,
        duration: '18 min',
      },
      auditory: {
        title: 'Mesa redonda: Cadenas sostenibles en la agroindustria colombiana',
        description: 'Expertos analizan cómo el café, el cacao y la panela pueden tener cadenas más sostenibles.',
        transcript: 'Una cadena de valor sostenible integra criterios ambientales, sociales y económicos en cada eslabón. Desde la extracción de materias primas hasta la disposición final, cada paso debe minimizar el impacto ambiental. En Colombia, cooperativas cafeteras están liderando este cambio al compostar la pulpa del café y generar biogás.',
        duration: '20 min',
      },
      kinesthetic: {
        title: 'Simulación: Gestiona tu cadena de valor',
        description: 'Toma decisiones en cada etapa de producción y observa su impacto ambiental.',
        steps: [
          'Selecciona materias primas (locales vs. importadas)',
          'Elige el proceso de producción (energía limpia vs. convencional)',
          'Define la estrategia de distribución',
          'Planifica la logística inversa del producto',
        ],
        duration: '22 min',
      },
    },
    order: 2,
  },
  {
    id: 'l_013',
    courseId: 'c_002',
    moduleId: 'm_005',
    title: 'Emprendimiento Verde en Colombia',
    type: 'video',
    duration: 20,
    completed: false,
    quiz: [
      {
        id: 'q_014',
        question: '¿Cuál es una ventaja competitiva del emprendimiento verde?',
        options: [
          'Mayor gasto en materias primas',
          'Acceso a financiamiento verde y preferencias de consumidores conscientes',
          'Menor calidad de los productos',
          'Mayor dependencia de recursos no renovables',
        ],
        correct: 1,
        explanation: 'Los emprendimientos verdes pueden acceder a líneas de crédito verde, certificaciones ambientales y un mercado creciente de consumidores comprometidos con la sostenibilidad.',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Reportaje: 5 emprendimientos verdes exitosos en Colombia',
        description: 'Conoce historias reales de emprendedores colombianos que transforman residuos en negocios.',
        thumbnail: null,
        duration: '20 min',
      },
      auditory: {
        title: 'Podcast: Emprende verde - Historias desde Córdoba',
        description: 'Entrevistas a emprendedores locales que están haciendo la diferencia con negocios sostenibles.',
        transcript: 'El emprendimiento verde no es solo una tendencia, es una necesidad. En Colombia, jóvenes como ustedes están creando empresas que convierten residuos plásticos en ladrillos, aceite de cocina usado en biodiesel, y desechos textiles en nuevas prendas. La clave es identificar un problema ambiental local y convertirlo en una oportunidad de negocio.',
        duration: '22 min',
      },
      kinesthetic: {
        title: 'Canvas verde: Diseña tu emprendimiento sostenible',
        description: 'Usa el modelo Canvas adaptado para crear tu propio emprendimiento circular.',
        steps: [
          'Identifica un problema ambiental en tu comunidad',
          'Define tu propuesta de valor circular',
          'Establece fuentes de ingresos y estructura de costos',
          'Presenta tu idea en un pitch de 3 minutos',
        ],
        duration: '30 min',
      },
    },
    order: 3,
  },
  // ===== LECCIONES l_014 a l_018: Programación Inicial (c_003) =====
  {
    id: 'l_014',
    courseId: 'c_003',
    moduleId: 'm_006',
    title: '¿Qué es un Algoritmo?',
    type: 'video',
    duration: 14,
    completed: false,
    quiz: [
      {
        id: 'q_015',
        question: '¿Cuál de las siguientes opciones describe mejor un algoritmo?',
        options: [
          'Un programa escrito en Python',
          'Una secuencia finita y ordenada de pasos para resolver un problema',
          'Un tipo especial de computadora',
          'Un lenguaje de programación',
        ],
        correct: 1,
        explanation: 'Un algoritmo es una secuencia finita, ordenada y definida de instrucciones que permite resolver un problema o realizar una tarea.',
      },
      {
        id: 'q_016',
        question: '¿Cuál de estas actividades cotidianas es un ejemplo de algoritmo?',
        options: [
          'Soñar despierto',
          'Una receta de cocina paso a paso',
          'Mirar por la ventana',
          'Pensar en el futuro',
        ],
        correct: 1,
        explanation: 'Una receta de cocina es un algoritmo porque tiene pasos definidos, en un orden específico, con un resultado esperado.',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Animación: ¿Qué es un algoritmo? Explicado con ejemplos visuales',
        description: 'Aprende el concepto de algoritmo con animaciones de la vida cotidiana.',
        thumbnail: null,
        duration: '14 min',
      },
      auditory: {
        title: 'Podcast: Algoritmos que usas sin saber',
        description: 'Descubre cómo los algoritmos están detrás de Google, Netflix y Spotify.',
        transcript: 'Un algoritmo es simplemente una serie de instrucciones paso a paso para resolver un problema. Cuando sigues una receta, estás ejecutando un algoritmo. Cuando Google te muestra resultados de búsqueda, hay un algoritmo decidiendo qué mostrarte primero. Los algoritmos son el corazón de toda la tecnología moderna.',
        duration: '16 min',
      },
      kinesthetic: {
        title: 'Reto: Escribe el algoritmo de tu rutina matutina',
        description: 'Practica el pensamiento algorítmico describiendo paso a paso tu mañana.',
        steps: [
          'Escribe tu rutina matutina como una lista de pasos',
          'Numera cada paso en orden',
          'Identifica si hay decisiones (si llueve → llevar paraguas)',
          'Dibuja un diagrama de flujo simple con las decisiones',
        ],
        duration: '18 min',
      },
    },
    order: 1,
  },
  {
    id: 'l_015',
    courseId: 'c_003',
    moduleId: 'm_006',
    title: 'Pseudocódigo y Diagramas de Flujo',
    type: 'interactive',
    duration: 16,
    completed: false,
    quiz: [
      {
        id: 'q_017',
        question: '¿Qué forma geométrica representa una decisión (condición) en un diagrama de flujo?',
        options: ['Rectángulo', 'Óvalo', 'Rombo', 'Paralelogramo'],
        correct: 2,
        explanation: 'El rombo (diamante) representa una decisión o condición que se evalúa como verdadero o falso.',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Tutorial visual: Cómo dibujar diagramas de flujo profesionales',
        description: 'Guía paso a paso para crear diagramas de flujo con los símbolos correctos.',
        thumbnail: null,
        duration: '16 min',
      },
      auditory: {
        title: 'Audio-guía: Del pseudocódigo al código real',
        description: 'Escucha cómo traducir tus ideas a pseudocódigo antes de programar.',
        transcript: 'El pseudocódigo es una forma de expresar algoritmos usando lenguaje natural estructurado. No sigue las reglas estrictas de ningún lenguaje de programación, pero mantiene una estructura lógica clara. Escribimos INICIO, luego los pasos, usamos SI-ENTONCES para decisiones, MIENTRAS para repeticiones, y terminamos con FIN.',
        duration: '18 min',
      },
      kinesthetic: {
        title: 'Reto: Diagrama de flujo para una calculadora',
        description: 'Diseña el diagrama de flujo de una calculadora básica que sume, reste, multiplique y divida.',
        steps: [
          'Define las entradas: dos números y una operación',
          'Dibuja las decisiones según la operación elegida',
          'Conecta cada decisión con su resultado',
          'Agrega el caso especial de la división entre cero',
        ],
        duration: '22 min',
      },
    },
    order: 2,
  },
  {
    id: 'l_016',
    courseId: 'c_003',
    moduleId: 'm_007',
    title: 'Variables y Tipos de Datos en Python',
    type: 'video',
    duration: 18,
    completed: false,
    quiz: [
      {
        id: 'q_018',
        question: '¿Cuál es el tipo de dato de la variable nombre = "Brigitte" en Python?',
        options: ['int', 'float', 'str', 'bool'],
        correct: 2,
        explanation: 'Los textos entre comillas son cadenas de caracteres (str - string) en Python.',
      },
      {
        id: 'q_019',
        question: '¿Qué hace la instrucción: edad = int(input("Tu edad: ")) en Python?',
        options: [
          'Muestra la edad en pantalla',
          'Lee un texto del usuario y lo convierte a número entero',
          'Crea una variable de tipo flotante',
          'Genera un error',
        ],
        correct: 1,
        explanation: 'input() lee texto del teclado, e int() lo convierte a un número entero antes de guardarlo en la variable edad.',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Animación: Variables como cajas con etiquetas',
        description: 'Visualiza las variables como contenedores con nombre que guardan diferentes tipos de datos.',
        thumbnail: null,
        duration: '18 min',
      },
      auditory: {
        title: 'Clase narrada: Tu primer programa en Python',
        description: 'Escucha la explicación paso a paso de cómo crear variables y usar tipos de datos.',
        transcript: 'Una variable en Python es como una caja con una etiqueta. Le pones un nombre y guardas algo dentro: puede ser un número entero como 42, un número decimal como 3.14, un texto como tu nombre entre comillas, o un valor lógico verdadero o falso. Python detecta automáticamente el tipo de dato, así que no necesitas declararlo explícitamente.',
        duration: '20 min',
      },
      kinesthetic: {
        title: 'Laboratorio: Crea tu calculadora de propinas en Python',
        description: 'Escribe un programa que calcule la propina en un restaurante usando variables.',
        steps: [
          'Crea variables para el precio de la comida y el porcentaje de propina',
          'Calcula la propina con una fórmula',
          'Muestra el total con print()',
          'Pide al usuario ingresar los valores con input()',
        ],
        duration: '25 min',
      },
    },
    order: 1,
  },
  {
    id: 'l_017',
    courseId: 'c_003',
    moduleId: 'm_007',
    title: 'Condicionales en Python (if, elif, else)',
    type: 'interactive',
    duration: 20,
    completed: false,
    quiz: [
      {
        id: 'q_020',
        question: '¿Qué imprime este código?\nnota = 85\nif nota >= 90:\n    print("Excelente")\nelif nota >= 70:\n    print("Aprobado")\nelse:\n    print("Reprobado")',
        options: ['Excelente', 'Aprobado', 'Reprobado', 'Error de sintaxis'],
        correct: 1,
        explanation: 'Como nota=85 no es >= 90 pero sí es >= 70, se ejecuta el bloque elif e imprime "Aprobado".',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Diagrama animado: El flujo de las decisiones en Python',
        description: 'Ve cómo el programa toma caminos diferentes según las condiciones.',
        thumbnail: null,
        duration: '20 min',
      },
      auditory: {
        title: 'Clase grabada: If, elif y else explicados con decisiones cotidianas',
        description: 'Aprende las estructuras condicionales comparándolas con situaciones de la vida real.',
        transcript: 'Los condicionales en Python funcionan como las decisiones que tomamos cada día. Si llueve, llevo paraguas. Si no llueve pero hace sol, llevo gafas. En otro caso, salgo normal. En Python esto se traduce a if, elif y else. La clave está en la indentación: todo lo que esté dentro del bloque if debe estar indentado con 4 espacios.',
        duration: '22 min',
      },
      kinesthetic: {
        title: 'Reto: Programa un juego de adivinanza',
        description: 'Crea un juego donde el computador elige un número y el usuario intenta adivinarlo.',
        steps: [
          'Importa random y genera un número secreto',
          'Pide al usuario que ingrese un número',
          'Usa if/elif/else para dar pistas (mayor, menor, correcto)',
          'Añade un contador de intentos',
        ],
        duration: '28 min',
      },
    },
    order: 2,
  },
  {
    id: 'l_018',
    courseId: 'c_003',
    moduleId: 'm_007',
    title: 'Bucles y Funciones en Python',
    type: 'video',
    duration: 22,
    completed: false,
    quiz: [
      {
        id: 'q_021',
        question: '¿Cuántas veces imprime "Hola" este código?\nfor i in range(5):\n    print("Hola")',
        options: ['4 veces', '5 veces', '6 veces', 'Infinitas veces'],
        correct: 1,
        explanation: 'range(5) genera los números 0, 1, 2, 3, 4, así que el bucle se repite 5 veces.',
      },
      {
        id: 'q_022',
        question: '¿Cuál es la palabra clave para definir una función en Python?',
        options: ['function', 'func', 'def', 'define'],
        correct: 2,
        explanation: 'En Python, las funciones se definen con la palabra clave "def" seguida del nombre de la función.',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Animación: Bucles for/while y funciones con ejemplos prácticos',
        description: 'Visualiza cómo los bucles repiten acciones y cómo las funciones organizan el código.',
        thumbnail: null,
        duration: '22 min',
      },
      auditory: {
        title: 'Audio-tutorial: Automatiza tareas con bucles y funciones',
        description: 'Escucha cómo los bucles y funciones te ahorran horas de trabajo repetitivo.',
        transcript: 'Los bucles son la herramienta de la eficiencia. En lugar de escribir print Hola cinco veces, usas un bucle for que lo repite automáticamente. El bucle while se repite mientras una condición sea verdadera. Las funciones por su parte te permiten encapsular un bloque de código reutilizable. Defines una vez y la llamas cuantas veces necesites.',
        duration: '24 min',
      },
      kinesthetic: {
        title: 'Proyecto: Tu primer programa con funciones',
        description: 'Crea un programa de gestión de notas que use bucles y funciones.',
        steps: [
          'Define una función que calcule el promedio de notas',
          'Usa un bucle while para pedir notas hasta que el usuario diga "fin"',
          'Crea otra función que determine si el promedio aprueba o reprueba',
          'Ejecuta el programa completo',
        ],
        duration: '30 min',
      },
    },
    order: 3,
  },
  // ===== LECCIONES l_019 a l_021: Comunicación Académica (c_004) =====
  {
    id: 'l_019',
    courseId: 'c_004',
    moduleId: 'm_008',
    title: 'Estructura del Texto Académico',
    type: 'reading',
    duration: 14,
    completed: true,
    quiz: [
      {
        id: 'q_023',
        question: '¿Cuáles son las partes fundamentales de un ensayo académico?',
        options: [
          'Inicio, nudo y desenlace',
          'Introducción, desarrollo y conclusión',
          'Título, cuerpo y firma',
          'Resumen, gráficas y bibliografía',
        ],
        correct: 1,
        explanation: 'Un ensayo académico se estructura en introducción (presenta la tesis), desarrollo (argumentos y evidencia) y conclusión (síntesis y cierre).',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Infografía: Anatomía de un texto académico',
        description: 'Mapa visual con las partes y funciones de cada sección de un ensayo.',
        thumbnail: null,
        duration: '14 min',
      },
      auditory: {
        title: 'Podcast: Cómo escribir un ensayo que impresione a tu profesor',
        description: 'Consejos prácticos narrados por docentes universitarios colombianos.',
        transcript: 'Un texto académico tiene tres partes esenciales: la introducción donde presentas tu tema y tu tesis principal, el desarrollo donde expones tus argumentos con evidencia de fuentes confiables, y la conclusión donde sintetizas tus hallazgos sin agregar información nueva.',
        duration: '16 min',
      },
      kinesthetic: {
        title: 'Taller de escritura: De la idea al párrafo perfecto',
        description: 'Practica la estructura de un ensayo escribiendo párrafos argumentativos.',
        steps: [
          'Elige un tema de actualidad colombiana',
          'Escribe una oración de tesis clara y concisa',
          'Desarrolla un párrafo argumentativo con cita textual',
          'Redacta una conclusión que retome tu tesis',
        ],
        duration: '20 min',
      },
    },
    order: 1,
  },
  {
    id: 'l_020',
    courseId: 'c_004',
    moduleId: 'm_008',
    title: 'Normas APA - 7ma Edición',
    type: 'video',
    duration: 16,
    completed: true,
    quiz: [
      {
        id: 'q_024',
        question: '¿Cuál es el formato correcto de cita en texto según APA 7a edición para dos autores?',
        options: [
          '(García y López, 2024)',
          '(García & López, 2024)',
          '(García, López, 2024)',
          '[García y López 2024]',
        ],
        correct: 0,
        explanation: 'En español, APA 7a usa "y" en lugar de "&" dentro del paréntesis para conectar dos autores.',
      },
      {
        id: 'q_025',
        question: '¿Cuál es el interlineado correcto en formato APA 7a edición?',
        options: ['Sencillo (1.0)', '1.5', 'Doble (2.0)', 'Triple (3.0)'],
        correct: 2,
        explanation: 'Las normas APA 7a edición requieren interlineado a doble espacio (2.0) en todo el documento.',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Tutorial visual: Aplica normas APA en Word paso a paso',
        description: 'Guía con capturas de pantalla para configurar tu documento APA correctamente.',
        thumbnail: null,
        duration: '16 min',
      },
      auditory: {
        title: 'Audio-guía: Los errores APA más comunes y cómo evitarlos',
        description: 'Escucha los errores que más cometen los estudiantes y sus correcciones.',
        transcript: 'Las normas APA de la 7a edición tienen requisitos claros: fuente Times New Roman 12 o Calibri 11, márgenes de 2.54 centímetros por todos los lados, interlineado doble, alineación a la izquierda sin justificar, y sangría de primera línea de 1.27 centímetros. El error más común es olvidar la sangría o justificar el texto.',
        duration: '18 min',
      },
      kinesthetic: {
        title: 'Práctica: Formatea tu primer documento APA',
        description: 'Toma un texto sin formato y aplícale todas las normas APA paso a paso.',
        steps: [
          'Configura los márgenes, fuente e interlineado',
          'Añade una portada APA con título, autor e institución',
          'Inserta una cita directa y una paráfrasis',
          'Crea la página de Referencias con formato APA correcto',
        ],
        duration: '25 min',
      },
    },
    order: 2,
  },
  {
    id: 'l_021',
    courseId: 'c_004',
    moduleId: 'm_008',
    title: 'Argumentación y Retórica',
    type: 'interactive',
    duration: 18,
    completed: true,
    quiz: [
      {
        id: 'q_026',
        question: '¿Cuál de los siguientes es un ejemplo de falacia argumentativa?',
        options: [
          'Citar un estudio revisado por pares',
          'Atacar a la persona en lugar de su argumento (Ad hominem)',
          'Presentar evidencia estadística',
          'Hacer una analogía con un caso similar',
        ],
        correct: 1,
        explanation: 'El Ad hominem es una falacia que ataca a la persona en vez de refutar su argumento, invalidando la lógica del debate.',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Mapa mental: Tipos de argumentos y falacias',
        description: 'Diagrama colorido que clasifica argumentos válidos vs. falacias comunes.',
        thumbnail: null,
        duration: '18 min',
      },
      auditory: {
        title: 'Debate simulado: Practica la argumentación',
        description: 'Escucha un debate modelo y aprende a identificar argumentos fuertes y débiles.',
        transcript: 'Argumentar bien es una habilidad que se entrena. Un buen argumento tiene tres partes: una afirmación clara, una evidencia que la respalde y un razonamiento que conecte ambas. Las falacias son errores lógicos que debilitan un argumento. La más común es el ad hominem, cuando atacas a la persona en vez de sus ideas.',
        duration: '20 min',
      },
      kinesthetic: {
        title: 'Debate en clase: Defiende tu postura',
        description: 'Prepara y presenta argumentos a favor y en contra de un tema controversial.',
        steps: [
          'Elige un tema debatible (ej: ¿debería ser obligatoria la IA en la educación?)',
          'Redacta 3 argumentos a favor con evidencia',
          'Redacta 3 contraargumentos anticipados',
          'Prepara un discurso de 2 minutos y grábate presentándolo',
        ],
        duration: '25 min',
      },
    },
    order: 3,
  },
  // ===== LECCIONES l_022 a l_023: Cálculo Diferencial (c_005) =====
  {
    id: 'l_022',
    courseId: 'c_005',
    moduleId: 'm_009',
    title: 'Concepto de Límite',
    type: 'video',
    duration: 20,
    completed: false,
    quiz: [
      {
        id: 'q_027',
        question: '¿Qué significa que el límite de f(x) cuando x tiende a 2 es igual a 5?',
        options: [
          'Que f(2) = 5 exactamente',
          'Que f(x) se acerca a 5 cuando x se acerca a 2',
          'Que f(x) = 5 para todo x',
          'Que x nunca puede ser 2',
        ],
        correct: 1,
        explanation: 'El límite describe el valor al que se acerca f(x) a medida que x se aproxima a un valor, sin necesariamente alcanzarlo.',
      },
      {
        id: 'q_028',
        question: '¿Cuál es el límite de (x² - 4)/(x - 2) cuando x tiende a 2?',
        options: ['0', '2', '4', 'No existe'],
        correct: 2,
        explanation: 'Factorizando: (x² - 4)/(x - 2) = (x+2)(x-2)/(x-2) = x+2. Cuando x→2: 2+2 = 4.',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Animación: ¿Qué es el límite? El zoom infinito',
        description: 'Visualiza el concepto de límite con animaciones de acercamiento infinito a un punto.',
        thumbnail: null,
        duration: '20 min',
      },
      auditory: {
        title: 'Clase magistral: Límites desde la intuición hasta la formalidad',
        description: 'El profesor explica el límite usando la analogía de caminar hacia una puerta.',
        transcript: 'Imagina que caminas hacia una puerta pero en cada paso recorres la mitad de la distancia que te falta. Nunca llegas, pero te acercas cada vez más. Eso es exactamente lo que describe un límite matemático. El límite de f de x cuando x tiende a a es el valor L al que se aproxima f de x cuando x se acerca cada vez más a a.',
        duration: '22 min',
      },
      kinesthetic: {
        title: 'Exploración numérica: Calcula límites con tablas',
        description: 'Construye tablas de valores para descubrir los límites de funciones.',
        steps: [
          'Evalúa f(x) = (x²-4)/(x-2) para x = 1.9, 1.99, 1.999, 2.001, 2.01, 2.1',
          'Observa a qué valor se aproximan los resultados',
          'Grafica los puntos para confirmar visualmente',
          'Factoriza la expresión para verificar algebraicamente',
        ],
        duration: '25 min',
      },
    },
    order: 1,
  },
  {
    id: 'l_023',
    courseId: 'c_005',
    moduleId: 'm_009',
    title: 'Continuidad de Funciones',
    type: 'reading',
    duration: 16,
    completed: false,
    quiz: [
      {
        id: 'q_029',
        question: '¿Cuál de estas condiciones NO es necesaria para que f(x) sea continua en x = a?',
        options: [
          'f(a) existe',
          'El límite de f(x) cuando x→a existe',
          'El límite de f(x) cuando x→a es igual a f(a)',
          'La derivada de f(x) en x=a existe',
        ],
        correct: 3,
        explanation: 'La continuidad requiere 3 condiciones: que f(a) exista, que el límite exista, y que ambos sean iguales. La derivada NO es necesaria para la continuidad (ej: f(x)=|x| es continua pero no derivable en x=0).',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Galería de gráficas: Funciones continuas vs. discontinuas',
        description: 'Compara visualmente funciones con y sin discontinuidades (salto, removible, infinita).',
        thumbnail: null,
        duration: '16 min',
      },
      auditory: {
        title: 'Audio-clase: Entendiendo la continuidad sin complicaciones',
        description: 'Explicación clara y directa del concepto de continuidad con ejemplos cotidianos.',
        transcript: 'Una función es continua en un punto si puedes dibujar su gráfica sin levantar el lápiz. Más formalmente, necesitamos tres cosas: que la función esté definida en ese punto, que el límite exista, y que el límite coincida con el valor de la función. Si falla alguna de estas tres condiciones, hay una discontinuidad.',
        duration: '18 min',
      },
      kinesthetic: {
        title: 'Detective de discontinuidades',
        description: 'Analiza funciones y clasifica sus discontinuidades como removibles, de salto o infinitas.',
        steps: [
          'Evalúa la función en el punto dado',
          'Calcula los límites laterales (izquierda y derecha)',
          'Compara los tres valores',
          'Clasifica: ¿es continua o tiene discontinuidad? ¿De qué tipo?',
        ],
        duration: '20 min',
      },
    },
    order: 2,
  },
  // ===== LECCIONES l_024 a l_025: Economía Circular (c_006) =====
  {
    id: 'l_024',
    courseId: 'c_006',
    moduleId: 'm_010',
    title: 'Modelos de Negocio Circular',
    type: 'video',
    duration: 18,
    completed: false,
    quiz: [
      {
        id: 'q_030',
        question: '¿Cuál de estos es un modelo de negocio circular?',
        options: [
          'Fabricar productos desechables de un solo uso',
          'Producto como servicio (PaaS): alquilar en vez de vender',
          'Reducir la calidad para abaratar costos',
          'Aumentar la producción sin límite',
        ],
        correct: 1,
        explanation: 'El modelo "Producto como Servicio" (PaaS) es circular porque el fabricante retiene la propiedad del producto y se responsabiliza de su mantenimiento, reparación y eventual reciclaje.',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Reportaje: Negocios circulares que están cambiando el mundo',
        description: 'Casos de éxito de empresas que transformaron su modelo lineal a circular.',
        thumbnail: null,
        duration: '18 min',
      },
      auditory: {
        title: 'Podcast: De la basura al negocio - Casos reales',
        description: 'Entrevistas con emprendedores que convirtieron residuos en oportunidades rentables.',
        transcript: 'Los modelos de negocio circular desafían la idea de que algo es basura. Hay al menos cinco modelos principales: suministros circulares donde usas materiales reciclados, recuperación de recursos donde conviertes desechos en nuevos insumos, extensión de vida útil donde reparas y reacondicionas, plataformas de intercambio donde compartes en vez de poseer, y producto como servicio donde alquilas en vez de vender.',
        duration: '20 min',
      },
      kinesthetic: {
        title: 'Taller: Diseña tu modelo de negocio circular',
        description: 'Aplica el Canvas circular para crear un plan de negocio sostenible.',
        steps: [
          'Identifica un flujo de residuos en tu comunidad',
          'Diseña un producto o servicio que aproveche ese residuo',
          'Define tu propuesta de valor y clientes objetivo',
          'Calcula la viabilidad financiera básica del modelo',
        ],
        duration: '25 min',
      },
    },
    order: 1,
  },
  {
    id: 'l_025',
    courseId: 'c_006',
    moduleId: 'm_010',
    title: 'Gestión de Residuos en Colombia',
    type: 'reading',
    duration: 14,
    completed: false,
    quiz: [
      {
        id: 'q_031',
        question: '¿Qué porcentaje aproximado de los residuos sólidos en Colombia se recicla actualmente?',
        options: ['Menos del 5%', 'Alrededor del 17%', 'Más del 50%', 'Más del 80%'],
        correct: 1,
        explanation: 'En Colombia se recicla aproximadamente el 17% de los residuos sólidos generados, lo que representa una gran oportunidad de mejora y emprendimiento.',
      },
    ],
    contentByStyle: {
      visual: {
        title: 'Infografía: El mapa de los residuos en Colombia',
        description: 'Datos visuales sobre generación, recolección y reciclaje de residuos en el país.',
        thumbnail: null,
        duration: '14 min',
      },
      auditory: {
        title: 'Podcast: Recicladores de oficio - Héroes invisibles de Colombia',
        description: 'Conoce la labor de los recicladores de base y su papel en la economía circular colombiana.',
        transcript: 'Colombia genera aproximadamente 12 millones de toneladas de residuos sólidos al año, pero solo recicla alrededor del 17 por ciento. Los recicladores de oficio son actores clave en este ecosistema, recuperando materiales que de otra forma terminarían en rellenos sanitarios. Su trabajo no solo es ambiental sino social, ya que representa el sustento de más de 40 mil familias en el país.',
        duration: '16 min',
      },
      kinesthetic: {
        title: 'Auditoría de residuos: ¿Cuánto desperdicias?',
        description: 'Realiza una auditoría de los residuos que generas en una semana y propón soluciones.',
        steps: [
          'Durante una semana, clasifica y pesa tus residuos diarios',
          'Categoriza en: orgánicos, reciclables, no reciclables',
          'Calcula tu porcentaje de reciclaje actual',
          'Propón 3 acciones para reducir tus residuos no reciclables',
        ],
        duration: '18 min',
      },
    },
    order: 2,
  },
];

const DEFAULT_POSTS = [
  {
    id: 'p_001',
    authorId: 'u_001',
    authorName: 'Brigitte Pico Peralta',
    authorAvatar: null,
    course: 'Matemáticas Básicas',
    courseId: 'c_001',
    title: '¿Cómo entender el concepto de límite sin morir en el intento?',
    content: 'Llevo toda la semana con el módulo de límites y siento que no avanzo. ¿Alguien tiene un truco visual para entenderlo mejor? Soy estudiante visual según mi diagnóstico.',
    tags: ['matemáticas', 'límites', 'visual'],
    likes: 12,
    replies: 5,
    solved: true,
    aiResponse: {
      text: 'El límite se puede visualizar como acercarse a un punto sin llegar nunca. Imagina que caminas hacia una puerta pero siempre recorres la mitad del camino restante. La analogía del zoom en una curva también funciona muy bien para perfiles visuales.',
      helpful: 8,
    },
    timestamp: '2026-05-23T10:00:00Z',
  },
  {
    id: 'p_002',
    authorId: 'u_003',
    authorName: 'María Fernanda Soto',
    authorAvatar: null,
    course: 'Desarrollo Sostenible',
    courseId: 'c_002',
    title: 'Comparto mi proyecto de economía circular: jabón de aceite reciclado',
    content: '¡Terminé mi proyecto aplicando los conceptos del módulo 2! Hice jabón artesanal con aceite de cocina usado que antes botábamos. El proceso fue sencillo y la profe quedó impresionada. ¿Quieren que comparta los pasos?',
    tags: ['economía circular', 'proyecto', 'kinestésico', 'artesanal'],
    likes: 28,
    replies: 14,
    solved: false,
    aiResponse: null,
    timestamp: '2026-05-24T15:30:00Z',
  },
];

const DEFAULT_TRENDS = [
  { tag: 'python', count: 23 },
  { tag: 'límites', count: 18 },
  { tag: 'APA', count: 15 },
  { tag: 'economía circular', count: 12 },
  { tag: 'algebra', count: 10 },
];

// Cargar DB actual o inicializar con mocks predeterminados
export const db = {
  data: {
    users: [],
    courses: [],
    lessons: [],
    posts: [],
    trends: [],
    tasks: [
      { id: 't_001', title: 'Completar cuestionario diagnóstico', course: 'Matemáticas Básicas', dueDate: 'Hoy', status: 'pending' },
      { id: 't_002', title: 'Ejercicios de simplificación algebraica', course: 'Matemáticas Básicas', dueDate: 'Mañana', status: 'in_progress' },
      { id: 't_003', title: 'Práctica de despeje de ecuaciones', course: 'Matemáticas Básicas', dueDate: 'En 3 días', status: 'pending' },
      { id: 't_004', title: 'Análisis de ciclo de vida del cartón', course: 'Desarrollo Sostenible', dueDate: 'En 5 días', status: 'pending' }
    ],
    weeklyProgress: [
      { day: 'Lun', minutes: 25 },
      { day: 'Mar', minutes: 40 },
      { day: 'Mié', minutes: 15 },
      { day: 'Jue', minutes: 60 },
      { day: 'Vie', minutes: 30 },
      { day: 'Sáb', minutes: 45 },
      { day: 'Dom', minutes: 10 },
    ],
    monthlyProgress: [
      { day: 'Sem 1', minutes: 120 },
      { day: 'Sem 2', minutes: 180 },
      { day: 'Sem 3', minutes: 220 },
      { day: 'Sem 4', minutes: 140 },
    ],
    badges: [
      { id: 'b_001', name: 'Explorador Cognitivo', description: 'Completaste el diagnóstico de aprendizaje.', icon: 'fa-wand-magic-sparkles', unlockedAt: '2026-03-15T10:00:00Z' },
      { id: 'b_002', name: 'Persistente', description: 'Lograste una racha de 7 días de estudio.', icon: 'fa-fire', unlockedAt: '2026-03-22T10:00:00Z' },
    ],
    activities: [
      { id: 'a_001', type: 'lesson_complete', description: 'Completaste la lección: Operaciones Algebraicas', timestamp: '2026-05-28T16:00:00Z' },
      { id: 'a_002', type: 'quiz_pass', description: 'Aprobaste el quiz de Ecuaciones con 100%', timestamp: '2026-05-29T10:00:00Z' },
    ],
    alerts: [
      { id: 'al_001', studentId: 'u_002', studentName: 'Carlos Andrade Muñoz', message: 'Carlos Andrade no ha ingresado en 9 días y su promedio de examen es bajo (42%).', action: 'Enviar mensaje motivacional por canal auditivo.', priority: 'high' },
      { id: 'al_002', studentId: 'u_003', studentName: 'María Fernanda Soto', message: 'María Fernanda tiene 1 tarea pendiente por vencer.', action: 'Recordatorio práctico kinestésico.', priority: 'medium' }
    ],
    chats: [],
    submissions: []
  },

  saveToLocalFile() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error guardando en db.json:', err);
    }
  },

  async loadFromPostgres() {
    if (!prisma) return;

    // 1. Cargar Usuarios
    const users = await prisma.user.findMany();
    this.data.users = users.map(u => ({
      ...u,
      joinedAt: u.joinedAt ? u.joinedAt.toISOString() : null,
      cognitiveProfile: u.cognitiveProfile || null,
      preferences: u.preferences || {},
      stats: u.stats || {},
      enrolledCourses: u.enrolledCourses || [],
      courseProgress: u.courseProgress || {},
      courses: u.courses || [],
    }));

    // 2. Cargar Cursos, Módulos y Lecciones (con mapeo de módulos)
    const coursesFromDb = await prisma.course.findMany({
      include: {
        modules: {
          include: {
            lessons: true
          }
        }
      }
    });

    this.data.courses = coursesFromDb.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      icon: c.icon,
      color: c.color,
      instructor: c.instructor,
      instructorAvatar: c.instructorAvatar,
      estimatedHours: c.estimatedHours || {},
      progress: c.progress,
      status: c.status,
      adaptedFor: c.adaptedFor,
      curriculumAligned: c.curriculumAligned,
      tags: c.tags || [],
      rating: c.rating,
      enrolled: c.enrolled,
      modules: c.modules.map(m => ({
        id: m.id,
        title: m.title,
        description: m.description,
        completed: m.completed,
        lessons: m.lessons.map(l => l.id)
      }))
    }));

    // 3. Cargar Lecciones planas
    const lessonsFromDb = await prisma.lesson.findMany();
    this.data.lessons = lessonsFromDb.map(l => ({
      id: l.id,
      courseId: l.courseId,
      moduleId: l.moduleId,
      title: l.title,
      type: l.type,
      duration: l.duration,
      completed: l.completed,
      quiz: l.quiz || [],
      contentByStyle: l.contentByStyle || {},
      order: l.order
    }));

    // 4. Cargar Posts del foro
    const postsFromDb = await prisma.forumPost.findMany();
    this.data.posts = postsFromDb.map(p => ({
      id: p.id,
      authorId: p.authorId,
      authorName: p.authorName,
      authorAvatar: p.authorAvatar,
      course: p.course,
      courseId: p.courseId,
      title: p.title,
      content: p.content,
      tags: p.tags || [],
      likes: p.likes,
      replies: p.replies,
      solved: p.solved,
      aiResponse: p.aiResponse || null,
      timestamp: p.timestamp ? p.timestamp.toISOString() : null
    }));

    // 5. Cargar Actividades
    const activitiesFromDb = await prisma.activity.findMany();
    this.data.activities = activitiesFromDb.map(a => ({
      id: a.id,
      userId: a.userId,
      type: a.type,
      description: a.description,
      timestamp: a.timestamp ? a.timestamp.toISOString() : null
    }));

    // 6. Cargar Insignias (Badges)
    const badgesFromDb = await prisma.badge.findMany();
    this.data.badges = badgesFromDb.map(b => ({
      id: b.id,
      userId: b.userId,
      name: b.name,
      description: b.description,
      icon: b.icon,
      unlockedAt: b.unlockedAt ? b.unlockedAt.toISOString() : null
    }));

    // 7. Cargar Tareas (Tasks)
    const tasksFromDb = await prisma.task.findMany();
    this.data.tasks = tasksFromDb.map(t => ({
      id: t.id,
      userId: t.userId,
      title: t.title,
      course: t.course,
      dueDate: t.dueDate,
      status: t.status
    }));

    // 8. Cargar Alertas
    const alertsFromDb = await prisma.alert.findMany();
    this.data.alerts = alertsFromDb.map(al => ({
      id: al.id,
      studentId: al.studentId,
      studentName: al.studentName,
      message: al.message,
      action: al.action,
      priority: al.priority
    }));

    // 9. Cargar Chats
    const chatsFromDb = await prisma.chat.findMany();
    this.data.chats = chatsFromDb.map(ch => ({
      id: ch.id,
      userId: ch.userId,
      lessonId: ch.lessonId,
      messages: ch.messages || []
    }));

    // 10. Cargar Submissions
    const subsFromDb = await prisma.submission.findMany();
    this.data.submissions = subsFromDb.map(s => ({
      id: s.id,
      userId: s.userId,
      lessonId: s.lessonId,
      lessonTitle: s.lessonTitle,
      fileName: s.fileName,
      filePath: s.filePath,
      score: s.score,
      feedback: s.feedback,
      timestamp: s.timestamp ? s.timestamp.toISOString() : null
    }));

    // Cargar weeklyProgress, monthlyProgress, trends del archivo local db.json como fallback/adicional
    if (fs.existsSync(DB_PATH)) {
      try {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        const fileData = JSON.parse(fileContent);
        this.data.weeklyProgress = fileData.weeklyProgress || [];
        this.data.monthlyProgress = fileData.monthlyProgress || [];
        this.data.trends = fileData.trends || [];
      } catch (err) {
        console.error('Error leyendo weekly/monthly progress de db.json:', err);
      }
    }
  },

  async init() {
    // Asegurarse de que el directorio data existe
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (prisma) {
      console.log('Detectada DATABASE_URL. Cargando datos desde PostgreSQL...');
      try {
        await this.loadFromPostgres();
        // Asegurarse de que al menos hay usuarios sembrados; de lo contrario sembramos
        if (!this.data.users || this.data.users.length === 0) {
          console.log('PostgreSQL está vacío. Sembrando datos por defecto...');
          await this.seed();
        } else {
          console.log('Datos cargados exitosamente desde PostgreSQL.');
          this.saveToLocalFile();
        }
        return;
      } catch (err) {
        console.error('Error cargando desde PostgreSQL, cayendo en db.json:', err);
      }
    }

    if (fs.existsSync(DB_PATH)) {
      try {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Asegurarse de que las colecciones necesarias existan
        if (!this.data.users) this.data.users = [];
        if (!this.data.courses) this.data.courses = [];
        if (!this.data.lessons) this.data.lessons = [];
        if (!this.data.posts) this.data.posts = [];
        if (!this.data.trends) this.data.trends = [];
        if (!this.data.tasks) this.data.tasks = [];
        if (!this.data.weeklyProgress) this.data.weeklyProgress = [];
        if (!this.data.monthlyProgress) this.data.monthlyProgress = [];
        if (!this.data.badges) this.data.badges = [];
        if (!this.data.activities) this.data.activities = [];
        if (!this.data.alerts) this.data.alerts = [];
        if (!this.data.chats) this.data.chats = [];
        if (!this.data.submissions) this.data.submissions = [];

        // Auto-reparar/sembrar el progreso de curso de los estudiantes si no existe
        this.data.users.forEach((u) => {
          if (!u.courseProgress || Object.keys(u.courseProgress).length === 0) {
            const defaultUser = DEFAULT_USERS.find((du) => du.id === u.id);
            if (defaultUser && defaultUser.courseProgress) {
              u.courseProgress = { ...defaultUser.courseProgress };
            } else {
              u.courseProgress = {
                c_001: 0,
                c_002: 0,
                c_003: 0,
                c_004: 0,
                c_005: 0,
                c_006: 0
              };
            }
          }
        });
        this.saveToLocalFile();
      } catch (err) {
        console.error('Error cargando db.json, reinicializando...', err);
        await this.seed();
      }
    } else {
      await this.seed();
    }
  },

  async seed() {
    this.data.users = DEFAULT_USERS;
    this.data.courses = DEFAULT_COURSES;
    this.data.lessons = DEFAULT_LESSONS;
    this.data.posts = DEFAULT_POSTS;
    this.data.trends = DEFAULT_TRENDS;
    this.saveToLocalFile();
    if (prisma) {
      console.log('Sembrando base de datos PostgreSQL...');
      try {
        await performPostgresSync();
        console.log('Sembrado en PostgreSQL completado.');
      } catch (err) {
        console.error('Error sembrando en PostgreSQL:', err);
      }
    }
    console.log('Base de datos inicializada y sembrada con éxito.');
  },

  save() {
    this.saveToLocalFile();
    if (prisma) {
      performPostgresSync();
    }
  }
};

let isSyncing = false;
let pendingSync = false;

async function performPostgresSync() {
  if (!prisma) return;
  if (isSyncing) {
    pendingSync = true;
    return;
  }
  isSyncing = true;
  
  try {
    // 1. Sync Users
    for (const u of db.data.users || []) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: {
          name: u.name,
          email: u.email,
          passwordHash: u.passwordHash,
          role: u.role,
          avatar: u.avatar,
          university: u.university,
          program: u.program,
          department: u.department,
          semester: u.semester,
          cognitiveProfile: u.cognitiveProfile || null,
          preferences: u.preferences || {},
          stats: u.stats || {},
          enrolledCourses: u.enrolledCourses || [],
          courseProgress: u.courseProgress || {},
          courses: u.courses || [],
        },
        create: {
          id: u.id,
          name: u.name,
          email: u.email,
          passwordHash: u.passwordHash,
          role: u.role || 'student',
          avatar: u.avatar,
          university: u.university || 'Universidad de Córdoba',
          program: u.program,
          department: u.department,
          semester: u.semester || 1,
          cognitiveProfile: u.cognitiveProfile || null,
          preferences: u.preferences || {},
          stats: u.stats || {},
          enrolledCourses: u.enrolledCourses || [],
          courseProgress: u.courseProgress || {},
          courses: u.courses || [],
          joinedAt: u.joinedAt ? new Date(u.joinedAt) : new Date(),
        }
      });
    }
    
    // 2. Sync Courses
    for (const c of db.data.courses || []) {
      await prisma.course.upsert({
        where: { id: c.id },
        update: {
          title: c.title,
          description: c.description,
          category: c.category,
          icon: c.icon,
          color: c.color,
          instructor: c.instructor,
          instructorAvatar: c.instructorAvatar,
          estimatedHours: c.estimatedHours || {},
          progress: c.progress || 0.0,
          status: c.status || 'locked',
          adaptedFor: c.adaptedFor,
          curriculumAligned: c.curriculumAligned,
          tags: c.tags || [],
          rating: c.rating || 0.0,
          enrolled: c.enrolled || 0,
        },
        create: {
          id: c.id,
          title: c.title,
          description: c.description,
          category: c.category,
          icon: c.icon,
          color: c.color,
          instructor: c.instructor,
          instructorAvatar: c.instructorAvatar,
          estimatedHours: c.estimatedHours || {},
          progress: c.progress || 0.0,
          status: c.status || 'locked',
          adaptedFor: c.adaptedFor,
          curriculumAligned: c.curriculumAligned,
          tags: c.tags || [],
          rating: c.rating || 0.0,
          enrolled: c.enrolled || 0,
        }
      });
      
      // Modules inside this course
      for (const m of c.modules || []) {
        await prisma.module.upsert({
          where: { id: m.id },
          update: {
            title: m.title,
            description: m.description || '',
            completed: m.completed || false,
          },
          create: {
            id: m.id,
            courseId: c.id,
            title: m.title,
            description: m.description || '',
            completed: m.completed || false,
          }
        });
      }
    }
    
    // 3. Sync Lessons
    for (const l of db.data.lessons || []) {
      await prisma.lesson.upsert({
        where: { id: l.id },
        update: {
          title: l.title,
          type: l.type,
          duration: l.duration,
          completed: l.completed,
          order: l.order,
          quiz: l.quiz || [],
          contentByStyle: l.contentByStyle || {},
        },
        create: {
          id: l.id,
          courseId: l.courseId,
          moduleId: l.moduleId,
          title: l.title,
          type: l.type,
          duration: l.duration,
          completed: l.completed,
          order: l.order,
          quiz: l.quiz || [],
          contentByStyle: l.contentByStyle || {},
        }
      });
    }
    
    // 4. Sync Forum Posts
    for (const p of db.data.posts || []) {
      await prisma.forumPost.upsert({
        where: { id: p.id },
        update: {
          authorName: p.authorName,
          authorAvatar: p.authorAvatar,
          title: p.title,
          content: p.content,
          tags: p.tags || [],
          likes: p.likes,
          replies: p.replies,
          solved: p.solved,
          aiResponse: p.aiResponse || null,
        },
        create: {
          id: p.id,
          authorId: p.authorId,
          authorName: p.authorName,
          authorAvatar: p.authorAvatar,
          course: p.course || 'General',
          courseId: p.courseId || 'c_001',
          title: p.title,
          content: p.content,
          tags: p.tags || [],
          likes: p.likes || 0,
          replies: p.replies || 0,
          solved: p.solved || false,
          aiResponse: p.aiResponse || null,
          timestamp: p.timestamp ? new Date(p.timestamp) : new Date(),
        }
      });
    }
    
    // 5. Sync Activities
    for (const a of db.data.activities || []) {
      await prisma.activity.upsert({
        where: { id: a.id },
        update: {
          type: a.type,
          description: a.description,
        },
        create: {
          id: a.id,
          userId: a.userId,
          type: a.type,
          description: a.description,
          timestamp: a.timestamp ? new Date(a.timestamp) : new Date(),
        }
      });
    }
    
    // 6. Sync Badges
    for (const b of db.data.badges || []) {
      await prisma.badge.upsert({
        where: { id: b.id },
        update: {
          name: b.name,
          description: b.description,
          icon: b.icon,
        },
        create: {
          id: b.id,
          userId: b.userId,
          name: b.name,
          description: b.description,
          icon: b.icon,
          unlockedAt: b.unlockedAt ? new Date(b.unlockedAt) : new Date(),
        }
      });
    }
    
    // 7. Sync Tasks
    for (const t of db.data.tasks || []) {
      const userId = t.userId || 'u_001';
      await prisma.task.upsert({
        where: { id: t.id },
        update: {
          title: t.title,
          course: t.course,
          dueDate: t.dueDate,
          status: t.status,
        },
        create: {
          id: t.id,
          userId,
          title: t.title,
          course: t.course,
          dueDate: t.dueDate,
          status: t.status || 'pending',
        }
      });
    }
    
    // 8. Sync Alerts
    for (const al of db.data.alerts || []) {
      await prisma.alert.upsert({
        where: { id: al.id },
        update: {
          studentName: al.studentName,
          message: al.message,
          action: al.action,
          priority: al.priority,
        },
        create: {
          id: al.id,
          studentId: al.studentId,
          studentName: al.studentName,
          message: al.message,
          action: al.action,
          priority: al.priority,
        }
      });
    }
    
    // 9. Sync Chats
    for (const ch of db.data.chats || []) {
      await prisma.chat.upsert({
        where: { id: ch.id },
        update: {
          messages: ch.messages || [],
        },
        create: {
          id: ch.id,
          userId: ch.userId,
          lessonId: ch.lessonId,
          messages: ch.messages || [],
        }
      });
    }
    
    // 10. Sync Submissions
    for (const sub of db.data.submissions || []) {
      await prisma.submission.upsert({
        where: { id: sub.id },
        update: {
          score: Number(sub.score),
          feedback: sub.feedback,
        },
        create: {
          id: sub.id,
          userId: sub.userId,
          lessonId: sub.lessonId,
          lessonTitle: sub.lessonTitle,
          fileName: sub.fileName,
          filePath: sub.filePath,
          score: Number(sub.score),
          feedback: sub.feedback,
          timestamp: sub.timestamp ? new Date(sub.timestamp) : new Date(),
        }
      });
    }
  } catch (err) {
    console.error('Error synchronizing database to PostgreSQL:', err);
  } finally {
    isSyncing = false;
    if (pendingSync) {
      pendingSync = false;
      performPostgresSync();
    }
  }
}

await db.init();

