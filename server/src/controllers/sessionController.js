const SessionHistory = require('../models/SessionHistory');

// @desc    Start a new learning session
// @route   POST /api/sessions/start
// @access  Private
exports.startSession = async (req, res) => {
  try {
    const { subject, topic, customGoal, conversationId } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Subject and topic are required'
      });
    }

    const session = await SessionHistory.create({
      user: req.session.userId,
      subject,
      topic,
      customGoal: customGoal || '',
      conversationId: conversationId || null,
      startedAt: new Date(),
      status: 'active'
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start learning session'
    });
  }
};

// @desc    End/Complete an active learning session
// @route   POST /api/sessions/:id/end
// @access  Private
exports.endSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { durationSeconds, notes } = req.body;

    const session = await SessionHistory.findOne({
      _id: id,
      user: req.session.userId
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const now = new Date();
    const calculatedDuration = durationSeconds || Math.max(0, Math.round((now.getTime() - new Date(session.startedAt).getTime()) / 1000));

    session.endedAt = now;
    session.durationSeconds = calculatedDuration;
    session.status = 'completed';
    if (notes) session.notes = notes;

    await session.save();

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete learning session'
    });
  }
};

// @desc    Get user's learning session history
// @route   GET /api/sessions/history
// @access  Private
exports.getSessionHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const skip = (page - 1) * limit;

    const sessions = await SessionHistory.find({ user: req.session.userId })
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SessionHistory.countDocuments({ user: req.session.userId });

    res.json({
      success: true,
      count: sessions.length,
      total,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching session history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve session history'
    });
  }
};

// @desc    Get aggregated learning statistics for dashboard
// @route   GET /api/sessions/stats
// @access  Private
exports.getSessionStats = async (req, res) => {
  try {
    const userId = req.session.userId;
    const allSessions = await SessionHistory.find({ user: userId });

    const totalSessions = allSessions.length;
    const completedSessions = allSessions.filter(s => s.status === 'completed').length;
    const totalDurationSeconds = allSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
    const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

    // Sessions this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const sessionsThisWeek = allSessions.filter(s => new Date(s.startedAt) >= oneWeekAgo).length;

    // Subjects distribution
    const subjectCounts = {};
    allSessions.forEach(s => {
      subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
    });

    // Unique topics mastered
    const uniqueTopics = new Set(allSessions.map(s => s.topic)).size;

    res.json({
      success: true,
      data: {
        totalSessions,
        completedSessions,
        totalDurationMinutes,
        sessionsThisWeek,
        uniqueTopics,
        subjectCounts
      }
    });
  } catch (error) {
    console.error('Error fetching session stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve session statistics'
    });
  }
};
