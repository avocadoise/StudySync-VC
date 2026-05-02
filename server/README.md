# StudySync Backend API

The StudySync backend is a Node.js, Express, MongoDB, and Mongoose API for authentication, academic management, focus tracking, analytics, and AI-assisted study support.

## Tech Stack

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt
- dotenv
- cors
- helmet
- express-rate-limit

## Folder Structure

```text
server/
  server.js              HTTP server entry point
  src/
    app.js               Express app, middleware, routes, errors
    config/db.js         MongoDB connection
    controllers/         Route handlers
    middleware/          Auth, error, ObjectId validation
    models/              Mongoose schemas
    routes/              Express routers
    services/            AI provider service
    utils/               AppError and asyncHandler
```

## Environment Variables

Copy `.env.example` to `.env` and set:

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

OPENAI_MODEL=gpt-4o-mini
OPENAI_BACKUP_MODELS=
OPENAI_API_BASE_URL=https://api.openai.com/v1/chat/completions
```

Notes:

- `AI_PROVIDER` supports `gemini` and `openai`.
- Gemini backup models are comma-separated.
- OpenAI-compatible providers can use `OPENAI_API_BASE_URL`.
- Do not commit `.env`.

## Scripts

```bash
npm run dev   # Start with nodemon
npm start     # Start with node
```

## Core Middleware

- `helmet()` for safer HTTP headers.
- `cors()` for cross-origin frontend requests.
- `express.json()` for JSON request bodies.
- Global rate limiting under `/api`.
- Stricter auth rate limiting for login/register.
- JWT protected routes through `protect`.
- Centralized error responses.
- 404 route handler.
- ObjectId validation middleware for id routes.

## Response Format

Success:

```json
{
  "success": true,
  "message": "Clear success message",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Clear error message"
}
```

## Health Route

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | Confirms the API is running |

## Auth Routes

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Create user, hash password, return token |
| POST | `/api/auth/login` | Public | Verify credentials, return token |
| GET | `/api/auth/me` | Private | Return current user without password |

Auth behavior:

- Passwords are hashed with bcrypt.
- JWT includes the user id.
- Duplicate emails are rejected.
- Passwords are never returned.
- Missing fields return clean validation errors.

## Subject Routes

| Method | Route | Access |
| --- | --- | --- |
| POST | `/api/subjects` | Private |
| GET | `/api/subjects` | Private |
| GET | `/api/subjects/:id` | Private |
| PUT | `/api/subjects/:id` | Private |
| DELETE | `/api/subjects/:id` | Private |

Subject fields:

- `userId`
- `name`
- `code`
- `instructor`
- `schedule`
- `color`

## Task Routes

| Method | Route | Access |
| --- | --- | --- |
| POST | `/api/tasks` | Private |
| GET | `/api/tasks` | Private |
| GET | `/api/tasks/:id` | Private |
| PUT | `/api/tasks/:id` | Private |
| PATCH | `/api/tasks/:id/status` | Private |
| DELETE | `/api/tasks/:id` | Private |

Task fields:

- `userId`
- `subjectId`
- `title`
- `description`
- `dueDate`
- `priority`
- `status`

Priority enum:

- `Low`
- `Medium`
- `High`
- `Urgent`

Status enum:

- `Pending`
- `In Progress`
- `Completed`
- `Overdue`

Supported filters:

- `status`
- `priority`
- `subjectId`
- `sort=dueDate`

## Study Plan Routes

| Method | Route | Access |
| --- | --- | --- |
| POST | `/api/study-plans` | Private |
| GET | `/api/study-plans` | Private |
| GET | `/api/study-plans/:id` | Private |
| PUT | `/api/study-plans/:id` | Private |
| PATCH | `/api/study-plans/:id/status` | Private |
| DELETE | `/api/study-plans/:id` | Private |

Study plan fields:

- `userId`
- `subjectId`
- `topic`
- `studyDate`
- `startTime`
- `endTime`
- `notes`
- `status`

Status enum:

- `Planned`
- `Completed`
- `Missed`
- `Cancelled`

Validation:

- `startTime` and `endTime` use `HH:mm`.
- `endTime` must be after `startTime`.

Supported filters:

- `date`
- `subjectId`
- `status`

## Note Routes

| Method | Route | Access |
| --- | --- | --- |
| POST | `/api/notes` | Private |
| GET | `/api/notes` | Private |
| GET | `/api/notes/:id` | Private |
| PUT | `/api/notes/:id` | Private |
| DELETE | `/api/notes/:id` | Private |

Note fields:

- `userId`
- `subjectId`
- `title`
- `content`
- `tags`

Supported filters:

- `subjectId`
- `search`

## Focus Session Routes

| Method | Route | Access |
| --- | --- | --- |
| POST | `/api/focus-sessions` | Private |
| GET | `/api/focus-sessions` | Private |
| GET | `/api/focus-sessions/stats` | Private |
| DELETE | `/api/focus-sessions/:id` | Private |

Focus session fields:

- `userId`
- `subjectId`
- `duration`
- `sessionType`
- `completedAt`

Session type enum:

- `Pomodoro`
- `Short Break`
- `Long Break`
- `Custom`

Stats response includes:

- `totalFocusMinutes`
- `totalSessions`
- `focusMinutesBySubject`
- `sessionsThisWeek`

## Dashboard Route

| Method | Route | Access |
| --- | --- | --- |
| GET | `/api/dashboard/summary` | Private |

Dashboard summary includes:

- `totalSubjects`
- `totalTasks`
- `pendingTasks`
- `inProgressTasks`
- `completedTasks`
- `overdueTasks`
- `upcomingTasks`
- `totalNotes`
- `totalFocusMinutes`
- `recentNotes`
- `recentFocusSessions`
- `tasksByPriority`
- `tasksByStatus`

## Calendar Route

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/calendar/events?start=YYYY-MM-DD&end=YYYY-MM-DD` | Private | Returns normalized academic calendar events |

Calendar event sources:

- Tasks with `dueDate` in the requested range.
- Study plans with `studyDate` in the requested range.
- Focus sessions with `completedAt` in the requested range.

Calendar event shape:

```json
{
  "id": "string",
  "type": "task | studyPlan | focusSession",
  "title": "string",
  "start": "date or datetime",
  "end": "date or datetime",
  "subject": "string",
  "subjectId": "string",
  "color": "string",
  "status": "string",
  "priority": "string or null"
}
```

Focus session events also include `duration` and `sessionType`.

## AI Routes

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/ai/generate-reviewer` | Private | Generate reviewer from a saved note |
| GET | `/api/ai/reviewers` | Private | List saved reviewers |
| GET | `/api/ai/reviewers/:id` | Private | Get one saved reviewer |
| DELETE | `/api/ai/reviewers/:id` | Private | Delete saved reviewer |
| POST | `/api/ai/study-recommendation` | Private | Generate study recommendation |
| POST | `/api/ai/validate-input` | Private | Advisory input validation |

### AI Reviewer Output

```json
{
  "summary": "string",
  "keyTerms": [
    {
      "term": "string",
      "definition": "string"
    }
  ],
  "questions": [
    {
      "question": "string",
      "answer": "string"
    }
  ],
  "flashcards": [
    {
      "front": "string",
      "back": "string"
    }
  ]
}
```

Reviewer behavior:

- Generates only from saved notes owned by the user.
- Rejects empty notes.
- Prompts the AI to use only selected note content.
- Saves generated reviewer records.
- Supports saved reviewer history and deletion.

### AI Study Recommendation Output

```json
{
  "mainRecommendation": "string",
  "prioritySubjects": [
    {
      "subject": "string",
      "reason": "string"
    }
  ],
  "suggestedActions": [
    "string"
  ],
  "warning": "string"
}
```

Recommendation data sources:

- Pending tasks
- Overdue tasks
- High and urgent priority tasks
- Upcoming deadlines
- Study plans
- Focus sessions
- Subjects

### AI Input Validation Output

```json
{
  "isAcceptable": true,
  "issues": [
    {
      "field": "string",
      "message": "string"
    }
  ],
  "suggestions": [
    "string"
  ]
}
```

Supported validation modules:

- `task`
- `subject`
- `note`
- `studyPlan`
- `focusSession`

AI validation is advisory only. Real validation still happens through controllers and Mongoose.

## AI Provider Behavior

The AI service supports:

- Gemini through `AI_PROVIDER=gemini`
- OpenAI-compatible chat completions through `AI_PROVIDER=openai`

For Gemini:

- Primary model: `GEMINI_PRIMARY_MODEL`
- Backup models: `GEMINI_BACKUP_MODELS`

For OpenAI-compatible providers:

- Primary model: `OPENAI_MODEL`
- Backup models: `OPENAI_BACKUP_MODELS`
- Base URL: `OPENAI_API_BASE_URL`

If the primary model fails, the service tries configured backup models before returning a clean error.

## Models And Indexes

- `User`: unique email, bcrypt password hashing.
- `Subject`: indexed by `userId`.
- `Task`: indexed by `userId + status`, `userId + dueDate`, `userId + subjectId`.
- `StudyPlan`: indexed by `userId + studyDate`.
- `Note`: indexed by `userId + subjectId`.
- `FocusSession`: indexed by `userId + completedAt`.
- `AIReviewer`: indexed by `userId + noteId`.

All private queries are scoped by `req.user.id` or the authenticated user id.

## Security Notes

- JWT protection on private routes.
- Ownership checks on user-owned resources.
- Passwords excluded from auth responses.
- Mongoose validation errors normalized.
- Duplicate key errors normalized.
- Raw database errors are not sent to clients.
- Auth routes have stricter rate limits.
- Helmet and CORS are enabled.

## Recommended Manual Test Order

1. `GET /api/health`
2. `POST /api/auth/register`
3. `POST /api/auth/login`
4. `GET /api/auth/me`
5. Create a subject.
6. Create tasks, notes, and study plans linked to that subject.
7. Create a completed focus session.
8. Check focus stats.
9. Check dashboard summary.
10. Check calendar events for tasks, study plans, and completed focus sessions.
11. Generate an AI reviewer from a saved note.
12. Generate an AI study recommendation.
13. Run AI input validation on a draft task or note.

## Troubleshooting

- If Atlas rejects connections, verify the current IP is in Atlas Network Access.
- If `Test-NetConnection <atlas-host> -Port 27017` fails, the local network may be blocking outbound MongoDB traffic.
- If auth fails after changing `.env`, restart the backend so `JWT_SECRET` and other env vars reload.
- If AI routes return missing-key errors, set `AI_API_KEY`.
- If Gemini fails on the primary model, verify `GEMINI_BACKUP_MODELS` is comma-separated and valid for the API key.
