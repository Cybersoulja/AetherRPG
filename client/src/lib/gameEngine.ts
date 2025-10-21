/**
 * The main game engine.
 * This class is responsible for managing the game state, character creation, and combat.
 */
import { Character, CharacterClass, GameState, Item, CombatState, Enemy } from '../types/game';
import { CHARACTER_CLASSES } from '../data/characters';
import { STARTING_ITEMS, CONSUMABLE_ITEMS } from '../data/items';

export class GameEngine {
  private saveKey = 'rpg_game_save';

  createCharacter(name: string, characterClass: CharacterClass): Character {
    const classData = CHARACTER_CLASSES[characterClass];
    const baseHealth = this.calculateHealth(classData.baseStats.constitution);
    const baseMana = this.calculateMana(classData.baseStats.intelligence);

    return {
      id: `char_${Date.now()}`,
      name,
      class: characterClass,
      level: 1,
      experience: 0,
      stats: { ...classData.baseStats },
      health: baseHealth,
      maxHealth: baseHealth,
      mana: baseMana,
      maxMana: baseMana,
      gold: classData.startingGold,
      createdAt: new Date()
    };
  }

  calculateHealth(constitution: number): number {
    return 20 + (constitution * 2);
  }

  calculateMana(intelligence: number): number {
    return 10 + (intelligence * 1.5);
  }

  getStartingItems(characterClass: CharacterClass): Item[] {
    const items = [...STARTING_ITEMS[characterClass]];
    // Add some basic consumables
    items.push(
      { ...CONSUMABLE_ITEMS[0], quantity: 3 }, // Health potions
      { ...CONSUMABLE_ITEMS[2], quantity: 5 }  // Bread
    );
    return items;
  }

  calculateExperienceToNextLevel(level: number): number {
    return level * 100;
  }

  gainExperience(character: Character, amount: number): Character {
    const newExperience = character.experience + amount;
    const experienceNeeded = this.calculateExperienceToNextLevel(character.level);
    
    let newCharacter = { ...character, experience: newExperience };
    
    if (newExperience >= experienceNeeded) {
      newCharacter = this.levelUp(newCharacter);
    }
    
    return newCharacter;
  }

  levelUp(character: Character): Character {
    const newLevel = character.level + 1;
    const statIncrease = this.getStatIncreaseForClass(character.class);
    
    const newStats = {
      strength: character.stats.strength + statIncrease.strength,
      dexterity: character.stats.dexterity + statIncrease.dexterity,
      intelligence: character.stats.intelligence + statIncrease.intelligence,
      constitution: character.stats.constitution + statIncrease.constitution,
      wisdom: character.stats.wisdom + statIncrease.wisdom,
      charisma: character.stats.charisma + statIncrease.charisma
    };

    const healthIncrease = Math.floor(statIncrease.constitution * 2) + 5;
    const manaIncrease = Math.floor(statIncrease.intelligence * 1.5) + 3;

    return {
      ...character,
      level: newLevel,
      experience: character.experience - this.calculateExperienceToNextLevel(character.level),
      stats: newStats,
      maxHealth: character.maxHealth + healthIncrease,
      health: character.health + healthIncrease, // Heal on level up
      maxMana: character.maxMana + manaIncrease,
      mana: character.mana + manaIncrease
    };
  }

  getStatIncreaseForClass(characterClass: CharacterClass) {
    const increases = {
      warrior: { strength: 2, dexterity: 1, intelligence: 0, constitution: 2, wisdom: 1, charisma: 0 },
      mage: { strength: 0, dexterity: 1, intelligence: 2, constitution: 1, wisdom: 2, charisma: 1 },
      rogue: { strength: 1, dexterity: 2, intelligence: 1, constitution: 1, wisdom: 1, charisma: 1 },
      cleric: { strength: 1, dexterity: 0, intelligence: 1, constitution: 1, wisdom: 2, charisma: 2 }
    };
    return increases[characterClass];
  }

  useItem(character: Character, item: Item): { character: Character; success: boolean; message: string } {
    if (item.type === 'consumable') {
      let newCharacter = { ...character };
      let message = '';

      if (item.healing && character.health < character.maxHealth) {
        const healAmount = Math.min(item.healing, character.maxHealth - character.health);
        newCharacter.health += healAmount;
        message = `Restored ${healAmount} health points.`;
      } else if (item.healing) {
        return { character, success: false, message: 'Health is already at maximum.' };
      }

      // Add mana restoration logic if the item restores mana
      if (item.name.toLowerCase().includes('mana') && character.mana < character.maxMana) {
        const manaAmount = 20; // Default mana restoration
        const actualRestore = Math.min(manaAmount, character.maxMana - character.mana);
        newCharacter.mana += actualRestore;
        message = `Restored ${actualRestore} mana points.`;
      }

      return { character: newCharacter, success: true, message };
    }

    return { character, success: false, message: 'Item cannot be used.' };
  }

  initiateCombat(enemies: Enemy[]): CombatState {
    return {
      isActive: true,
      enemies: enemies.map(enemy => ({ ...enemy })),
      turnOrder: ['player', ...enemies.map(e => e.id)],
      currentTurn: 0,
      playerActions: [
        {
          id: 'attack',
          name: 'Attack',
          description: 'Perform a basic attack',
          type: 'attack'
        },
        {
          id: 'defend',
          name: 'Defend',
          description: 'Reduce incoming damage',
          type: 'defend'
        }
      ]
    };
  }

  calculateDamage(attacker: Character | Enemy, defender: Character | Enemy): number {
    let baseDamage = 0;
    
    if ('stats' in attacker) {
      // Player character
      baseDamage = Math.floor(attacker.stats.strength / 2) + 5;
    } else {
      // Enemy
      baseDamage = attacker.damage || 5;
    }

    let armor = 0;
    if ('stats' in defender) {
      // Player character
      armor = Math.floor(defender.stats.constitution / 4);
    } else {
      // Enemy
      armor = defender.armor || 0;
    }

    const finalDamage = Math.max(1, baseDamage - armor);
    return finalDamage + Math.floor(Math.random() * 3); // Add some randomness
  }

  saveGame(gameState: GameState): void {
    const saveData = {
      ...gameState,
      lastSaved: new Date()
    };
    localStorage.setItem(this.saveKey, JSON.stringify(saveData));
  }

  loadGame(): GameState | null {
    try {
      const savedData = localStorage.getItem(this.saveKey);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Failed to load game:', error);
    }
    return null;
  }

  deleteSave(): void {
    localStorage.removeItem(this.saveKey);
  }

  hasSavedGame(): boolean {
    return localStorage.getItem(this.saveKey) !== null;
  }
}
