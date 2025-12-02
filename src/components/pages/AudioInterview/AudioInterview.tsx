import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, VolumeX, Award, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import { $api } from '../../../utils/axios.instance';
import toast from 'react-hot-toast';

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

interface VoiceInfo {
  id: string;
  name: string;
  gender: string;
}

const POSITIONS = [
  'Frontend разработчик',
  'Backend разработчик',
  'Fullstack разработчик',
  'React разработчик',
  'Node.js разработчик',
  'Python разработчик',
  'Java разработчик',
  'DevOps инженер',
  'QA инженер',
  'Data Scientist',
  'Data Analyst',
  'Mobile разработчик (iOS)',
  'Mobile разработчик (Android)',
  'UI/UX дизайнер',
  'Product Manager',
  'Project Manager',
  'System Administrator',
  'Бизнес-аналитик',
  'ML инженер',
  'Технический писатель'
];

const AudioInterview = () => {
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

  // Voice info for current interview (random per session)
  const [currentVoice, setCurrentVoice] = useState<VoiceInfo | null>(null);

  // Web Speech API for recognition
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const interimTranscriptRef = useRef<string>('');

  useEffect(() => {
    // Create audio element for Yandex TTS
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsSpeaking(false);
    audioRef.current.onerror = () => setIsSpeaking(false);

    // Initialize speech recognition with improved settings
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ru-RU';
      recognitionRef.current.maxAlternatives = 3;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (interimTranscript) {
          interimTranscriptRef.current = interimTranscript;
          setCurrentMessage(prev => {
            const base = prev.replace(interimTranscriptRef.current, '');
            return base + interimTranscript;
          });
        }

        if (finalTranscript) {
          setCurrentMessage(prev => {
            const base = prev.replace(interimTranscriptRef.current, '');
            return (base + ' ' + finalTranscript).trim();
          });
          interimTranscriptRef.current = '';
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
          if (event.error === 'not-allowed') {
            toast.error('Доступ к микрофону запрещен. Разрешите доступ в настройках браузера.');
          } else if (event.error === 'network') {
            toast.error('Ошибка сети при распознавании речи');
          }
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isListening]);

  // Синтез речи через Yandex SpeechKit
  const speak = useCallback(async (text: string) => {
    if (!audioEnabled) return;

    try {
      setIsSpeaking(true);

      const response = await $api.post('/interviews/tts', {
        text,
        gender: currentVoice?.gender,
        voiceId: currentVoice?.id
      });

      // Сохраняем информацию о голосе для использования в течение сессии
      if (response.data.voice && !currentVoice) {
        setCurrentVoice(response.data.voice);
      }

      // Декодируем base64 аудио и воспроизводим
      const audioData = `data:${response.data.format};base64,${response.data.audio}`;

      if (audioRef.current) {
        audioRef.current.src = audioData;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Yandex TTS error:', error);
      setIsSpeaking(false);
      toast.error('Ошибка синтеза речи');
    }
  }, [audioEnabled, currentVoice]);

  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error('Распознавание речи не поддерживается вашим браузером');
      return;
    }

    setCurrentMessage('');
    setIsListening(true);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const startInterview = async () => {
    if (!position) {
      toast.error('Выберите желаемую позицию');
      return;
    }

    try {
      // Сбрасываем голос для нового интервью (будет выбран случайный)
      setCurrentVoice(null);

      const response = await $api.post('/interviews/audio', {
        interviewerPersona: persona,
        position: position.trim()
      });

      setSession(response.data.session);
      setMessages([response.data.firstMessage]);
      setStep('interview');

      // Speak greeting
      speak(response.data.firstMessage.content);

      toast.success('Интервью начато!');
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Ошибка при создании интервью');
    }
  };

  const sendAnswer = async () => {
    if (!currentMessage.trim() || !session) return;

    try {
      const response = await $api.post(`/interviews/audio/${session.id}/answer`, {
        content: currentMessage.trim()
      });

      setMessages([...messages, response.data.userMessage, response.data.aiMessage]);
      setCurrentMessage('');

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
      toast.error('Ошибка при отправке ответа');
    }
  };

  const completeInterview = async () => {
    if (!session) return;

    try {
      const response = await $api.post(`/interviews/audio/${session.id}/complete`);
      setFeedback(response.data);
      setStep('feedback');

      // Speak feedback
      speak(response.data.feedback);
    } catch (error) {
      console.error('Error completing interview:', error);
      toast.error('Ошибка при завершении интервью');
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

  const personaInfo = {
    strict_hr: {
      name: 'Строгий HR-директор',
      description: 'Профессиональный, требовательный, фокус на опыте и soft skills',
      icon: '👔'
    },
    friendly_tech: {
      name: 'Дружелюбный тимлид',
      description: 'Открытый, технический, интересуется проектами и технологиями',
      icon: '👨‍💻'
    },
    direct_ceo: {
      name: 'Прямолинейный CEO',
      description: 'Деловой, конкретный, ожидает быстрых и четких ответов',
      icon: '💼'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🎙️ Аудио-интервью с AI</h1>
          <p className="text-gray-400">Практикуйтесь в собеседованиях с виртуальным интервьюером</p>
        </div>

        {/* Setup Step */}
        {step === 'setup' && (
          <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-6">Настройка интервью</h2>

            {/* Position Select */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Желаемая позиция</label>
              <div className="relative">
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="">Выберите позицию...</option>
                  {POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Persona Selection */}
            <div className="mb-8">
              <label className="block text-gray-300 mb-3">Выберите интервьюера</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(personaInfo).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => setPersona(key)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      persona === key
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-4xl mb-2">{info.icon}</div>
                    <div className="font-semibold mb-1">{info.name}</div>
                    <div className="text-xs text-gray-400">{info.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startInterview}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Начать интервью
            </button>
          </div>
        )}

        {/* Interview Step */}
        {step === 'interview' && (
          <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Прогресс</span>
                <span className="text-sm text-gray-400">
                  Вопрос {session?.currentQuestionIndex || 0} из 5
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
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
                      ? 'bg-blue-900/30 border border-blue-700'
                      : 'bg-gray-700 ml-12'
                  }`}
                >
                  <div className="text-xs text-gray-400 mb-1">
                    {msg.role === 'assistant' ? 'Интервьюер' : 'Вы'}
                  </div>
                  <div>{msg.content}</div>
                </div>
              ))}
            </div>

            {/* Audio Controls */}
            <div className="flex gap-4 mb-4">
              <button
                onClick={toggleAudio}
                className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all"
              >
                {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Или напишите ответ..."
                  className="w-full px-4 py-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-20"
                  onKeyPress={(e) => e.key === 'Enter' && sendAnswer()}
                />
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`absolute right-2 top-2 p-2 rounded-lg transition-all ${
                    isListening
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              </div>

              <button
                onClick={sendAnswer}
                disabled={!currentMessage.trim() || isSpeaking}
                className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Отправить
              </button>
            </div>

            {isSpeaking && (
              <div className="text-center text-sm text-gray-400 animate-pulse">
                🔊 Интервьюер говорит...
                {currentVoice && (
                  <span className="ml-2 text-xs opacity-75">
                    ({currentVoice.name}, {currentVoice.gender === 'female' ? 'женский' : 'мужской'} голос)
                  </span>
                )}
              </div>
            )}

            {isListening && (
              <div className="text-center text-sm text-red-400 animate-pulse">
                🎙️ Слушаю... (говорите чётко)
              </div>
            )}

            {/* Кнопка досрочного завершения */}
            <div className="mt-6 text-center">
              <button
                onClick={completeInterview}
                className="px-6 py-2 bg-red-600/20 border border-red-600 text-red-400 rounded-lg hover:bg-red-600/40 transition-all text-sm"
              >
                Завершить интервью досрочно
              </button>
            </div>
          </div>
        )}

        {/* Feedback Step */}
        {step === 'feedback' && feedback && (
          <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <Award className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h2 className="text-3xl font-bold mb-2">Интервью завершено!</h2>
              <div className="text-5xl font-bold text-blue-400 mb-2">
                {feedback.overallScore}/100
              </div>
              <div className="text-gray-400">
                Длительность: {Math.floor(feedback.duration / 60)} мин {feedback.duration % 60} сек
              </div>
            </div>

            {/* Strengths */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="text-green-400" />
                <h3 className="text-xl font-semibold">Сильные стороны</h3>
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
                <h3 className="text-xl font-semibold">Области для улучшения</h3>
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
            <div className="mb-8 p-4 bg-gray-700 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Комментарий интервьюера</h3>
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
                  setCurrentVoice(null);
                }}
                className="flex-1 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
              >
                Новое интервью
              </button>
              <button
                onClick={() => navigate('/home')}
                className="flex-1 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all"
              >
                На главную
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioInterview;