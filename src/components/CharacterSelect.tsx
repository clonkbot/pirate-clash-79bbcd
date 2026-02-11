import React from 'react';
import { Character, CHARACTERS } from '../gameData';

interface CharacterSelectProps {
  onSelect: (character: Character) => void;
  selectedCharacter: Character | null;
  title: string;
  isOpponent?: boolean;
}

export function CharacterSelect({ onSelect, selectedCharacter, title, isOpponent }: CharacterSelectProps) {
  return (
    <div className="flex flex-col items-center">
      <h3 className={`text-xl md:text-2xl font-black mb-4 md:mb-6 tracking-wider ${isOpponent ? 'text-red-400' : 'text-cyan-400'}`}
        style={{ textShadow: `0 0 20px ${isOpponent ? '#ef4444' : '#22d3ee'}` }}>
        {title}
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
        {CHARACTERS.map((char) => (
          <button
            key={char.id}
            onClick={() => onSelect(char)}
            disabled={isOpponent}
            className={`relative group p-2 md:p-4 rounded-lg border-2 transition-all duration-300 transform
              ${selectedCharacter?.id === char.id
                ? `border-${isOpponent ? 'red' : 'cyan'}-400 bg-${isOpponent ? 'red' : 'cyan'}-400/20 scale-105`
                : 'border-white/20 bg-black/40 hover:border-white/40 hover:scale-105'}
              ${isOpponent ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <div className={`text-4xl md:text-6xl mb-1 md:mb-2 transition-transform duration-300 ${!isOpponent && 'group-hover:scale-110'}`}>
              {char.emoji}
            </div>
            <div className="text-xs md:text-sm font-bold text-white">{char.name}</div>
            <div className={`text-[10px] md:text-xs ${isOpponent ? 'text-red-300' : 'text-cyan-300'}`}>{char.title}</div>

            {/* Stats preview on hover */}
            {!isOpponent && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100
                transition-opacity duration-300 bg-black/90 rounded px-2 py-1 whitespace-nowrap z-10 hidden md:block">
                <div className="text-[10px] text-white/70">
                  ATK: {char.stats.attack} | DEF: {char.stats.defense} | SPD: {char.stats.speed}
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
