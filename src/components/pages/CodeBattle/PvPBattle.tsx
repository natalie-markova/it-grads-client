import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import CodeEditor from './CodeEditor';
import { executeCode } from './api';
import type { GameTask, TestResult, MatchFoundData, MatchFinishedData, League } from './types';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import ConfirmModal from '../../ui/ConfirmModal';
import { getImageUrl } from '../../../utils/image.utils';

interface OutletContext {
  user: { id: number; role: string } | null;
  setUser: (user: { id: number; role: string } | null) => void;
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const leagueColors: Record<string, string> = {
  bronze: 'text-amber-600',
  silver: 'text-gray-400',
  gold: 'text-yellow-500',
  platinum: 'text-accent-cyan',
  diamond: 'text-blue-400',
  master: 'text-accent-blue',
  grandmaster: 'text-red-500'
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

type GameStatus = 'idle' | 'searching' | 'found' | 'playing' | 'finished';

interface MatchResult {
  matchId: number;
  winnerId?: number;
  isDraw: boolean;
  player1: {
    id: number;
    solved: boolean;
    solveTime?: number;
    testsPassed: number;
    ratingChange: number;
  };
  player2: {
    id: number;
    solved: boolean;
    solveTime?: number;
    testsPassed: number;
    ratingChange: number;
  };
}

export default function PvPBattle() {
  const navigate = useNavigate();
  const context = useOutletContext<OutletContext>();
  const user = context?.user;

  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [searchTime, setSearchTime] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Автоматический лимит времени в зависимости от сложности
  const getTimeLimit = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy': return 180;    // 3 минуты
      case 'medium': return 300;  // 5 минут
      case 'hard': return 600;    // 10 минут
    }
  };

  // Match data
  const [matchId, setMatchId] = useState<number | null>(null);
  const [task, setTask] = useState<GameTask | null>(null);
  const [opponent, setOpponent] = useState<{
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    rating: number;
    league: League;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startedAt, setStartedAt] = useState<Date | null>(null);

  // Game state
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [opponentSolved, setOpponentSolved] = useState<boolean | null>(null);
  const [submitResult, setSubmitResult] = useState<{
    solved: boolean;
    testsPassed: number;
    totalTests: number;
    solveTime: number;
  } | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  const [activeTab, setActiveTab] = useState<'description' | 'output'>('description');
  const [output, setOutput] = useState('');

  // Private room
  const [roomCode, setRoomCode] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [showRoomOptions, setShowRoomOptions] = useState(false);

  // Connect socket
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const wsUrl = apiUrl.replace('/api', '').replace('http', 'ws').replace('https', 'wss');

    socketRef.current = io(wsUrl.replace('ws://', 'http://').replace('wss://', 'https://'), {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to Code Battle WebSocket');
      socket.emit('codebattle:join');
    });

    socket.on('codebattle:searching', ({ position, estimatedWait }) => {
      console.log(`Searching... Position: ${position}, Wait: ${estimatedWait}`);
    });

    socket.on('codebattle:match-found', (data: MatchFoundData) => {
      console.log('Match found:', data);
      setStatus('found');
      setMatchId(data.matchId);
      setTask(data.task);
      setOpponent(data.opponent);
      setTimeLeft(data.timeLimit);
      setStartedAt(new Date(data.startedAt));

      // Set initial code
      if (data.task.starterCode?.[selectedLanguage]) {
        setCode(data.task.starterCode[selectedLanguage]);
      }

      // Transition to playing after 3 seconds
      setTimeout(() => setStatus('playing'), 3000);
    });

    socket.on('codebattle:submit-result', (result) => {
      setSubmitResult(result);
      setSubmitted(true);
      setRunning(false);
    });

    socket.on('codebattle:opponent-submitted', ({ solved }) => {
      setOpponentSubmitted(true);
      setOpponentSolved(solved);
    });

    socket.on('codebattle:match-finished', (result: MatchFinishedData) => {
      console.log('Match finished:', result);
      setMatchResult(result as MatchResult);
      setStatus('finished');
    });

    socket.on('codebattle:opponent-left', ({ winnerId }) => {
      if (winnerId === user.id) {
        setMatchResult({
          matchId: matchId || 0,
          winnerId,
          isDraw: false,
          player1: { id: user.id, solved: true, testsPassed: 0, ratingChange: 15 },
          player2: { id: opponent?.id || 0, solved: false, testsPassed: 0, ratingChange: -25 }
        });
        setStatus('finished');
      }
    });

    socket.on('codebattle:room-created', ({ roomCode: code }) => {
      setRoomCode(code);
    });

    socket.on('codebattle:error', ({ message }) => {
      console.error('Code Battle error:', message);
      toast.error(message);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Code Battle WebSocket');
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Search timer
  useEffect(() => {
    if (status !== 'searching') return;

    const timer = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  // Game timer
  useEffect(() => {
    if (status !== 'playing' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, timeLeft > 0]);

  const handleFindMatch = () => {
    if (!socketRef.current) return;
    setStatus('searching');
    setSearchTime(0);
    socketRef.current.emit('codebattle:find-match', {
      difficulty: selectedDifficulty,
      timeLimit: getTimeLimit(selectedDifficulty)
    });
  };

  const handleCancelSearch = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('codebattle:cancel-search');
    setStatus('idle');
  };

  const handleCreateRoom = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('codebattle:create-room', {
      difficulty: selectedDifficulty,
      timeLimit: getTimeLimit(selectedDifficulty)
    });
  };

  const handleJoinRoom = () => {
    if (!socketRef.current || !joinRoomCode.trim()) return;
    socketRef.current.emit('codebattle:join-room', {
      roomCode: joinRoomCode.toUpperCase()
    });
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    if (task?.starterCode?.[lang]) {
      setCode(task.starterCode[lang]);
    }
  };

  const handleRun = async () => {
    if (!code.trim()) return;

    setRunning(true);
    setOutput('');
    setActiveTab('output');

    try {
      const result = await executeCode({
        code,
        language: selectedLanguage,
        input: ''
      });

      if (result.success) {
        setOutput(result.stdout || 'Код выполнен успешно (нет вывода)');
      } else {
        setOutput(`Ошибка: ${result.error || result.stderr || result.status}`);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      setOutput(`Ошибка выполнения: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = useCallback(() => {
    if (!socketRef.current || !matchId || submitted || !code.trim()) return;

    setRunning(true);
    socketRef.current.emit('codebattle:submit-code', {
      matchId,
      code,
      language: selectedLanguage
    });
  }, [matchId, code, selectedLanguage, submitted]);

  const [leaveConfirm, setLeaveConfirm] = useState(false);

  const handleLeaveMatch = () => {
    if (!socketRef.current || !matchId) return;
    setLeaveConfirm(true);
  };

  const confirmLeave = () => {
    if (socketRef.current && matchId) {
      socketRef.current.emit('codebattle:leave-match', { matchId });
      setStatus('idle');
    }
    setLeaveConfirm(false);
  };

  const handlePlayAgain = () => {
    setStatus('idle');
    setMatchId(null);
    setTask(null);
    setOpponent(null);
    setCode('');
    setSubmitted(false);
    setOpponentSubmitted(false);
    setOpponentSolved(null);
    setSubmitResult(null);
    setMatchResult(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Idle screen - find match options
  if (status === 'idle') {
    return (
      <div className="min-h-screen bg-dark-bg text-white">
        <div className="container mx-auto px-4 py-12">
          <button
            onClick={() => navigate('/codebattle')}
            className="px-4 py-2 bg-dark-surface hover:bg-dark-card border border-dark-card hover:border-accent-cyan/50 rounded-lg text-sm text-gray-400 hover:text-accent-cyan transition-all flex items-center gap-2 mb-8"
          >
            <span>&larr;</span>
            <span>Назад</span>
          </button>

          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">⚔️</div>
              <h1 className="text-3xl font-bold mb-2">PvP Battle</h1>
              <p className="text-gray-400">Сразись с другими игроками в реальном времени</p>
            </div>

            {/* Match Settings */}
            <div className="bg-dark-card border border-dark-surface rounded-xl p-6 mb-6">
              <h2 className="text-lg font-bold mb-4">Настройки матча</h2>

              {/* Difficulty */}
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Сложность задачи:</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`p-3 rounded-lg text-center transition-all ${
                        selectedDifficulty === diff
                          ? difficultyColors[diff] + ' border-2'
                          : 'bg-dark-surface border-2 border-transparent hover:border-dark-card'
                      }`}
                    >
                      <div className={`font-bold ${selectedDifficulty === diff ? '' : 'text-white'}`}>
                        {diff === 'easy' ? 'Easy' : diff === 'medium' ? 'Medium' : 'Hard'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Time Info */}
              <div className="mb-6 p-3 bg-dark-surface rounded-lg text-center text-sm text-gray-400">
                <span className="text-accent-cyan font-medium">{formatTime(getTimeLimit(selectedDifficulty))}</span> — автоматический лимит времени
              </div>

              {/* Find Match Button */}
              <button
                onClick={handleFindMatch}
                className="w-full py-4 bg-gradient-to-r from-accent-cyan to-accent-blue hover:from-accent-cyan/90 hover:to-accent-blue/90 rounded-xl text-xl font-bold transition-all"
              >
                Найти соперника
              </button>
            </div>

            {/* Private Room Options */}
            <div className="bg-dark-card border border-dark-surface rounded-xl p-6">
              <button
                onClick={() => setShowRoomOptions(!showRoomOptions)}
                className="w-full flex items-center justify-between text-left"
              >
                <h2 className="text-lg font-bold">Приватная комната</h2>
                <span className="text-gray-400">{showRoomOptions ? '▲' : '▼'}</span>
              </button>

              {showRoomOptions && (
                <div className="mt-4 space-y-4">
                  {/* Create Room */}
                  <div>
                    <button
                      onClick={handleCreateRoom}
                      className="w-full py-3 bg-dark-surface hover:bg-dark-bg border border-dark-bg hover:border-accent-cyan/50 rounded-lg transition-all"
                    >
                      Создать комнату
                    </button>
                    {roomCode && (
                      <div className="mt-2 p-3 bg-accent-cyan/10 border border-accent-cyan/30 rounded-lg text-center">
                        <div className="text-sm text-gray-400 mb-1">Код комнаты:</div>
                        <div className="text-2xl font-mono font-bold text-accent-cyan">{roomCode}</div>
                        <div className="text-xs text-gray-500 mt-1">Отправьте этот код другу</div>
                      </div>
                    )}
                  </div>

                  {/* Join Room */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={joinRoomCode}
                      onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                      placeholder="Введите код"
                      maxLength={6}
                      className="flex-1 px-4 py-3 bg-dark-surface border border-dark-bg rounded-lg focus:outline-none focus:border-accent-cyan font-mono text-center text-lg"
                    />
                    <button
                      onClick={handleJoinRoom}
                      disabled={joinRoomCode.length !== 6}
                      className="px-6 py-3 bg-accent-blue hover:bg-accent-blue/90 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Войти
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Searching screen
  if (status === 'searching') {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-accent-cyan/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-accent-cyan rounded-full animate-spin"></div>
            <div className="absolute inset-4 flex items-center justify-center text-4xl">⚔️</div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Поиск соперника...</h2>
          <p className="text-gray-400 mb-4">
            {selectedDifficulty.toUpperCase()} | {formatTime(getTimeLimit(selectedDifficulty))}
          </p>
          <div className="text-3xl font-mono text-accent-cyan mb-8">
            {formatTime(searchTime)}
          </div>
          <button
            onClick={handleCancelSearch}
            className="px-6 py-3 bg-dark-surface hover:bg-dark-card border border-dark-card hover:border-red-500/50 rounded-lg text-gray-400 hover:text-red-400 transition-all"
          >
            Отменить поиск
          </button>
        </div>
      </div>
    );
  }

  // Match found screen
  if (status === 'found' && opponent) {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-8 text-accent-gold">Соперник найден!</h2>

          <div className="flex items-center justify-center gap-8 mb-8">
            {/* You */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-dark-surface flex items-center justify-center text-2xl mb-2 mx-auto border-2 border-accent-cyan">
                {user?.id ? '👤' : '?'}
              </div>
              <div className="font-medium">Вы</div>
            </div>

            <div className="text-4xl text-accent-gold">VS</div>

            {/* Opponent */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-dark-surface flex items-center justify-center text-2xl mb-2 mx-auto border-2 border-red-500">
                {opponent.avatar ? (
                  <img src={getImageUrl(opponent.avatar)} alt="" className="w-full h-full rounded-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  opponent.username?.charAt(0).toUpperCase() || '?'
                )}
              </div>
              <div className="font-medium">{opponent.firstName || opponent.username}</div>
              <div className={`text-sm ${leagueColors[opponent.league]}`}>
                {opponent.rating} | {opponent.league}
              </div>
            </div>
          </div>

          <div className="text-gray-400 animate-pulse">
            Матч начнётся через 3 секунды...
          </div>
        </div>
      </div>
    );
  }

  // Playing screen
  if (status === 'playing' && task) {
    return (
      <div className="min-h-screen bg-dark-bg text-white">
        {/* Header */}
        <div className="bg-dark-surface border-b border-dark-card py-3 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLeaveMatch}
                className="px-3 py-1.5 bg-dark-card hover:bg-dark-bg border border-dark-bg hover:border-red-500/50 rounded-lg text-sm text-gray-400 hover:text-red-400 transition-all"
              >
                Сдаться
              </button>
              <h1 className="font-bold">{task.title}</h1>
              <span className={`px-2 py-1 rounded text-xs border ${difficultyColors[task.difficulty]}`}>
                {task.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className={`font-mono text-lg ${timeLeft < 60 ? 'text-red-400' : 'text-gray-300'}`}>
                ⏱ {formatTime(timeLeft)}
              </div>

              {/* Opponent status */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-card rounded-lg">
                <div className="w-6 h-6 rounded-full bg-dark-surface flex items-center justify-center text-xs">
                  {opponent?.avatar ? (
                    <img src={getImageUrl(opponent.avatar)} alt="" className="w-full h-full rounded-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    opponent?.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="text-sm text-gray-400">{opponent?.firstName || opponent?.username}</span>
                {opponentSubmitted && (
                  <span className={`text-xs px-2 py-0.5 rounded ${opponentSolved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {opponentSolved ? 'Решил!' : 'Отправил'}
                  </span>
                )}
              </div>

              {/* Language Selector */}
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-dark-card border border-dark-surface rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-cyan"
              >
                {task.languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {languageNames[lang] || lang}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-120px)]">
          {/* Left Panel - Task */}
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
            </div>

            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
              {activeTab === 'description' && (
                <div className="prose prose-invert max-w-none">
                  {/* Заголовок и сложность */}
                  <div className="flex items-start justify-between mb-4 not-prose">
                    <h2 className="text-xl font-bold">{task.title}</h2>
                    <span className={`px-2 py-1 rounded text-xs border ${difficultyColors[task.difficulty]}`}>
                      {task.difficulty.toUpperCase()}
                    </span>
                  </div>

                  {/* Описание задачи */}
                  <div className="mb-6">
                    <ReactMarkdown>{task.description || 'Описание задачи недоступно'}</ReactMarkdown>
                  </div>

                  {/* Link to Codeforces */}
                  {task.externalUrl && (
                    <div className="mb-6 not-prose">
                      <a
                        href={task.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
                      >
                        Источник: Codeforces ↗
                      </a>
                    </div>
                  )}

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
                  </div>
                </div>
              )}

              {activeTab === 'output' && (
                <div className="bg-dark-card rounded-lg p-4 font-mono text-sm whitespace-pre-wrap min-h-[200px]">
                  {output ? (
                    output
                  ) : submitResult ? (
                    <div>
                      <div className={`text-lg mb-2 ${submitResult.solved ? 'text-green-400' : 'text-red-400'}`}>
                        {submitResult.solved ? '✅ Решено!' : '❌ Не все тесты пройдены'}
                      </div>
                      <div>Пройдено тестов: {submitResult.testsPassed}/{submitResult.totalTests}</div>
                      <div>Время: {submitResult.solveTime}с</div>
                    </div>
                  ) : (
                    <span className="text-gray-500">Нажмите "Запустить" чтобы выполнить код</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Editor */}
          <div className="w-1/2 flex flex-col">
            <div className="flex-1 p-4">
              <CodeEditor
                value={code}
                onChange={setCode}
                language={selectedLanguage}
                height="100%"
              />
            </div>

            {/* Actions */}
            <div className="border-t border-dark-card p-4 flex items-center justify-end gap-3">
              <button
                onClick={handleRun}
                disabled={running || !code.trim()}
                className="px-4 py-2 bg-dark-surface hover:bg-dark-card rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {running && !submitted ? '⏳ Выполнение...' : '▶ Запустить'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={running || submitted || !code.trim()}
                className="px-6 py-2 bg-accent-cyan hover:bg-accent-cyan/90 text-dark-bg rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {running && !submitted ? '⏳ Проверка...' : submitted ? (submitResult?.solved ? '✓ Решено' : 'Отправлено') : '📤 Отправить'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Finished screen
  if (status === 'finished' && matchResult) {
    const myResult = matchResult.player1.id === user?.id ? matchResult.player1 : matchResult.player2;
    const opponentResult = matchResult.player1.id === user?.id ? matchResult.player2 : matchResult.player1;
    const isWinner = matchResult.winnerId === user?.id;
    const isDraw = matchResult.isDraw;

    return (
      <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
        <div className="max-w-lg w-full mx-auto p-6">
          {/* Result Icon */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              {isDraw ? '🤝' : isWinner ? '🏆' : '😔'}
            </div>
            <h1 className={`text-3xl font-bold ${isDraw ? 'text-yellow-400' : isWinner ? 'text-green-400' : 'text-red-400'}`}>
              {isDraw ? 'Ничья!' : isWinner ? 'Победа!' : 'Поражение'}
            </h1>
          </div>

          {/* Stats Comparison */}
          <div className="bg-dark-card border border-dark-surface rounded-xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              {/* You */}
              <div className="p-4 bg-dark-surface rounded-lg">
                <div className="text-gray-400 mb-2">Вы</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Решено:</span>
                    <span className={myResult.solved ? 'text-green-400' : 'text-red-400'}>
                      {myResult.solved ? 'Да' : 'Нет'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Тесты:</span>
                    <span>{myResult.testsPassed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Время:</span>
                    <span>{myResult.solveTime ? `${myResult.solveTime}с` : '-'}</span>
                  </div>
                  <div className={`text-lg font-bold ${myResult.ratingChange > 0 ? 'text-green-400' : myResult.ratingChange < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {myResult.ratingChange > 0 ? '+' : ''}{myResult.ratingChange}
                  </div>
                </div>
              </div>

              {/* Opponent */}
              <div className="p-4 bg-dark-surface rounded-lg">
                <div className="text-gray-400 mb-2">{opponent?.firstName || opponent?.username}</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Решено:</span>
                    <span className={opponentResult.solved ? 'text-green-400' : 'text-red-400'}>
                      {opponentResult.solved ? 'Да' : 'Нет'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Тесты:</span>
                    <span>{opponentResult.testsPassed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Время:</span>
                    <span>{opponentResult.solveTime ? `${opponentResult.solveTime}с` : '-'}</span>
                  </div>
                  <div className={`text-lg font-bold ${opponentResult.ratingChange > 0 ? 'text-green-400' : opponentResult.ratingChange < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    {opponentResult.ratingChange > 0 ? '+' : ''}{opponentResult.ratingChange}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handlePlayAgain}
              className="flex-1 py-3 bg-gradient-to-r from-accent-cyan to-accent-blue hover:from-accent-cyan/90 hover:to-accent-blue/90 rounded-lg font-medium transition-all"
            >
              Играть снова
            </button>
            <button
              onClick={() => navigate('/codebattle')}
              className="flex-1 py-3 bg-dark-surface hover:bg-dark-card border border-dark-card hover:border-accent-cyan/50 rounded-lg text-gray-400 hover:text-white transition-all"
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {leaveConfirm && (
        <ConfirmModal
          isOpen={leaveConfirm}
          title="Покинуть матч"
          message="Вы уверены, что хотите покинуть матч? Вы потеряете рейтинг, если покинете игру."
          confirmText="Покинуть"
          cancelText="Отмена"
          variant="warning"
          onConfirm={confirmLeave}
          onCancel={() => setLeaveConfirm(false)}
        />
      )}
    </>
  );
}
