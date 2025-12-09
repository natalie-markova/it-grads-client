import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import { getTask, startSession, testSolution, submitSolution, getHint, getLanguages, getAiStatus } from './api';
import CodeEditor from './CodeEditor';
import type { GameTask, GameSession, TestResult, Language, SubmitResult } from './types';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

interface OutletContext {
  user: { id: number; role: string } | null;
  setUser: (user: { id: number; role: string } | null) => void;
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30'
};

// Время в зависимости от сложности задачи
const difficultyTime: Record<string, { time: number; label: string }> = {
  easy: { time: 180, label: '3 мин' },
  medium: { time: 300, label: '5 мин' },
  hard: { time: 600, label: '10 мин' }
};

const languageNames: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  go: 'Go',
  kotlin: 'Kotlin'
};

const formatLanguage = (lang: string): string => {
  return languageNames[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
};

export default function Playground() {
  const { taskId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const context = useOutletContext<OutletContext>();
  const user = context?.user;

  const mode = (searchParams.get('mode') as 'solo' | 'vs_ai' | 'daily') || 'solo';
  const initialAiDifficulty = (searchParams.get('ai') as 'easy' | 'medium' | 'hard') || 'medium';

  const [task, setTask] = useState<GameTask | null>(null);
  const [selectedAiDifficulty, setSelectedAiDifficulty] = useState<'easy' | 'medium' | 'hard'>(initialAiDifficulty);
  const [session, setSession] = useState<GameSession | null>(null);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hints, setHints] = useState<string[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'output' | 'results'>('description');
  const [gameStarted, setGameStarted] = useState(false);
  const [startingGame, setStartingGame] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [aiStatus, setAiStatus] = useState<{
    status: 'solving' | 'completed' | 'failed';
    aiSolved: boolean | null;
    aiSolveTime: number;
    aiTestsPassed: number;
  } | null>(null);

  const timeExpiredRef = useRef(false);

  useEffect(() => {
    loadData();
  }, [taskId]);

  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Отмечаем что время истекло
          timeExpiredRef.current = true;
          toast.error('⏱ Время истекло! Отправляем ваше решение...', { duration: 3000 });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, timeLeft > 0]);

  // Автоматическая отправка при истечении времени
  useEffect(() => {
    if (timeExpiredRef.current && !submitting && code.trim() && session) {
      timeExpiredRef.current = false;
      handleSubmit();
    }
  }, [timeLeft]);

  // Poll AI status in VS AI mode
  useEffect(() => {
    if (!gameStarted || mode !== 'vs_ai' || !session) return;

    // Stop polling if AI already finished or player already submitted
    if (aiStatus?.status !== 'solving' && aiStatus !== null) return;
    if (submitResult?.solved) return;

    const pollAiStatus = async () => {
      try {
        const status = await getAiStatus(session.id);
        setAiStatus(status);

        // Show notification when AI finishes
        if (status.status === 'completed' && status.aiSolved) {
          toast.success(`AI решил задачу за ${status.aiSolveTime}с!`, { duration: 3000 });
        } else if (status.status === 'failed') {
          toast.error('AI не смог решить задачу', { duration: 3000 });
        }
      } catch (error) {
        console.error('Failed to poll AI status:', error);
      }
    };

    // Initial poll
    pollAiStatus();

    // Poll every 3 seconds
    const interval = setInterval(pollAiStatus, 3000);

    return () => clearInterval(interval);
  }, [gameStarted, mode, session, aiStatus?.status, submitResult?.solved]);

  const loadData = async () => {
    if (!taskId) return;

    try {
      const [taskData, langsData] = await Promise.all([
        getTask(parseInt(taskId)),
        getLanguages()
      ]);

      setTask(taskData);
      setLanguages(langsData);

      // Set initial code from starter template
      if (taskData.starterCode?.[selectedLanguage]) {
        setCode(taskData.starterCode[selectedLanguage]);
      } else {
        const lang = langsData.find(l => l.id === selectedLanguage);
        if (lang) setCode(lang.template);
      }
    } catch (error) {
      console.error('Failed to load task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!task || !taskId) return;

    setStartingGame(true);
    try {
      if (user) {
        const sessionMode = mode === 'daily' ? 'daily_challenge' : mode === 'vs_ai' ? 'vs_ai' : 'solo';
        const sessionData = await startSession({
          taskId: parseInt(taskId),
          mode: sessionMode,
          aiDifficulty: mode === 'vs_ai' ? selectedAiDifficulty : undefined,
          language: selectedLanguage
        });
        setSession(sessionData.session);
        if (sessionData.starterCode) {
          setCode(sessionData.starterCode);
        }
      }
      // Время зависит от сложности задачи
      const taskDifficulty = task.difficulty as 'easy' | 'medium' | 'hard';
      setTimeLeft(difficultyTime[taskDifficulty]?.time || 300);
      setGameStarted(true);
    } catch (error) {
      console.error('Failed to start game:', error);
      toast.error('Не удалось начать игру');
    } finally {
      setStartingGame(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    if (task?.starterCode[lang]) {
      setCode(task.starterCode[lang]);
    } else {
      const langData = languages.find(l => l.id === lang);
      if (langData) setCode(langData.template);
    }
  };

  const handleRun = async () => {
    if (!session || !code.trim()) {
      toast.error('Начните игру для тестирования');
      return;
    }

    setRunning(true);
    setOutput('');
    setActiveTab('output');

    try {
      // Запускаем пробное тестирование (только видимые тесты)
      const result = await testSolution(session.id, {
        code,
        language: selectedLanguage
      });

      // Сохраняем результаты тестов для отображения (маппим к TestResult формату)
      setTestResults(result.testResults.map(r => ({
        ...r,
        expectedOutput: r.expected,
        actualOutput: r.actual,
        time: 0,
        memory: 0
      })) as TestResult[]);

      // Формируем вывод (с защитой от null/undefined)
      const execTime = result.executionTime ?? 0;
      const memUsed = result.memoryUsed ?? 0;
      const outputText = `Пробное тестирование (видимые тесты):\n` +
        `Пройдено: ${result.passed}/${result.total}\n` +
        `Время выполнения: ${execTime.toFixed(2)}ms\n` +
        `Память: ${memUsed.toFixed(2)}KB\n\n` +
        result.testResults.map((test, idx) => {
          if (test.passed) {
            return `✅ Тест ${idx + 1}: Пройден`;
          } else {
            return `❌ Тест ${idx + 1}: Не пройден\n` +
              `   Ввод: ${JSON.stringify(test.input)}\n` +
              `   Ожидалось: ${JSON.stringify(test.expected)}\n` +
              `   Получено: ${JSON.stringify(test.actual)}` +
              (test.error ? `\n   Ошибка: ${test.error}` : '');
          }
        }).join('\n');

      setOutput(outputText);

      if (result.success) {
        toast.success(`Все видимые тесты пройдены (${result.passed}/${result.total})`);
      } else {
        toast.error(`Пройдено ${result.passed} из ${result.total} видимых тестов`);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      setOutput(`Ошибка тестирования: ${err.message}`);
      toast.error('Ошибка при выполнении тестов');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!session || !code.trim()) {
      toast.error('Войдите в систему для отправки решения');
      return;
    }

    setSubmitting(true);
    setActiveTab('results');

    try {
      const result = await submitSolution(session.id, {
        code,
        language: selectedLanguage
      });

      setSubmitResult(result);
      setTestResults(result.results);

      // Завершаем игру и показываем экран результатов
      setGameStarted(false);
      setGameFinished(true);
      setTimeLeft(0);

      if (result.solved) {
        // Обновляем сессию
        setSession((prev) => prev ? { ...prev, solved: true, status: 'completed' } : null);

        // Показываем результат
        if (mode === 'vs_ai' && result.beatAi !== undefined) {
          if (result.beatAi) {
            toast.success('🎉 Поздравляем! Вы победили AI!', { duration: 5000 });
          } else {
            toast.error('AI оказался быстрее. Попробуйте ещё раз!', { duration: 5000 });
          }
        } else {
          toast.success('🎉 Задача решена успешно!', { duration: 5000 });
        }
      } else {
        toast.error('Некоторые тесты не прошли. Попробуйте ещё раз!', { duration: 3000 });
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      setOutput(`Ошибка отправки: ${err.message}`);
      setActiveTab('output');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetHint = async () => {
    if (!session) return;

    try {
      const result = await getHint(session.id);
      setHints((prev) => [...prev, result.hint]);
      setShowHints(true);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Не удалось получить подсказку');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-cyan"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">404</div>
          <p>Задача не найдена</p>
          <button
            onClick={() => navigate('/codebattle/tasks')}
            className="mt-4 px-4 py-2 bg-dark-card hover:bg-dark-surface border border-dark-surface hover:border-accent-cyan/50 rounded-lg text-sm text-gray-400 hover:text-accent-cyan transition-all flex items-center gap-2"
          >
            <span>←</span>
            <span>К списку задач</span>
          </button>
        </div>
      </div>
    );
  }

  // Экран результатов после завершения игры
  if (gameFinished && submitResult) {
    return (
      <div className="min-h-screen bg-dark-bg text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">
                {submitResult.solved ? '🎉' : '💪'}
              </div>
              <h1 className="text-4xl font-bold mb-2">
                {submitResult.solved ? 'Задача решена!' : 'Хорошая попытка!'}
              </h1>
              <p className="text-gray-400">
                {submitResult.solved
                  ? 'Поздравляем с успешным решением задачи!'
                  : 'Не сдавайтесь, попробуйте другую задачу или эту же снова'}
              </p>
            </div>

            {/* Results Card */}
            <div className="bg-dark-card border border-dark-surface rounded-xl p-8 mb-6">
              {/* Summary */}
              <div className={`p-6 rounded-lg mb-6 ${submitResult.solved ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">{submitResult.solved ? '✅' : '❌'}</span>
                  <div>
                    <h3 className="font-bold text-2xl">
                      {submitResult.solved ? 'Все тесты пройдены!' : 'Не все тесты пройдены'}
                    </h3>
                    <p className="text-lg text-gray-300">
                      Пройдено {submitResult.testsPassed} из {submitResult.totalTests} тестов
                    </p>
                  </div>
                </div>

                {submitResult.solved && (
                  <div className="flex gap-6 text-lg">
                    <span>⏱ Время: {submitResult.timeSpent}с</span>
                    <span className="text-accent-cyan">+{submitResult.pointsEarned} очков</span>
                  </div>
                )}
              </div>

              {/* VS AI Result */}
              {mode === 'vs_ai' && submitResult.beatAi !== undefined && (
                <div className={`p-6 rounded-lg mb-6 ${submitResult.beatAi ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{submitResult.beatAi ? '🏆' : '🤖'}</span>
                      <div>
                        <h4 className={`text-2xl font-bold ${submitResult.beatAi ? 'text-green-400' : 'text-red-400'}`}>
                          {submitResult.beatAi ? 'Вы победили AI!' : 'AI победил'}
                        </h4>
                        <p className="text-sm text-gray-400 mt-1">
                          Реальный AI ({selectedAiDifficulty === 'hard' ? 'YandexGPT Pro' : selectedAiDifficulty === 'medium' ? 'YandexGPT' : 'YandexGPT Lite'})
                        </p>
                      </div>
                    </div>
                    {submitResult.playerRating && (
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${submitResult.beatAi ? 'text-green-400' : 'text-red-400'}`}>
                          {submitResult.beatAi ? '+' : ''}{submitResult.beatAi ? (15 * (selectedAiDifficulty === 'hard' ? 3 : selectedAiDifficulty === 'medium' ? 2 : 1)) : -(10 * (selectedAiDifficulty === 'hard' ? 3 : selectedAiDifficulty === 'medium' ? 2 : 1))} рейтинга
                        </div>
                        <div className="text-sm text-gray-400">
                          Текущий: {submitResult.playerRating.rating}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Comparison Table */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-dark-surface/50 rounded-lg p-4">
                      <div className="text-gray-400 mb-3 font-medium">Вы</div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Решено:</span>
                          <span className={submitResult.solved ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                            {submitResult.solved ? 'Да' : 'Нет'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Тесты:</span>
                          <span className="font-bold">{submitResult.testsPassed}/{submitResult.totalTests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Время:</span>
                          <span className="font-bold">{submitResult.timeSpent}с</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-dark-surface/50 rounded-lg p-4">
                      <div className="text-gray-400 mb-3 font-medium">AI ({selectedAiDifficulty})</div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Решено:</span>
                          <span className={submitResult.aiSolved ? 'text-green-400 font-bold' : submitResult.aiSolved === null ? 'text-yellow-400 font-bold' : 'text-red-400 font-bold'}>
                            {submitResult.aiSolved === null ? 'Думает...' : submitResult.aiSolved ? 'Да' : 'Нет'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Тесты:</span>
                          <span className="font-bold">{submitResult.aiTestsPassed ?? '?'}/{submitResult.totalTests}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Время:</span>
                          <span className="font-bold">{submitResult.aiSolveTime ? `${submitResult.aiSolveTime}с` : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Test Results Details */}
              <div>
                <h3 className="font-bold text-xl mb-4">Детали тестирования</h3>
                <div className="space-y-3">
                  {testResults.map((result, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border ${result.passed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{result.passed ? '✓' : '✗'}</span>
                        <span className="font-medium">Тест {i + 1}</span>
                        {result.isHidden && <span className="text-xs text-gray-500">(скрытый)</span>}
                      </div>
                      {!result.isHidden && (
                        <div className="text-sm space-y-1 text-gray-300">
                          <div><span className="text-gray-500">Input:</span> {JSON.stringify(result.input)}</div>
                          <div><span className="text-gray-500">Expected:</span> {JSON.stringify(result.expectedOutput)}</div>
                          <div><span className="text-gray-500">Output:</span> {result.actualOutput}</div>
                          {result.error && <div className="text-red-400">Error: {result.error}</div>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/codebattle')}
                className="px-6 py-3 bg-dark-card hover:bg-dark-surface border border-dark-surface hover:border-accent-cyan/50 rounded-lg text-lg font-medium transition-all flex items-center gap-2"
              >
                <span>📋</span>
                <span>Все задачи</span>
              </button>
              {mode === 'vs_ai' && (
                <button
                  onClick={() => navigate('/codebattle/vs-ai')}
                  className="px-6 py-3 bg-dark-card hover:bg-dark-surface border border-dark-surface hover:border-accent-blue/50 rounded-lg text-lg font-medium transition-all flex items-center gap-2"
                >
                  <span>🤖</span>
                  <span>Другой VS AI</span>
                </button>
              )}
              <button
                onClick={() => {
                  setGameFinished(false);
                  setSubmitResult(null);
                  setTestResults([]);
                  setHints([]);
                  setShowHints(false);
                  setAiStatus(null);
                  setSession(null);
                }}
                className="px-6 py-3 bg-gradient-to-r from-accent-cyan to-accent-blue hover:from-accent-cyan/90 hover:to-accent-blue/90 rounded-lg text-lg font-bold transition-all flex items-center gap-2"
              >
                <span>🔄</span>
                <span>Попробовать снова</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Экран подготовки к игре
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-dark-bg text-white">
        <div className="container mx-auto px-4 py-12">
          <button
            onClick={() => navigate('/codebattle')}
            className="px-4 py-2 bg-dark-surface hover:bg-dark-card border border-dark-card hover:border-accent-cyan/50 rounded-lg text-sm text-gray-400 hover:text-accent-cyan transition-all flex items-center gap-2 mb-8"
          >
            <span>←</span>
            <span>Назад</span>
          </button>

          <div className="max-w-2xl mx-auto">
            {/* Task Info Card */}
            <div className="bg-dark-card border border-dark-surface rounded-xl p-8 mb-8 overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold break-words">{task.title}</h1>
                <span className={`px-3 py-1 rounded text-sm border flex-shrink-0 ${difficultyColors[task.difficulty]}`}>
                  {task.difficulty.toUpperCase()}
                </span>
              </div>

              <div className="prose prose-invert max-w-none mb-6 overflow-hidden break-words">
                <ReactMarkdown>{task.description}</ReactMarkdown>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
                <div className="flex items-center gap-2">
                  <span>⏱</span>
                  <span>{difficultyTime[task.difficulty]?.label || '5 мин'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🏆</span>
                  <span>{task.points} очков</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✓</span>
                  <span>{task.solvedCount} решений</span>
                </div>
              </div>

              {/* Language Selection */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Выберите язык:</label>
                <div className="flex flex-wrap gap-2">
                  {task.languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        selectedLanguage === lang
                          ? 'bg-accent-cyan text-dark-bg'
                          : 'bg-dark-surface text-gray-300 hover:bg-dark-surface/80'
                      }`}
                    >
                      {formatLanguage(lang)}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Difficulty Selection */}
              {mode === 'vs_ai' && (
                <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-2">
                    Выберите уровень AI-противника:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setSelectedAiDifficulty('easy')}
                      className={`p-4 rounded-lg text-center transition-all ${
                        selectedAiDifficulty === 'easy'
                          ? 'bg-green-500/20 border-2 border-green-500'
                          : 'bg-dark-surface border-2 border-transparent hover:border-dark-card'
                      }`}
                    >
                      <div className="text-2xl mb-1">🤖</div>
                      <div className={`font-bold ${selectedAiDifficulty === 'easy' ? 'text-green-400' : 'text-white'}`}>
                        Easy
                      </div>
                      <div className="text-xs text-gray-400 mt-1">YandexGPT Lite</div>
                      <div className="text-xs text-gray-500">+15 / -10 рейтинга</div>
                    </button>
                    <button
                      onClick={() => setSelectedAiDifficulty('medium')}
                      className={`p-4 rounded-lg text-center transition-all ${
                        selectedAiDifficulty === 'medium'
                          ? 'bg-yellow-500/20 border-2 border-yellow-500'
                          : 'bg-dark-surface border-2 border-transparent hover:border-dark-card'
                      }`}
                    >
                      <div className="text-2xl mb-1">🤖</div>
                      <div className={`font-bold ${selectedAiDifficulty === 'medium' ? 'text-yellow-400' : 'text-white'}`}>
                        Medium
                      </div>
                      <div className="text-xs text-gray-400 mt-1">YandexGPT</div>
                      <div className="text-xs text-gray-500">+30 / -20 рейтинга</div>
                    </button>
                    <button
                      onClick={() => setSelectedAiDifficulty('hard')}
                      className={`p-4 rounded-lg text-center transition-all ${
                        selectedAiDifficulty === 'hard'
                          ? 'bg-red-500/20 border-2 border-red-500'
                          : 'bg-dark-surface border-2 border-transparent hover:border-dark-card'
                      }`}
                    >
                      <div className="text-2xl mb-1">🤖</div>
                      <div className={`font-bold ${selectedAiDifficulty === 'hard' ? 'text-red-400' : 'text-white'}`}>
                        Hard
                      </div>
                      <div className="text-xs text-gray-400 mt-1">YandexGPT Pro</div>
                      <div className="text-xs text-gray-500">+45 / -30 рейтинга</div>
                    </button>
                  </div>
                  <div className="mt-4 p-3 bg-accent-blue/10 border border-accent-blue/30 rounded-lg">
                    <p className="text-sm text-accent-blue text-center">
                      Настоящий AI будет решать задачу одновременно с вами!
                    </p>
                    <p className="text-xs text-gray-500 text-center mt-1">
                      Победите AI, решив задачу быстрее или лучше
                    </p>
                  </div>
                </div>
              )}

              {mode === 'daily' && (
                <div className="bg-accent-gold/10 border border-accent-gold/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-accent-gold">
                    <span>🔥</span>
                    <span>Daily Challenge</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Бонус x2 очков за выполнение!
                  </p>
                </div>
              )}

              {/* Start Button */}
              <button
                onClick={handleStartGame}
                disabled={startingGame}
                className="w-full py-4 bg-gradient-to-r from-accent-cyan to-accent-blue hover:from-accent-cyan/90 hover:to-accent-blue/90 rounded-xl text-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {startingGame ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Подготовка...
                  </span>
                ) : (
                  '🚀 Начать игру'
                )}
              </button>

              {!user && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  Войдите в аккаунт для сохранения результатов
                </p>
              )}
            </div>

            {/* Example Tests Preview */}
            <div className="bg-dark-card border border-dark-surface rounded-xl p-6">
              <h3 className="font-semibold mb-4">Примеры тестов:</h3>
              {task.testCases && task.testCases.filter(tc => !tc.isHidden).length > 0 ? (
                task.testCases.filter(tc => !tc.isHidden).slice(0, 3).map((tc, i) => (
                  <div key={i} className="bg-dark-bg rounded p-3 mb-2 text-sm font-mono">
                    <div><span className="text-gray-500">Input:</span> {JSON.stringify(tc.input)}</div>
                    <div><span className="text-gray-500">Output:</span> {JSON.stringify(tc.expectedOutput)}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Примеры будут доступны во время игры</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Header */}
      <div className="bg-dark-surface border-b border-dark-card py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/codebattle')}
              className="px-3 py-1.5 bg-dark-card hover:bg-dark-bg border border-dark-bg hover:border-accent-cyan/50 rounded-lg text-sm text-gray-400 hover:text-accent-cyan transition-all flex items-center gap-2"
            >
              <span>←</span>
              <span>Назад</span>
            </button>
            <h1 className="font-bold">{task.title}</h1>
            <span className={`px-2 py-1 rounded text-xs border ${difficultyColors[task.difficulty]}`}>
              {task.difficulty}
            </span>
            {mode === 'vs_ai' && (
              <span className="px-2 py-1 bg-accent-blue/20 text-accent-blue rounded text-xs">
                VS AI ({selectedAiDifficulty})
              </span>
            )}
            {mode === 'daily' && (
              <span className="px-2 py-1 bg-accent-gold/20 text-accent-gold rounded text-xs">
                Daily Challenge
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* AI Status Indicator */}
            {mode === 'vs_ai' && aiStatus && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-card rounded-lg border border-dark-surface">
                {aiStatus.status === 'solving' ? (
                  <>
                    <div className="relative flex items-center">
                      <span className="text-lg animate-pulse">🤖</span>
                      <div className="absolute -right-1 -top-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                    </div>
                    <span className="text-sm text-yellow-400 animate-pulse">AI думает...</span>
                  </>
                ) : aiStatus.status === 'completed' ? (
                  <>
                    <span className="text-lg">✅</span>
                    <span className="text-sm text-green-400">AI решил за {aiStatus.aiSolveTime}с</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">❌</span>
                    <span className="text-sm text-red-400">AI не решил</span>
                  </>
                )}
              </div>
            )}

            {/* Timer */}
            <div className={`font-mono text-lg ${timeLeft < 60 ? 'text-red-400' : 'text-gray-300'}`}>
              ⏱ {formatTime(timeLeft)}
            </div>

            {/* Language Selector */}
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-dark-card border border-dark-surface rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan"
            >
              {task.languages.map((lang) => (
                <option key={lang} value={lang}>
                  {formatLanguage(lang)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Panel - Task Description */}
        <div className="w-1/2 border-r border-dark-card flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-dark-card">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-4 py-2 text-sm transition-colors ${activeTab === 'description' ? 'bg-dark-card text-accent-cyan' : 'text-gray-400 hover:text-white'}`}
            >
              Описание
            </button>
            <button
              onClick={() => setActiveTab('output')}
              className={`px-4 py-2 text-sm transition-colors ${activeTab === 'output' ? 'bg-dark-card text-accent-cyan' : 'text-gray-400 hover:text-white'}`}
            >
              Вывод
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-4 py-2 text-sm transition-colors ${activeTab === 'results' ? 'bg-dark-card text-accent-cyan' : 'text-gray-400 hover:text-white'}`}
            >
              Результаты {testResults.length > 0 && `(${testResults.filter(r => r.passed).length}/${testResults.length})`}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-4 custom-scrollbar">
            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none overflow-hidden">
                {/* Заголовок и сложность задачи */}
                <div className="flex items-start justify-between gap-4 mb-4 not-prose">
                  <h2 className="text-xl font-bold break-words flex-1 min-w-0">{task.title}</h2>
                  <span className={`px-2 py-1 rounded text-xs border flex-shrink-0 ${difficultyColors[task.difficulty]}`}>
                    {task.difficulty.toUpperCase()}
                  </span>
                </div>

                {/* Описание задачи */}
                <div className="mb-6 overflow-hidden break-words">
                  <ReactMarkdown>{task.description || 'Описание задачи недоступно'}</ReactMarkdown>
                </div>

                {/* Примеры тестов */}
                <div className="mt-6 not-prose">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Примеры тестов:</h4>
                  {task.testCases && task.testCases.filter(tc => !tc.isHidden).length > 0 ? (
                    task.testCases.filter(tc => !tc.isHidden).map((tc, i) => (
                      <div key={i} className="bg-dark-card rounded p-3 mb-2 text-sm font-mono">
                        <div><span className="text-gray-500">Input:</span> {JSON.stringify(tc.input)}</div>
                        <div><span className="text-gray-500">Output:</span> {JSON.stringify(tc.expectedOutput)}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Примеры недоступны</p>
                  )}
                  {task.hiddenTestsCount && task.hiddenTestsCount > 0 && (
                    <p className="text-sm text-gray-500 mt-2">+ {task.hiddenTestsCount} скрытых тестов</p>
                  )}
                </div>

                {/* Hints */}
                {task.hints && task.hints.length > 0 && (
                  <div className="mt-6">
                    <button
                      onClick={handleGetHint}
                      disabled={hints.length >= (task.hints?.length || 0)}
                      className="text-sm text-accent-gold hover:text-accent-gold/80 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                      💡 Получить подсказку ({hints.length}/{task.hints.length})
                    </button>
                    {showHints && hints.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {hints.map((hint, i) => (
                          <div key={i} className="bg-accent-gold/10 border border-accent-gold/30 rounded p-3 text-sm text-yellow-200">
                            <strong>Подсказка {i + 1}:</strong> {hint}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'output' && (
              <div className="bg-dark-card rounded-lg p-4 font-mono text-sm whitespace-pre-wrap min-h-[200px]">
                {output || 'Нажмите "Запустить" чтобы выполнить код'}
              </div>
            )}

            {activeTab === 'results' && (
              <div>
                {submitResult ? (
                  <div>
                    {/* Summary */}
                    <div className={`p-4 rounded-lg mb-4 ${submitResult.solved ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{submitResult.solved ? '✅' : '❌'}</span>
                        <div>
                          <h3 className="font-bold text-lg">
                            {submitResult.solved ? 'Решено!' : 'Не все тесты пройдены'}
                          </h3>
                          <p className="text-sm text-gray-300">
                            Пройдено {submitResult.testsPassed} из {submitResult.totalTests} тестов
                          </p>
                        </div>
                      </div>
                      {submitResult.solved && (
                        <div className="mt-3 flex gap-4 text-sm">
                          <span>⏱ {submitResult.timeSpent}с</span>
                          <span className="text-accent-cyan">+{submitResult.pointsEarned} очков</span>
                        </div>
                      )}

                      {/* VS AI Result - Real AI Battle */}
                      {/* Победа: beatAi === true */}
                      {mode === 'vs_ai' && submitResult.beatAi === true && (
                        <div className="mt-4 p-4 rounded-lg bg-green-500/20 border border-green-500/50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">🏆</span>
                              <div>
                                <h4 className="font-bold text-green-400">Вы победили AI!</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  Реальный AI ({selectedAiDifficulty === 'hard' ? 'YandexGPT Pro' : selectedAiDifficulty === 'medium' ? 'YandexGPT' : 'YandexGPT Lite'})
                                </p>
                              </div>
                            </div>
                            {submitResult.playerRating && (
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-400">
                                  +{15 * (selectedAiDifficulty === 'hard' ? 3 : selectedAiDifficulty === 'medium' ? 2 : 1)} рейтинга
                                </div>
                                <div className="text-sm text-gray-400">
                                  Текущий: {submitResult.playerRating.rating}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Comparison Table */}
                          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                            <div className="bg-dark-surface/50 rounded-lg p-3">
                              <div className="text-gray-400 mb-2">Вы</div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span>Решено:</span>
                                  <span className="text-green-400">Да</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Тесты:</span>
                                  <span>{submitResult.testsPassed}/{submitResult.totalTests}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Время:</span>
                                  <span>{submitResult.timeSpent}с</span>
                                </div>
                              </div>
                            </div>
                            <div className="bg-dark-surface/50 rounded-lg p-3">
                              <div className="text-gray-400 mb-2">AI ({selectedAiDifficulty})</div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span>Решено:</span>
                                  <span className={submitResult.aiSolved ? 'text-green-400' : 'text-yellow-400'}>
                                    {submitResult.aiSolved ? 'Да' : 'Нет/Думает'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Тесты:</span>
                                  <span>{submitResult.aiTestsPassed ?? '?'}/{submitResult.totalTests}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Время:</span>
                                  <span>{submitResult.aiSolveTime ? `${submitResult.aiSolveTime}с` : 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Поражение: beatAi === false (AI решил, игрок нет или медленнее) */}
                      {mode === 'vs_ai' && submitResult.beatAi === false && (
                        <div className="mt-4 p-4 rounded-lg bg-red-500/20 border border-red-500/50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">🤖</span>
                              <div>
                                <h4 className="font-bold text-red-400">AI победил</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  Реальный AI ({selectedAiDifficulty === 'hard' ? 'YandexGPT Pro' : selectedAiDifficulty === 'medium' ? 'YandexGPT' : 'YandexGPT Lite'})
                                </p>
                              </div>
                            </div>
                            {submitResult.playerRating && (
                              <div className="text-right">
                                <div className="text-lg font-bold text-red-400">
                                  -{10 * (selectedAiDifficulty === 'hard' ? 3 : selectedAiDifficulty === 'medium' ? 2 : 1)} рейтинга
                                </div>
                                <div className="text-sm text-gray-400">
                                  Текущий: {submitResult.playerRating.rating}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Comparison Table */}
                          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                            <div className="bg-dark-surface/50 rounded-lg p-3">
                              <div className="text-gray-400 mb-2">Вы</div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span>Решено:</span>
                                  <span className={submitResult.solved ? 'text-green-400' : 'text-red-400'}>
                                    {submitResult.solved ? 'Да' : 'Нет'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Тесты:</span>
                                  <span>{submitResult.testsPassed}/{submitResult.totalTests}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Время:</span>
                                  <span>{submitResult.timeSpent}с</span>
                                </div>
                              </div>
                            </div>
                            <div className="bg-dark-surface/50 rounded-lg p-3">
                              <div className="text-gray-400 mb-2">AI ({selectedAiDifficulty})</div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span>Решено:</span>
                                  <span className="text-green-400">Да</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Тесты:</span>
                                  <span>{submitResult.aiTestsPassed ?? submitResult.totalTests}/{submitResult.totalTests}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Время:</span>
                                  <span>{submitResult.aiSolveTime ? `${submitResult.aiSolveTime}с` : 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Ожидание результата: beatAi === null (AI ещё думает, игрок не решил) */}
                      {mode === 'vs_ai' && submitResult.beatAi === null && !submitResult.solved && (
                        <div className="mt-4 p-4 rounded-lg bg-yellow-500/20 border border-yellow-500/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl animate-pulse">🤖</span>
                              <div>
                                <h4 className="font-bold text-yellow-400">AI ещё думает...</h4>
                                <p className="text-sm text-gray-400">Попробуйте решить задачу, пока AI не справился!</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-400">
                                Рейтинг не изменён
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Test Results */}
                    <div className="space-y-2">
                      {testResults.map((result, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg border ${result.passed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span>{result.passed ? '✓' : '✗'}</span>
                            <span className="font-medium">Тест {i + 1}</span>
                            {result.isHidden && <span className="text-xs text-gray-500">(скрытый)</span>}
                          </div>
                          {!result.isHidden && (
                            <div className="text-sm space-y-1 text-gray-300">
                              <div><span className="text-gray-500">Input:</span> {JSON.stringify(result.input)}</div>
                              <div><span className="text-gray-500">Expected:</span> {JSON.stringify(result.expectedOutput)}</div>
                              <div><span className="text-gray-500">Output:</span> {result.actualOutput}</div>
                              {result.error && <div className="text-red-400">Error: {result.error}</div>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    Отправьте решение для просмотра результатов
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          <div className="flex-1 p-4">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={selectedLanguage}
              height="100%"
            />
          </div>

          {/* Action Buttons */}
          <div className="border-t border-dark-card p-4 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {session && `Подсказок использовано: ${hints.length}`}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRun}
                disabled={running || !code.trim()}
                className="px-4 py-2 bg-dark-surface hover:bg-dark-card rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {running ? '⏳ Выполнение...' : '▶ Запустить'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !code.trim() || timeLeft === 0}
                className="px-6 py-2 bg-accent-cyan hover:bg-accent-cyan/90 text-dark-bg rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? '⏳ Проверка...' : timeLeft === 0 ? '⏱ Время истекло' : '📤 Отправить'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
