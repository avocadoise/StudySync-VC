const Task = require('../models/Task');
const StudyPlan = require('../models/StudyPlan');
const FocusSession = require('../models/FocusSession');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const parseDateOnly = (value, fieldName) => {
  if (!value || !DATE_ONLY_PATTERN.test(value)) {
    throw new AppError(`Please provide a valid ${fieldName} date in YYYY-MM-DD format`, 400);
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(`Please provide a valid ${fieldName} date`, 400);
  }

  if (date.toISOString().split('T')[0] !== value) {
    throw new AppError(`Please provide a valid ${fieldName} date`, 400);
  }

  return date;
};

const parseDateRange = (start, end) => {
  const startDate = parseDateOnly(start, 'start');
  const endDate = parseDateOnly(end, 'end');
  endDate.setUTCHours(23, 59, 59, 999);

  if (startDate > endDate) {
    throw new AppError('Start date must be before or equal to end date', 400);
  }

  return { startDate, endDate };
};

const getDatePart = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

const combineDateAndTime = (date, time) => {
  const datePart = getDatePart(date);
  return datePart && time ? `${datePart}T${time}:00` : null;
};

const getSubjectMeta = (subjectData) => ({
  subject: subjectData?.name || 'Unknown subject',
  subjectId: subjectData?._id?.toString() || subjectData?.toString() || null,
  color: subjectData?.color || '#64748b'
});

const normalizeTask = (task) => {
  const subjectMeta = getSubjectMeta(task.subjectId);

  return {
    id: `task-${task._id}`,
    type: 'task',
    title: task.title,
    start: task.dueDate,
    end: task.dueDate,
    ...subjectMeta,
    status: task.status,
    priority: task.priority
  };
};

const normalizeStudyPlan = (plan) => {
  const subjectMeta = getSubjectMeta(plan.subjectId);

  return {
    id: `studyPlan-${plan._id}`,
    type: 'studyPlan',
    title: plan.topic,
    start: combineDateAndTime(plan.studyDate, plan.startTime),
    end: combineDateAndTime(plan.studyDate, plan.endTime),
    ...subjectMeta,
    status: plan.status,
    priority: null
  };
};

const normalizeFocusSession = (session) => {
  const subjectMeta = getSubjectMeta(session.subjectId);

  return {
    id: `focusSession-${session._id}`,
    type: 'focusSession',
    title: `${session.sessionType} - ${session.duration} min`,
    start: session.completedAt,
    end: session.completedAt,
    ...subjectMeta,
    status: 'Completed',
    priority: null,
    duration: session.duration,
    sessionType: session.sessionType
  };
};

// @desc    Get normalized academic calendar events
// @route   GET /api/calendar/events?start=YYYY-MM-DD&end=YYYY-MM-DD
// @access  Private
const getCalendarEvents = asyncHandler(async (req, res) => {
  const { start, end } = req.query;
  const { startDate, endDate } = parseDateRange(start, end);
  const userId = req.user.id;

  const [tasks, studyPlans, focusSessions] = await Promise.all([
    Task.find({
      userId,
      dueDate: { $gte: startDate, $lte: endDate }
    })
      .populate('subjectId', 'name color')
      .sort({ dueDate: 1 })
      .limit(500),
    StudyPlan.find({
      userId,
      studyDate: { $gte: startDate, $lte: endDate }
    })
      .populate('subjectId', 'name color')
      .sort({ studyDate: 1, startTime: 1 })
      .limit(500),
    FocusSession.find({
      userId,
      completedAt: { $gte: startDate, $lte: endDate }
    })
      .populate('subjectId', 'name color')
      .sort({ completedAt: 1 })
      .limit(500)
  ]);

  const events = [
    ...tasks.map(normalizeTask),
    ...studyPlans.map(normalizeStudyPlan),
    ...focusSessions.map(normalizeFocusSession)
  ].sort((a, b) => new Date(a.start) - new Date(b.start));

  res.status(200).json({
    success: true,
    message: 'Calendar events retrieved successfully',
    data: events
  });
});

module.exports = {
  getCalendarEvents
};
