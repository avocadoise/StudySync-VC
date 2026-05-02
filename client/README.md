# StudySync Client

The StudySync client is a React + Vite frontend for the student productivity and academic management system. It connects to the Express API through Axios and provides protected pages for academic planning, note taking, focus tracking, dashboard analytics, and AI study support.

## Tech Stack

- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Recharts
- Lucide React
- Matter.js for the animated auth background
- FullCalendar for the Academic Calendar View

## Folder Structure

```text
client/
  public/              Static assets
  src/
    api/               Axios instance and feature API clients
    assets/            Images and local frontend assets
    components/        Shared UI components
    context/           AuthContext
    layouts/           DashboardLayout
    pages/             Route pages
    index.css          Tailwind and global styles
    main.jsx           React entry point
    App.jsx            Route definitions
```

## Environment Variables

Copy `.env.example` to `.env`:

```bash
VITE_API_URL=http://localhost:5000/api
```

`VITE_API_URL` must point to the backend API base URL.

## Scripts

```bash
npm run dev      # Start local Vite dev server
npm run build    # Build production assets
npm run lint     # Run ESLint
npm run preview  # Preview the production build
```

## API Service Files

All API calls use `src/api/axiosInstance.js`, which:

- Reads the base URL from `VITE_API_URL`.
- Automatically attaches the JWT token from `localStorage`.
- Handles `401` responses by clearing the token and redirecting to login.

Feature API files:

- `authApi.js`
- `subjectApi.js`
- `taskApi.js`
- `noteApi.js`
- `studyPlanApi.js`
- `calendarApi.js`
- `focusApi.js`
- `dashboardApi.js`
- `aiApi.js`

## Routing

Public routes:

- `/login`
- `/register`

Protected routes inside `DashboardLayout`:

- `/dashboard`
- `/subjects`
- `/tasks`
- `/study-planner`
- `/calendar`
- `/notes`
- `/focus-timer`
- `/ai-reviewer`

Fallback route:

- `*` renders `NotFound`

## Authentication Flow

- Login and registration call the backend auth endpoints.
- Successful auth stores the JWT in `localStorage`.
- `AuthContext` loads the current user on refresh through `/api/auth/me`.
- `ProtectedRoute` blocks private pages until the user is authenticated.
- Logout clears the token and returns the user to login.

## Pages And Features

### Login

- Email and password form.
- Friendly validation and error messages.
- Stores token through `AuthContext`.
- Redirects to dashboard on success.
- Includes animated academic background.

### Register

- Name, email, and password form.
- Password length validation.
- Creates a new account through the backend.
- Logs the user in after successful registration.

### Dashboard

- Stat cards for subjects, tasks, pending work, in-progress tasks, completed tasks, overdue tasks, notes, and focus minutes.
- Empty-state onboarding panel for new accounts.
- Upcoming tasks list.
- Recent notes list.
- Recent focus sessions list.
- Tasks by status chart.
- Tasks by priority chart.
- AI study recommendation panel with manual generate button.

### Subjects

- Create, edit, view, and delete subjects.
- Fields include name, code, instructor, schedule, and color.
- Loading, error, empty, and delete confirmation states.
- Subject colors are reused across task, note, study plan, and focus UI.

### Tasks

- Create, edit, view, delete, and update status.
- Fields include subject, title, description, due date, priority, and status.
- Filters by subject, priority, and status.
- Sorts by due date in the UI.
- Prevents task creation when no subjects exist.

### Study Planner

- Create, edit, view, delete, and update study plan status.
- Fields include subject, topic, date, start time, end time, notes, and status.
- Filters by date, subject, and status.
- Prevents study plan creation when no subjects exist.
- Validates that end time is later than start time.

### Academic Calendar

- Protected calendar page at `/calendar`.
- Fetches real events from `/api/calendar/events`.
- Shows tasks, study plans, and completed focus sessions in one FullCalendar view.
- Month view is the default, with week view available from the calendar toolbar.
- Filters events by type and subject.
- Opens an event details modal when an event is clicked.
- Uses type-based colors for tasks, study plans, and focus sessions.

### Notes

- Create, edit, view, delete, search, and filter notes.
- Fields include subject, title, content, and tags.
- Prevents note creation when no subjects exist.
- Can navigate directly to AI Reviewer with a selected note.

### Focus Timer

- Select a subject and session type.
- Supports Pomodoro, Short Break, Long Break, and Custom sessions.
- Start, pause, resume, reset, and save completed sessions.
- Does not save unfinished sessions.
- Does not save without a selected subject.
- Persists active timer state in `localStorage` so switching browser tabs, refreshing, or navigating away does not reset the timer.
- Shows focus history.
- Shows focus stats, total focus minutes, total sessions, sessions this week, and focus minutes by subject.

### AI Reviewer

- Fetches saved notes.
- Selects a note and generates a reviewer through the backend.
- Shows AI loading and error states.
- Displays generated summary, key terms, questions, and flashcards.
- Shows saved reviewer history.
- Deletes saved reviewers.

### NotFound

- Simple 404 page with a link back into the app.

## Shared Components

- `ProtectedRoute`
- `DashboardLayout`
- `Sidebar`
- `Navbar`
- `LoadingSpinner`
- `StatCard`
- `ArithmeticBackground`
- `StudyBoxPhysicsBackground`

## UI Notes

- Styling uses Tailwind classes.
- Icons come from Lucide React.
- Charts use Recharts.
- Calendar rendering uses FullCalendar.
- Delete actions use confirmation prompts or modals.
- Forms disable submit buttons while saving.
- User-facing errors avoid raw technical details where possible.

## Troubleshooting

- If API calls fail, confirm `VITE_API_URL` matches the backend URL.
- If the app logs out unexpectedly, the backend may be returning `401` because the JWT is expired, invalid, or `JWT_SECRET` changed.
- If the Focus Timer looks reset after route changes, clear old local state once with browser dev tools under `localStorage` key `studysync.focusTimer`.
- If the build warns about large chunks, the app still builds successfully. Recharts and Matter.js make the bundle larger; code splitting can be added later.
