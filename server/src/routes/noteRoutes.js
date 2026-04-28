const express = require('express');
const {
  createNote,
  getNotes,
  getNote,
  updateNote,
  deleteNote,
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

// Protect all routes
router.use(protect);

router
  .route('/')
  .post(createNote)
  .get(getNotes);

router
  .route('/:id')
  .get(validateObjectId, getNote)
  .put(validateObjectId, updateNote)
  .delete(validateObjectId, deleteNote);

module.exports = router;
