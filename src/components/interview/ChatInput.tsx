import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-3 items-end">
      <div className="flex-1">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Введите ваш ответ... (Enter - отправить, Shift+Enter - новая строка)"
          rows={3}
          disabled={disabled}
          className="w-full px-4 py-3 bg-dark-surface border border-dark-card rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:border-transparent resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={disabled || !message.trim()}
        className="btn-primary flex items-center gap-2 h-[88px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {disabled ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
        {disabled ? 'Отправка...' : 'Отправить'}
      </button>
    </div>
  );
}