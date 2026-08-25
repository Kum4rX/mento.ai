const SessionHistory = require('../models/SessionHistory');

// Master Academic Curriculum Catalog (Source of Truth for mento.ai)
const CURRICULUM_CATALOG = [
  {
    subject: "Physics",
    description: "Mechanics, Thermodynamics, Electromagnetism, Quantum Concepts",
    color: "from-blue-600 to-cyan-500",
    topics: [
      "Laws of Motion",
      "Thermodynamics",
      "Electromagnetism",
      "Optics & Light",
      "Work, Energy & Power"
    ]
  },
  {
    subject: "Mathematics",
    description: "Calculus, Linear Algebra, Geometry, Statistics & Probability",
    color: "from-indigo-600 to-purple-500",
    topics: [
      "Calculus & Derivatives",
      "Integration & Areas",
      "Linear Algebra",
      "Quadratic Equations",
      "Probability & Statistics"
    ]
  },
  {
    subject: "Chemistry",
    description: "Organic Reactions, Atomic Structure, Chemical Bonding, Equilibrium",
    color: "from-emerald-600 to-teal-400",
    topics: [
      "Chemical Bonding",
      "Periodic Table & Trends",
      "Organic Reaction Mechanisms",
      "Acids, Bases & pH",
      "Stoichiometry & Moles"
    ]
  },
  {
    subject: "Computer Science",
    description: "Data Structures, Algorithms, AI Concepts, Web Development",
    color: "from-cyan-600 to-blue-500",
    topics: [
      "Data Structures",
      "Algorithms & Big-O",
      "Machine Learning Basics",
      "React & Modern Web",
      "Databases & SQL"
    ]
  },
  {
    subject: "Biology",
    description: "Cellular Biology, Genetics, Human Physiology, Ecology",
    color: "from-amber-600 to-orange-500",
    topics: [
      "Cell Structure & Function",
      "Genetics & DNA Replication",
      "Photosynthesis",
      "Human Nervous System"
    ]
  },
  {
    subject: "History & Social Sciences",
    description: "World Civilizations, Modern History, Economics & Governance",
    color: "from-rose-600 to-pink-500",
    topics: [
      "World War II & Global Impact",
      "The Industrial Revolution",
      "Ancient Civilizations",
      "Microeconomics Principles"
    ]
  }
];

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
      subject: subject.trim(),
      topic: topic.trim(),
      customGoal: customGoal ? customGoal.trim() : '',
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
    const completedSessions = allSessions.filter(s => s.status === 'completed');
    const totalCompletedCount = completedSessions.length;
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

    // Unique topics completed
    const uniqueTopics = new Set(completedSessions.map(s => s.topic)).size;

    res.json({
      success: true,
      data: {
        totalSessions,
        completedSessions: totalCompletedCount,
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

const Assessment = require('../models/Assessment');

// @desc    Get curriculum mastery progress across all academic subjects
// @route   GET /api/sessions/curriculum
// @access  Private
exports.getCurriculumProgress = async (req, res) => {
  try {
    const userId = req.session.userId;
    const [completedSessions, completedAssessments] = await Promise.all([
      SessionHistory.find({ user: userId, status: 'completed' }),
      Assessment.find({ user: userId, status: 'completed' })
    ]);

    let totalCatalogTopics = 0;
    let totalUniqueCompleted = 0;
    let totalUniqueMastered = 0;

    // Map latest assessment per topic
    const assessmentByTopic = {};
    completedAssessments.forEach(a => {
      if (!assessmentByTopic[a.topic] || new Date(a.completedAt) > new Date(assessmentByTopic[a.topic].completedAt)) {
        assessmentByTopic[a.topic] = a;
      }
    });

    const subjectsProgress = CURRICULUM_CATALOG.map(cat => {
      const subjectSessions = completedSessions.filter(s => s.subject.toLowerCase() === cat.subject.toLowerCase());
      const completedTopicsSet = new Set(subjectSessions.map(s => s.topic));
      const completedTopicsList = Array.from(completedTopicsSet);

      const totalTopics = cat.topics.length;
      const completedCount = completedTopicsList.length;
      const progressPercentage = Math.min(100, Math.round((completedCount / totalTopics) * 100));

      const totalDurationSeconds = subjectSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
      const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

      // Detailed topic breakdown with assessment evidence
      const topicDetails = cat.topics.map(tName => {
        const isStudied = completedTopicsSet.has(tName);
        const assessment = assessmentByTopic[tName];
        let topicStatus = 'Not Started';
        let assessmentScore = null;

        if (assessment) {
          assessmentScore = assessment.percentageScore;
          if (assessmentScore >= 85) {
            topicStatus = 'Mastered';
          } else if (assessmentScore >= 60) {
            topicStatus = 'Proficient';
          } else {
            topicStatus = 'In Progress';
          }
        } else if (isStudied) {
          topicStatus = 'Studied';
        }

        if (topicStatus === 'Mastered') {
          totalUniqueMastered += 1;
        }

        return {
          topic: tName,
          studied: isStudied,
          assessed: !!assessment,
          score: assessmentScore,
          status: topicStatus
        };
      });

      // Find next recommended topic
      const nextTopic = cat.topics.find(t => !completedTopicsSet.has(t)) || cat.topics[0];

      totalCatalogTopics += totalTopics;
      totalUniqueCompleted += completedCount;

      let masteryLevel = 'Beginner';
      if (progressPercentage === 100) masteryLevel = 'Mastered';
      else if (progressPercentage >= 60) masteryLevel = 'Proficient';
      else if (progressPercentage > 0) masteryLevel = 'In Progress';

      return {
        subject: cat.subject,
        description: cat.description,
        color: cat.color,
        totalTopics,
        completedCount,
        completedTopics: completedTopicsList,
        allTopics: cat.topics,
        topicDetails,
        progressPercentage,
        totalDurationMinutes,
        sessionCount: subjectSessions.length,
        nextTopic,
        masteryLevel
      };
    });

    const overallPercentage = Math.round((totalUniqueCompleted / totalCatalogTopics) * 100);

    res.json({
      success: true,
      data: {
        totalCatalogTopics,
        totalUniqueCompleted,
        totalUniqueMastered,
        overallPercentage,
        subjects: subjectsProgress
      }
    });
  } catch (error) {
    console.error('Error fetching curriculum progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve curriculum progress'
    });
  }
};

exports.CURRICULUM_CATALOG = CURRICULUM_CATALOG;
