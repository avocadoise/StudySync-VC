# StudySync Backend API

This is the Express.js and MongoDB backend for StudySync, providing RESTful API endpoints for user authentication, subjects, tasks, notes, study plans, focus sessions, and AI-assisted study recommendations.

## Requirements

- Node.js (v18+)
- MongoDB (Local or Atlas)
- An AI API Key (e.g., OpenAI `AI_API_KEY`)

## Setup Instructions

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Environment Variables**
   Rename `.env.example` to `.env` and fill in the required fields:
   - \`PORT=5000\`
   - \`MONGO_URI=mongodb+srv://...\` (Your MongoDB connection string)
   - \`JWT_SECRET=super_secret_key_here\`
   - \`JWT_EXPIRES_IN=7d\`
   - \`AI_API_KEY=your_openai_or_groq_api_key\`

3. **Run the Backend**
   - **Development mode** (auto-restarts on save):
     \`\`\`bash
     npm run dev
     \`\`\`
   - **Production mode**:
     \`\`\`bash
     npm start
     \`\`\`

## Recommended API Testing Order

1. **Auth:** \`POST /api/auth/register\` -> \`POST /api/auth/login\`
2. **Subjects:** \`POST /api/subjects\`
3. **Tasks:** \`POST /api/tasks\`
4. **Notes:** \`POST /api/notes\`
5. **Study Plans:** \`POST /api/study-plans\`
6. **Focus Sessions:** \`POST /api/focus-sessions\`
7. **Dashboard:** \`GET /api/dashboard/summary\`
8. **AI Reviewer:** \`POST /api/ai/generate-reviewer\`
9. **AI Recommendations:** \`POST /api/ai/study-recommendation\`
