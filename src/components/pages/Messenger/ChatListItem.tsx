import { Link } from 'react-router-dom';
import { MessageCircle, User as UserIcon } from 'lucide-react';
import type { Chat, User } from '../../../types';

interface ChatListItemProps {
  chat: Chat;
  currentUser: User;
  isActive?: boolean;
}

const ChatListItem = ({ chat, currentUser, isActive }: ChatListItemProps) => {
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

  return (
    <Link
      to={`/messenger/${chat.id}`}
      className={`block p-4 border-b border-dark-card hover:bg-dark-card transition-colors ${
        isActive ? 'bg-dark-card' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {otherUser?.avatar ? (
            <img
              src={otherUser.avatar}
              alt={otherUser.username}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-accent-cyan/20 flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-accent-cyan" />
            </div>
          )}
        </div>

        {/* Chat info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-white font-semibold truncate">
              {otherUser?.username || 'Пользователь'}
            </h3>
            {formattedTime && (
              <span className="text-xs text-gray-500 ml-2">{formattedTime}</span>
            )}
          </div>
          
          {lastMessage ? (
            <p className="text-sm text-gray-400 truncate">
              {lastMessage.content}
            </p>
          ) : (
            <p className="text-sm text-gray-500 italic">Нет сообщений</p>
          )}
        </div>

        {/* Unread badge */}
        {chat.unreadCount && chat.unreadCount > 0 && (
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-accent-cyan rounded-full">
              {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ChatListItem;