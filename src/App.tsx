import React, { useState, useEffect, useCallback } from 'react';
import { useConvexAuth } from "convex/react";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../convex/_generated/api";
import { Auth } from './components/Auth';
import { CharacterSelect } from './components/CharacterSelect';
import { BattleArena } from './components/BattleArena';
import { Leaderboard } from './components/Leaderboard';
import { ResultScreen } from './components/ResultScreen';
import {
  Character,
  CHARACTERS,
  GameState,
  initialGameState,
  Move,
  calculateDamage,
  getAIMove,
} from './gameData';

function App() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { signOut } = useAuthActions();

  const player = useQuery(api.players.getCurrentPlayer);
  const leaderboard = useQuery(api.players.getLeaderboard);
  const getOrCreatePlayer = useMutation(api.players.getOrCreatePlayer);
  const recordMatchResult = useMutation(api.players.recordMatchResult);

  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [initialized, setInitialized] = useState(false);

  // Initialize player
  useEffect(() => {
    if (isAuthenticated && !initialized && player === undefined) {
      // Still loading
    } else if (isAuthenticated && !initialized && player === null) {
      getOrCreatePlayer({ username: `Pirate${Math.floor(Math.random() * 9999)}` })
        .then(() => setInitialized(true));
    } else if (isAuthenticated && player) {
      setInitialized(true);
    }
  }, [isAuthenticated, player, initialized, getOrCreatePlayer]);

  // Select random opponent
  const selectRandomOpponent = useCallback((excludeId?: string) => {
    const available = CHARACTERS.filter(c => c.id !== excludeId);
    return available[Math.floor(Math.random() * available.length)];
  }, []);

  // Handle character selection
  const handleSelectCharacter = useCallback((character: Character) => {
    const opponent = selectRandomOpponent(character.id);
    setGameState(prev => ({
      ...prev,
      phase: 'battle',
      playerCharacter: character,
      opponentCharacter: opponent,
      playerHealth: 100,
      opponentHealth: 100,
      currentRound: 1,
      playerRoundsWon: 0,
      opponentRoundsWon: 0,
      battleLog: [],
      isPlayerTurn: true,
      specialCharge: 0,
      opponentSpecialCharge: 0,
      perfectRounds: 0,
      matchWinner: null,
    }));
  }, [selectRandomOpponent]);

  // Handle player move
  const handlePlayerMove = useCallback((move: Move, isSpecial: boolean) => {
    if (!gameState.playerCharacter || !gameState.opponentCharacter) return;

    setGameState(prev => {
      const damage = calculateDamage(move, prev.playerCharacter!, prev.opponentCharacter!);
      const newOpponentHealth = Math.max(0, prev.opponentHealth - damage);
      const newSpecialCharge = isSpecial ? 0 : Math.min(100, prev.specialCharge + 20);

      const newLog = [...prev.battleLog, `${prev.playerCharacter!.name} uses ${move.name}! Hits for ${damage} damage! ${move.emoji}`];

      // Check if round ends
      if (newOpponentHealth <= 0) {
        const newPlayerRounds = prev.playerRoundsWon + 1;
        const isPerfect = prev.playerHealth === 100;
        return {
          ...prev,
          opponentHealth: 0,
          specialCharge: newSpecialCharge,
          battleLog: [...newLog, `${prev.opponentCharacter!.name} is down! Round goes to ${prev.playerCharacter!.name}!`],
          playerRoundsWon: newPlayerRounds,
          isPlayerTurn: false,
          perfectRounds: isPerfect ? prev.perfectRounds + 1 : prev.perfectRounds,
        };
      }

      return {
        ...prev,
        opponentHealth: newOpponentHealth,
        specialCharge: newSpecialCharge,
        battleLog: newLog,
        isPlayerTurn: false,
      };
    });

    // AI turn after delay
    setTimeout(() => {
      setGameState(prev => {
        if (prev.opponentHealth <= 0 || !prev.opponentCharacter || !prev.playerCharacter) {
          return prev;
        }

        const aiMove = getAIMove(prev.opponentCharacter, prev.opponentHealth, prev.playerHealth, prev.opponentSpecialCharge);
        const damage = calculateDamage(aiMove.move, prev.opponentCharacter, prev.playerCharacter);
        const newPlayerHealth = Math.max(0, prev.playerHealth - damage);
        const newOpponentSpecial = aiMove.isSpecial ? 0 : Math.min(100, prev.opponentSpecialCharge + 20);

        const newLog = [...prev.battleLog, `${prev.opponentCharacter.name} uses ${aiMove.move.name}! Hits for ${damage} damage! ${aiMove.move.emoji}`];

        // Check if round ends
        if (newPlayerHealth <= 0) {
          const newOpponentRounds = prev.opponentRoundsWon + 1;
          return {
            ...prev,
            playerHealth: 0,
            opponentSpecialCharge: newOpponentSpecial,
            battleLog: [...newLog, `${prev.playerCharacter.name} is down! Round goes to ${prev.opponentCharacter.name}!`],
            opponentRoundsWon: newOpponentRounds,
            isPlayerTurn: false,
          };
        }

        return {
          ...prev,
          playerHealth: newPlayerHealth,
          opponentSpecialCharge: newOpponentSpecial,
          battleLog: newLog,
          isPlayerTurn: true,
        };
      });
    }, 1500);
  }, [gameState.playerCharacter, gameState.opponentCharacter]);

  // Handle end of round
  const handleEndRound = useCallback(async () => {
    const matchOver = gameState.playerRoundsWon >= 2 || gameState.opponentRoundsWon >= 2;

    if (matchOver) {
      const playerWon = gameState.playerRoundsWon >= 2;

      // Record match result
      if (gameState.playerCharacter && gameState.opponentCharacter) {
        await recordMatchResult({
          playerCharacter: gameState.playerCharacter.id,
          opponentCharacter: gameState.opponentCharacter.id,
          playerWon,
          roundsWon: gameState.playerRoundsWon,
          roundsLost: gameState.opponentRoundsWon,
          perfectRounds: gameState.perfectRounds,
        });
      }

      setGameState(prev => ({
        ...prev,
        phase: 'result',
        matchWinner: playerWon ? 'player' : 'opponent',
      }));
    } else {
      // Next round
      setGameState(prev => ({
        ...prev,
        playerHealth: 100,
        opponentHealth: 100,
        currentRound: prev.currentRound + 1,
        isPlayerTurn: true,
        battleLog: [...prev.battleLog, `--- ROUND ${prev.currentRound + 1} ---`],
      }));
    }
  }, [gameState, recordMatchResult]);

  // Handle play again (keep character, new opponent)
  const handlePlayAgain = useCallback(() => {
    if (!gameState.playerCharacter) return;
    const newOpponent = selectRandomOpponent(gameState.playerCharacter.id);
    setGameState(prev => ({
      ...initialGameState,
      phase: 'battle',
      playerCharacter: prev.playerCharacter,
      opponentCharacter: newOpponent,
    }));
  }, [gameState.playerCharacter, selectRandomOpponent]);

  // Handle back to menu
  const handleBackToMenu = useCallback(() => {
    setGameState(initialGameState);
  }, []);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-4xl animate-pulse">⚓</div>
      </div>
    );
  }

  // Auth screen
  if (!isAuthenticated) {
    return <Auth />;
  }

  // Loading player
  if (!initialized || player === undefined) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🏴‍☠️</div>
          <div className="text-white/50">Loading your pirate profile...</div>
        </div>
      </div>
    );
  }

  const roundEnded = gameState.playerHealth <= 0 || gameState.opponentHealth <= 0;

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/50 via-black to-purple-950/50" />
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255,255,255,0.02) 10px,
              rgba(255,255,255,0.02) 20px
            )`,
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <button
            onClick={handleBackToMenu}
            className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl md:text-3xl">🏴‍☠️</span>
            <h1 className="text-lg md:text-2xl font-black tracking-tight hidden sm:block"
              style={{
                background: 'linear-gradient(135deg, #fbbf24, #ef4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              PIRATE CLASH
            </h1>
          </button>

          <div className="flex items-center gap-2 md:gap-4">
            {player && (
              <div className="text-right hidden sm:block">
                <div className="text-xs md:text-sm text-white/50">Playing as</div>
                <div className="font-bold text-white text-sm md:text-base">{player.username}</div>
              </div>
            )}
            {player && (
              <div className="bg-yellow-500/20 rounded-lg px-2 md:px-3 py-1 md:py-1.5 border border-yellow-400/30">
                <div className="text-[10px] md:text-xs text-yellow-400/70">Streak</div>
                <div className="font-black text-yellow-400 text-base md:text-xl flex items-center gap-1">
                  <span>🔥</span> {player.currentStreak}
                </div>
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-white/50 hover:text-white hover:bg-white/10
                rounded-lg transition-all duration-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 min-h-[calc(100vh-180px)] md:min-h-[calc(100vh-200px)]">
        {/* Menu Phase */}
        {gameState.phase === 'menu' && (
          <div className="max-w-7xl mx-auto px-3 md:px-6 py-6 md:py-12">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl md:text-5xl font-black mb-3 md:mb-4"
                style={{
                  background: 'linear-gradient(135deg, #22d3ee, #a855f7, #ef4444)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Choose Your Fighter
              </h2>
              <p className="text-white/50 text-sm md:text-base">Select a One Piece character to battle!</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Character Selection */}
              <div className="lg:col-span-2">
                <div className="bg-black/40 rounded-2xl border border-white/10 p-4 md:p-6 backdrop-blur-sm">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    {CHARACTERS.map((char) => (
                      <button
                        key={char.id}
                        onClick={() => handleSelectCharacter(char)}
                        className="group relative overflow-hidden rounded-xl p-3 md:p-6 transition-all duration-300
                          bg-gradient-to-br from-white/5 to-transparent border border-white/10
                          hover:border-cyan-400/50 hover:from-cyan-400/10 hover:scale-105 transform"
                      >
                        <div className="text-4xl md:text-6xl mb-2 md:mb-3 transition-transform duration-300 group-hover:scale-110">
                          {char.emoji}
                        </div>
                        <div className="text-sm md:text-lg font-bold text-white mb-0.5 md:mb-1">{char.name}</div>
                        <div className="text-[10px] md:text-xs text-white/50 mb-2 md:mb-3">{char.title}</div>

                        {/* Stats bars */}
                        <div className="space-y-1 md:space-y-1.5 text-[9px] md:text-xs">
                          <div className="flex items-center gap-1 md:gap-2">
                            <span className="w-6 md:w-8 text-white/40">ATK</span>
                            <div className="flex-1 h-1 md:h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-red-400" style={{ width: `${char.stats.attack}%` }} />
                            </div>
                          </div>
                          <div className="flex items-center gap-1 md:gap-2">
                            <span className="w-6 md:w-8 text-white/40">DEF</span>
                            <div className="flex-1 h-1 md:h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-400" style={{ width: `${char.stats.defense}%` }} />
                            </div>
                          </div>
                          <div className="flex items-center gap-1 md:gap-2">
                            <span className="w-6 md:w-8 text-white/40">SPD</span>
                            <div className="flex-1 h-1 md:h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-green-400" style={{ width: `${char.stats.speed}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Special move preview */}
                        <div className="mt-2 md:mt-4 pt-2 md:pt-3 border-t border-white/10">
                          <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs text-yellow-400/70">
                            <span>{char.specialMove.emoji}</span>
                            <span>{char.specialMove.name}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="lg:col-span-1">
                <Leaderboard
                  entries={leaderboard || []}
                  currentPlayerId={player?._id}
                />

                {/* Player Stats */}
                {player && (
                  <div className="mt-4 md:mt-6 bg-black/40 rounded-2xl border border-white/10 p-4 md:p-6 backdrop-blur-sm">
                    <h3 className="text-base md:text-lg font-bold text-white mb-3 md:mb-4">Your Stats</h3>
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                      <div className="bg-white/5 rounded-lg p-2 md:p-3 text-center">
                        <div className="text-xl md:text-2xl font-black text-green-400">{player.totalWins}</div>
                        <div className="text-[10px] md:text-xs text-white/40">Wins</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 md:p-3 text-center">
                        <div className="text-xl md:text-2xl font-black text-red-400">{player.totalLosses}</div>
                        <div className="text-[10px] md:text-xs text-white/40">Losses</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 md:p-3 text-center">
                        <div className="text-xl md:text-2xl font-black text-yellow-400">{player.currentStreak}</div>
                        <div className="text-[10px] md:text-xs text-white/40">Current Streak</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 md:p-3 text-center">
                        <div className="text-xl md:text-2xl font-black text-orange-400">{player.bestStreak}</div>
                        <div className="text-[10px] md:text-xs text-white/40">Best Streak</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Battle Phase */}
        {gameState.phase === 'battle' && gameState.playerCharacter && gameState.opponentCharacter && (
          <div className="py-4 md:py-8">
            <BattleArena
              player={gameState.playerCharacter}
              opponent={gameState.opponentCharacter}
              playerHealth={gameState.playerHealth}
              opponentHealth={gameState.opponentHealth}
              playerSpecial={gameState.specialCharge}
              opponentSpecial={gameState.opponentSpecialCharge}
              isPlayerTurn={gameState.isPlayerTurn}
              battleLog={gameState.battleLog}
              onPlayerMove={handlePlayerMove}
              onEndRound={handleEndRound}
              roundEnded={roundEnded}
              currentRound={gameState.currentRound}
              playerRounds={gameState.playerRoundsWon}
              opponentRounds={gameState.opponentRoundsWon}
            />
          </div>
        )}

        {/* Result Phase */}
        {gameState.phase === 'result' && gameState.matchWinner && gameState.playerCharacter && gameState.opponentCharacter && (
          <ResultScreen
            winner={gameState.matchWinner}
            player={gameState.playerCharacter}
            opponent={gameState.opponentCharacter}
            playerRounds={gameState.playerRoundsWon}
            opponentRounds={gameState.opponentRoundsWon}
            currentStreak={player?.currentStreak || 0}
            bestStreak={player?.bestStreak || 0}
            perfectRounds={gameState.perfectRounds}
            onPlayAgain={handlePlayAgain}
            onBackToMenu={handleBackToMenu}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-sm py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white/30 text-xs">
            Requested by <span className="text-white/40">@plantingtoearn</span> · Built by <span className="text-white/40">@clonkbot</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
