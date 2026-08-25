const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');
const {
  generateAssessment,
  submitAssessment,
  getAssessmentHistory,
  getAssessmentById,
  getAssessmentStats
} = require('../controllers/assessmentController');

// All assessment routes require authentication
router.use(requireAuth);

router.post('/generate', generateAssessment);
router.post('/:id/submit', submitAssessment);
router.get('/history', getAssessmentHistory);
router.get('/stats', getAssessmentStats);
router.get('/:id', getAssessmentById);

module.exports = router;
