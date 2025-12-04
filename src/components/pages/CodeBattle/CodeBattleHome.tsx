import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMyRating, getLeaderboard, getDailyChallenge, getTasks } from './api';
import type { PlayerRating, GameTask } from './types';

interface OutletContext {
  user: { id: number; role: string } | null;
  setUser: (user: { id: number; role: string } | null) => void;
}

const leagueColors: Record<string, string> = {
  bronze: 'text-amber-600',
  silver: 'text-gray-400',
  gold: 'text-yellow-500',
  platinum: 'text-accent-cyan',
  diamond: 'text-blue-400',
  master: 'text-accent-blue',
  grandmaster: 'text-red-500'
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-400 border-red-500/30'
};

export default function CodeBattleHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const context = useOutletContext<OutletContext>();
  const user = context?.user;
  const [myRating, setMyRating] = useState<PlayerRating | null>(null);
  const [leaderboard, setLeaderboard] = useState<PlayerRating[]>([]);
  const [dailyTask, setDailyTask] = useState<GameTask | null>(null);
  const [recentTasks, setRecentTasks] = useState<GameTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [leaderboardData, dailyData, tasksData] = await Promise.all([
        getLeaderboard({ limit: 10 }).catch(() => []),
        getDailyChallenge().catch(() => ({ task: null })),
        getTasks({ limit: 6 }).catch(() => ({ tasks: [], pagination: { page: 1, pages: 1, total: 0, limit: 6 } }))
      ]);

      setLeaderboard(leaderboardData || []);
      setDailyTask(dailyData?.task || null);
      setRecentTasks(tasksData?.tasks || []);

      if (user) {
        try {
          const ratingData = await getMyRating();
          setMyRating(ratingData);
        } catch {
          // No rating yet
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-cyan"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-white pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-accent-cyan/20 via-dark-bg to-accent-blue/20 py-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,168,196,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,168,196,0.1)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 text-gradient">
              Code Battle Arena
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              {t('codeBattle.subtitle')}
            </p>

            {/* Game Mode Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
              {/* Solo Mode */}
              <div
                onClick={() => navigate('/codebattle/tasks')}
                className="bg-dark-card/50 backdrop-blur-sm border border-dark-surface rounded-xl p-6 cursor-pointer hover:border-green-500 hover:shadow-glow-cyan transition-all group"
              >
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-400 transition-colors">{t('codeBattle.solo.title')}</h3>
                <p className="text-gray-400 text-sm">{t('codeBattle.solo.description')}</p>
              </div>

              {/* PvP Mode */}
              <div
                onClick={() => user ? navigate('/codebattle/pvp') : navigate('/login')}
                className="bg-dark-card/50 backdrop-blur-sm border border-dark-surface rounded-xl p-6 cursor-pointer hover:border-accent-cyan hover:shadow-glow-cyan transition-all group"
              >
                <div className="text-4xl mb-4">⚔️</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-accent-cyan transition-colors">{t('codeBattle.multiplayer.title')}</h3>
                <p className="text-gray-400 text-sm">{t('codeBattle.multiplayer.description')}</p>
              </div>

              {/* VS AI Mode */}
              <div
                onClick={() => navigate('/codebattle/vs-ai')}
                className="bg-dark-card/50 backdrop-blur-sm border border-dark-surface rounded-xl p-6 cursor-pointer hover:border-accent-blue hover:shadow-glow-cyan transition-all group"
              >
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-accent-blue transition-colors">{t('codeBattle.vsBot.title')}</h3>
                <p className="text-gray-400 text-sm">{t('codeBattle.vsBot.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Daily Challenge */}
            {dailyTask && (
              <div className="bg-gradient-to-r from-accent-gold/20 to-yellow-500/20 border border-accent-gold/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🔥</span>
                  <div>
                    <h2 className="text-xl font-bold text-accent-gold">{t('codeBattle.dailyChallenge.title')}</h2>
                    <p className="text-sm text-gray-400">{t('codeBattle.dailyChallenge.bonus')}</p>
                  </div>
                </div>
                <div className="bg-dark-bg/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{dailyTask.title}</h3>
                      <span className={`inline-block px-2 py-1 rounded text-xs border mt-2 ${difficultyColors[dailyTask.difficulty]}`}>
                        {dailyTask.difficulty.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-accent-gold">+{dailyTask.points * 2}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/codebattle/play/${dailyTask.id}?mode=daily`)}
                  className="w-full bg-accent-gold hover:bg-accent-gold/90 text-dark-bg font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  {t('codeBattle.dailyChallenge.start')}
                </button>
              </div>
            )}

            {/* Recent Tasks */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{t('codeBattle.tasks')}</h2>
                <button
                  onClick={() => navigate('/codebattle/tasks')}
                  className="px-4 py-2 bg-dark-surface hover:bg-dark-card border border-dark-card hover:border-accent-cyan/50 rounded-lg text-sm text-gray-300 hover:text-accent-cyan transition-all"
                >
                  {t('codeBattle.allTasks')}
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/codebattle/play/${task.id}`)}
                    className="bg-dark-card border border-dark-surface rounded-lg p-4 cursor-pointer hover:border-accent-cyan/50 hover:shadow-glow-cyan transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{task.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs border ${difficultyColors[task.difficulty]}`}>
                        {task.difficulty}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {task.category || 'General'}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>✓ {t('codeBattle.solutions', { count: task.solvedCount })}</span>
                      <span className="text-accent-cyan">+{task.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Rating */}
            {myRating && (
              <div className="bg-dark-card border border-dark-surface rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4">{t('profile.myProfile')}</h2>
                <div className="text-center mb-4">
                  <div className="text-5xl mb-2">{myRating.leagueIcon}</div>
                  <div className={`text-2xl font-bold ${leagueColors[myRating.league]}`}>
                    {myRating.rating}
                  </div>
                  <div className="text-gray-400 capitalize">{myRating.league}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="text-green-400 font-bold">{myRating.wins}</div>
                    <div className="text-gray-500">{t('common.rating')}</div>
                  </div>
                  <div>
                    <div className="text-red-400 font-bold">{myRating.losses}</div>
                    <div className="text-gray-500">{t('common.rating')}</div>
                  </div>
                  <div>
                    <div className="text-accent-cyan font-bold">{myRating.totalSolved}</div>
                    <div className="text-gray-500">{t('common.tasks')}</div>
                  </div>
                </div>
                {myRating.streak > 0 && (
                  <div className="mt-4 text-center">
                    <span className="text-accent-gold">🔥 {myRating.streak}</span>
                  </div>
                )}
              </div>
            )}

            {/* Leaderboard */}
            <div className="bg-dark-card border border-dark-surface rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">🏆 Top</h2>
                <button
                  onClick={() => navigate('/codebattle/leaderboard')}
                  className="px-3 py-1.5 bg-dark-surface hover:bg-dark-bg border border-dark-bg hover:border-accent-cyan/50 rounded-lg text-xs text-gray-400 hover:text-accent-cyan transition-all"
                >
                  {t('common.all')}
                </button>
              </div>
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-surface transition-colors"
                  >
                    <div className="w-6 text-center font-bold text-gray-500">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-dark-surface flex items-center justify-center text-sm">
                      {player.user?.avatar ? (
                        <img src={player.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        player.user?.username?.charAt(0).toUpperCase() || '?'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium">
                        {player.user?.firstName || player.user?.username || 'Unknown'}
                      </div>
                    </div>
                    <div className={`font-bold ${leagueColors[player.league]}`}>
                      {player.rating}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-dark-card border border-dark-surface rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">{t('graduates.languages')}</h2>
              <div className="flex flex-wrap gap-2">
                {['JavaScript', 'Python', 'Java', 'C++', 'Go', 'TypeScript', 'C#', 'Kotlin'].map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1 bg-dark-surface rounded-full text-sm text-gray-300 hover:bg-accent-cyan/20 hover:text-accent-cyan transition-colors cursor-pointer"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
