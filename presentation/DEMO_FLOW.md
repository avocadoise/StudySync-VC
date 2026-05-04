# StudySync Live Demo Flow

Use this checklist for a live demo or a screen-recorded demo. Use demo-safe data only. Do not show real passwords, API keys, tokens, `.env` files, or MongoDB connection strings.

## Demo Sample Data

| Item | Value |
| --- | --- |
| Subject | Web Systems |
| Subject code | WS101 |
| Instructor | [Instructor Name] |
| Schedule | Monday and Wednesday, 9:00 AM - 10:30 AM |
| Task | Final Project Presentation |
| Task priority | Urgent |
| Task status | Pending, then In Progress |
| Note | MERN Stack Architecture |
| Study Plan | Review API routes and demo flow |
| Focus session | Pomodoro or Custom |

## 1. Start Backend

**What to do**
- Open a terminal.
- Go to `server/`.
- Run `npm.cmd run start`.

**Expected result**
- Server starts on the configured port.
- MongoDB connection message appears if the database is reachable.

**What to say**
"First, we start the backend API. This Express server connects to MongoDB and exposes the protected routes used by the frontend."

## 2. Start Frontend

**What to do**
- Open a second terminal.
- Go to `client/`.
- Run `npm.cmd run dev`.
- Open the local Vite URL in the browser.

**Expected result**
- Browser shows the StudySync login page.

**What to say**
"Next, we start the React and Vite frontend. The frontend communicates with the backend through Axios API services."

## 3. Register or Login

**What to click**
- Click `Register` for a new demo account, or use `Login` for an existing demo-safe account.

**What to type**
- Name: `[Demo Student]`
- Email: `[demo-safe-email]`
- Password: `[demo-safe-password]`

**Expected result**
- User is redirected to the dashboard.
- Token is stored by the frontend and used for protected API requests.

**What to say**
"Authentication uses JWT. After login or registration, the token is used to access protected user-owned data."

## 4. Create Subject

**What to click**
- Open `Subjects` from the sidebar.
- Click `Add Subject`.

**What to type**
- Name: `Web Systems`
- Code: `WS101`
- Instructor: `[Instructor Name]`
- Schedule: `Monday and Wednesday, 9:00 AM - 10:30 AM`
- Choose any color.

**Expected result**
- Subject appears as a subject card.

**What to say**
"Subjects are the foundation of the system. Tasks, notes, study plans, and focus sessions can all be connected to a subject."

## 5. Create Task

**What to click**
- Open `Tasks`.
- Click `Add Task`.

**What to type**
- Subject: `Web Systems`
- Title: `Final Project Presentation`
- Description: `Prepare slides, demo flow, and speaker script for the final defense.`
- Due date: choose a near upcoming date.
- Priority: `Urgent`
- Status: `Pending`

**Expected result**
- Task card appears with due date, priority, and status.

**What to say**
"The task tracker helps students manage assignments and deadlines. Each task belongs to a subject and has priority and status fields."

## 6. Update Task Status

**What to click**
- On the task card, use the status dropdown.
- Change status from `Pending` to `In Progress`.

**Expected result**
- Status badge updates.

**What to say**
"Tasks can be updated quickly as the student works on them. The backend also has a dedicated route for updating task status."

## 7. Create Study Plan

**What to click**
- Open `Study Planner`.
- Click `Plan Session`.

**What to type**
- Subject: `Web Systems`
- Topic: `Review API routes and demo flow`
- Date: choose today or an upcoming date.
- Start time: `14:00`
- End time: `15:00`
- Notes: `Practice backend route explanation and demo sequence.`
- Status: `Planned`

**Expected result**
- Study plan appears in the list.

**What to say**
"The study planner helps students schedule focused study sessions. The system validates that the end time must be later than the start time."

## 8. Create Note

**What to click**
- Open `Notes`.
- Click `Create Note`.

**What to type**
- Subject: `Web Systems`
- Title: `MERN Stack Architecture`
- Content:
  `MERN is composed of MongoDB, Express, React, and Node.js. In StudySync, React handles the user interface, Express provides API routes, MongoDB stores user-owned academic records, and Node.js runs the backend server. JWT protects private routes, while Mongoose defines schemas and validations.`
- Tags: `mern, architecture, api`

**Expected result**
- Note appears with subject and tags.

**What to say**
"Notes store academic content by subject. These notes can also be used as the source for AI reviewer generation."

## 9. Generate AI Reviewer

**What to click**
- From Notes, click the AI reviewer action if available, or open `AI Reviewer`.
- Select `MERN Stack Architecture`.
- Click `Generate Reviewer`.

**Expected result**
- AI reviewer shows summary, key terms, questions, and flashcards.
- The generated reviewer appears in saved reviewer history.

**What to say**
"The AI reviewer uses the selected note as its source. It generates structured study materials such as summaries, terms, questions, and flashcards."

## 10. Use Focus Timer

**What to click**
- Open `Focus Timer`.
- Select subject `Web Systems`.
- Choose `Pomodoro` or `Custom`.
- Click `Start`.

**Expected result**
- Timer starts.
- Pause, resume, and reset controls are available.

**What to say**
"The focus timer supports Pomodoro, short break, long break, and custom sessions. A subject is required so focus history stays organized."

## 11. Save Completed Focus Session

**What to click**
- For a fast demo, use a `Custom` session set to at least 1 minute, or show a previously completed session if the live demo time is limited.
- Let the timer finish.
- Click `Save Session`.

**Expected result**
- Completed session appears in focus history.
- Focus stats update.

**What to say**
"Only completed sessions are saved. This prevents unfinished sessions from being counted as real productivity data."

## 12. Open Dashboard

**What to click**
- Open `Dashboard`.

**Expected result**
- Stat cards, charts, upcoming tasks, recent notes, and recent focus sessions are visible.

**What to say**
"The dashboard summarizes the student's academic data, including task counts, notes, focus minutes, upcoming tasks, recent notes, and recent focus sessions."

## 13. Generate AI Study Recommendation

**What to click**
- On the dashboard, click `Generate Recommendation`.

**Expected result**
- Recommendation panel shows main recommendation, priority subjects, suggested actions, and warning if applicable.

**What to say**
"The AI recommendation uses the student's current StudySync data, including tasks, priorities, deadlines, study plans, focus sessions, and subjects."

## 14. Explain Validation and Security Briefly

**What to say**
"Behind the scenes, private routes are protected with JWT. Passwords are hashed using bcrypt. Data queries are scoped by user ID. IDs are validated before database lookup. Mongoose schemas enforce required fields and enums, while centralized error handling returns clean JSON responses."

## Backup Plan If AI API Key Does Not Work

- Do not show `.env`.
- Explain that AI routes require a configured `AI_API_KEY`.
- Use a previously generated reviewer if available.
- If no saved reviewer exists, show the AI Reviewer page and explain the expected output shape:
  - summary
  - key terms
  - questions
  - flashcards
- Mention that the backend returns clean errors when AI is not configured.

## Backup Plan If MongoDB Connection Fails

- Do not show the database connection string.
- Explain that the backend depends on MongoDB through `MONGO_URI`.
- Show prepared screenshots from the screenshot guide.
- Continue with slides explaining the expected flow.
- Mention that `Test-NetConnection` or MongoDB Atlas Network Access can be checked separately, but do not expose private network settings during the presentation.
