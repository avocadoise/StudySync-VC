const express = require('express');
const {
  createFocusSession,
  getFocusSessions,
  getFocusSessionStats,
  deleteFocusSession
} = require('../controllers/focusSessionController');
const { protect } = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

// Protect all focus session routes
router.use(protect);

router
  .route('/')
  .post(createFocusSession)
  .get(getFocusSessions);

// Important: Specific routes should come before parameterized routes 
// so '/stats' isn't interpreted as an ':id'
router
  .route('/stats')
  .get(getFocusSessionStats);

router
  .route('/:id')
  .delete(validateObjectId, deleteFocusSession);

module.exports = router;