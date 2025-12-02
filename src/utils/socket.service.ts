import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  // Инициализация подключения
  connect(token: string): void {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const socketUrl = API_URL.replace('/api', '');

    this.socket = io(socketUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket подключен:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket отключен');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket ошибка подключения:', error);
    });
  }

  // Отключение
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Присоединиться к чату
  joinChat(chatId: number): void {
    if (this.socket) {
      this.socket.emit('join-chat', chatId);
    }
  }

  // Покинуть чат
  leaveChat(chatId: number): void {
    if (this.socket) {
      this.socket.emit('leave-chat', chatId);
    }
  }

  // Отправить сообщение
  sendMessage(chatId: number, message: string): void {
    if (this.socket) {
      this.socket.emit('send-message', { chatId, message });
    }
  }

  // Подписаться на новые сообщения
  onNewMessage(callback: (message: any) => void): void {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  // Подписаться на уведомления о непрочитанных сообщениях
  onNotificationUnread(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('notification-unread', callback);
    }
  }

  // Подписаться на событие прочтения сообщений
  onMessagesRead(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('messages-read', callback);
    }
  }

  // Отписаться от событий
  off(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Проверка подключения
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();