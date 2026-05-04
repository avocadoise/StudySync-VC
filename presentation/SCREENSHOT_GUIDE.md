# StudySync Screenshot Guide

Use this checklist to capture safe screenshots for the Canva presentation. Do not show private emails, passwords, JWT tokens, API keys, `.env` values, MongoDB connection strings, or real personal records.

## General Screenshot Safety

- Use a demo-safe account.
- Hide bookmarks, browser extensions, notifications, terminal secrets, and personal tabs.
- Do not open `server/.env` during recording or screenshots.
- Do not show Authorization headers or JWT tokens.
- If showing MongoDB, blur or crop private `_id`, email, token, URI, and real user data.
- Prefer screenshots of the app UI over raw database screens.

## Recommended Screenshots

| Screenshot | Page or file to capture | What should be visible | Slide |
| --- | --- | --- | --- |
| Login page | Browser at `/login` | StudySync login form, clean auth UI | Slides 1, 9 |
| Register page | Browser at `/register` | Registration form with name, email, password fields | Slide 9 |
| Dashboard page | Browser at `/dashboard` | Stat cards, charts, upcoming tasks, recent notes, focus sessions | Slides 6, 14 |
| AI recommendation panel | Dashboard after clicking generate recommendation | Main recommendation, priority subjects, suggested actions | Slides 14, 15 |
| Subject management page | Browser at `/subjects` | Subject cards and add/edit controls | Slide 10 |
| Task tracker page | Browser at `/tasks` | Task card, filters, priority/status badges | Slide 11 |
| Study planner page | Browser at `/study-planner` | Study session list, date/time fields, status controls | Slide 12 |
| Notes page | Browser at `/notes` | Note cards, tags, search/filter controls | Slide 12 |
| Focus timer page | Browser at `/focus-timer` | Timer, subject selector, controls, stats, history | Slide 13 |
| AI reviewer page | Browser at `/ai-reviewer` | Note selector, generated summary, key terms, questions, flashcards | Slide 15 |
| Backend route sample | Postman or browser health endpoint `/api/health` | Clean JSON response without secrets | Slides 6, 7 |
| MongoDB collection sample | MongoDB Atlas or Compass, only if safe | Collections such as users, subjects, tasks, notes, focus sessions with private data hidden | Slides 7, 16 |

## Suggested Capture Order

1. Login page.
2. Register page.
3. Dashboard before demo data or with safe demo data.
4. Subjects page with `Web Systems`.
5. Tasks page with `Final Project Presentation`.
6. Study Planner page with `Review API routes and demo flow`.
7. Notes page with `MERN Stack Architecture`.
8. AI Reviewer page with generated reviewer.
9. Focus Timer page with history and stats.
10. Dashboard with AI recommendation panel.
11. Optional API health route.
12. Optional sanitized MongoDB collection view.

## Screenshot Notes By Slide

**Slides 1 and 6**  
Use a dashboard or app overview screenshot. Keep it clean and avoid showing personal information.

**Slide 7**  
Use a diagram in Canva rather than a screenshot if backend internals are hard to show safely.

**Slide 9**  
Use login/register UI screenshots. Do not show real credentials.

**Slides 10 to 15**  
Use module page screenshots. These are the strongest proof of working frontend features.

**Slide 16**  
Use a simple Canva matrix for quality, security, and performance. If showing code snippets, use short cropped snippets from models, middleware, or controllers without `.env`.

**Slide 17**  
Use a demo roadmap graphic or a screenshot collage from the demo flow.

## Why Screenshots Are Not Captured Automatically Here

This package intentionally provides a screenshot guide instead of automatic screenshots because safe screenshots depend on the presenter choosing a demo-safe account and hiding private data. Capturing directly from a live local app could expose real emails, private records, tokens, API keys, or database details.
