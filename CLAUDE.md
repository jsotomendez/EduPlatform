# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context

EduPlatform is an academic MVP of an AI-adaptive learning platform for Colombian university students (Universidad de Córdoba). It is a **full-stack app**:
1. **Frontend (React.js)**: A React-based SPA in the root folder, running on port `5173`. Calls the API via a centralized fetch wrapper.
2. **Backend (Node.js + Express)**: Located in the `backend/` directory, running on port `3001`. Manages authentication (JWT), course and module creation, forum community posts, analytics (VAK and risk calculator), database persistence in `backend/data/db.json`, and integrates **Google Gemini 3.5 Flash** for VAK-tailored RAG context tutoring.

## Commands

**Root Directory (Frontend & Common Tasks):**
```bash
npm run dev      # Vite dev server on http://localhost:5173
npm run build    # Production build to dist/
npm run lint     # ESLint (flat config) over **/*.{js,jsx}
npm run format   # Prettier on src/**/*.{js,jsx,css}
npm run preview  # Serve the production build
npm run test     # Run unit tests (Vitest) over src/tests/
```

**Backend Directory:**
```bash
cd backend
npm install      # Install server dependencies
npm start        # Start API server on http://localhost:3001
```

## Architecture — strict layering

Imports in the React app MUST flow downward through these layers; do not skip layers:

1. **Presentation** — [src/pages/](src/pages/), [src/components/](src/components/) — JSX + CSS Modules. Imports only from `hooks/`, `context/`, `constants/`, and other components.
2. **Business logic** — [src/hooks/](src/hooks/) — `useAuth`, `useDiagnostic`, `useAdaptiveRoute`, `useAITutor`, `useDropoutRisk`, `useProgress`. Imports from `services/` and `context/`.
3. **Data access** — [src/services/](src/services/) — async functions that perform HTTP API requests to the backend server. Imports from `utils/` (like `api`) and `constants/`.
4. **Infrastructure** — [src/utils/](src/utils/) — pure helpers (`vakClassifier`, `storage`, `formatters`, `validators`).

## Routing and auth flow

Routes are declared as a single config array in [src/config/routes.config.jsx](src/config/routes.config.jsx) and consumed via `useRoutes`. Provider order in [src/App.jsx](src/App.jsx) is load-bearing: `ThemeProvider → UserProvider → NotificationProvider → ProgressProvider → ErrorBoundary`.

Authentication uses JWT tokens stored under `edu_token` in `localStorage`. The fetch wrapper `src/utils/api.js` automatically attaches this token to requests.

Post-login redirect logic lives in [src/hooks/useAuth.js](src/hooks/useAuth.js) — teachers go to `/teacher/dashboard`, students without a `cognitiveProfile` go to `/onboarding/welcome`, otherwise `/student/dashboard`.

## Core algorithms (VAK & Risk)

- **VAK classifier** (`backend/utils.js` / `src/utils/vakClassifier.js`) — counts diagnostic answers into `{visual, auditory, kinesthetic}` and returns `{primary, secondary, scores}`. **Ties break in the order Visual > Auditory > Kinesthetic** via `STYLE_ORDER` in [src/constants/learningStyles.js](src/constants/learningStyles.js).
- **Dropout risk** (`backend/utils.js` / `src/utils/riskCalculator.js`) — weighted sum of four behavioral metrics from the student's stats -> `low/medium/high` bands (`<0.3`, `0.3–0.6`, `>0.6`). Factor keys (`low_engagement`, `no_progress`, etc.) are referenced in other sections; preserve them when modifying weights.

## AI Tutor Chat (Gemini 3.5 Flash RAG)

The backend `/api/ai/chat` uses `@google/genai` to generate tutoring responses. It reads `GEMINI_API_KEY` from server environment variables or client headers (`x-gemini-key`). It injects RAG context (active lesson transcript & description) and instructions customized to the student's primary VAK style to tailor response layouts.

## Conventions

- All UI strings are in Spanish — keep new copy in Spanish and prefer the catalog in [src/constants/messages.js](src/constants/messages.js) (`MSG.success.*`, etc.).
- React component files use `.jsx`; pure logic uses `.js`. Components are exported as **named exports** (`export function FooPage()`), not defaults, except for `App.jsx`.
- Styling uses **CSS Modules** + design tokens in [src/styles/tokens.css](src/styles/tokens.css). Avoid Bootstrap classes where modular layout styling is preferred.
