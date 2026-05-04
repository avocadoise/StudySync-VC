# StudySync Video Presentation Plan

Recommended duration: 12 to 15 minutes  
Target length: about 14 minutes and 30 seconds  
Format: slides with a short live or recorded system demo

## Presenter Assignments

Use these placeholders and adjust based on your actual team:

| Presenter | Suggested role |
| --- | --- |
| `[Member 1]` | Opening, team introduction, problem, closing |
| `[Member 2]` | System overview, architecture, backend |
| `[Member 3]` | Frontend features and user experience |
| `[Member 4]` | Database, dashboard, AI integration |
| `[Member 5]` | Demo support, QA, documentation, reflections |

## Segment Timing

| Time | Segment | Presenter | What to cover |
| --- | --- | --- | --- |
| 0:00-0:45 | Opening and team introduction | `[Member 1]` | Introduce team, project title, and member roles. |
| 0:45-2:00 | Problem statement and solution | `[Member 1]` | Explain scattered academic tools and StudySync as the centralized solution. |
| 2:00-3:30 | System overview and architecture | `[Member 2]` | Explain React frontend, Axios, Express API, JWT auth, MongoDB/Mongoose, and AI provider layer. |
| 3:30-5:00 | Backend, database, authentication, and security | `[Member 2]` | Explain routes, models, bcrypt, JWT, ownership checks, rate limiting, Helmet, CORS, and clean errors. |
| 5:00-6:30 | Frontend features and user experience | `[Member 3]` | Explain pages, protected layout, sidebar navigation, loading/error/empty states, and real API calls. |
| 6:30-8:00 | AI integration | `[Member 4]` | Explain AI reviewer, AI recommendation, advisory AI validation, provider fallback, and grounded AI prompts. |
| 8:00-11:30 | System demonstration | `[Member 5]` with support | Show login, subject, task, study plan, note, AI reviewer, focus timer, dashboard, and recommendation. |
| 11:30-13:30 | Reflections and contributions | All members | Each member briefly explains contribution and learning. |
| 13:30-14:30 | Closing | `[Member 1]` | Summarize value, thank the audience, and invite questions. |

## Recommended Screen Recording Flow

1. Start the backend in a terminal using `npm.cmd run start` inside `server/`.
2. Start the frontend in another terminal using `npm.cmd run dev` inside `client/`.
3. Open the Vite local URL in the browser.
4. Use a demo-safe account. Do not show real passwords or tokens.
5. Zoom browser to 90-100 percent so the sidebar and content fit cleanly.
6. Keep dev tools closed unless showing API route behavior intentionally.
7. Record at 1080p if possible.
8. Hide bookmarks, notifications, email, API keys, `.env` files, and database connection strings.

## Demo Timing

Use about 3 minutes and 30 seconds:

- 20 seconds: login or register.
- 25 seconds: create `Web Systems` subject.
- 35 seconds: create and update `Final Project Presentation` task.
- 25 seconds: create `Review API routes and demo flow` study plan.
- 35 seconds: create `MERN Stack Architecture` note.
- 35 seconds: generate AI reviewer from the note.
- 35 seconds: start and explain the focus timer, then show how completed sessions are saved.
- 40 seconds: show dashboard analytics and generate AI study recommendation.

## Recording Tips

- Use one speaker at a time.
- Keep explanations short and tied to what is visible on screen.
- Use the same sample data throughout the demo.
- Before recording, log out and clear any browser tabs that may expose private information.
- If AI is slow, use a previously generated reviewer and explain that live AI response depends on the configured provider key.
- If MongoDB is unavailable, show the prepared screenshots and explain the expected live flow.
