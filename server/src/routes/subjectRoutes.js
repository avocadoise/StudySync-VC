const express = require('express');
const {
  createSubject,
  getSubjects,
  getSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');
const { protect } = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

// Apply protect middleware to all routes in this file
router.use(protect);

router
  .route('/')
  .post(createSubject)
  .get(getSubjects);

router
  .route('/:id')
  .get(validateObjectId, getSubject)
  .put(validateObjectId, updateSubject)
  .delete(validateObjectId, deleteSubject);

module.exports = router;
