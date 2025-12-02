import { $api } from './axios.instance';
import type { Chat, Message } from '../types';

interface CreateChatRequest {
  otherUserId: number;
}

interface SendMessageRequest {
  content: string;
}

interface UnreadCountResponse {
  unreadCount: number;
  unreadMessages: Message[];
}

export const chatAPI = {
  // Получить все чаты текущего пользователя
  getChats: async (): Promise<Chat[]> => {
    const response = await $api.get<Chat[]>('/chats');
    return response.data;
  },

  // Получить конкретный чат по ID
  getChatById: async (chatId: number): Promise<Chat> => {
    const response = await $api.get<Chat>(`/chats/${chatId}`);
    return response.data;
  },

  // Создать или найти существующий чат с пользователем
  createChat: async (otherUserId: number): Promise<Chat> => {
    const response = await $api.post<Chat>('/chats', { otherUserId });
    return response.data;
  },

  // Отправить сообщение в чат
  sendMessage: async (chatId: number, content: string): Promise<Message> => {
    const response = await $api.post<Message>(`/chats/${chatId}/messages`, { content });
    return response.data;
  },

  // Отметить все сообщения в чате как прочитанные
  markAsRead: async (chatId: number): Promise<void> => {
    await $api.put(`/chats/${chatId}/read`);
  },

  // Получить количество непрочитанных сообщений
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await $api.get<UnreadCountResponse>('/chats/unread/count');
    return response.data;
  },

  // Удалить чат
  deleteChat: async (chatId: number): Promise<void> => {
    await $api.delete(`/chats/${chatId}`);
  }
};