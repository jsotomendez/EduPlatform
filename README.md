# EduPlatform

Plataforma educativa adaptativa con IA para estudiantes universitarios colombianos.  
Proyecto académico · Universidad de Córdoba

**Autores:** José Gil Soto Méndez · Frank Manuel García Pernett · Tomás David González López

---

## Estructura del proyecto (Full-Stack)

El proyecto consta de una arquitectura cliente-servidor:
1. **Frontend (React.js)**: Aplicación SPA reactiva que corre en `http://localhost:5173`.
2. **Backend (Node.js + Express)**: API REST que maneja la lógica de negocio, autenticación, base de datos local y conectividad con la IA. Corre por defecto en `http://localhost:3001`.

---

## Inicio rápido

### 1. Iniciar el Backend
Ve a la carpeta del backend, instala las dependencias e inicia el servidor:
```bash
cd backend
npm install
npm start
```
El servidor backend se levantará en `http://localhost:3001`.

### 2. Iniciar el Frontend
En la raíz del proyecto, instala las dependencias e inicia el servidor de desarrollo:
```bash
npm install
npm run dev
```
La aplicación cliente se abrirá en `http://localhost:5173`.

> [!NOTE]
> **API Key de Gemini:** Si deseas habilitar el tutor inteligente con IA real (Gemini 3.5 Flash), agrega tu API Key en la configuración del estudiante (interfaz de Ajustes) o crea un archivo `.env` en la carpeta `backend/` con la variable: `GEMINI_API_KEY=tu_api_key_aqui`. Si no se provee, la aplicación usará un motor heurístico local de respaldo.

**Cuentas demo de prueba:**

| Rol        | Email                       | Contraseña |
|------------|-----------------------------|------------|
| Estudiante | brigitte@unicordoba.edu.co  | demo1234   |
| Docente    | jose.soto@unicordoba.edu.co | demo1234   |

También puedes usar los botones de acceso rápido "Demo Estudiante" / "Demo Docente" en la pantalla de login.

---

## Arquitectura en capas del Frontend

```
┌─────────────────────────────────────────────┐
│  Capa 1 · Presentación (pages/, components/)│
│  React JSX + CSS Modules                    │
│  Solo importa desde: hooks/ y context/      │
└───────────────┬─────────────────────────────┘
                │ custom hooks
┌───────────────▼─────────────────────────────┐
│  Capa 2 · Lógica de negocio (hooks/)        │
│  useAuth, useDiagnostic, useAdaptiveRoute,  │
│  useAITutor, useDropoutRisk, useProgress    │
│  Solo importa desde: services/ y context/   │
└───────────────┬─────────────────────────────┘
                │ API Calls (fetch)
┌───────────────▼─────────────────────────────┐
│  Capa 3 · Acceso a datos (services/)        │
│  Llamadas HTTP asíncronas vía utils/api     │
│  Solo importa desde: utils/ y constants/    │
└───────────────┬─────────────────────────────┘
                │
┌───────────────▼─────────────────────────────┐
│  Capa 4 · Infraestructura (utils/, styles/) │
│  API Wrapper, clasificadores, tokens CSS,   │
│  almacenamiento local (localStorage wrapper)│
└─────────────────────────────────────────────┘
```

---

## Estructura de carpetas principal

```
EduPlatform/
├── backend/            # Servidor Node.js + Express
│   ├── data/           # Base de datos local (db.json)
│   ├── db.js           # Inicializador y persistencia de base de datos
│   ├── server.js       # Endpoints de API REST, Auth y lógica de IA (Gemini)
│   └── utils.js        # Heurísticas compartidas (VAK, Riesgo deserción)
├── src/                # Aplicación Frontend React
│   ├── components/     # Componentes visuales y gráficos (Recharts)
│   ├── config/         # Rutas protegidas y configs de enrutamiento
│   ├── constants/      # Rutas, estilos cognitivos y mensajes predeterminados
│   ├── context/        # Providers globales (User, Theme, Notification, Progress)
│   ├── hooks/          # Custom hooks encargados de aislar la lógica de la UI
│   ├── pages/          # Páginas (Login, Registro, Onboarding, Student, Teacher)
│   ├── services/       # Servicios frontend que se comunican con la API Backend
│   ├── styles/         # Hojas de estilo y design tokens de accesibilidad
│   ├── tests/          # Pruebas unitarias automatizadas (Vitest)
│   └── utils/          # Utilidades frontend (almacenamiento, validadores, etc.)
```

---

## Algoritmos de Adaptabilidad e IA

1. **Clasificador VAK** (`backend/utils.js` / `src/utils/vakClassifier.js`):
   Evalúa un cuestionario diagnóstico de 10 preguntas para determinar el estilo dominante de aprendizaje (**Visual, Auditivo o Kinestésico**). Resuelve empates siguiendo el orden jerárquico de desempate: *Visual > Auditivo > Kinestésico*.
   
2. **Cálculo de Riesgo de Deserción** (`backend/utils.js` / `src/utils/riskCalculator.js`):
   Determina si un estudiante se encuentra en riesgo bajo, medio o alto sumando pesos ponderados basados en:
   * Días de inactividad (`daysSinceLastLogin`).
   * Lecciones completadas en la semana (`completedLessonsThisWeek`).
   * Calificación promedio de quices (`avgQuizScore`).
   * Tareas retrasadas (`missedDeadlines`).

3. **Tutor Inteligente IA RAG** (`backend/server.js`):
   Utiliza la API oficial de **Google Gemini 3.5 Flash** (vía `@google/genai`). Implementa **RAG Contextual**: inyecta la descripción y transcripción de la lección activa al prompt del sistema, junto con el historial de conversación. Configura instrucciones del sistema dinámicas que obligan al modelo a adaptar su estilo comunicativo al perfil cognitivo detectado (ej: usar emojis y listas estructuradas para visuales, explicaciones narrativas y rítmicas para auditivos, o retos activos para kinestésicos).

---

## Scripts disponibles

En el directorio raíz del proyecto puedes ejecutar:

| Comando          | Descripción                                     |
|------------------|-------------------------------------------------|
| `npm run dev`    | Levanta el frontend en modo desarrollo          |
| `npm run build`  | Genera el build de producción del frontend      |
| `npm run lint`   | Analiza la calidad del código con ESLint        |
| `npm run format` | Da formato consistente con Prettier             |
| `npm run test`   | Ejecuta las pruebas automatizadas (Vitest)       |

---

## Tecnologías Principales

* **React 19** + **Vite 8** + **JavaScript ES2022**
* **Express** + **JSON File DB**
* **Google Gemini API** (`@google/genai`)
* **react-router-dom v7** (Enrutamiento)
* **Recharts** (Visualizaciones dinámicas en Dashboards)
* **Framer Motion** (Micro-animaciones fluidas)
* **CSS Modules** (Diseño modular y tokens de accesibilidad)
* **Vitest** (Framework de pruebas automatizadas)
