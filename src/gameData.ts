export interface Character {
  id: string;
  name: string;
  title: string;
  emoji: string;
  color: string;
  stats: {
    health: number;
    attack: number;
    defense: number;
    speed: number;
    special: number;
  };
  moves: Move[];
  specialMove: Move;
  portrait: string;
}

export interface Move {
  name: string;
  damage: number;
  type: 'light' | 'heavy' | 'special';
  description: string;
  emoji: string;
}

export const CHARACTERS: Character[] = [
  {
    id: 'luffy',
    name: 'Luffy',
    title: 'Straw Hat Captain',
    emoji: '👒',
    color: '#e11d48',
    portrait: '🏴‍☠️',
    stats: { health: 100, attack: 85, defense: 70, speed: 90, special: 95 },
    moves: [
      { name: 'Gum-Gum Pistol', damage: 15, type: 'light', description: 'A stretchy punch!', emoji: '👊' },
      { name: 'Gum-Gum Bazooka', damage: 25, type: 'heavy', description: 'Double palm strike!', emoji: '🤲' },
    ],
    specialMove: { name: 'Gear Fifth', damage: 45, type: 'special', description: 'Awakening power!', emoji: '⚡' },
  },
  {
    id: 'zoro',
    name: 'Zoro',
    title: 'Pirate Hunter',
    emoji: '⚔️',
    color: '#22c55e',
    portrait: '🗡️',
    stats: { health: 95, attack: 95, defense: 80, speed: 75, special: 85 },
    moves: [
      { name: 'Oni Giri', damage: 18, type: 'light', description: 'Three-sword slash!', emoji: '🗡️' },
      { name: 'Shishi Sonson', damage: 28, type: 'heavy', description: 'Lion song!', emoji: '🦁' },
    ],
    specialMove: { name: 'Ashura', damage: 50, type: 'special', description: 'Nine-sword demon!', emoji: '👹' },
  },
  {
    id: 'sanji',
    name: 'Sanji',
    title: 'Black Leg',
    emoji: '🦵',
    color: '#f59e0b',
    portrait: '🔥',
    stats: { health: 90, attack: 80, defense: 65, speed: 95, special: 80 },
    moves: [
      { name: 'Collier Strike', damage: 14, type: 'light', description: 'Neck kick!', emoji: '🦶' },
      { name: 'Diable Jambe', damage: 26, type: 'heavy', description: 'Flaming leg!', emoji: '🔥' },
    ],
    specialMove: { name: 'Ifrit Jambe', damage: 42, type: 'special', description: 'Hells fire kick!', emoji: '🌋' },
  },
  {
    id: 'nami',
    name: 'Nami',
    title: 'Cat Burglar',
    emoji: '🌩️',
    color: '#f97316',
    portrait: '⛈️',
    stats: { health: 75, attack: 70, defense: 55, speed: 85, special: 90 },
    moves: [
      { name: 'Thunder Tempo', damage: 16, type: 'light', description: 'Lightning strike!', emoji: '⚡' },
      { name: 'Tornado Tempo', damage: 22, type: 'heavy', description: 'Cyclone attack!', emoji: '🌪️' },
    ],
    specialMove: { name: 'Zeus Breeze', damage: 40, type: 'special', description: 'Storm god attack!', emoji: '⛈️' },
  },
  {
    id: 'law',
    name: 'Law',
    title: 'Surgeon of Death',
    emoji: '⚕️',
    color: '#6366f1',
    portrait: '💀',
    stats: { health: 85, attack: 75, defense: 70, speed: 80, special: 100 },
    moves: [
      { name: 'Shambles', damage: 12, type: 'light', description: 'Object swap!', emoji: '🔄' },
      { name: 'Injection Shot', damage: 24, type: 'heavy', description: 'Piercing strike!', emoji: '💉' },
    ],
    specialMove: { name: 'K-Room', damage: 48, type: 'special', description: 'Internal destruction!', emoji: '💔' },
  },
  {
    id: 'ace',
    name: 'Ace',
    title: 'Fire Fist',
    emoji: '🔥',
    color: '#dc2626',
    portrait: '🎴',
    stats: { health: 90, attack: 90, defense: 60, speed: 85, special: 90 },
    moves: [
      { name: 'Fire Fist', damage: 17, type: 'light', description: 'Flaming punch!', emoji: '👊' },
      { name: 'Fire Gun', damage: 24, type: 'heavy', description: 'Fire bullets!', emoji: '🔫' },
    ],
    specialMove: { name: 'Entei', damage: 46, type: 'special', description: 'Great fire emperor!', emoji: '☀️' },
  },
];

export interface GameState {
  phase: 'menu' | 'select' | 'battle' | 'result';
  playerCharacter: Character | null;
  opponentCharacter: Character | null;
  playerHealth: number;
  opponentHealth: number;
  currentRound: number;
  playerRoundsWon: number;
  opponentRoundsWon: number;
  battleLog: string[];
  isPlayerTurn: boolean;
  specialCharge: number;
  opponentSpecialCharge: number;
  lastAction: string;
  matchWinner: 'player' | 'opponent' | null;
  perfectRounds: number;
}

export const initialGameState: GameState = {
  phase: 'menu',
  playerCharacter: null,
  opponentCharacter: null,
  playerHealth: 100,
  opponentHealth: 100,
  currentRound: 1,
  playerRoundsWon: 0,
  opponentRoundsWon: 0,
  battleLog: [],
  isPlayerTurn: true,
  specialCharge: 0,
  opponentSpecialCharge: 0,
  lastAction: '',
  matchWinner: null,
  perfectRounds: 0,
};

// AI opponent logic - medium difficulty
export function getAIMove(
  opponent: Character,
  opponentHealth: number,
  playerHealth: number,
  specialCharge: number
): { move: Move; isSpecial: boolean } {
  const random = Math.random();

  // 30% chance to use special if available
  if (specialCharge >= 100 && random < 0.3) {
    return { move: opponent.specialMove, isSpecial: true };
  }

  // If low health, 40% chance to use heavy attack
  if (opponentHealth < 30 && random < 0.4) {
    return { move: opponent.moves[1], isSpecial: false };
  }

  // If player is low, 50% chance to go aggressive
  if (playerHealth < 30 && random < 0.5) {
    return { move: opponent.moves[1], isSpecial: false };
  }

  // Normal play: 60% light, 40% heavy
  return {
    move: random < 0.6 ? opponent.moves[0] : opponent.moves[1],
    isSpecial: false,
  };
}

export function calculateDamage(
  move: Move,
  attacker: Character,
  defender: Character
): number {
  const attackMod = attacker.stats.attack / 100;
  const defenseMod = 1 - (defender.stats.defense / 200);
  const speedBonus = Math.random() < (attacker.stats.speed / 200) ? 1.2 : 1;
  const variance = 0.9 + Math.random() * 0.2;

  let damage = move.damage * attackMod * defenseMod * speedBonus * variance;

  // Critical hit chance based on speed
  if (Math.random() < attacker.stats.speed / 400) {
    damage *= 1.5;
  }

  return Math.round(damage);
}
