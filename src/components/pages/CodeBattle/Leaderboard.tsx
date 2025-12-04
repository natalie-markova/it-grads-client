import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getLeaderboard, getMyRating } from './api';
import type { PlayerRating, League } from './types';

interface OutletContext {
  user: { id: number; role: string } | null;
  setUser: (user: { id: number; role: string } | null) => void;
}

const leagueData: Record<League, { name: string; icon: string; color: string; minRating: number }> = {
  bronze: { name: 'Bronze', icon: '🥉', color: 'text-amber-600', minRating: 0 },
  silver: { name: 'Silver', icon: '🥈', color: 'text-gray-400', minRating: 1000 },
  gold: { name: 'Gold', icon: '🥇', color: 'text-yellow-500', minRating: 1200 },
  platinum: { name: 'Platinum', icon: '💎', color: 'text-accent-cyan', minRating: 1400 },
  diamond: { name: 'Diamond', icon: '💠', color: 'text-blue-400', minRating: 1600 },
  master: { name: 'Master', icon: '👑', color: 'text-accent-blue', minRating: 2000 },
  grandmaster: { name: 'Grandmaster', icon: '🏆', color: 'text-red-500', minRating: 2400 }
};

export default function Leaderboard() {
  const navigate = useNavigate();
  const context = useOutletContext<OutletContext>();
  const user = context?.user;
  const [leaderboard, setLeaderboard] = useState<PlayerRating[]>([]);
  const [myRating, setMyRating] = useState<PlayerRating | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedLeague]);

  const loadData = async () => {
    setLoading(true);
    try {
      const leaderboardData = await getLeaderboard({ league: selectedLeague || undefined, limit: 30 }).catch(() => []);
      setLeaderboard(leaderboardData || []);

      if (user) {
        try {
          const ratingData = await getMyRating();
          setMyRating(ratingData);
        } catch {
          // No rating yet
        }
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const leagues: League[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster'];

  return (
    <div className="min-h-screen bg-dark-bg text-white pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-cyan/20 to-accent-blue/20 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/codebattle')}
              className="px-4 py-2 bg-dark-card/50 hover:bg-dark-card border border-dark-surface hover:border-accent-cyan/50 rounded-lg text-sm text-gray-400 hover:text-accent-cyan transition-all flex items-center gap-2"
            >
              <span>←</span>
              <span>Назад</span>
            </button>
          </div>
          <h1 className="text-4xl font-bold text-center mb-4">🏆 Таблица лидеров</h1>
          <p className="text-center text-gray-400">Топ-30 игроков Code Battle Arena</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Leagues */}
          <div className="lg:col-span-1">
            <div className="bg-dark-card border border-dark-surface rounded-xl p-6 sticky top-4">
              <h3 className="font-bold mb-4">Лиги</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedLeague('')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedLeague === '' ? 'bg-accent-cyan/20 text-accent-cyan' : 'hover:bg-dark-surface'
                  }`}
                >
                  Все лиги
                </button>
                {leagues.map((league) => (
                  <button
                    key={league}
                    onClick={() => setSelectedLeague(league)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      selectedLeague === league ? 'bg-accent-cyan/20 text-accent-cyan' : 'hover:bg-dark-surface'
                    }`}
                  >
                    <span>{leagueData[league].icon}</span>
                    <span className={leagueData[league].color}>{leagueData[league].name}</span>
                    <span className="text-gray-500 text-xs ml-auto">{leagueData[league].minRating}+</span>
                  </button>
                ))}
              </div>

              {/* My Position */}
              {myRating && (
                <div className="mt-6 pt-6 border-t border-dark-surface">
                  <h4 className="text-sm text-gray-400 mb-3">Моя позиция</h4>
                  <div className="bg-dark-bg/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{leagueData[myRating.league].icon}</span>
                      <div>
                        <div className={`font-bold ${leagueData[myRating.league].color}`}>
                          #{myRating.rank || '?'}
                        </div>
                        <div className="text-sm text-gray-400">
                          {myRating.rating} pts
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Leaderboard */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-cyan"></div>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-4">🏅</div>
                <p>Пока нет игроков в этой лиге</p>
              </div>
            ) : (
              <div className="bg-dark-card border border-dark-surface rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-surface text-gray-400 text-sm">
                      <th className="px-6 py-4 text-left">Место</th>
                      <th className="px-6 py-4 text-left">Игрок</th>
                      <th className="px-6 py-4 text-center">Лига</th>
                      <th className="px-6 py-4 text-center">Рейтинг</th>
                      <th className="px-6 py-4 text-center">W/L/D</th>
                      <th className="px-6 py-4 text-center">Win Rate</th>
                      <th className="px-6 py-4 text-center">Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((player, index) => {
                      const isMe = user && player.userId === user.id;
                      const winRate = player.totalGames > 0
                        ? Math.round((player.wins / player.totalGames) * 100)
                        : 0;

                      return (
                        <tr
                          key={player.id}
                          className={`border-b border-dark-surface/50 hover:bg-dark-surface/30 transition-colors ${
                            isMe ? 'bg-accent-cyan/10' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <span className="font-bold text-lg">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium">
                                {player.user?.firstName || player.user?.username || 'Unknown'}
                                {isMe && <span className="ml-2 text-xs text-accent-cyan">(вы)</span>}
                              </div>
                              {player.user?.lastName && (
                                <div className="text-sm text-gray-500">{player.user.lastName}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-2xl" title={leagueData[player.league].name}>
                              {leagueData[player.league].icon}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`font-bold text-lg ${leagueData[player.league].color}`}>
                              {player.rating}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-green-400">{player.wins}</span>
                            {' / '}
                            <span className="text-red-400">{player.losses}</span>
                            {' / '}
                            <span className="text-gray-400">{player.draws}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-2 bg-dark-surface rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-accent-cyan to-accent-blue"
                                  style={{ width: `${winRate}%` }}
                                />
                              </div>
                              <span className="text-sm">{winRate}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {player.streak > 0 ? (
                              <span className="text-accent-gold">🔥 {player.streak}</span>
                            ) : player.streak < 0 ? (
                              <span className="text-blue-400">❄️ {Math.abs(player.streak)}</span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
