import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatMessage from '../../interview/ChatMessage';
import ChatInput from '../../interview/ChatInput';
import { interviewAPI } from '../../../utils/interview.api';
import type { InterviewMessage } from '../../../types';

export default function InterviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Автоскролл к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Загрузка истории сообщений при монтировании
  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    if (!sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const session = await interviewAPI.getSession(Number(sessionId));
      
      if (session.messages) {
        setMessages(session.messages);
      }
    } catch (err) {
      setError('Не удалось загрузить сессию');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!sessionId) return;

    setIsSending(true);
    setError(null);

    try {
      const { userMessage, aiMessage } = await interviewAPI.sendMessage(
        Number(sessionId),
        content
      );

      // Добавляем оба сообщения в историю
      setMessages(prev => [...prev, userMessage, aiMessage]);
    } catch (err) {
      setError('Не удалось отправить сообщение');
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCompleteInterview = async () => {
    if (!sessionId) return;

    try {
      await interviewAPI.completeSession(Number(sessionId));
      navigate(`/interview/${sessionId}/results`);
    } catch (err) {
      setError('Не удалось завершить интервью');
      console.error(err);
    }
  };

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Интервью</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* История сообщений */}
      <div style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '20px',
        height: '500px',
        overflowY: 'scroll',
        marginBottom: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <ChatInput onSend={handleSendMessage} disabled={isSending} />

      {/* Кнопки управления */}
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleCompleteInterview}>
          Завершить интервью
        </button>
        <button onClick={() => navigate('/interview/setup')} style={{ marginLeft: '10px' }}>
          Прервать
        </button>
      </div>
    </div>
  );
}