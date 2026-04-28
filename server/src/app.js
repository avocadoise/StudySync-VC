const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const noteRoutes = require('./routes/noteRoutes');
const studyPlanRoutes = require('./routes/studyPlanRoutes');
const focusSessionRoutes = require('./routes/focusSessionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  }
});
app.use('/api', limiter);

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/focus-sessions', focusSessionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StudySync API is running properly.',
    timestamp: new Date().toISOString()
  });
});

// Unknown Routes 404 Handler
app.use('*', notFound);

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
