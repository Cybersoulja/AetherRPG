export interface Character {
  id: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  stats: CharacterStats;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  gold: number;
  createdAt: Date;
}

export interface CharacterStats {
  strength: number;
  dexterity: number;
  intelligence: number;
  constitution: number;
  wisdom: number;
  charisma: number;
}

export type CharacterClass = 'warrior' | 'mage' | 'rogue' | 'cleric';

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  value: number;
  rarity: ItemRarity;
  stats?: Partial<CharacterStats>;
  damage?: number;
  armor?: number;
  healing?: number;
  stackable?: boolean;
  quantity?: number;
}

export type ItemType = 'weapon' | 'armor' | 'consumable' | 'misc' | 'quest';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface GameState {
  character: Character | null;
  inventory: Item[];
  storyState: any;
  currentLocation: string;
  gameFlags: Record<string, boolean>;
  combatState: CombatState | null;
  lastSaved: Date;
}

export interface CombatState {
  isActive: boolean;
  enemies: Enemy[];
  turnOrder: string[];
  currentTurn: number;
  playerActions: CombatAction[];
}

export interface Enemy {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  damage: number;
  armor: number;
  level: number;
}

export interface CombatAction {
  id: string;
  name: string;
  description: string;
  type: 'attack' | 'defend' | 'spell' | 'item';
  cost?: number;
  damage?: number;
  healing?: number;
}

export interface AIAgent {
  id: string;
  name: string;
  role: 'dungeon_master' | 'npc' | 'ally';
  personality: string;
  knowledge: string[];
  responseTemplates: Record<string, string[]>;
}

export interface StoryChoice {
  text: string;
  index: number;
  tags?: string[];
}

export interface StorySegment {
  text: string;
  choices: StoryChoice[];
  tags: string[];
  variables: Record<string, any>;
}
