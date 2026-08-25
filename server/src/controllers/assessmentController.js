const mongoose = require('mongoose');
const Assessment = require('../models/Assessment');
const { generateQuestions, evaluateAssessment } = require('../services/aiAssessmentService');

// @desc    Generate a new 5-question assessment for a subject/topic
// @route   POST /api/assessments/generate
// @access  Private
exports.generateAssessment = async (req, res) => {
  try {
    const { subject, topic, sessionId } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Subject and topic are required to generate an assessment'
      });
    }

    const validSessionId = (sessionId && mongoose.Types.ObjectId.isValid(sessionId)) ? sessionId : null;

    // Generate 5 dynamic questions
    const generatedQuestions = await generateQuestions(subject.trim(), topic.trim());

    const assessment = await Assessment.create({
      user: req.session.userId,
      sessionId: validSessionId,
      subject: subject.trim(),
      topic: topic.trim(),
      questions: generatedQuestions,
      status: 'in_progress'
    });

    // Create safe questions for client (strip answers and evaluation criteria)
    const clientSafeQuestions = assessment.questions.map((q, idx) => ({
      id: q.id || `q${idx + 1}`,
      type: q.type,
      question: q.question,
      options: q.options || []
    }));

    res.status(201).json({
      success: true,
      data: {
        _id: assessment._id,
        subject: assessment.subject,
        topic: assessment.topic,
        sessionId: assessment.sessionId,
        status: assessment.status,
        totalQuestions: clientSafeQuestions.length,
        questions: clientSafeQuestions,
        createdAt: assessment.createdAt
      }
    });
  } catch (error) {
    console.error('Error generating assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate assessment. Please try again.'
    });
  }
};

// @desc    Submit student answers and evaluate assessment
// @route   POST /api/assessments/:id/submit
// @access  Private
exports.submitAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body; // e.g. { q1: "Option A", q4: "My answer..." }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Student answers are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found or invalid ID'
      });
    }

    const assessment = await Assessment.findOne({
      _id: id,
      user: req.session.userId
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found or not owned by user'
      });
    }

    // Evaluate answers with AI grading service
    const evaluation = await evaluateAssessment(
      assessment.subject,
      assessment.topic,
      assessment.questions,
      answers
    );

    assessment.questions = evaluation.questions;
    assessment.scoreAchieved = evaluation.scoreAchieved;
    assessment.totalPossibleScore = evaluation.totalPossibleScore;
    assessment.percentageScore = evaluation.percentageScore;
    assessment.masteryStatus = evaluation.masteryStatus;
    assessment.strengths = evaluation.strengths;
    assessment.needsPractice = evaluation.needsPractice;
    assessment.status = 'completed';
    assessment.completedAt = new Date();

    await assessment.save();

    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    console.error('Error evaluating assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to evaluate assessment submission'
    });
  }
};

// @desc    Get user's assessment history
// @route   GET /api/assessments/history
// @access  Private
exports.getAssessmentHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const skip = (page - 1) * limit;

    const assessments = await Assessment.find({
      user: req.session.userId,
      status: 'completed'
    })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-questions.evaluationCriteria -questions.modelAnswer');

    const total = await Assessment.countDocuments({
      user: req.session.userId,
      status: 'completed'
    });

    res.json({
      success: true,
      count: assessments.length,
      total,
      data: assessments
    });
  } catch (error) {
    console.error('Error fetching assessment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve assessment history'
    });
  }
};

// @desc    Get specific assessment details
// @route   GET /api/assessments/:id
// @access  Private
exports.getAssessmentById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    const assessment = await Assessment.findOne({
      _id: req.params.id,
      user: req.session.userId
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    console.error('Error fetching assessment by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve assessment'
    });
  }
};

// @desc    Get aggregate assessment analytics for dashboard & profile
// @route   GET /api/assessments/stats
// @access  Private
exports.getAssessmentStats = async (req, res) => {
  try {
    const completedAssessments = await Assessment.find({
      user: req.session.userId,
      status: 'completed'
    }).sort({ completedAt: -1 });

    const totalAssessments = completedAssessments.length;
    if (totalAssessments === 0) {
      return res.json({
        success: true,
        data: {
          totalAssessments: 0,
          averageScore: 0,
          masteredTopicsCount: 0,
          strongestSubjects: [],
          needsPracticeTopics: [],
          recentAssessments: []
        }
      });
    }

    const totalScoreSum = completedAssessments.reduce((acc, a) => acc + (a.percentageScore || 0), 0);
    const averageScore = Math.round(totalScoreSum / totalAssessments);

    // Subject breakdown
    const subjectScores = {};
    completedAssessments.forEach(a => {
      if (!subjectScores[a.subject]) {
        subjectScores[a.subject] = { total: 0, count: 0 };
      }
      subjectScores[a.subject].total += a.percentageScore;
      subjectScores[a.subject].count += 1;
    });

    const strongestSubjects = Object.keys(subjectScores).map(sub => ({
      subject: sub,
      avgScore: Math.round(subjectScores[sub].total / subjectScores[sub].count),
      count: subjectScores[sub].count
    })).sort((a, b) => b.avgScore - a.avgScore);

    // Topics needing practice (< 70% on latest attempt)
    const latestTopicAttempts = {};
    completedAssessments.forEach(a => {
      if (!latestTopicAttempts[a.topic]) {
        latestTopicAttempts[a.topic] = a;
      }
    });

    const needsPracticeTopics = Object.values(latestTopicAttempts)
      .filter(a => a.percentageScore < 70)
      .map(a => ({
        subject: a.subject,
        topic: a.topic,
        score: a.percentageScore,
        date: a.completedAt
      }));

    const masteredTopicsCount = Object.values(latestTopicAttempts)
      .filter(a => a.percentageScore >= 85).length;

    res.json({
      success: true,
      data: {
        totalAssessments,
        averageScore,
        masteredTopicsCount,
        strongestSubjects: strongestSubjects.slice(0, 3),
        needsPracticeTopics: needsPracticeTopics.slice(0, 4),
        recentAssessments: completedAssessments.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Error fetching assessment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve assessment statistics'
    });
  }
};
