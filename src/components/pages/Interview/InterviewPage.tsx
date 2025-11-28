import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatMessage from '../../interview/ChatMessage';
import ChatInput from '../../interview/ChatInput';
import { interviewAPI } from '../../../utils/interview.api';
import type { InterviewMessage } from '../../../types';
import { MessageCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import Section from '../../ui/Section';
import Card from '../../ui/Card';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

export default function InterviewPage() {
  useScrollAnimation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Автоскролл только при первой загрузке
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, []);

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
      navigate(`/interview/ai/${sessionId}/results`);
    } catch (err) {
      setError('Не удалось завершить интервью');
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-dark-bg min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="h-8 w-8 animate-spin text-accent-cyan" />
          <span className="text-xl">Загрузка интервью...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <Section
        title="AI Интервью"
        subtitle="Отвечайте на вопросы интервьюера. Ваши ответы будут проанализированы"
        className="bg-dark-bg py-0 scroll-animate-item"
      >
        <Card className="max-w-4xl mx-auto scroll-animate-item" hover={false}>
          {/* Сообщения об ошибках */}
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2 text-red-400">
              <XCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {/* История сообщений */}
          <div className="mb-6 bg-dark-surface rounded-lg border border-dark-card overflow-hidden">
            <div className="p-4 border-b border-dark-card bg-dark-bg/50 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-accent-cyan" />
              <span className="font-medium text-white">Диалог с интервьюером</span>
              <span className="ml-auto text-sm text-gray-400">
                {messages.length} сообщений
              </span>
            </div>

            <div
              className="p-6 h-[500px] overflow-y-auto"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(6, 182, 212, 0.2) #0a0e1a'
              }}
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>Начните диалог с интервьюером</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
          </div>

          {/* Поле ввода */}
          <ChatInput onSend={handleSendMessage} disabled={isSending} />

          {/* Кнопки управления */}
          <div className="flex justify-between items-center pt-6 border-t border-dark-surface mt-6">
            <button
              onClick={() => navigate('/interview/ai/setup')}
              className="btn-secondary flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Прервать интервью
            </button>

            <button
              onClick={handleCompleteInterview}
              className="btn-primary flex items-center gap-2"
              disabled={messages.length < 2}
            >
              <CheckCircle className="h-4 w-4" />
              Завершить и получить результаты
            </button>
          </div>
        </Card>
      </Section>
    </div>
  );
}