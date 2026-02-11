import React, { useEffect, useState, useCallback } from 'react';
import { Character, Move, calculateDamage, getAIMove } from '../gameData';

interface BattleArenaProps {
  player: Character;
  opponent: Character;
  playerHealth: number;
  opponentHealth: number;
  playerSpecial: number;
  opponentSpecial: number;
  isPlayerTurn: boolean;
  battleLog: string[];
  onPlayerMove: (move: Move, isSpecial: boolean) => void;
  onEndRound: () => void;
  roundEnded: boolean;
  currentRound: number;
  playerRounds: number;
  opponentRounds: number;
}

export function BattleArena({
  player,
  opponent,
  playerHealth,
  opponentHealth,
  playerSpecial,
  opponentSpecial,
  isPlayerTurn,
  battleLog,
  onPlayerMove,
  onEndRound,
  roundEnded,
  currentRound,
  playerRounds,
  opponentRounds,
}: BattleArenaProps) {
  const [playerShake, setPlayerShake] = useState(false);
  const [opponentShake, setOpponentShake] = useState(false);
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [opponentAttacking, setOpponentAttacking] = useState(false);
  const [showMoves, setShowMoves] = useState(true);

  // Shake animation when hit
  useEffect(() => {
    if (battleLog.length > 0) {
      const lastLog = battleLog[battleLog.length - 1];
      if (lastLog.includes(player.name) && lastLog.includes('hits')) {
        setOpponentShake(true);
        setPlayerAttacking(true);
        setTimeout(() => {
          setOpponentShake(false);
          setPlayerAttacking(false);
        }, 500);
      } else if (lastLog.includes(opponent.name) && lastLog.includes('hits')) {
        setPlayerShake(true);
        setOpponentAttacking(true);
        setTimeout(() => {
          setPlayerShake(false);
          setOpponentAttacking(false);
        }, 500);
      }
    }
  }, [battleLog, player.name, opponent.name]);

  const handleMoveClick = useCallback((move: Move, isSpecial: boolean) => {
    if (!isPlayerTurn || roundEnded) return;
    if (isSpecial && playerSpecial < 100) return;
    setShowMoves(false);
    onPlayerMove(move, isSpecial);
    setTimeout(() => setShowMoves(true), 1000);
  }, [isPlayerTurn, roundEnded, playerSpecial, onPlayerMove]);

  return (
    <div className="relative w-full max-w-5xl mx-auto px-2 md:px-4">
      {/* Battle Background */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 via-black/70 to-red-900/50" />
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, transparent 0%, black 100%),
              repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)`,
          }}
        />
        {/* Speed lines */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-white animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${50 + Math.random() * 100}px`,
                transform: `rotate(${-45 + Math.random() * 90}deg)`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Round indicator */}
      <div className="relative z-10 text-center py-2 md:py-4">
        <div className="inline-flex items-center gap-2 md:gap-4 bg-black/60 rounded-full px-4 md:px-6 py-1 md:py-2 border border-yellow-400/50">
          <span className="text-yellow-400 font-bold text-xs md:text-sm">ROUND {currentRound}</span>
          <div className="flex gap-1 md:gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={`p${i}`}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors ${
                  i < playerRounds ? 'bg-cyan-400' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <span className="text-white/50 text-xs md:text-sm">vs</span>
          <div className="flex gap-1 md:gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={`o${i}`}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors ${
                  i < opponentRounds ? 'bg-red-400' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Characters */}
      <div className="relative z-10 flex justify-between items-end py-4 md:py-8 px-4 md:px-12">
        {/* Player */}
        <div className={`flex flex-col items-center transition-transform duration-300 ${
          playerShake ? 'animate-shake' : ''
        } ${playerAttacking ? 'translate-x-4 md:translate-x-16' : ''}`}>
          <div className="relative">
            <div
              className="text-6xl md:text-[120px] transition-all duration-300"
              style={{
                filter: `drop-shadow(0 0 20px ${player.color})`,
                transform: `scaleX(1) ${playerAttacking ? 'translateX(20px)' : ''}`,
              }}
            >
              {player.emoji}
            </div>
            {/* Health bar */}
            <div className="absolute -bottom-4 md:-bottom-6 left-1/2 -translate-x-1/2 w-16 md:w-32">
              <div className="h-1.5 md:h-2 bg-black/60 rounded-full overflow-hidden border border-cyan-400/50">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-cyan-300 transition-all duration-500"
                  style={{ width: `${playerHealth}%` }}
                />
              </div>
              <div className="text-center text-[10px] md:text-xs text-cyan-400 mt-0.5 md:mt-1 font-bold">
                {playerHealth} HP
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-8 text-center">
            <div className="text-base md:text-xl font-black text-cyan-400">{player.name}</div>
            <div className="text-[10px] md:text-xs text-cyan-300/70">{player.title}</div>
          </div>
        </div>

        {/* VS */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="text-3xl md:text-6xl font-black text-white/10 animate-pulse">VS</div>
        </div>

        {/* Opponent */}
        <div className={`flex flex-col items-center transition-transform duration-300 ${
          opponentShake ? 'animate-shake' : ''
        } ${opponentAttacking ? '-translate-x-4 md:-translate-x-16' : ''}`}>
          <div className="relative">
            <div
              className="text-6xl md:text-[120px] transition-all duration-300"
              style={{
                filter: `drop-shadow(0 0 20px ${opponent.color})`,
                transform: `scaleX(-1) ${opponentAttacking ? 'translateX(20px)' : ''}`,
              }}
            >
              {opponent.emoji}
            </div>
            {/* Health bar */}
            <div className="absolute -bottom-4 md:-bottom-6 left-1/2 -translate-x-1/2 w-16 md:w-32">
              <div className="h-1.5 md:h-2 bg-black/60 rounded-full overflow-hidden border border-red-400/50">
                <div
                  className="h-full bg-gradient-to-r from-red-400 to-red-300 transition-all duration-500"
                  style={{ width: `${opponentHealth}%` }}
                />
              </div>
              <div className="text-center text-[10px] md:text-xs text-red-400 mt-0.5 md:mt-1 font-bold">
                {opponentHealth} HP
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-8 text-center">
            <div className="text-base md:text-xl font-black text-red-400">{opponent.name}</div>
            <div className="text-[10px] md:text-xs text-red-300/70">{opponent.title}</div>
          </div>
        </div>
      </div>

      {/* Special Meters */}
      <div className="relative z-10 flex justify-between px-2 md:px-8 pb-2 md:pb-4">
        <div className="w-24 md:w-40">
          <div className="text-[10px] md:text-xs text-cyan-400 mb-0.5 md:mb-1 font-bold">SPECIAL</div>
          <div className="h-2 md:h-3 bg-black/60 rounded-full overflow-hidden border border-yellow-400/50">
            <div
              className={`h-full transition-all duration-500 ${
                playerSpecial >= 100
                  ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 animate-pulse'
                  : 'bg-gradient-to-r from-yellow-600 to-yellow-500'
              }`}
              style={{ width: `${playerSpecial}%` }}
            />
          </div>
        </div>
        <div className="w-24 md:w-40">
          <div className="text-[10px] md:text-xs text-red-400 mb-0.5 md:mb-1 font-bold text-right">SPECIAL</div>
          <div className="h-2 md:h-3 bg-black/60 rounded-full overflow-hidden border border-yellow-400/50">
            <div
              className={`h-full transition-all duration-500 ${
                opponentSpecial >= 100
                  ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 animate-pulse'
                  : 'bg-gradient-to-r from-yellow-600 to-yellow-500'
              }`}
              style={{ width: `${opponentSpecial}%` }}
            />
          </div>
        </div>
      </div>

      {/* Battle Log */}
      <div className="relative z-10 bg-black/60 rounded-lg mx-2 md:mx-4 p-2 md:p-4 mb-2 md:mb-4 max-h-16 md:max-h-24 overflow-y-auto border border-white/10">
        {battleLog.slice(-3).map((log, i) => (
          <div
            key={i}
            className={`text-xs md:text-sm transition-opacity duration-300 ${
              i === battleLog.slice(-3).length - 1 ? 'text-white' : 'text-white/50'
            }`}
          >
            {log}
          </div>
        ))}
        {battleLog.length === 0 && (
          <div className="text-white/30 text-xs md:text-sm">Battle begins! Choose your move...</div>
        )}
      </div>

      {/* Move Buttons */}
      {!roundEnded && showMoves && (
        <div className="relative z-10 px-2 md:px-4 pb-4">
          <div className="grid grid-cols-3 gap-1.5 md:gap-3">
            {player.moves.map((move, i) => (
              <button
                key={move.name}
                onClick={() => handleMoveClick(move, false)}
                disabled={!isPlayerTurn}
                className={`relative overflow-hidden rounded-lg p-2 md:p-4 transition-all duration-300 transform
                  ${isPlayerTurn
                    ? 'bg-gradient-to-br from-cyan-600 to-cyan-800 hover:from-cyan-500 hover:to-cyan-700 hover:scale-105 cursor-pointer'
                    : 'bg-gray-700/50 cursor-not-allowed opacity-50'}
                  border border-cyan-400/30`}
              >
                <div className="text-xl md:text-3xl mb-0.5 md:mb-1">{move.emoji}</div>
                <div className="text-[10px] md:text-sm font-bold text-white">{move.name}</div>
                <div className="text-[8px] md:text-xs text-cyan-200">DMG: {move.damage}</div>
              </button>
            ))}
            <button
              onClick={() => handleMoveClick(player.specialMove, true)}
              disabled={!isPlayerTurn || playerSpecial < 100}
              className={`relative overflow-hidden rounded-lg p-2 md:p-4 transition-all duration-300 transform
                ${isPlayerTurn && playerSpecial >= 100
                  ? 'bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 hover:scale-105 cursor-pointer animate-pulse'
                  : 'bg-gray-700/50 cursor-not-allowed opacity-50'}
                border border-yellow-400/50`}
            >
              <div className="text-xl md:text-3xl mb-0.5 md:mb-1">{player.specialMove.emoji}</div>
              <div className="text-[10px] md:text-sm font-bold text-white">{player.specialMove.name}</div>
              <div className="text-[8px] md:text-xs text-yellow-200">SPECIAL!</div>
            </button>
          </div>
        </div>
      )}

      {/* Round End */}
      {roundEnded && (
        <div className="relative z-10 text-center py-4 md:py-8">
          <div className={`text-2xl md:text-4xl font-black mb-2 md:mb-4 animate-pulse ${
            playerHealth > 0 ? 'text-cyan-400' : 'text-red-400'
          }`}>
            {playerHealth > 0 ? 'ROUND WIN!' : 'ROUND LOST!'}
          </div>
          <button
            onClick={onEndRound}
            className="px-6 md:px-8 py-2 md:py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full
              font-bold text-black text-sm md:text-base hover:scale-105 transition-transform"
          >
            {playerRounds >= 2 || opponentRounds >= 2 ? 'VIEW RESULTS' : 'NEXT ROUND'}
          </button>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
