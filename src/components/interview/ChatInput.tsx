import { useState } from 'react';

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
    <div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Введите ваш ответ..."
        rows={3}
        disabled={disabled}
        style={{ width: '100%', padding: '10px', color: '#000' }}
      />
      <button onClick={handleSubmit} disabled={disabled || !message.trim()}>
        {disabled ? 'Отправка...' : 'Отправить'}
      </button>
    </div>
  );
}