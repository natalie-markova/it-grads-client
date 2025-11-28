import { useState, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Chat, ChatMessage } from '../types';
import { $api } from '../utils/axios.instance';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

interface ChatSidebarProps {
  userId: number | undefined;
}

const ChatSidebar = ({ userId }: ChatSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    fetchChats();

    // Инициализация WebSocket
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('accessToken='))
      ?.split('=')[1];

    if (!token) return;

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    newSocket.on('new-message', (newMessage: ChatMessage) => {
      if (selectedChat && newMessage.chatId === selectedChat.id) {
        setSelectedChat(prev => prev ? {
          ...prev,
          messages: [...(prev.messages || []), newMessage]
        } : null);
      }
      fetchChats();
    });

    newSocket.on('chat-notification', ({ chatId, message: notificationMessage }: { chatId: number, message: ChatMessage }) => {
      toast.success(`Новое сообщение от ${notificationMessage.sender?.username}`);
      fetchChats();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    // Подсчет непрочитанных сообщений
    const total = chats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);
    setUnreadCount(total);
  }, [chats]);

  useEffect(() => {
    if (selectedChat && socket) {
      socket.emit('join-chat', selectedChat.id);
      markAsRead(selectedChat.id);

      return () => {
        socket.emit('leave-chat', selectedChat.id);
      };
    }
  }, [selectedChat, socket]);

  const fetchChats = async () => {
    try {
      const response = await $api.get('/chats');
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchChatMessages = async (chatId: number) => {
    try {
      const response = await $api.get(`/chats/${chatId}`);
      setSelectedChat(response.data);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      toast.error('Ошибка при загрузке сообщений');
    }
  };

  const markAsRead = async (chatId: number) => {
    try {
      await $api.put(`/chats/${chatId}/read`);
      fetchChats();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat || !socket) return;

    socket.emit('send-message', {
      chatId: selectedChat.id,
      content: message.trim()
    });

    setMessage('');
  };

  const handleChatClick = (chat: Chat) => {
    setSelectedChat(null);
    fetchChatMessages(chat.id);
  };

  const getOtherUser = (chat: Chat) => {
    return chat.user1Id === userId ? chat.user2 : chat.user1;
  };

  if (!userId) return null;

  return (
    <>
      {/* Chat Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-accent-cyan hover:bg-accent-cyan/80 text-dark-bg p-4 rounded-full shadow-lg transition-all z-40"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Sidebar */}
      {isOpen && (
        <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-dark-surface shadow-2xl z-50 flex flex-col border-l border-dark-card">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-dark-card">
            <h2 className="text-xl font-bold text-white">Сообщения</h2>
            <button
              onClick={() => {
                setIsOpen(false);
                setSelectedChat(null);
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Chat List or Messages */}
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-dark-card flex items-center gap-3">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="text-accent-cyan hover:text-accent-cyan/80"
                >
                  ←
                </button>
                <div>
                  <h3 className="text-white font-semibold">
                    {getOtherUser(selectedChat).username}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {getOtherUser(selectedChat).role === 'employer' ? 'Работодатель' : 'Кандидат'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedChat.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.senderId === userId
                          ? 'bg-accent-cyan text-dark-bg'
                          : 'bg-dark-card text-white'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-dark-card">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Введите сообщение..."
                    className="flex-1 px-4 py-2 bg-dark-bg border border-dark-card rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-accent-cyan hover:bg-accent-cyan/80 text-dark-bg rounded-lg transition-colors"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Chat List
            <div className="flex-1 overflow-y-auto">
              {chats.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  Нет активных чатов
                </div>
              ) : (
                chats.map((chat) => {
                  const otherUser = getOtherUser(chat);
                  return (
                    <div
                      key={chat.id}
                      onClick={() => handleChatClick(chat)}
                      className="p-4 border-b border-dark-card hover:bg-dark-bg cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold flex items-center gap-2">
                            {otherUser.username}
                            {chat.unreadCount && chat.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                                {chat.unreadCount}
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {otherUser.role === 'employer' ? 'Работодатель' : 'Кандидат'}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(chat.lastMessageAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ChatSidebar;
