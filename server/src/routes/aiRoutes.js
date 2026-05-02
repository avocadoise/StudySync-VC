const express = require('express');
const {
  generateReviewer,
  getReviewers,
  getReviewer,
  deleteReviewer,
  getStudyRecommendation,
  validateInput
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

// Protect all AI routes
router.use(protect);

// Generate
router.post('/generate-reviewer', generateReviewer);
router.post('/study-recommendation', getStudyRecommendation);
router.post('/validate-input', validateInput);

// CRUD
router.route('/reviewers')
  .get(getReviewers);

router.route('/reviewers/:id')
  .get(validateObjectId, getReviewer)
  .delete(validateObjectId, deleteReviewer);

module.exports = router;
