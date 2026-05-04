const AppError = require('../utils/AppError');

const SUPPORTED_PROVIDERS = ['gemini', 'openai'];

const parseCsv = (value = '') =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const unique = (items) => [...new Set(items.filter(Boolean))];

const getProvider = () => {
  const configuredProvider = (process.env.AI_PROVIDER || '').trim().toLowerCase();

  if (configuredProvider) {
    return configuredProvider;
  }

  if (process.env.GEMINI_PRIMARY_MODEL || process.env.GEMINI_BACKUP_MODELS) {
    return 'gemini';
  }

  return 'openai';
};

const getModels = (provider) => {
  if (provider === 'gemini') {
    return unique([
      process.env.GEMINI_PRIMARY_MODEL || process.env.AI_MODEL || 'gemini-2.5-flash-lite',
      ...parseCsv(process.env.GEMINI_BACKUP_MODELS || process.env.AI_BACKUP_MODELS)
    ]);
  }

  return unique([
    process.env.OPENAI_MODEL || process.env.AI_MODEL || 'gpt-4o-mini',
    ...parseCsv(process.env.OPENAI_BACKUP_MODELS || process.env.AI_BACKUP_MODELS)
  ]);
};

const stripJsonFence = (rawText = '') => {
  let text = rawText.trim();

  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  return text;
};

const parseAiJson = (rawText) => {
  try {
    return JSON.parse(stripJsonFence(rawText));
  } catch (error) {
    throw new AppError('AI provider returned invalid JSON. Please try again.', 502);
  }
};

const readProviderError = async (response) => {
  try {
    const data = await response.json();
    return data?.error?.message || data?.message || response.statusText;
  } catch (error) {
    return response.statusText;
  }
};

const callGemini = async ({ apiKey, model, prompt, temperature }) => {
  const baseUrl = process.env.GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
  const normalizedModel = model.replace(/^models\//, '');
  const url = `${baseUrl}/models/${normalizedModel}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const detail = await readProviderError(response);
    throw new AppError(`Gemini model ${model} failed: ${detail}`, 502);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  if (!text) {
    throw new AppError(`Gemini model ${model} did not return content`, 502);
  }

  return text;
};

const callOpenAI = async ({ apiKey, model, prompt, temperature }) => {
  const url =
    process.env.OPENAI_API_BASE_URL ||
    process.env.AI_API_BASE_URL ||
    'https://api.openai.com/v1/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const detail = await readProviderError(response);
    throw new AppError(`OpenAI-compatible model ${model} failed: ${detail}`, 502);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new AppError(`OpenAI-compatible model ${model} did not return content`, 502);
  }

  return text;
};

const callAiJson = async ({ prompt, temperature = 0.3 }) => {
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    throw new AppError('AI service is not configured. Missing AI_API_KEY.', 500);
  }

  const provider = getProvider();

  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    throw new AppError('AI service provider is not supported. Use gemini or openai.', 500);
  }

  const models = getModels(provider);

  if (models.length === 0) {
    throw new AppError('AI service is not configured with a model.', 500);
  }

  let lastError;

  for (const model of models) {
    try {
      const rawText =
        provider === 'gemini'
          ? await callGemini({ apiKey, model, prompt, temperature })
          : await callOpenAI({ apiKey, model, prompt, temperature });

      return parseAiJson(rawText);
    } catch (error) {
      lastError = error;

      if (process.env.NODE_ENV === 'development') {
        console.warn(`AI model fallback triggered for ${provider}/${model}: ${error.message}`);
      }
    }
  }

  throw new AppError(
    lastError?.statusCode === 500
      ? lastError.message
      : 'AI provider could not complete the request with the configured models.',
    lastError?.statusCode || 502
  );
};

const normalizeReviewer = (data) => ({
  summary: typeof data.summary === 'string' ? data.summary : '',
  keyTerms: Array.isArray(data.keyTerms)
    ? data.keyTerms.map((item) => ({
        term: String(item.term || ''),
        definition: String(item.definition || '')
      }))
    : [],
  questions: Array.isArray(data.questions)
    ? data.questions.map((item) => ({
        question: String(item.question || ''),
        choices: normalizeChoices(item.choices, item.answer),
        answer: String(item.answer || '')
      }))
    : [],
  flashcards: Array.isArray(data.flashcards)
    ? data.flashcards.map((item) => ({
        front: String(item.front || ''),
        back: String(item.back || '')
      }))
    : []
});

const normalizeChoices = (choices, answer) => {
  const normalizedAnswer = String(answer || '').trim();
  const normalizedChoices = Array.isArray(choices)
    ? choices
        .map((choice) => String(choice || '').trim())
        .filter(Boolean)
    : [];

  const uniqueChoices = [...new Set(normalizedChoices)];

  if (normalizedAnswer && !uniqueChoices.includes(normalizedAnswer)) {
    uniqueChoices.unshift(normalizedAnswer);
  }

  return uniqueChoices.slice(0, 4);
};

const normalizeStudyRecommendation = (data) => ({
  mainRecommendation: String(data.mainRecommendation || ''),
  prioritySubjects: Array.isArray(data.prioritySubjects)
    ? data.prioritySubjects.map((item) =>
        typeof item === 'string'
          ? { subject: item, reason: '' }
          : {
              subject: String(item.subject || ''),
              reason: String(item.reason || '')
            }
      )
    : [],
  suggestedActions: Array.isArray(data.suggestedActions)
    ? data.suggestedActions.map((item) => String(item))
    : [],
  warning: String(data.warning || '')
});

const normalizeInputValidation = (data) => ({
  isAcceptable: Boolean(data.isAcceptable),
  issues: Array.isArray(data.issues)
    ? data.issues.map((item) => ({
        field: String(item.field || ''),
        message: String(item.message || '')
      }))
    : [],
  suggestions: Array.isArray(data.suggestions)
    ? data.suggestions.map((item) => String(item))
    : []
});

const generateReviewerFromNote = async (title, content) => {
  if (!content || content.trim().length === 0) {
    throw new AppError('Cannot generate a reviewer from an empty note.', 400);
  }

  const prompt = `
You are an expert academic tutor. Generate a study reviewer strictly based on the following saved note.

Note Title:
${title}

Note Content:
${content}

Rules:
1. Only use facts, terms, and ideas that appear in the note content.
2. Do not invent content outside the note.
3. If the note is too short, unclear, or not academic, return {"error":"Insufficient note content"}.
4. Use simple, student-friendly explanations.
5. Return only valid JSON with exactly this shape:
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
      "choices": [
        "string",
        "string",
        "string",
        "string"
      ],
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

For each question:
- Create four multiple-choice options when the note contains enough related details.
- One choice must exactly match the answer field.
- Distractor choices must still come from or be directly supported by the note content.
- Do not add outside facts just to create more choices.
`;

  const data = await callAiJson({ prompt, temperature: 0.2 });

  if (data.error) {
    throw new AppError(`AI analysis: ${data.error}`, 400);
  }

  return normalizeReviewer(data);
};

const generateStudyRecommendation = async (studentDataSummary) => {
  const prompt = `
You are an expert academic advisor. Provide a customized study recommendation based only on the student's current StudySync data below.

Student Data:
${studentDataSummary}

Rules:
1. Only base your recommendation on the provided data.
2. Do not invent subjects, tasks, deadlines, or focus history.
3. Prioritize overdue, urgent, high-priority, and upcoming work.
4. Keep the response short, practical, and actionable.
5. Return only valid JSON with exactly this shape:
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
`;

  const data = await callAiJson({ prompt, temperature: 0.3 });

  if (data.error) {
    throw new AppError(`AI analysis: ${data.error}`, 400);
  }

  return normalizeStudyRecommendation(data);
};

const validateAcademicInput = async (moduleName, inputData) => {
  const prompt = `
You are an advisory input validation assistant for a student productivity app.

Module:
${moduleName}

Submitted Input JSON:
${JSON.stringify(inputData, null, 2)}

Rules:
1. This validation is advisory only. Do not claim the item was saved or rejected.
2. Check whether the input appears useful, clear, school-appropriate, and complete for the module.
3. Mention likely missing fields, unclear wording, unrealistic values, or academic quality issues.
4. Do not enforce hidden rules or invent data.
5. Return only valid JSON with exactly this shape:
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
`;

  const data = await callAiJson({ prompt, temperature: 0.1 });

  if (data.error) {
    throw new AppError(`AI validation: ${data.error}`, 400);
  }

  return normalizeInputValidation(data);
};

module.exports = {
  generateReviewerFromNote,
  generateStudyRecommendation,
  validateAcademicInput
};
