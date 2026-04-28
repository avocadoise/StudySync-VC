const express = require('express');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

// Protect all routes
router.use(protect);

router
  .route('/')
  .post(createTask)
  .get(getTasks);

router
  .route('/:id')
  .get(validateObjectId, getTask)
  .put(validateObjectId, updateTask)
  .delete(validateObjectId, deleteTask);

router
  .route('/:id/status')
  .patch(validateObjectId, updateTaskStatus);

module.exports = router;
