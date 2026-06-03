import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

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
    ]
  },

  init() {
    // Asegurarse de que el directorio data existe
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
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
      } catch (err) {
        console.error('Error cargando db.json, reinicializando...', err);
        this.seed();
      }
    } else {
      this.seed();
    }
  },

  seed() {
    this.data.users = DEFAULT_USERS;
    this.data.courses = DEFAULT_COURSES;
    this.data.lessons = DEFAULT_LESSONS;
    this.data.posts = DEFAULT_POSTS;
    this.data.trends = DEFAULT_TRENDS;
    this.save();
    console.log('Base de datos inicializada y sembrada con éxito.');
  },

  save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error guardando en db.json:', err);
    }
  }
};

db.init();
