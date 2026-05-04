# Canva AI Presentation Prompt

Copy and paste this full prompt into Canva AI to generate the slide deck.

```text
Create a 16:9 final defense presentation for a software project titled "StudySync: A MERN-Based Student Productivity and Academic Management System with AI-Assisted Academic Support."

Use a modern academic technology theme with blue, purple, white, and dark navy colors. The design should look clean, student-friendly, professional, and suitable for a school project defense. Use software-dashboard visuals, subtle academic patterns, clean cards, architecture diagrams, and icons for React, Node.js, Express, MongoDB, AI, security, dashboard analytics, timer, notes, calendar, and tasks.

Use placeholders where needed:
- Team Name: [Team Name]
- Members: [Member 1], [Member 2], [Member 3], [Member 4], [Member 5]
- Course/Subject: [Course/Subject]
- Instructor: [Instructor]
- Date: [Date]

These placeholders are intentional editable labels. Keep them visible in the generated deck so the team can replace them later.

Do not include fake API keys, real passwords, private emails, database connection strings, or access tokens.

Slide 1: Title Slide
Title: StudySync
Subtitle: A MERN-Based Student Productivity and Academic Management System with AI-Assisted Academic Support
Content: Team [Team Name], Members [Member Names], Course [Course/Subject], Instructor [Instructor], Date [Date]
Visual: Clean dashboard-inspired hero background with academic icons and a large StudySync title.

Slide 2: Team Introduction
Content:
- Team name: [Team Name]
- Members: [Member 1], [Member 2], [Member 3], [Member 4], [Member 5]
- Roles: Project Manager / Presenter, Backend Developer, Frontend Developer, Database and AI Integration, QA / Documentation / UI Support
Visual: Role cards with simple icons.

Slide 3: Problem Statement
Content:
Students often manage their academic life using separate tools such as notebooks, calendar apps, reminders, timers, spreadsheets, and AI chat tools. This scattered workflow makes it difficult to track deadlines, organize study materials, monitor productivity, and prepare efficiently for exams. StudySync solves this by providing one centralized academic productivity platform.
Visual: Scattered tools flowing into one StudySync hub.

Slide 4: Proposed Solution
Content:
- StudySync is a unified student productivity platform.
- It combines subjects, tasks, notes, study planner, focus timer, dashboard, and AI support.
- It uses real backend APIs and MongoDB records for each authenticated user.
Visual: Central StudySync circle connected to Subjects, Tasks, Notes, Study Planner, Focus Timer, Dashboard, and AI.

Slide 5: Project Objectives
Content:
- Build a full-stack MERN web application.
- Implement authentication.
- Implement MongoDB CRUD operations.
- Provide academic productivity tools.
- Add AI-assisted academic support.
- Improve validation, security, performance, and reliability.
Visual: Objective checklist with icons.

Slide 6: System Overview
Content:
- User interacts with the React frontend.
- Frontend communicates with the Express API through Axios.
- Express API stores and retrieves MongoDB data.
- JWT authentication protects private routes.
- AI service provides reviewer generation, study recommendation, and input validation assistance.
Visual: Four-layer overview diagram: Frontend, Backend API, Database, AI Service.

Slide 7: System Architecture
Content:
- React + Vite Frontend
- Axios API Layer
- Node.js + Express Backend
- JWT Authentication
- MongoDB + Mongoose Database
- AI Provider Layer using Gemini or OpenAI-compatible provider
Visual: Architecture diagram with arrows from user to frontend, API, database, and AI provider.

Slide 8: Technologies Used
Content:
Frontend: React, Vite, React Router, Axios, Tailwind CSS, Recharts, Lucide React
Backend: Node.js, Express, Mongoose
Database: MongoDB
Auth: JWT, bcrypt
Security: Helmet, CORS, Express rate limiting, ownership-scoped queries
AI: Gemini or OpenAI-compatible provider
Visual: Technology stack grid with logos/icons.

Slide 9: Authentication and Security
Content:
- Register and login
- JWT protected routes
- bcrypt password hashing
- Passwords are never returned
- Ownership checks
- ObjectId validation
- Centralized error handling
- Rate limiting, Helmet, and CORS
Visual: Security flow diagram with lock, token, and protected database icons.

Slide 10: Subject Management
Content:
- Create, read, update, and delete subjects.
- Subject fields: name, code, instructor, schedule, color.
- Subjects connect to tasks, notes, study plans, and focus sessions.
- The page includes loading, error, empty, edit, and delete-confirmation states.
Visual: Subject cards screenshot placeholder.

Slide 11: Task and Assignment Tracker
Content:
- Create, read, update, and delete tasks.
- Update task status.
- Priority levels: Low, Medium, High, Urgent.
- Status values: Pending, In Progress, Completed, Overdue.
- Filter by subject, priority, and status.
- Sort by due date.
Visual: Task board with colored priority and status labels.

Slide 12: Study Planner and Notes
Content:
Study Planner:
- Create study sessions.
- Set date, start time, and end time.
- Update study plan status.
- Validate that end time is after start time.
Notes:
- Create, edit, delete, search, and filter notes.
- Notes can be used to generate AI reviewers.
Visual: Split layout with calendar/planner on one side and note cards on the other.

Slide 13: Focus Timer
Content:
- Pomodoro, Short Break, Long Break, and Custom sessions.
- Start, pause, resume, and reset.
- Save only completed sessions.
- Requires selected subject.
- Shows focus history and stats.
- Persists active timer state in localStorage.
Visual: Timer interface mockup with focus history and subject selector.

Slide 14: Dashboard Analytics
Content:
- Total subjects and total tasks.
- Pending, in-progress, completed, and overdue task counts.
- Total notes and total focus minutes.
- Upcoming tasks.
- Recent notes.
- Recent focus sessions.
- Task status chart and task priority chart.
- AI study recommendation panel.
Visual: Dashboard screenshot placeholder with stat cards, pie chart, bar chart, and recent activity.

Slide 15: AI Integration
Content:
AI Reviewer Generator:
- Generates summary, key terms, questions, and flashcards from saved notes.
AI Study Recommendation:
- Recommends what to study based on pending tasks, overdue tasks, priorities, deadlines, study plans, focus sessions, and subjects.
AI Input Validation Assistant:
- Detects missing, inconsistent, or unclear draft data and gives suggestions.
Visual: Three AI feature cards with flow arrows.

Slide 16: AI Impact on Quality, Security, and Performance
Content:
- Input Validation: AI validation assistant checks draft inputs and suggests improvements.
- Error Handling: Backend handles invalid IDs, malformed requests, validation errors, duplicate emails, missing tokens, and system exceptions with clean responses.
- Data Modeling: Mongoose schemas use ObjectId references, proper data types, required fields, enums, timestamps, and ownership fields.
- Schema Validation: Models validate required fields, enums, time ranges, duration values, and user-owned resources.
- Indexing Strategies: Indexes exist for email, userId, status, dueDate, subjectId, studyDate, completedAt, and noteId.
- Query Optimization: Private queries are scoped by userId. Dashboard uses counts, filtering, aggregation, sorting, and limits.
- Performance Optimization: Frontend uses API services and dashboard summaries. Backend avoids returning unnecessary records and uses indexes.
- Defensive Programming: JWT protection, bcrypt hashing, rate limiting, ObjectId validation, ownership checks, clean errors, and no raw database errors.
Visual: Matrix with columns for Quality, Security, and Performance.

Slide 17: System Demonstration Flow
Content:
1. Register or login.
2. Create a subject.
3. Create and update a task.
4. Create a study plan.
5. Create a note.
6. Generate an AI reviewer.
7. Use the focus timer.
8. View dashboard analytics.
9. Generate AI study recommendation.
Visual: Numbered demo roadmap with icons for each page.

Slide 18: Reflections, Contributions, and Closing
Content:
- What the team learned: full-stack integration, secure user-owned data, real API workflows, and AI grounded in saved data.
- Member contributions: [Member 1 contribution], [Member 2 contribution], [Member 3 contribution], [Member 4 contribution], [Member 5 contribution].
- Challenges: connecting frontend to real APIs, handling validation/loading/error states, and producing structured AI responses.
- Closing: StudySync centralizes student productivity and adds AI-assisted academic support. Thank you.
Visual: Team contribution cards and closing thank-you screen.
```
