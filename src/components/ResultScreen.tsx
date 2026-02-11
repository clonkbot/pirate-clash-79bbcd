import React, { useEffect, useState } from 'react';
import { Character } from '../gameData';

interface ResultScreenProps {
  winner: 'player' | 'opponent';
  player: Character;
  opponent: Character;
  playerRounds: number;
  opponentRounds: number;
  currentStreak: number;
  bestStreak: number;
  perfectRounds: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export function ResultScreen({
  winner,
  player,
  opponent,
  playerRounds,
  opponentRounds,
  currentStreak,
  bestStreak,
  perfectRounds,
  onPlayAgain,
  onBackToMenu,
}: ResultScreenProps) {
  const [showContent, setShowContent] = useState(false);
  const isVictory = winner === 'player';

  useEffect(() => {
    setTimeout(() => setShowContent(true), 500);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      {/* Overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: isVictory
            ? 'radial-gradient(circle at center, rgba(34, 211, 238, 0.3) 0%, rgba(0,0,0,0.95) 70%)'
            : 'radial-gradient(circle at center, rgba(239, 68, 68, 0.3) 0%, rgba(0,0,0,0.95) 70%)',
        }}
      />

      {/* Content */}
      <div
        className={`relative z-10 max-w-lg w-full transition-all duration-700 transform ${
          showContent ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
        }`}
      >
        {/* Result Banner */}
        <div
          className={`text-center mb-4 md:mb-8 ${
            isVictory ? 'animate-victory-bounce' : 'animate-defeat-shake'
          }`}
        >
          <div className="text-6xl md:text-8xl mb-2 md:mb-4">
            {isVictory ? '🏆' : '💀'}
          </div>
          <h1
            className={`text-4xl md:text-6xl font-black tracking-wider ${
              isVictory ? 'text-cyan-400' : 'text-red-400'
            }`}
            style={{
              textShadow: `0 0 40px ${isVictory ? '#22d3ee' : '#ef4444'}`,
            }}
          >
            {isVictory ? 'VICTORY!' : 'DEFEAT'}
          </h1>
        </div>

        {/* Match Summary */}
        <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-4 md:p-6 mb-4 md:mb-6">
          {/* Characters */}
          <div className="flex justify-center items-center gap-4 md:gap-8 mb-4 md:mb-6">
            <div className={`text-center ${isVictory ? 'scale-125' : 'opacity-50 grayscale'} transition-all`}>
              <div className="text-5xl md:text-7xl mb-1 md:mb-2">{player.emoji}</div>
              <div className={`text-sm md:text-base font-bold ${isVictory ? 'text-cyan-400' : 'text-white/50'}`}>
                {player.name}
              </div>
            </div>
            <div className="text-xl md:text-2xl font-black text-white/30">
              {playerRounds} - {opponentRounds}
            </div>
            <div className={`text-center ${!isVictory ? 'scale-125' : 'opacity-50 grayscale'} transition-all`}>
              <div className="text-5xl md:text-7xl mb-1 md:mb-2">{opponent.emoji}</div>
              <div className={`text-sm md:text-base font-bold ${!isVictory ? 'text-red-400' : 'text-white/50'}`}>
                {opponent.name}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <div className="bg-white/5 rounded-lg p-2 md:p-4 text-center">
              <div className="text-2xl md:text-3xl font-black text-yellow-400">
                🔥 {currentStreak}
              </div>
              <div className="text-[10px] md:text-xs text-white/50 mt-0.5 md:mt-1">Current Streak</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2 md:p-4 text-center">
              <div className="text-2xl md:text-3xl font-black text-orange-400">
                ⭐ {bestStreak}
              </div>
              <div className="text-[10px] md:text-xs text-white/50 mt-0.5 md:mt-1">Best Streak</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2 md:p-4 text-center">
              <div className="text-2xl md:text-3xl font-black text-purple-400">
                💎 {perfectRounds}
              </div>
              <div className="text-[10px] md:text-xs text-white/50 mt-0.5 md:mt-1">Perfect Rounds</div>
            </div>
          </div>

          {/* New Record */}
          {currentStreak === bestStreak && bestStreak > 0 && isVictory && (
            <div className="mt-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-3
              border border-yellow-400/30 text-center animate-pulse">
              <span className="text-yellow-400 font-bold text-sm md:text-base">
                🎉 NEW PERSONAL BEST! 🎉
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <button
            onClick={onPlayAgain}
            className={`flex-1 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all duration-300 transform hover:scale-105 ${
              isVictory
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                : 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
            }`}
          >
            {isVictory ? '🎮 Keep Fighting!' : '🔄 Try Again'}
          </button>
          <button
            onClick={onBackToMenu}
            className="flex-1 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg bg-white/10 text-white/70
              hover:bg-white/20 hover:text-white transition-all duration-300 transform hover:scale-105
              border border-white/20"
          >
            📋 Main Menu
          </button>
        </div>
      </div>

      <style>{`
        @keyframes victory-bounce {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.05) translateY(-10px); }
        }
        @keyframes defeat-shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-victory-bounce {
          animation: victory-bounce 2s ease-in-out infinite;
        }
        .animate-defeat-shake {
          animation: defeat-shake 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
