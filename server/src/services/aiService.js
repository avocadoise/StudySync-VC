const AppError = require('../utils/AppError');

/**
 * Calls an AI provider to generate a study reviewer from note content.
 * By default, this uses the standard OpenAI chat completions format,
 * which is also compatible with models like Groq, Together AI, or local instances.
 */
const generateReviewerFromNote = async (title, content) => {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    throw new AppError('AI Service is not configured (Missing AI_API_KEY)', 500);
  }

  // Basic check for content length to avoid wasteful API calls
  if (!content || content.trim().length < 50) {
    throw new AppError('Note content is too short to generate a meaningful reviewer', 400);
  }

  const prompt = `
You are an expert academic tutor. Generate a study reviewer strictly based on the following note.
Note Title: "${title}"
Note Content: "${content}"

Rules:
1. ONLY use the provided note content. Do not invent topics or facts not found in the text.
2. If the note content is too short, unrelated to studying, or unclear, return a JSON with a single field { "error": "Insufficient note content" }.
3. Use simple, student-friendly explanations.
4. Output STRICTLY in valid JSON format matching this structure perfectly:
{
  "summary": "string (A concise overview of the note)",
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
      "front": "string (question or concept)",
      "back": "string (answer or explanation)"
    }
  ]
}
  `;

  try {
    // Assuming standard OpenAI API format
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Or gpt-4o-mini
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('AI API Error:', errorData);
      throw new AppError('AI provider returned an error while generating content', 502);
    }

    const data = await response.json();
    const rawResult = data.choices[0].message.content;

    // Parse the JSON strictly
    const parsedData = JSON.parse(rawResult);

    if (parsedData.error) {
      throw new AppError(`AI Analysis: ${parsedData.error}`, 400);
    }

    return parsedData;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('AI Generation Error:', error.message);
    throw new AppError('Failed to generate reviewer from AI service. Please try again later.', 500);
  }
};

/**
 * Calls AI provider to generate a study recommendation based on student data.
 */
const generateStudyRecommendation = async (studentDataSummary) => {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    throw new AppError('AI Service is not configured (Missing AI_API_KEY)', 500);
  }

  const prompt = `
You are an expert academic advisor. Provide a customized study recommendation based on the student's current academic data summary below.

Student Data Summary:
${studentDataSummary}

Rules:
1. ONLY base your recommendations on the provided data. Do not invent subjects, tasks, or deadlines.
2. If there are no pending tasks or study plans, state that more data is needed to provide specific recommendations.
3. Keep recommendations short, practical, and highly actionable.
4. Output STRICTLY in valid JSON format matching this structure perfectly:
{
  "mainRecommendation": "string (1-2 sentences of the primary goal for the student right now)",
  "prioritySubjects": [
    {
      "subject": "string",
      "reason": "string (Why they need to focus on this subject)"
    }
  ],
  "suggestedActions": [
    "string (Actionable step)"
  ],
  "warning": "string (Optional warning, like 'You have 3 overdue tasks'. If none, leave empty or say 'No immediate warnings')"
}
  `;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('AI API Error:', errorData);
      throw new AppError('AI provider returned an error while generating recommendation', 502);
    }

    const data = await response.json();
    const rawResult = data.choices[0].message.content;

    const parsedData = JSON.parse(rawResult);

    if (parsedData.error) {
      throw new AppError(`AI Analysis: ${parsedData.error}`, 400);
    }

    return parsedData;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('AI Recommendation Error:', error.message);
    throw new AppError('Failed to generate recommendation from AI service.', 500);
  }
};

module.exports = {
  generateReviewerFromNote,
  generateStudyRecommendation
};