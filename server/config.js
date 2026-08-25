require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  tavusApiKey: process.env.TAVUS_API_KEY || '',
  tavusApiUrl: process.env.TAVUS_API_URL || 'https://tavusapi.com/v2',
  replicaId: process.env.REPLICA_ID || process.env.TAVUS_REPLICA_ID || 'r6c7a6cb6d9b',
  defaultPersonaId: process.env.TAVUS_DEFAULT_PERSONA_ID || ''
};
