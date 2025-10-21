/**
 * Zustand store for managing the player character.
 */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Character, CharacterClass } from '../../types/game';
import { GameEngine } from '../gameEngine';

interface CharacterState {
  character: Character | null;
  gameEngine: GameEngine;
  
  // Actions
  createCharacter: (name: string, characterClass: CharacterClass) => void;
  updateCharacter: (character: Character) => void;
  gainExperience: (amount: number) => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  spendMana: (amount: number) => boolean;
  restoreMana: (amount: number) => void;
  modifyGold: (amount: number) => void;
  resetCharacter: () => void;
}

export const useCharacter = create<CharacterState>()(
  subscribeWithSelector((set, get) => ({
    character: null,
    gameEngine: new GameEngine(),

    createCharacter: (name: string, characterClass: CharacterClass) => {
      const { gameEngine } = get();
      const newCharacter = gameEngine.createCharacter(name, characterClass);
      set({ character: newCharacter });
      console.log('Character created:', newCharacter);
    },

    updateCharacter: (character: Character) => {
      set({ character });
    },

    gainExperience: (amount: number) => {
      const { character, gameEngine } = get();
      if (!character) return;

      const updatedCharacter = gameEngine.gainExperience(character, amount);
      set({ character: updatedCharacter });
      
      if (updatedCharacter.level > character.level) {
        console.log(`Level up! Now level ${updatedCharacter.level}`);
      }
    },

    takeDamage: (amount: number) => {
      const { character } = get();
      if (!character) return;

      const newHealth = Math.max(0, character.health - amount);
      const updatedCharacter = { ...character, health: newHealth };
      set({ character: updatedCharacter });
      
      if (newHealth === 0) {
        console.log('Character has fallen!');
      }
    },

    heal: (amount: number) => {
      const { character } = get();
      if (!character) return;

      const newHealth = Math.min(character.maxHealth, character.health + amount);
      const updatedCharacter = { ...character, health: newHealth };
      set({ character: updatedCharacter });
    },

    spendMana: (amount: number) => {
      const { character } = get();
      if (!character || character.mana < amount) return false;

      const newMana = character.mana - amount;
      const updatedCharacter = { ...character, mana: newMana };
      set({ character: updatedCharacter });
      return true;
    },

    restoreMana: (amount: number) => {
      const { character } = get();
      if (!character) return;

      const newMana = Math.min(character.maxMana, character.mana + amount);
      const updatedCharacter = { ...character, mana: newMana };
      set({ character: updatedCharacter });
    },

    modifyGold: (amount: number) => {
      const { character } = get();
      if (!character) return;

      const newGold = Math.max(0, character.gold + amount);
      const updatedCharacter = { ...character, gold: newGold };
      set({ character: updatedCharacter });
    },

    resetCharacter: () => {
      set({ character: null });
    }
  }))
);
