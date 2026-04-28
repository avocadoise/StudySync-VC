const express = require('express');
const {
  createStudyPlan,
  getStudyPlans,
  getStudyPlan,
  updateStudyPlan,
  updateStudyPlanStatus,
  deleteStudyPlan,
} = require('../controllers/studyPlanController');
const { protect } = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

// Protect all study plan routes
router.use(protect);

router
  .route('/')
  .post(createStudyPlan)
  .get(getStudyPlans);

router
  .route('/:id')
  .get(validateObjectId, getStudyPlan)
  .put(validateObjectId, updateStudyPlan)
  .delete(validateObjectId, deleteStudyPlan);

router
  .route('/:id/status')
  .patch(validateObjectId, updateStudyPlanStatus);

module.exports = router;
