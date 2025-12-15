import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, User as UserIcon, Loader2, MessageCircle } from 'lucide-react';
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

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadChats();
  }, [user, loadChats, navigate]);

  useEffect(() => {
    if (chatId) {
      loadChat(Number(chatId));
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

    useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('accessToken') || '';
    
    if (token) {
        socketService.connect(token);
    }

    return () => {
        socketService.disconnect();
    };
    }, [user]);

    useEffect(() => {
      if (!user) return;

      const handleNotificationUnread = (data: any) => {
        console.log('📬 Получено уведомление о новом сообщении:', data);
        loadChats();
      };

      const handleNewMessageGlobal = (message: any) => {
        console.log('📨 Глобальное новое сообщение получено:', message);
        loadChats();
      };

      const handleChatCreated = (data: { chat: any }) => {
        console.log('💬 Создан новый чат:', data.chat);
        loadChats();
      };

      const handleMessagesRead = (data: { chatId: number }) => {
        console.log('✅ Сообщения отмечены как прочитанные в чате:', data.chatId);
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
      };
    }, [user, loadChats]);

    useEffect(() => {
      if (!user) return;

      const handleChatDeleted = (data: { chatId: number }) => {
        console.log('Чат удален другим пользователем:', data.chatId);

        const currentChatId = chatId ? Number(chatId) : null;
        const isActiveChat = (currentChatId === data.chatId) || (activeChat && activeChat.id === data.chatId);

        setActiveChat(null);
        setMessages([]);

        if (isActiveChat) {
          navigate('/messenger', { replace: true });
        }

        loadChats().catch(err => {
          console.error('Error reloading chats after deletion:', err);
        });
      };

      socketService.onChatDeleted(handleChatDeleted);

      return () => {
        socketService.off('chat-deleted');
      };
    }, [user, chatId, activeChat, navigate, loadChats]);

    useEffect(() => {
    if (!chatId || !user) return;

    socketService.joinChat(Number(chatId));

    const handleNewMessage = (message: any) => {
        console.log('Новое сообщение получено в активном чате:', message);
        setMessages((prev) => [...prev, message]);

        if (message.senderId !== user.id) {
            chatAPI.markAsRead(Number(chatId))
                .then(() => {
                    console.log('Сообщение автоматически отмечено как прочитанное');
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

      await chatAPI.markAsRead(id);

      loadChats();
    } catch (error: any) {
      console.error('Error loading chat:', error);
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
      if (socketService.isConnected()) {
        socketService.sendMessage(activeChat.id, messageText);

        const errorHandler = (error: any) => {
          console.error('Ошибка отправки сообщения:', error);
          toast.error('Не удалось отправить сообщение');
          socketService.off('message-error');
          setSending(false);
        };

        socketService.onMessageError(errorHandler);

        setTimeout(() => {
          setNewMessage('');
          socketService.off('message-error');
          setSending(false);
        }, 300);

        console.log('Сообщение отправлено через WebSocket');
      } else {
        console.log('WebSocket отключен, используем HTTP API');
        const message = await chatAPI.sendMessage(activeChat.id, messageText);
        setMessages([...messages, message]);
        setNewMessage('');
        setSending(false);
      }

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

      setActiveChat(null);
      setMessages([]);

      const currentChatId = chatId ? Number(chatId) : null;
      if (currentChatId === deleteConfirmChatId || (activeChat && activeChat.id === deleteConfirmChatId)) {
        navigate('/messenger', { replace: true });
      }

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

  const otherUser = activeChat
    ? activeChat.user1Id === user.id ? activeChat.user2 : activeChat.user1
    : null;

  return (
    <div className="h-[calc(100vh-64px)] bg-dark-bg flex">
      <div className={`w-full md:w-80 lg:w-96 border-r border-dark-card flex flex-col bg-dark-bg ${chatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="h-[73px] px-4 border-b border-dark-card flex items-center bg-gradient-to-r from-dark-surface to-dark-bg">
          <MessageCircle className="h-6 w-6 text-accent-cyan mr-3 animate-pulse" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{t('messenger.title')}</h1>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
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
            chats.map((chat, index) => (
              <div
                key={chat.id}
                className="animate-fadeSlideIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ChatListItem
                  chat={chat}
                  currentUser={user}
                  isActive={chat.id === Number(chatId)}
                  onDelete={handleDeleteChat}
                />
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col ${!chatId ? 'hidden md:flex' : 'flex'}`}>
        {activeChat && otherUser ? (
          <>
            <div className="h-[73px] px-4 border-b border-dark-card flex items-center gap-3 bg-gradient-to-r from-dark-surface to-dark-bg">
              <button
                onClick={() => navigate('/messenger')}
                className="md:hidden p-2 hover:bg-dark-card rounded-lg transition-all duration-300 hover:scale-110"
              >
                <ArrowLeft className="h-5 w-5 text-accent-cyan" />
              </button>

              <div className="relative">
                {otherUser.avatar ? (
                  <img
                    src={getImageUrl(otherUser.avatar)}
                    alt={otherUser.username}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-accent-cyan/30 shadow-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-cyan/30 to-accent-blue/30 flex items-center justify-center ring-2 ring-accent-cyan/30 shadow-lg">
                    <UserIcon className="h-5 w-5 text-accent-cyan" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-surface" />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">
                  {otherUser.username}
                </h2>
                {otherUser.role && (
                  <p className="text-sm text-accent-cyan/70">
                    {otherUser.role === 'employer' ? t('messenger.employer') : t('messenger.jobSeeker')}
                  </p>
                )}
              </div>
            </div>

            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-dark-surface">
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

            <form onSubmit={handleSendMessage} className="p-4 border-t border-dark-card bg-dark-surface">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t('messenger.typeMessage')}
                  className="flex-1 px-5 py-4 bg-dark-card border border-dark-surface rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent transition-all duration-300 shadow-lg shadow-black/10"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-6 py-4 bg-gradient-to-r from-accent-cyan to-accent-blue hover:from-accent-cyan/90 hover:to-accent-blue/90 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-accent-cyan/20 hover:shadow-xl hover:shadow-accent-cyan/30 hover:scale-105 disabled:scale-100 disabled:shadow-none"
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
          <div className="flex items-center justify-center h-full bg-dark-surface relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03]">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-cyan rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-blue rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
            </div>

            <div className="text-center relative z-10 max-w-md px-8">
              <div className="relative w-48 h-48 mx-auto mb-8">
                <div className="absolute top-8 left-0 w-32 h-20 bg-gradient-to-br from-dark-card to-dark-surface rounded-2xl rounded-bl-sm border border-dark-surface shadow-lg animate-float" style={{ animationDelay: '0s' }}>
                  <div className="p-3">
                    <div className="h-2 bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-2 bg-gray-700 rounded w-1/2" />
                  </div>
                </div>

                <div className="absolute top-20 right-0 w-36 h-24 bg-gradient-to-br from-accent-cyan to-accent-blue rounded-2xl rounded-br-sm shadow-lg shadow-accent-cyan/20 animate-float" style={{ animationDelay: '0.5s' }}>
                  <div className="p-3">
                    <div className="h-2 bg-white/40 rounded w-2/3 mb-2" />
                    <div className="h-2 bg-white/40 rounded w-full mb-2" />
                    <div className="h-2 bg-white/40 rounded w-3/4" />
                  </div>
                </div>

                <MessageCircle className="absolute top-0 right-8 h-8 w-8 text-accent-cyan/30 animate-float" style={{ animationDelay: '1s', animationDuration: '5s' }} />
                <div className="absolute bottom-0 left-8 h-6 w-6 rounded-full bg-accent-blue/20 animate-float" style={{ animationDelay: '1.5s', animationDuration: '4s' }} />
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {t('messenger.selectChat')}
                </h2>
                <p className="text-gray-400 text-sm">
                  Выберите из списка или создайте новый чат,<br />чтобы начать общение
                </p>
              </div>

              <div className="flex justify-center gap-2 mt-6">
                <div className="w-2 h-2 rounded-full bg-accent-cyan/50 animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-2 h-2 rounded-full bg-accent-cyan/50 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 rounded-full bg-accent-cyan/50 animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

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