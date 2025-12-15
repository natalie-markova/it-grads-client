import { $api } from './axios.instance';
import type {
  InterviewSession,
  InterviewConfig,
  InterviewFeedback,
  InterviewMessage,
} from '../types';

export const interviewAPI = {
  createSession: async (config: InterviewConfig, lang: string = 'ru'): Promise<{
    session: InterviewSession;
    firstMessage: InterviewMessage;
  }> => {
    const response = await $api.post<{
      session: InterviewSession;
      firstMessage: InterviewMessage;
    }>('/interviews', { ...config, lang });
    return response.data;
  },

  getSession: async (sessionId: number): Promise<InterviewSession> => {
    const response = await $api.get<InterviewSession>(`/interviews/${sessionId}`);
    return response.data;
  },

  sendMessage: async (
    sessionId: number,
    content: string,
    lang: string = 'ru'
  ): Promise<{
    userMessage: InterviewMessage;
    aiMessage: InterviewMessage;
  }> => {
    const response = await $api.post<{
      userMessage: InterviewMessage;
      aiMessage: InterviewMessage;
    }>(`/interviews/${sessionId}/message`, { content, lang });
    return response.data;
  },

  completeSession: async (sessionId: number, lang: string = 'ru'): Promise<InterviewFeedback> => {
    const response = await $api.post<InterviewFeedback>(
      `/interviews/${sessionId}/complete`,
      { lang }
    );
    return response.data;
  },

  getUserInterviews: async (): Promise<InterviewSession[]> => {
    const response = await $api.get<InterviewSession[]>('/interviews/my');
    return response.data;
  },

  deleteSession: async (sessionId: number): Promise<void> => {
    await $api.delete(`/interviews/${sessionId}`);
  },
};