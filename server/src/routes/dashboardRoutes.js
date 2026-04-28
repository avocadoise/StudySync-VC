const express = require('express');
const { getDashboardSummary } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all dashboard routes
router.use(protect);

router.get('/summary', getDashboardSummary);

module.exports = router;