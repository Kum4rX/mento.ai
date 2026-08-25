const express = require('express');
const cors = require('cors');
const axios = require('axios');
const session = require('express-session');
const MongoStore = require('connect-mongo').MongoStore;
const config = require('./config');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const sessionRoutes = require('./src/routes/sessionRoutes');
const User = require('./src/models/User');
const { requireAuth: authenticate } = require('./src/middlewares/authMiddleware');

const app = express();

// Connect to database
connectDB();

// Middleware
// CORS configuration
const allowedOrigins = [
  'http://localhost:8080',  // Vite dev server
  'http://127.0.0.1:8080',  // Alternative localhost
  'http://192.168.43.252:8080',  // Local network access
  // Production frontend origins
  'https://mento-ai.onrender.com'
  // Your custom domain(s) can be added here
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // In production, allow all origins for Render deployment
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'a_secure_session_secret_12345',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

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
    
    // Fetch authenticated student's name
    let studentName = 'Student';
    if (req.session.userId) {
      try {
        const user = await User.findById(req.session.userId);
        if (user && user.name) {
          studentName = user.name.split(' ')[0]; // First name
        }
      } catch (err) {
        console.warn('Could not fetch user name for conversation context:', err.message);
      }
    }

    // Build Intelligent Learning Context
    if (subject && topic) {
      payload.conversation_name = `${subject} - ${topic} (${studentName})`;
      payload.conversational_context = `You are mento.ai, an expert, encouraging, and highly interactive AI personal tutor teaching ${studentName}. The student is studying the subject "${subject}" with a dedicated focus on the topic "${topic}". Explain fundamental concepts clearly using intuitive real-world analogies, verify understanding with brief check questions, and guide the student step-by-step through any doubts they raise.${customGoal ? ` The student specifically wants to focus on: "${customGoal}".` : ''}`;
      payload.custom_greeting = `Hello ${studentName}! Welcome to your mento.ai session on ${subject}. Today we are exploring ${topic}. What questions or concepts would you like to start with?`;
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

    console.log('=== DEBUG: Conversation Creation with Intelligent Context ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Student:', studentName);
    console.log('Subject & Topic:', subject, '->', topic);
    console.log('Payload:', payload);
    console.log('===========================================================');

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
