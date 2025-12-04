import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, User as UserIcon, Loader2 } from 'lucide-react';
import { chatAPI } from '../../../utils/chat.api';
import type { Chat, Message, OutletContext } from '../../../types';
import ChatListItem from './ChatListItem';
import MessageItem from './MessageItem';
import toast from 'react-hot-toast';
import { socketService } from '../../../utils/socket.service';
import Card from '../../ui/Card';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../../../utils/image.utils';

const MessengerPage = () => {
  const { t } = useTranslation();
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleteConfirmChatId, setDeleteConfirmChatId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Функция загрузки списка чатов
  const loadChats = useCallback(async () => {
    try {
      const data = await chatAPI.getChats();
      setChats(data);
    } catch (error: any) {
      console.error('Error loading chats:', error);
      toast.error('Ошибка при загрузке чатов');
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузка списка чатов
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadChats();
  }, [user, loadChats, navigate]);

  // Загрузка конкретного чата
  useEffect(() => {
    if (chatId) {
      loadChat(Number(chatId));
    }
  }, [chatId]);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

    // WebSocket подключение
    useEffect(() => {
    if (!user) return;
    
    // Получить токен из localStorage или cookies
    const token = localStorage.getItem('accessToken') || '';
    
    if (token) {
        socketService.connect(token);
    }

    return () => {
        socketService.disconnect();
    };
    }, [user]);

    // Глобальный обработчик для обновления списка чатов при получении новых сообщений и создании чатов
    useEffect(() => {
      if (!user) return;

      const handleNotificationUnread = (data: any) => {
        console.log('📬 Получено уведомление о новом сообщении:', data);
        // Обновляем список чатов для получения актуальных данных, включая счетчик непрочитанных
        loadChats();
      };

      const handleNewMessageGlobal = (message: any) => {
        console.log('📨 Глобальное новое сообщение получено:', message);
        // Обновляем список чатов для обновления lastMessageAt и счетчика непрочитанных
        // Это сработает для всех чатов, включая активный
        loadChats();
      };

      const handleChatCreated = (data: { chat: any }) => {
        console.log('💬 Создан новый чат:', data.chat);
        // Обновляем список чатов, чтобы новый чат появился в списке
        loadChats();
      };

      const handleMessagesRead = (data: { chatId: number }) => {
        console.log('✅ Сообщения отмечены как прочитанные в чате:', data.chatId);
        // Обновляем список чатов для обновления счетчика непрочитанных
        loadChats();
      };

      socketService.onNotificationUnread(handleNotificationUnread);
      socketService.onNewMessage(handleNewMessageGlobal);
      socketService.onChatCreated(handleChatCreated);
      socketService.onMessagesRead(handleMessagesRead);

      return () => {
        socketService.off('notification-unread');
        socketService.off('chat-created');
        socketService.off('messages-read');
        // Не отписываемся от 'new-message' здесь полностью, так как это используется в активном чате
        // Отписка от 'new-message' происходит в useEffect для активного чата
      };
    }, [user, loadChats]);

    // Обработчик удаления чата другим пользователем
    useEffect(() => {
      if (!user) return;

      const handleChatDeleted = (data: { chatId: number }) => {
        console.log('Чат удален другим пользователем:', data.chatId);
        
        // Проверяем, был ли удаленный чат активным
        const currentChatId = chatId ? Number(chatId) : null;
        const isActiveChat = (currentChatId === data.chatId) || (activeChat && activeChat.id === data.chatId);
        
        // Очищаем состояние перед перенаправлением
        setActiveChat(null);
        setMessages([]);
        
        // Если удаленный чат был активным, всегда перенаправляем на список чатов
        if (isActiveChat) {
          navigate('/messenger', { replace: true });
        }
        
        // Перезагружаем список чатов с сервера для получения актуальных данных
        loadChats().catch(err => {
          console.error('Error reloading chats after deletion:', err);
        });
      };

      socketService.onChatDeleted(handleChatDeleted);

      return () => {
        socketService.off('chat-deleted');
      };
    }, [user, chatId, activeChat, navigate, loadChats]);

    // Подписка на новые сообщения в активном чате
    useEffect(() => {
    if (!chatId || !user) return;

    socketService.joinChat(Number(chatId));

    const handleNewMessage = (message: any) => {
        console.log('Новое сообщение получено в активном чате:', message);
        setMessages((prev) => [...prev, message]);

        // Если сообщение от другого пользователя, автоматически отмечаем как прочитанное
        if (message.senderId !== user.id) {
            chatAPI.markAsRead(Number(chatId))
                .then(() => {
                    console.log('Сообщение автоматически отмечено как прочитанное');
                    // Обновляем список чатов для обновления счетчика непрочитанных
                    loadChats();
                })
                .catch(err => console.error('Error auto-marking as read:', err));
        }
    };

    const handleJoinChatError = (error: any) => {
        console.error('Ошибка присоединения к чату:', error);
        toast.error('Не удалось присоединиться к чату');
    };

    socketService.onNewMessage(handleNewMessage);
    socketService.onJoinChatError(handleJoinChatError);

    return () => {
        socketService.leaveChat(Number(chatId));
        socketService.off('new-message');
        socketService.off('notification-unread');
        socketService.off('messages-read');
        socketService.off('join-chat-error');
    };
    }, [chatId, user]);

  const loadChat = async (id: number) => {
    try {
      const chat = await chatAPI.getChatById(id);
      setActiveChat(chat);
      setMessages(chat.messages || []);
      
      // Отметить сообщения как прочитанные
      await chatAPI.markAsRead(id);
      
      // Обновить список чатов
      loadChats();
    } catch (error: any) {
      console.error('Error loading chat:', error);
      // Если чат не найден (404), перенаправляем на список чатов
      if (error.response?.status === 404) {
        setActiveChat(null);
        setMessages([]);
        navigate('/messenger', { replace: true });
        toast.error('Чат не найден');
      } else {
        toast.error('Ошибка при загрузке чата');
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !activeChat || !user) return;

    const messageText = newMessage.trim();
    setSending(true);

    try {
      // Попытка отправить через WebSocket
      if (socketService.isConnected()) {
        // Отправляем через WebSocket
        socketService.sendMessage(activeChat.id, messageText);

        // Подписываемся на ошибку однократно
        const errorHandler = (error: any) => {
          console.error('Ошибка отправки сообщения:', error);
          toast.error('Не удалось отправить сообщение');
          socketService.off('message-error');
          setSending(false);
        };

        socketService.onMessageError(errorHandler);

        // Очищаем поле только после успешной отправки (когда получим new-message с нашим senderId)
        // Сообщение появится через обработчик onNewMessage из useEffect
        // Просто очистим поле и состояние через небольшую задержку
        setTimeout(() => {
          setNewMessage('');
          socketService.off('message-error');
          setSending(false);
        }, 300);

        console.log('Сообщение отправлено через WebSocket');
      } else {
        // Fallback на HTTP если WebSocket не подключен
        console.log('WebSocket отключен, используем HTTP API');
        const message = await chatAPI.sendMessage(activeChat.id, messageText);
        setMessages([...messages, message]);
        setNewMessage('');
        setSending(false);
      }

      // Обновить список чатов
      loadChats();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Ошибка при отправке сообщения');
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const handleDeleteChat = (chatId: number) => {
    setDeleteConfirmChatId(chatId);
  };

  const confirmDeleteChat = async () => {
    if (!deleteConfirmChatId) return;

    try {
      await chatAPI.deleteChat(deleteConfirmChatId);
      toast.success('Чат успешно удален');
      
      // Очищаем состояние перед перенаправлением
      setActiveChat(null);
      setMessages([]);
      
      // Если удаленный чат был активным, перенаправляем на список чатов
      const currentChatId = chatId ? Number(chatId) : null;
      if (currentChatId === deleteConfirmChatId || (activeChat && activeChat.id === deleteConfirmChatId)) {
        navigate('/messenger', { replace: true });
      }
      
      // Обновляем список чатов
      loadChats();
      setDeleteConfirmChatId(null);
    } catch (error: any) {
      console.error('Error deleting chat:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Ошибка при удалении чата';
      toast.error(errorMessage);
      setDeleteConfirmChatId(null);
    }
  };

  if (!user) {
    return null;
  }

  // Определяем собеседника
  const otherUser = activeChat
    ? activeChat.user1Id === user.id ? activeChat.user2 : activeChat.user1
    : null;

  return (
    <div className="h-[calc(100vh-64px)] bg-dark-bg flex">
      {/* Список чатов */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-dark-card flex flex-col ${chatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="h-[73px] px-4 border-b border-dark-card flex items-center">
          <h1 className="text-2xl font-bold text-white">{t('messenger.title')}</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 text-accent-cyan animate-spin" />
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <UserIcon className="h-16 w-16 text-gray-600 mb-4" />
              <p className="text-gray-400 mb-2">{t('messenger.noChats')}</p>
              <p className="text-sm text-gray-500">
                {t('messenger.startChatting')}
              </p>
            </div>
          ) : (
            chats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                currentUser={user}
                isActive={chat.id === Number(chatId)}
                onDelete={handleDeleteChat}
              />
            ))
          )}
        </div>
      </div>

      {/* Окно чата */}
      <div className={`flex-1 flex flex-col ${!chatId ? 'hidden md:flex' : 'flex'}`}>
        {activeChat && otherUser ? (
          <>
            {/* Шапка чата */}
            <div className="h-[73px] px-4 border-b border-dark-card flex items-center gap-3">
              <button
                onClick={() => navigate('/messenger')}
                className="md:hidden p-2 hover:bg-dark-card rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </button>
              
              {otherUser.avatar ? (
                <img
                  src={getImageUrl(otherUser.avatar)}
                  alt={otherUser.username}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-accent-cyan" />
                </div>
              )}
              
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {otherUser.username}
                </h2>
                {otherUser.role && (
                  <p className="text-sm text-gray-400">
                    {otherUser.role === 'employer' ? t('messenger.employer') : t('messenger.jobSeeker')}
                  </p>
                )}
              </div>
            </div>

            {/* Сообщения */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-dark-surface">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">{t('messenger.startConversation')}</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <MessageItem
                      key={message.id}
                      message={message}
                      isOwn={message.senderId === user.id}
                      currentUser={user}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Поле ввода */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-dark-card">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('messenger.typeMessage')}
                  className="flex-1 px-4 py-4 bg-dark-card border border-dark-surface rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2 bg-accent-cyan hover:bg-accent-cyan/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {sending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <UserIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">{t('messenger.selectChat')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно подтверждения удаления */}
      {deleteConfirmChatId && (
        <div 
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-[100] p-4"
          onClick={() => setDeleteConfirmChatId(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Card className="max-w-md w-full">
              <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                {t('messenger.deleteConfirm')}
              </h3>
              <p className="text-gray-300 mb-6">
                {t('messenger.deleteConfirmText')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDeleteChat}
                  className="btn-primary flex-1"
                >
                  {t('messenger.delete')}
                </button>
                <button
                  onClick={() => setDeleteConfirmChatId(null)}
                  className="btn-secondary flex-1"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessengerPage;