const mongoose = require('mongoose');

const sessionHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Please specify a subject'],
    trim: true
  },
  topic: {
    type: String,
    required: [true, 'Please specify a topic'],
    trim: true
  },
  customGoal: {
    type: String,
    trim: true,
    default: ''
  },
  conversationId: {
    type: String,
    trim: true,
    default: null
  },
  durationSeconds: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SessionHistory', sessionHistorySchema);
