import { Link } from 'react-router-dom';
import { MessageCircle, User as UserIcon, Trash2 } from 'lucide-react';
import type { Chat, User } from '../../../types';
import { getImageUrl } from '../../../utils/image.utils';

interface ChatListItemProps {
  chat: Chat;
  currentUser: User;
  isActive?: boolean;
  onDelete?: (chatId: number) => void;
}

const ChatListItem = ({ chat, currentUser, isActive, onDelete }: ChatListItemProps) => {
  // Определяем собеседника (не текущего пользователя)
  const otherUser = chat.user1Id === currentUser.id ? chat.user2 : chat.user1;

  // Последнее сообщение
  const lastMessage = chat.messages?.[0];

  // Форматирование времени
  const formattedTime = chat.lastMessageAt
    ? new Date(chat.lastMessageAt).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    : '';

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(chat.id);
    }
  };

  // Определяем наличие непрочитанных сообщений
  const hasUnread = chat.unreadCount && chat.unreadCount > 0;

  return (
    <Link
      to={`/messenger/${chat.id}`}
      className={`group block p-4 border-b border-dark-card transition-all duration-300 relative overflow-hidden ${
        isActive
          ? 'bg-gradient-to-r from-accent-cyan/10 to-accent-blue/10 border-l-2 border-l-accent-cyan'
          : 'hover:bg-dark-card/70 hover:translate-x-1'
      }`}
    >
      {/* Анимированный фон при hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start gap-3 relative z-10">
        {/* Avatar с анимированным кольцом */}
        <div className="flex-shrink-0 relative group/avatar">
          {/* Анимированное кольцо вокруг аватара */}
          <div className={`absolute -inset-1 rounded-full bg-gradient-to-r from-accent-cyan to-accent-blue opacity-0 group-hover:opacity-100 transition-all duration-500 blur-sm ${hasUnread ? 'animate-pulse opacity-50' : ''}`} />

          {otherUser?.avatar ? (
            <img
              src={getImageUrl(otherUser.avatar)}
              alt={otherUser.username}
              className="relative w-12 h-12 rounded-full object-cover ring-2 ring-dark-card group-hover:ring-accent-cyan/50 transition-all duration-300 group-hover/avatar:scale-110 shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-accent-cyan/20 to-accent-blue/20 flex items-center justify-center ring-2 ring-dark-card group-hover:ring-accent-cyan/50 transition-all duration-300 group-hover/avatar:scale-110 shadow-lg">
              <UserIcon className="h-6 w-6 text-accent-cyan" />
            </div>
          )}

          {/* Индикатор онлайн статуса с анимацией */}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-bg shadow-lg shadow-green-500/50">
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
          </div>
        </div>

        {/* Chat info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className={`font-semibold truncate transition-all duration-300 ${
              isActive
                ? 'text-accent-cyan'
                : 'text-white group-hover:text-accent-cyan'
            }`}>
              {otherUser?.username || 'Пользователь'}
            </h3>
            {formattedTime && (
              <span className={`text-xs ml-2 transition-colors duration-300 ${
                hasUnread ? 'text-accent-cyan font-medium' : 'text-gray-500'
              }`}>
                {formattedTime}
              </span>
            )}
          </div>

          {lastMessage ? (
            <p className={`text-sm truncate transition-colors duration-300 ${
              hasUnread ? 'text-gray-300 font-medium' : 'text-gray-400'
            }`}>
              {lastMessage.content}
            </p>
          ) : (
            <p className="text-sm text-gray-500 italic">Нет сообщений</p>
          )}
        </div>

        {/* Unread badge и delete button */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {hasUnread && (
            <span className="relative inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-dark-bg bg-gradient-to-r from-accent-cyan to-accent-blue rounded-full shadow-lg shadow-accent-cyan/30 animate-bounce" style={{ animationDuration: '2s' }}>
              {/* Пульсирующий эффект */}
              <span className="absolute inset-0 rounded-full bg-accent-cyan animate-ping opacity-40" />
              <span className="relative">{chat.unreadCount > 9 ? '9+' : chat.unreadCount}</span>
            </span>
          )}
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
              title="Удалить чат"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Нижняя линия при active */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-cyan via-accent-blue to-transparent" />
      )}
    </Link>
  );
};

export default ChatListItem;