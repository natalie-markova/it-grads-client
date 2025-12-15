import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

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
      console.log('✅ WebSocket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinChat(chatId: number): void {
    if (this.socket) {
      this.socket.emit('join-chat', chatId);
    }
  }

  leaveChat(chatId: number): void {
    if (this.socket) {
      this.socket.emit('leave-chat', chatId);
    }
  }

  sendMessage(chatId: number, message: string): void {
    if (this.socket) {
      this.socket.emit('send-message', { chatId, message });
    }
  }

  onNewMessage(callback: (message: any) => void): void {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  onNotificationUnread(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('notification-unread', callback);
    }
  }

  onMessagesRead(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('messages-read', callback);
    }
  }

  onChatDeleted(callback: (data: { chatId: number }) => void): void {
    if (this.socket) {
      this.socket.on('chat-deleted', callback);
    }
  }

  onChatCreated(callback: (data: { chat: any }) => void): void {
    if (this.socket) {
      this.socket.on('chat-created', callback);
    }
  }

  onMessageError(callback: (error: any) => void): void {
    if (this.socket) {
      this.socket.on('message-error', callback);
    }
  }

  onJoinChatError(callback: (error: any) => void): void {
    if (this.socket) {
      this.socket.on('join-chat-error', callback);
    }
  }

  off(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();