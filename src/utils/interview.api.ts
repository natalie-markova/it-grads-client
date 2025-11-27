import { $api } from './axios.instance';
import type {
  InterviewSession,
  InterviewConfig,
  InterviewFeedback,
  InterviewMessage,
} from '../types';

export const interviewAPI = {
  // Создать новую сессию интервью
  createSession: async (config: InterviewConfig): Promise<{
    session: InterviewSession;
    firstMessage: InterviewMessage;
  }> => {
    const response = await $api.post<{
      session: InterviewSession;
      firstMessage: InterviewMessage;
    }>('/interviews', config);
    return response.data;
  },

  // Получить сессию по ID с историей сообщений
  getSession: async (sessionId: number): Promise<InterviewSession> => {
    const response = await $api.get<InterviewSession>(`/interviews/${sessionId}`);
    return response.data;
  },

  // Отправить сообщение пользователя и получить ответ AI
  sendMessage: async (
    sessionId: number,
    content: string
  ): Promise<{
    userMessage: InterviewMessage;
    aiMessage: InterviewMessage;
  }> => {
    const response = await $api.post<{
      userMessage: InterviewMessage;
      aiMessage: InterviewMessage;
    }>(`/interviews/${sessionId}/message`, { content });
    return response.data;
  },

  // Завершить интервью и получить итоговую оценку
  completeSession: async (sessionId: number): Promise<InterviewFeedback> => {
    const response = await $api.post<InterviewFeedback>(
      `/interviews/${sessionId}/complete`
    );
    return response.data;
  },

  // Получить все интервью пользователя
  getUserInterviews: async (): Promise<InterviewSession[]> => {
    const response = await $api.get<InterviewSession[]>('/interviews/my');
    return response.data;
  },

  // Удалить сессию
  deleteSession: async (sessionId: number): Promise<void> => {
    await $api.delete(`/interviews/${sessionId}`);
  },
};