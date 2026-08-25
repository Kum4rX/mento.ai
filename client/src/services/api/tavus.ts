import { api } from '@/utils/api';
import { Replica, ConversationResponse, ApiError } from '@/services/tavusService';

export interface CreateConversationParams {
  personaId?: string;
  subject?: string;
  topic?: string;
  customGoal?: string;
}

export const tavusApi = {
  async getReplica(): Promise<Replica> {
    try {
      const response = await api.get('/tavus/replica');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  async createConversation(params?: CreateConversationParams | string): Promise<ConversationResponse> {
    try {
      let payload: Record<string, any> = {};
      
      if (typeof params === 'string') {
        if (params.trim() !== '') {
          payload.persona_id = params;
        }
      } else if (params) {
        if (params.personaId && params.personaId.trim() !== '') {
          payload.persona_id = params.personaId;
        }
        if (params.subject) payload.subject = params.subject;
        if (params.topic) payload.topic = params.topic;
        if (params.customGoal) payload.customGoal = params.customGoal;
      }
      
      const response = await api.post('/tavus/conversation', payload);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  handleError(error: any): ApiError {
    if (error.response) {
      return {
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        details: error.response.data
      };
    }
    return {
      message: error.message || 'An unknown error occurred',
      details: error
    };
  }
};
