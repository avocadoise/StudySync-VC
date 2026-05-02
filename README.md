# StudySync

StudySync is a MERN-based student productivity and academic management system with AI-assisted academic support. It helps students organize subjects, tasks, study sessions, notes, focus time, dashboard analytics, and AI-generated study material.

## Tech Stack

| Layer | Tools |
| --- | --- |
| Frontend | React, Vite, React Router, Axios, Tailwind CSS, Recharts, Lucide React, Matter.js, FullCalendar |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| Security | Helmet, CORS, Express rate limiting, ownership-scoped queries |
| AI | Gemini or OpenAI-compatible provider configured through environment variables |

## Repository Structure

```text
StudySync-VC/
  client/                 React + Vite frontend
  server/                 Express + MongoDB backend
  FEATURE_AUDIT.md        Repo audit and checklist comparison
  IMPLEMENTATION_SUMMARY.md
  README.md               Root project guide
```

## Main Features

- User registration, login, persisted JWT sessions, logout, and protected routes.
- Subject management with course name, code, instructor, schedule, and color.
- Task and assignment tracker with priority, status, due-date sorting, and filters.
- Study planner with date, time range, notes, status updates, and time validation.
- Academic Calendar View showing tasks, study plans, and completed focus sessions in one protected calendar.
- Notes manager with tags, search, subject filtering, and reviewer generation flow.
- Focus timer with Pomodoro, short break, long break, custom sessions, pause/resume/reset, completed-session saving, persistent active timer state, focus history, and stats.
- Dashboard summary with subject/task/note/focus totals, upcoming tasks, recent notes, recent focus sessions, status chart, priority chart, and AI study recommendation.
- AI reviewer generator from saved notes with summary, key terms, questions, and flashcards.
- AI study recommendation based on subjects, tasks, deadlines, study plans, and focus history.
- AI input validation assistant for task, subject, note, study plan, and focus session payloads.

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB Atlas or local MongoDB
- Gemini or OpenAI-compatible API key for AI features

## Quick Start

### 1. Backend

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

Edit `server/.env` before starting:

```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
AI_PROVIDER=gemini
AI_API_KEY=your_ai_provider_api_key
GEMINI_PRIMARY_MODEL=gemini-2.5-flash-lite
GEMINI_BACKUP_MODELS=gemini-2.5-flash,gemini-2.0-flash-lite
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com/v1beta
```

### 2. Frontend

```bash
cd client
npm install
copy .env.example .env
npm run dev
```

Edit `client/.env`:

```bash
VITE_API_URL=http://localhost:5000/api
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Scripts

### Backend

```bash
cd server
npm run dev      # Start Express with nodemon
npm start        # Start Express with node
```

### Frontend

```bash
cd client
npm run dev      # Start Vite dev server
npm run build    # Build production frontend
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Environment Notes

- Do not commit `.env` files.
- `server/.env.example` and `client/.env.example` document the required keys.
- If MongoDB Atlas blocks connections, confirm your IP is allowed in Atlas Network Access and that outbound TCP `27017` is not blocked by the current network.
- AI routes fail gracefully if `AI_API_KEY` is missing, but reviewer generation and recommendation creation require a valid provider key.

## Verification

Useful checks:

```bash
cd server
node -e "require('./src/app'); console.log('app import ok')"
```

```bash
cd client
npm run lint
npm run build
```

## API And UI Documentation

- See `server/README.md` for API routes, models, AI behavior, and security details.
- See `client/README.md` for pages, components, auth flow, API services, and UI behavior.
- See `FEATURE_AUDIT.md` and `IMPLEMENTATION_SUMMARY.md` for the implementation audit and verification history.
