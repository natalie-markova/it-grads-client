import type { InterviewMessage } from '../../types';

interface ChatMessageProps {
  message: InterviewMessage;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAI = message.role === 'assistant';

  return (
    <div style={{ marginBottom: '10px', textAlign: isAI ? 'left' : 'right' }}>
      <div style={{
        display: 'inline-block',
        padding: '10px',
        borderRadius: '8px',
        maxWidth: '70%',
        background: isAI ? '#f0f0f0' : '#007bff',
        color: isAI ? '#000' : '#fff'
      }}>
        <strong>{isAI ? 'AI:' : 'Вы:'}</strong>
        <p style={{ margin: 0 }}>{message.content}</p>
      </div>
    </div>
  );
}