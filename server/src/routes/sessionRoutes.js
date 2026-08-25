const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');
const {
  startSession,
  endSession,
  getSessionHistory,
  getSessionStats,
  getCurriculumProgress
} = require('../controllers/sessionController');

// All session routes require authentication
router.use(requireAuth);

router.post('/start', startSession);
router.post('/:id/end', endSession);
router.get('/history', getSessionHistory);
router.get('/stats', getSessionStats);
router.get('/curriculum', getCurriculumProgress);

module.exports = router;
