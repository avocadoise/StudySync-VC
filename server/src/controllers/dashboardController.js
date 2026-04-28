const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Task = require('../models/Task');
const Note = require('../models/Note');
const FocusSession = require('../models/FocusSession');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = asyncHandler(async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);
  
  // Set current date at midnight for accurate overdue/upcoming comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Run all queries concurrently for maximum performance
  const [
    totalSubjects,
    totalNotes,
    recentNotes,
    taskStats,
    upcomingTasks,
    overdueTasksCount,
    focusStats,
    recentFocusSessions
  ] = await Promise.all([
    // Counts
    Subject.countDocuments({ userId: req.user.id }),
    Note.countDocuments({ userId: req.user.id }),
    
    // Recent Notes (limit 5)
    Note.find({ userId: req.user.id })
      .select('title tags createdAt')
      .sort({ createdAt: -1 })
      .limit(5),
    
    // Aggregated Task Stats
    Task.aggregate([
      { $match: { userId } },
      { $facet: {
          byStatus: [ { $group: { _id: "$status", count: { $sum: 1 } } } ],
          byPriority: [ { $group: { _id: "$priority", count: { $sum: 1 } } } ],
          total: [ { $count: "count" } ]
        }
      }
    ]),
    
    // Upcoming Tasks (due today or later, not completed)
    Task.find({ 
      userId: req.user.id, 
      dueDate: { $gte: today }, 
      status: { $ne: 'Completed' } 
    })
      .select('title dueDate priority status')
      .sort({ dueDate: 1 })
      .limit(5),
    
    // Overdue Tasks Count
    Task.countDocuments({
      userId: req.user.id,
      dueDate: { $lt: today },
      status: { $ne: 'Completed' }
    }),
    
    // Total Focus Minutes
    FocusSession.aggregate([
      { $match: { userId } },
      { $group: { _id: null, totalMinutes: { $sum: "$duration" } } }
    ]),
    
    // Recent Focus Sessions
    FocusSession.find({ userId: req.user.id })
      .populate('subjectId', 'name color')
      .select('duration sessionType completedAt status')
      .sort({ completedAt: -1 })
      .limit(5)
  ]);

  // Transform Aggregated Task Stats into a clean object
  let totalTasks = 0, pendingTasks = 0, inProgressTasks = 0, completedTasks = 0;
  let tasksByStatus = { Pending: 0, 'In Progress': 0, Completed: 0 };
  let tasksByPriority = { Low: 0, Medium: 0, High: 0 };

  if (taskStats && taskStats.length > 0) {
    const stats = taskStats[0];
    totalTasks = stats.total.length > 0 ? stats.total[0].count : 0;
    
    stats.byStatus.forEach(s => {
      tasksByStatus[s._id] = s.count;
      if (s._id === 'Pending') pendingTasks = s.count;
      if (s._id === 'In Progress') inProgressTasks = s.count;
      if (s._id === 'Completed') completedTasks = s.count;
    });

    stats.byPriority.forEach(p => {
      if (p._id) tasksByPriority[p._id] = p.count;
    });
  }

  const totalFocusMinutes = focusStats.length > 0 ? focusStats[0].totalMinutes : 0;

  res.status(200).json({
    success: true,
    message: 'Dashboard summary retrieved successfully',
    data: {
      totalSubjects,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks: overdueTasksCount,
      tasksByStatus,
      tasksByPriority,
      upcomingTasks,
      totalNotes,
      recentNotes,
      totalFocusMinutes,
      recentFocusSessions
    }
  });
});

module.exports = {
  getDashboardSummary
};