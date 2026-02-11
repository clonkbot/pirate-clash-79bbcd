import React from 'react';

interface LeaderboardEntry {
  _id: string;
  username: string;
  bestStreak: number;
  totalWins: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayerId?: string;
}

export function Leaderboard({ entries, currentPlayerId }: LeaderboardProps) {
  const getRankEmoji = (index: number) => {
    switch (index) {
      case 0: return '👑';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  const getRankGradient = (index: number) => {
    switch (index) {
      case 0: return 'from-yellow-500/30 to-yellow-600/10 border-yellow-400/50';
      case 1: return 'from-gray-300/20 to-gray-400/10 border-gray-300/40';
      case 2: return 'from-amber-600/20 to-amber-700/10 border-amber-500/40';
      default: return 'from-white/5 to-transparent border-white/10';
    }
  };

  return (
    <div className="bg-black/40 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm">
      <div className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 px-4 md:px-6 py-3 md:py-4 border-b border-white/10">
        <h3 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
          <span className="text-xl md:text-2xl">🏆</span>
          WINNING STREAKS
        </h3>
      </div>

      <div className="p-2 md:p-4 space-y-1.5 md:space-y-2">
        {entries.length === 0 ? (
          <div className="text-center py-6 md:py-8 text-white/40 text-sm">
            No battles yet. Be the first to climb the ranks!
          </div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={entry._id}
              className={`flex items-center gap-2 md:gap-4 p-2 md:p-3 rounded-lg border transition-all duration-300
                bg-gradient-to-r ${getRankGradient(index)}
                ${currentPlayerId === entry._id ? 'ring-2 ring-cyan-400/50' : ''}`}
            >
              <div className={`w-6 md:w-10 text-center font-black ${
                index < 3 ? 'text-lg md:text-2xl' : 'text-xs md:text-sm text-white/50'
              }`}>
                {getRankEmoji(index)}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-bold text-sm md:text-base truncate ${
                  currentPlayerId === entry._id ? 'text-cyan-400' : 'text-white'
                }`}>
                  {entry.username}
                  {currentPlayerId === entry._id && (
                    <span className="text-[10px] md:text-xs text-cyan-300 ml-1 md:ml-2">(You)</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-base md:text-xl font-black text-yellow-400 flex items-center gap-0.5 md:gap-1">
                  <span className="text-xs md:text-sm">🔥</span>
                  {entry.bestStreak}
                </div>
                <div className="text-[10px] md:text-xs text-white/40">{entry.totalWins} wins</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
