import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Volume2, VolumeX, Award, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import { $api } from '../../../utils/axios.instance';
import toast from 'react-hot-toast';
import Card from '../../ui/Card';
import Section from '../../ui/Section';

interface InterviewSession {
  id: number;
  interviewerPersona: string;
  position: string;
  status: string;
  currentQuestionIndex: number;
}

interface Message {
  id: number;
  role: 'assistant' | 'user';
  content: string;
}

interface FeedbackResult {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  duration: number;
}

const POSITION_KEYS = [
  'frontend',
  'backend',
  'fullstack',
  'react',
  'nodejs',
  'python',
  'java',
  'devops',
  'qa',
  'dataScientist',
  'dataAnalyst',
  'iosDev',
  'androidDev',
  'uiux',
  'productManager',
  'projectManager',
  'sysAdmin',
  'businessAnalyst',
  'mlEngineer',
  'techWriter'
];

const AudioInterview = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<'setup' | 'interview' | 'feedback'>('setup');
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');

  // Audio controls
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Setup form
  const [persona, setPersona] = useState('friendly_tech');
  const [position, setPosition] = useState('');

  // Feedback
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);

  // Sending state to prevent double-clicks
  const [isSending, setIsSending] = useState(false);

  // Web Speech API for recognition
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isListeningRef = useRef(false); // Ref для отслеживания состояния
  const confirmedTextRef = useRef<string>(''); // Храним подтверждённый текст
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Для отмены таймера перезапуска
  const isRestartingRef = useRef(false); // Флаг что идёт перезапуск

  // Инициализация Audio один раз
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsSpeaking(false);
    audioRef.current.onerror = () => setIsSpeaking(false);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Инициализация Speech Recognition один раз (без зависимостей от языка)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let newFinalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (newFinalTranscript) {
        confirmedTextRef.current = (confirmedTextRef.current + ' ' + newFinalTranscript).trim();
        setCurrentMessage(confirmedTextRef.current);
      } else if (interimTranscript) {
        setCurrentMessage((confirmedTextRef.current + ' ' + interimTranscript).trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);

      // Критические ошибки - полностью останавливаем
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        isListeningRef.current = false;
        setIsListening(false);
        toast.error(t('toasts.micAccessDenied'));
        return;
      }

      if (event.error === 'network') {
        isListeningRef.current = false;
        setIsListening(false);
        toast.error(t('toasts.networkError'));
        return;
      }

      // Остальные ошибки (aborted, no-speech, audio-capture) - игнорируем
      // onend сам перезапустит если нужно
    };

    recognition.onend = () => {
      // Если это был запланированный перезапуск - игнорируем
      if (isRestartingRef.current) {
        isRestartingRef.current = false;
        return;
      }

      // Если пользователь всё ещё хочет слушать - перезапускаем
      if (isListeningRef.current) {
        // Отменяем предыдущий таймер если есть
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
        }

        restartTimeoutRef.current = setTimeout(() => {
          if (isListeningRef.current && recognitionRef.current) {
            try {
              isRestartingRef.current = true;
              recognitionRef.current.start();
            } catch (e: any) {
              // Если уже запущен - это нормально
              if (e.message?.includes('already started')) {
                isRestartingRef.current = false;
                return;
              }
              console.error('Failed to restart recognition:', e);
              isListeningRef.current = false;
              setIsListening(false);
            }
          }
        }, 150);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []); // Пустой массив зависимостей!

  // Обновляем язык recognition при смене языка (без пересоздания)
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = i18n.language === 'en' ? 'en-US' : 'ru-RU';
    }
  }, [i18n.language]);

  // Маппинг персоны на гендер голоса
  const personaGender: Record<string, 'male' | 'female'> = {
    strict_hr: 'female',
    friendly_tech: 'male',
    direct_ceo: 'male'
  };

  // Синтез речи через Yandex SpeechKit (без браузерного fallback)
  // Используем useRef для хранения voiceId, чтобы избежать проблем с зависимостями useCallback
  const voiceIdRef = useRef<string | null>(null);

  const speak = useCallback(async (text: string) => {
    if (!audioEnabled) return;
    setIsSpeaking(true);

    try {
      // Передаём гендер в зависимости от выбранной персоны
      const gender = personaGender[persona] || 'male';
      // Определяем язык для TTS
      const lang = i18n.language === 'en' ? 'en' : 'ru';

      // Если у нас уже есть выбранный голос для этой сессии - используем его
      // Иначе передаём только gender для первого вызова
      const requestData: { text: string; gender?: string; voiceId?: string; lang?: string } = { text, lang };

      if (voiceIdRef.current) {
        // Используем сохранённый голос для консистентности в рамках сессии
        requestData.voiceId = voiceIdRef.current;
      } else {
        // Первый вызов - передаём gender, сервер выберет случайный голос
        requestData.gender = gender;
      }

      const response = await $api.post('/interviews/tts', requestData);

      if (response.data.audio && audioRef.current) {
        // Сохраняем voiceId для использования в следующих запросах
        if (response.data.voice && !voiceIdRef.current) {
          voiceIdRef.current = response.data.voice.id;
        }

        // Декодируем base64 аудио и воспроизводим
        const audioData = `data:${response.data.format};base64,${response.data.audio}`;
        audioRef.current.src = audioData;
        audioRef.current.play().catch((err) => {
          console.error('Audio playback error:', err);
          setIsSpeaking(false);
          toast.error(t('audioInterview.audioPlaybackError'));
        });
      } else {
        setIsSpeaking(false);
        toast.error(t('audioInterview.ttsUnavailable'));
      }
    } catch (error) {
      console.error('Yandex TTS error:', error);
      setIsSpeaking(false);
      toast.error(t('audioInterview.ttsError'));
    }
  }, [audioEnabled, t, persona, i18n.language]);

  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error(t('audioInterview.speechNotSupported'));
      return;
    }

    // Сбрасываем текст
    confirmedTextRef.current = '';
    setCurrentMessage('');

    // Отменяем любой pending таймер перезапуска
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    // Устанавливаем флаги ПЕРЕД запуском
    isListeningRef.current = true;
    isRestartingRef.current = false;
    setIsListening(true);

    try {
      recognitionRef.current.start();
    } catch (e: any) {
      // Если уже запущен - это нормально
      if (e.message?.includes('already started')) {
        return;
      }
      console.error('Failed to start recognition:', e);
      isListeningRef.current = false;
      setIsListening(false);
    }
  };

  const stopListening = () => {
    // Сначала сбрасываем все флаги
    isListeningRef.current = false;
    isRestartingRef.current = false;

    // Отменяем таймер перезапуска
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    setIsListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore - может быть уже остановлен
      }
    }
  };

  const startInterview = async () => {
    if (!position) {
      toast.error(t('audioInterview.selectPositionError'));
      return;
    }

    try {
      // Сбрасываем голос для новой сессии
      voiceIdRef.current = null;

      const response = await $api.post('/interviews/audio', {
        interviewerPersona: persona,
        position: t(`audioInterview.positions.${position}`),
        lang: i18n.language === 'en' ? 'en' : 'ru'
      });

      setSession(response.data.session);
      setMessages([response.data.firstMessage]);
      setStep('interview');

      speak(response.data.firstMessage.content);

      toast.success(t('audioInterview.interviewStarted'));
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error(t('audioInterview.interviewCreateError'));
    }
  };

  const sendAnswer = async () => {
    if (!currentMessage.trim() || !session || isSending) return;

    // Сохраняем ответ и сразу очищаем поле ввода
    const answerToSend = currentMessage.trim();
    setCurrentMessage('');
    setIsSending(true);

    // Останавливаем запись если она активна
    if (isListening) {
      stopListening();
    }

    try {
      const response = await $api.post(`/interviews/audio/${session.id}/answer`, {
        content: answerToSend
      });

      setMessages(prev => [...prev, response.data.userMessage, response.data.aiMessage]);

      // Speak next question
      speak(response.data.aiMessage.content);

      // Update session
      setSession({
        ...session,
        currentQuestionIndex: response.data.questionNumber
      });

      // Check if interview is complete
      if (response.data.isLastQuestion) {
        setTimeout(() => {
          completeInterview();
        }, 3000);
      }
    } catch (error) {
      console.error('Error sending answer:', error);
      toast.error(t('audioInterview.answerSendError'));
      // Восстанавливаем текст при ошибке
      setCurrentMessage(answerToSend);
    } finally {
      setIsSending(false);
    }
  };

  const completeInterview = async () => {
    if (!session) return;

    try {
      const response = await $api.post(`/interviews/audio/${session.id}/complete`);
      setFeedback(response.data);
      setStep('feedback');

      speak(response.data.feedback);
    } catch (error) {
      console.error('Error completing interview:', error);
      toast.error(t('audioInterview.interviewCompleteError'));
    }
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (audioEnabled) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsSpeaking(false);
    }
  };

  const personaInfo: Record<string, { icon: string; gender: 'male' | 'female' }> = {
    strict_hr: { icon: '👔', gender: 'female' },
    friendly_tech: { icon: '👨‍💻', gender: 'male' },
    direct_ceo: { icon: '💼', gender: 'male' }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Section title={`🎙️ ${t('audioInterview.title')}`} subtitle={t('audioInterview.subtitle')} className="bg-dark-bg py-0 mb-8" />

        {/* Setup Step */}
        {step === 'setup' && (
          <Card>
            <h2 className="text-2xl font-bold text-white mb-6">{t('audioInterview.setupTitle')}</h2>

            {/* Position Select */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">{t('audioInterview.desiredPosition')}</label>
              <div className="relative">
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-surface border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-accent-cyan focus:border-transparent outline-none appearance-none cursor-pointer"
                >
                  <option value="">{t('audioInterview.selectPosition')}</option>
                  {POSITION_KEYS.map((key) => (
                    <option key={key} value={key}>{t(`audioInterview.positions.${key}`)}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Persona Selection */}
            <div className="mb-8">
              <label className="block text-gray-300 mb-3">{t('audioInterview.chooseInterviewer')}</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(personaInfo).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => setPersona(key)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      persona === key
                        ? 'border-accent-cyan bg-accent-cyan/20 text-white'
                        : 'border-gray-700 bg-dark-surface text-gray-300 hover:border-accent-cyan/50 hover:bg-dark-card'
                    }`}
                  >
                    <div className="text-4xl mb-2">{info.icon}</div>
                    <div className="font-semibold mb-1">{t(`audioInterview.personas.${key}.name`)}</div>
                    <div className="text-xs text-gray-400">{t(`audioInterview.personas.${key}.description`)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startInterview}
              className="w-full btn-primary"
            >
              {t('audioInterview.startInterview')}
            </button>
          </Card>
        )}

        {/* Interview Step */}
        {step === 'interview' && (
          <Card>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">{t('audioInterview.progress')}</span>
                <span className="text-sm text-gray-400">
                  {t('audioInterview.questionOf', { current: session?.currentQuestionIndex || 0, total: 5 })}
                </span>
              </div>
              <div className="w-full bg-dark-surface rounded-full h-2">
                <div
                  className="bg-accent-cyan h-2 rounded-full transition-all"
                  style={{ width: `${((session?.currentQuestionIndex || 0) / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Messages */}
            <div className="mb-6 max-h-96 overflow-y-auto space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg ${
                    msg.role === 'assistant'
                      ? 'bg-accent-cyan/20 border border-accent-cyan/50'
                      : 'bg-dark-surface ml-12 border border-gray-700'
                  }`}
                >
                  <div className="text-xs text-gray-400 mb-1">
                    {msg.role === 'assistant' ? t('audioInterview.interviewer') : t('audioInterview.you')}
                  </div>
                  <div className="text-gray-300">{msg.content}</div>
                </div>
              ))}
            </div>

            {/* Audio Controls */}
            <div className="flex gap-4 mb-4">
              <button
                onClick={toggleAudio}
                className="btn-secondary px-4 py-2"
                title={audioEnabled ? t('audioInterview.disableSound') : t('audioInterview.enableSound')}
              >
                {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>

              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder={t('audioInterview.writeAnswer')}
                  className="input-field pr-14 w-full"
                  onKeyPress={(e) => e.key === 'Enter' && sendAnswer()}
                />
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                    isListening
                      ? 'bg-red-500 animate-pulse text-white'
                      : 'bg-accent-cyan hover:bg-accent-cyan/80 text-dark-bg'
                  }`}
                  title={isListening ? t('audioInterview.stopRecording') : t('audioInterview.startRecording')}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              </div>

              <button
                onClick={sendAnswer}
                disabled={!currentMessage.trim() || isSpeaking || isSending}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? '...' : t('audioInterview.send')}
              </button>
            </div>

            {isSpeaking && (
              <div className="text-center text-sm text-accent-cyan animate-pulse mb-2">
                🔊 {t('audioInterview.interviewerSpeaking')}
              </div>
            )}

            {isListening && (
              <div className="text-center text-sm text-red-400 animate-pulse mb-2">
                🎙️ {t('audioInterview.listening')}
              </div>
            )}

            {/* Кнопка досрочного завершения */}
            <div className="mt-6 text-center">
              <button
                onClick={completeInterview}
                className="px-6 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm"
              >
                {t('audioInterview.endEarly')}
              </button>
            </div>
          </Card>
        )}

        {/* Feedback Step */}
        {step === 'feedback' && feedback && (
          <Card>
            <div className="text-center mb-8">
              <Award className="w-16 h-16 mx-auto mb-4 text-accent-gold" />
              <h2 className="text-3xl font-bold text-white mb-2">{t('audioInterview.interviewComplete')}</h2>
              <div className="text-5xl font-bold text-accent-cyan mb-2">
                {feedback.overallScore}/100
              </div>
              <div className="text-gray-400">
                {t('audioInterview.duration')}: {Math.floor(feedback.duration / 60)} {t('audioInterview.min')} {feedback.duration % 60} {t('audioInterview.sec')}
              </div>
            </div>

            {/* Strengths */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="text-green-400" />
                <h3 className="text-xl font-semibold text-white">{t('audioInterview.strengths')}</h3>
              </div>
              <ul className="space-y-2">
                {feedback.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span className="text-gray-300">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="text-orange-400" />
                <h3 className="text-xl font-semibold text-white">{t('audioInterview.improvements')}</h3>
              </div>
              <ul className="space-y-2">
                {feedback.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-orange-400 mt-1">!</span>
                    <span className="text-gray-300">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Detailed Feedback */}
            <div className="mb-8 p-4 bg-dark-surface rounded-lg border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-2">{t('audioInterview.interviewerComment')}</h3>
              <p className="text-gray-300">{feedback.feedback}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setStep('setup');
                  setSession(null);
                  setMessages([]);
                  setCurrentMessage('');
                  setFeedback(null);
                  voiceIdRef.current = null;
                }}
                className="btn-primary flex-1"
              >
                {t('audioInterview.newInterview')}
              </button>
              <button
                onClick={() => navigate('/home')}
                className="btn-secondary flex-1"
              >
                {t('audioInterview.toHome')}
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AudioInterview;