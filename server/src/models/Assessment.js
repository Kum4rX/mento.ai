const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['mcq', 'short_answer'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String
  }],
  correctAnswer: {
    type: String,
    default: ''
  },
  explanation: {
    type: String,
    default: ''
  },
  evaluationCriteria: {
    type: String,
    default: ''
  },
  modelAnswer: {
    type: String,
    default: ''
  },
  studentAnswer: {
    type: String,
    default: null
  },
  isCorrect: {
    type: String,
    enum: ['correct', 'partially_correct', 'incorrect', 'unanswered'],
    default: 'unanswered'
  },
  score: {
    type: Number,
    default: 0
  },
  feedback: {
    type: String,
    default: ''
  }
}, { _id: false });

const assessmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SessionHistory',
    default: null
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress'
  },
  questions: [questionSchema],
  totalPossibleScore: {
    type: Number,
    default: 10
  },
  scoreAchieved: {
    type: Number,
    default: 0
  },
  percentageScore: {
    type: Number,
    default: 0
  },
  masteryStatus: {
    type: String,
    enum: ['In Progress', 'Proficient', 'Mastered'],
    default: 'In Progress'
  },
  strengths: [{
    type: String
  }],
  needsPractice: [{
    type: String
  }],
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assessment', assessmentSchema);
