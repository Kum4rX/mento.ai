const express = require('express');
const cors = require('cors');
const axios = require('axios');
const session = require('express-session');
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo.MongoStore || connectMongo;
const config = require('./config');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const sessionRoutes = require('./src/routes/sessionRoutes');
const User = require('./src/models/User');
const SessionHistory = require('./src/models/SessionHistory');
const { requireAuth: authenticate } = require('./src/middlewares/authMiddleware');

const app = express();

// Trust reverse proxy for Render / Cloud load balancers (ensures secure cookies over HTTPS)
app.set('trust proxy', 1);

// Connect to database
connectDB();

// Production flag
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

// CORS configuration supporting local development, Render, and Vercel frontends
const allowedOrigins = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://mento-ai.vercel.app',
  'https://mento-ai.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    // In production, allow all vercel preview & production deployments
    if (
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com') ||
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true);
    }
    
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie']
}));

app.use(express.json());

// Session configuration with cross-site cookie support for Vercel <-> Render
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mento_ai';

app.use(session({
  name: 'connect.sid',
  secret: process.env.SESSION_SECRET || 'mento_ai_session_secret_default_key',
  resave: false,
  saveUninitialized: false,
  proxy: true, // Explicitly tell express-session to trust the reverse proxy
  store: MongoStore.create({
    mongoUrl: mongoUri,
    ttl: 24 * 60 * 60 * 7, // 7 days
    autoRemove: 'native'
  }),
  cookie: {
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

// Safe diagnostic middleware for auth & session verification
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/sessions')) {
    const hasCookie = !!req.headers.cookie;
    const cookieNames = req.headers.cookie ? req.headers.cookie.split(';').map(c => c.split('=')[0].trim()) : [];
    console.log(`[AUTH-DEBUG] ${req.method} ${req.path} | Origin: ${req.headers.origin || 'none'} | Cookie: ${hasCookie} (${cookieNames.join(', ')}) | SessionID: ${req.sessionID ? 'yes' : 'no'} | User: ${req.session?.userId ? 'authenticated' : 'guest'}`);
  }
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);

// Tavus API client
const tavusApi = axios.create({
  baseURL: config.tavusApiUrl,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': config.tavusApiKey
  }
});

// Add request/response interceptors for debugging
if (process.env.NODE_ENV === 'development') {
  tavusApi.interceptors.request.use(
    (config) => {
      console.log('Tavus API Request:', {
        url: config.url,
        method: config.method,
        data: config.data
      });
      return config;
    },
    (error) => {
      console.error('Tavus API Request Error:', error);
      return Promise.reject(error);
    }
  );

  tavusApi.interceptors.response.use(
    (response) => {
      console.log('Tavus API Response:', {
        status: response.status,
        data: response.data
      });
      return response;
    },
    (error) => {
      console.error('Tavus API Response Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      return Promise.reject(error);
    }
  );
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Debug endpoint to check current configuration
app.get('/api/debug/config', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    tavusApiUrl: config.tavusApiUrl,
    replicaId: config.replicaId,
    defaultPersonaId: config.defaultPersonaId,
    apiKeySource: process.env.TAVUS_API_KEY ? 'environment' : 'fallback',
    apiKeyLength: config.tavusApiKey ? config.tavusApiKey.length : 0,
    apiKeyPreview: config.tavusApiKey ? `${config.tavusApiKey.substring(0, 8)}...` : null,
    hasValidConfig: !!(config.tavusApiKey && config.replicaId)
  });
});

// Health check for Tavus API
app.get('/api/tavus/health', authenticate, async (req, res) => {
  try {
    console.log('=== DEBUG: Tavus API Configuration ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('API Key Source:', process.env.TAVUS_API_KEY ? 'Environment Variable' : 'Hardcoded Fallback');
    console.log('API Key Preview:', config.tavusApiKey ? `${config.tavusApiKey.substring(0, 8)}...` : 'None');
    console.log('Replica ID:', config.replicaId);
    console.log('API URL:', config.tavusApiUrl);
    console.log('=====================================');
    
    const response = await tavusApi.get(`/replicas/${config.replicaId}`);
    
    res.json({
      status: 'ok',
      tavusConnected: true,
      replicaId: config.replicaId,
      replicaStatus: response.data?.status,
      replicaName: response.data?.replica_name,
      debug: {
        apiKeySource: process.env.TAVUS_API_KEY ? 'env' : 'fallback',
        apiKeyLength: config.tavusApiKey ? config.tavusApiKey.length : 0
      }
    });
  } catch (error) {
    console.error('Tavus API Health Check Failed:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    res.status(error.response?.status || 500).json({
      status: 'error',
      tavusConnected: false,
      error: error.response?.data?.message || error.message,
      debug: {
        replicaId: config.replicaId,
        hasApiKey: !!config.tavusApiKey,
        apiKeySource: process.env.TAVUS_API_KEY ? 'env' : 'fallback',
        apiKeyLength: config.tavusApiKey ? config.tavusApiKey.length : 0,
        apiUrl: config.tavusApiUrl
      }
    });
  }
});

// Get replica details
app.get('/api/tavus/replica', authenticate, async (req, res) => {
  try {
    const response = await tavusApi.get(`/replicas/${config.replicaId}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching replica:', error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || 'Failed to fetch replica',
      details: error.response?.data
    });
  }
});

// Create conversation
app.post('/api/tavus/conversation', authenticate, async (req, res) => {
  try {
    const { personaId, subject, topic, customGoal } = req.body;
    const payload = { replica_id: config.replicaId };
    
    // Fetch authenticated student's name and completed learning history
    let studentName = 'Student';
    let pastSessions = [];
    if (req.session.userId) {
      try {
        const [user, sessions] = await Promise.all([
          User.findById(req.session.userId),
          SessionHistory.find({ user: req.session.userId, status: 'completed' }).sort({ endedAt: -1 })
        ]);
        if (user && user.name) {
          studentName = user.name.split(' ')[0]; // First name
        }
        if (sessions) {
          pastSessions = sessions;
        }
      } catch (err) {
        console.warn('Could not fetch user profile/history for conversation context:', err.message);
      }
    }

    // Analyze subject and topic history
    const subjectSessions = subject 
      ? pastSessions.filter(s => s.subject && s.subject.toLowerCase() === subject.toLowerCase()) 
      : [];
    const topicSessions = topic 
      ? subjectSessions.filter(s => s.topic && s.topic.toLowerCase() === topic.toLowerCase()) 
      : [];

    const isReturningTopic = topicSessions.length > 0;
    const subjectSessionCount = subjectSessions.length;
    const subjectTotalMinutes = Math.round(subjectSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60);
    const previousTopicsInSubject = [...new Set(subjectSessions.map(s => s.topic))];

    // Build Student Learning Profile
    let studentProfile = `${studentName} is `;
    if (subjectSessionCount === 0) {
      studentProfile += `a new student starting their first ever session in ${subject || 'general learning'}.`;
    } else if (isReturningTopic) {
      studentProfile += `a returning student continuing their study of "${topic}" (${topicSessions.length} prior completed session${topicSessions.length > 1 ? 's' : ''}, ${subjectTotalMinutes} minutes total in ${subject}).`;
    } else {
      studentProfile += `a continuing student in ${subject} who has previously studied: [${previousTopicsInSubject.slice(0, 4).join(', ')}] (${subjectSessionCount} prior session${subjectSessionCount > 1 ? 's' : ''}, ${subjectTotalMinutes} mins total). Today is their first session on "${topic}".`;
    }

    // Build Adaptive Pedagogical Strategy
    let pedagogicalStrategy = '';
    if (isReturningTopic) {
      pedagogicalStrategy = `Since ${studentName} has studied "${topic}" before, build directly upon their previous knowledge. Focus on deeper nuances, problem-solving, resolving any lingering doubts or misconceptions, and applying the concept in new contexts.`;
    } else if (subjectSessionCount > 0) {
      pedagogicalStrategy = `Bridge "${topic}" with the foundational concepts they previously learned in ${previousTopicsInSubject.slice(0, 2).join(' and ')}. Guide them step-by-step through the new principles.`;
    } else {
      pedagogicalStrategy = `Introduce "${topic}" from core foundational principles using intuitive real-world analogies, step-by-step clarity, and gentle check-in questions to ensure solid grounding.`;
    }

    // Build Personalized Context & Natural Greeting
    if (subject && topic) {
      payload.conversation_name = `${subject} - ${topic} (${studentName})`;
      payload.conversational_context = `You are mento.ai, an expert, encouraging, and highly adaptive AI personal tutor.
Learning Profile: ${studentProfile}
Current Focus: Subject "${subject}", Topic "${topic}".
Pedagogical Strategy: ${pedagogicalStrategy}${customGoal ? ` Specific doubt/goal: "${customGoal}".` : ''}`;

      if (isReturningTopic) {
        payload.custom_greeting = `Welcome back, ${studentName}! Great to continue our ${subject} session on ${topic}. Since we've worked on this before, what specific questions or deeper concepts would you like to focus on today?`;
      } else if (subjectSessionCount > 0) {
        payload.custom_greeting = `Welcome back, ${studentName}! It's great to see your momentum in ${subject}. Today we're diving into ${topic}. Where would you like us to start?`;
      } else {
        payload.custom_greeting = `Hello ${studentName}! Welcome to your mento.ai session on ${subject}. Today we are exploring ${topic}. What questions or concepts would you like to start with?`;
      }
    } else {
      payload.conversation_name = `Learning Session - ${studentName}`;
      payload.conversational_context = `You are mento.ai, an expert, patient, and encouraging personal tutor for ${studentName}. Guide the student through their learning goals and clarify any academic questions with step-by-step clarity.`;
      payload.custom_greeting = `Hello ${studentName}! I am your mento.ai tutor. What would you like to learn or clarify today?`;
    }

    // Only add persona_id if explicitly provided and not empty
    if (personaId && personaId.trim() !== '') {
      payload.persona_id = personaId;
    } else if (config.defaultPersonaId && config.defaultPersonaId.trim() !== '') {
      payload.persona_id = config.defaultPersonaId;
    }

    console.log('=== DEBUG: Conversation Creation with Personalized Context ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Student:', studentName);
    console.log('Subject & Topic:', subject, '->', topic);
    console.log('Is Returning Topic:', isReturningTopic);
    console.log('Payload:', payload);
    console.log('=============================================================');

    const response = await tavusApi.post('/conversations', payload);
    console.log('Conversation created successfully:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('=== DEBUG: Conversation Creation Error ===');
    console.error('Environment:', process.env.NODE_ENV);
    console.error('API Key Source:', process.env.TAVUS_API_KEY ? 'Environment Variable' : 'Hardcoded Fallback');
    console.error('API Key Preview:', config.tavusApiKey ? `${config.tavusApiKey.substring(0, 8)}...` : 'None');
    console.error('Full error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        headers: { ...error.config?.headers, 'x-api-key': '***masked***' }
      }
    });
    console.error('==========================================');
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Failed to create conversation';
    const details = error.response?.data || error.message;
    
    res.status(status).json({
      message,
      details,
      debug: {
        replicaId: config.replicaId,
        hasApiKey: !!config.tavusApiKey,
        apiKeySource: process.env.TAVUS_API_KEY ? 'env' : 'fallback',
        apiKeyLength: config.tavusApiKey ? config.tavusApiKey.length : 0,
        apiKeyPreview: config.tavusApiKey ? `${config.tavusApiKey.substring(0, 8)}...` : 'None'
      }
    });
  }
});

// End conversation
app.post('/api/tavus/conversation/:conversationId/end', authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    console.log('=== DEBUG: End Conversation ===');
    console.log('Conversation ID:', conversationId);
    console.log('API Key Source:', process.env.TAVUS_API_KEY ? 'Environment Variable' : 'Hardcoded Fallback');
    
    const response = await tavusApi.post(`/conversations/${conversationId}/end`);
    console.log('Conversation ended successfully');
    res.json({ message: 'Conversation ended successfully', data: response.data });
  } catch (error) {
    console.error('Error ending conversation:', error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Failed to end conversation';
    res.status(status).json({ message, details: error.response?.data || error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

module.exports = app;
