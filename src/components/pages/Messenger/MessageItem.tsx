import { User } from '../../../types';
import type { Message } from '../../../types';
import { getImageUrl } from '../../../utils/image.utils';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  currentUser: User;
}

const MessageItem = ({ message, isOwn }: MessageItemProps) => {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && message.sender && (
          <div className="flex items-center gap-2 mb-1">
            {message.sender.avatar ? (
              <img
                src={getImageUrl(message.sender.avatar)}
                alt={message.sender.username}
                className="w-6 h-6 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                <span className="text-xs text-accent-cyan">
                  {message.sender.username?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <span className="text-sm text-gray-400">{message.sender.username}</span>
          </div>
        )}
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwn
              ? 'bg-accent-cyan text-white'
              : 'bg-dark-card text-gray-200'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          <div className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
            {formattedTime}
            {isOwn && (
              <span className="ml-2">
                {message.isRead ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;