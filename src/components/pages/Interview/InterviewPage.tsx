import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ChatMessage from '../../interview/ChatMessage';
import ChatInput from '../../interview/ChatInput';
import { interviewAPI } from '../../../utils/interview.api';
import type { InterviewMessage } from '../../../types';
import { MessageCircle, Loader2, CheckCircle, XCircle } from 'lucide-react';
import Section from '../../ui/Section';
import Card from '../../ui/Card';
import { useScrollAnimation } from '../../../hooks/useScrollAnimation';

export default function InterviewPage() {
  const { t, i18n } = useTranslation();
  useScrollAnimation();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, []);

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
      setError(t('aiInterview.errors.loadSessionFailed'));
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
        content,
        i18n.language
      );

      setMessages(prev => [...prev, userMessage, aiMessage]);
    } catch (err) {
      setError(t('aiInterview.errors.sendMessageFailed'));
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCompleteInterview = async () => {
    if (!sessionId) return;

    try {
      await interviewAPI.completeSession(Number(sessionId), i18n.language);
      navigate(`/interview/ai/${sessionId}/results`);
    } catch (err) {
      setError(t('aiInterview.errors.completeFailed'));
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-dark-bg min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="h-8 w-8 animate-spin text-accent-cyan" />
          <span className="text-xl">{t('aiInterview.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-bg min-h-screen py-8">
      <Section
        title={t('aiInterview.title')}
        subtitle={t('aiInterview.subtitle')}
        className="bg-dark-bg py-0 scroll-animate-item"
      >
        <Card className="max-w-4xl mx-auto scroll-animate-item" hover={false}>
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2 text-red-400">
              <XCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-6 bg-dark-surface rounded-lg border border-dark-card overflow-hidden">
            <div className="p-4 border-b border-dark-card bg-dark-bg/50 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-accent-cyan" />
              <span className="font-medium text-white">{t('aiInterview.dialogWithInterviewer')}</span>
              <span className="ml-auto text-sm text-gray-400">
                {messages.length} {t('aiInterview.messages')}
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
                  <p>{t('aiInterview.startDialog')}</p>
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

          <ChatInput onSend={handleSendMessage} disabled={isSending} />

          <div className="flex justify-between items-center pt-6 border-t border-dark-surface mt-6">
            <button
              onClick={() => navigate('/interview/ai/setup')}
              className="btn-secondary flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              {t('aiInterview.cancelInterview')}
            </button>

            <button
              onClick={handleCompleteInterview}
              className="btn-primary flex items-center gap-2"
              disabled={messages.length < 2}
            >
              <CheckCircle className="h-4 w-4" />
              {t('aiInterview.finishAndGetResults')}
            </button>
          </div>
        </Card>
      </Section>
    </div>
  );
}