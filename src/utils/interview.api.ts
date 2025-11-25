import { $api } from './axios.instance';
import type {
  InterviewSession,
  InterviewConfig,
  InterviewAnswer,
  InterviewFeedback,
  InterviewQuestion,
} from '../types';


// Создать новую сессию интервью
export const interviewAPI = {
  createSession: async (config: InterviewConfig): Promise<InterviewSession> => {
    const response = await $api.post<InterviewSession>('/interviews', config);
    return response.data;
  },


// Получить текущую сессию по ID
  getSession: async (sessionId: number): Promise<InterviewSession> => {
    const response = await $api.get<InterviewSession>(`/interviews/${sessionId}`);
    return response.data;
  },

//    Получить следующий вопрос (генерируется AI)
  getNextQuestion: async (sessionId: number): Promise<InterviewQuestion> => {
    const response = await $api.post<InterviewQuestion>(
      `/interviews/${sessionId}/next-question`
    );
    return response.data;
  },


// Отправить ответ на вопрос и получить оценку
  submitAnswer: async (
    sessionId: number,
    answer: InterviewAnswer
  ): Promise<{ score: number; feedback: string }> => {
    const response = await $api.post<{ score: number; feedback: string }>(
      `/interviews/${sessionId}/answer`,
      answer
    );
    return response.data;
  },

//  Получить подсказку для текущего вопроса
  getHint: async (
    sessionId: number,
    questionId: number
  ): Promise<{ hint: string }> => {
    const response = await $api.post<{ hint: string }>(
      `/interviews/${sessionId}/hint`,
      { questionId }
    );
    return response.data;
  },

    // Завершить интервью и получить финальные результаты
  completeSession: async (sessionId: number): Promise<InterviewFeedback> => {
    const response = await $api.post<InterviewFeedback>(
      `/interviews/${sessionId}/complete`
    );
    return response.data;
  },

//    Получить историю всех интервью текущего пользователя
  getUserInterviews: async (): Promise<InterviewSession[]> => {
    const response = await $api.get<InterviewSession[]>('/interviews/my');
    return response.data;
  },

//    Удалить сессию интервью
  deleteSession: async (sessionId: number): Promise<void> => {
    await $api.delete(`/interviews/${sessionId}`);
  },
};