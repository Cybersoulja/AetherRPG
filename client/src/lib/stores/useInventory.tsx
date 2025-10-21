/**
 * Zustand store for managing the player's inventory.
 */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Item, CharacterClass } from '../../types/game';
import { GameEngine } from '../gameEngine';

interface InventoryState {
  items: Item[];
  gameEngine: GameEngine;
  
  // Actions
  initializeInventory: (characterClass: CharacterClass) => void;
  addItem: (item: Item) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  useItem: (itemId: string) => { success: boolean; message: string };
  getItemById: (itemId: string) => Item | undefined;
  getItemsByType: (type: Item['type']) => Item[];
  getTotalValue: () => number;
  hasItem: (itemId: string, quantity?: number) => boolean;
  clearInventory: () => void;
}

export const useInventory = create<InventoryState>()(
  subscribeWithSelector((set, get) => ({
    items: [],
    gameEngine: new GameEngine(),

    initializeInventory: (characterClass: CharacterClass) => {
      const { gameEngine } = get();
      const startingItems = gameEngine.getStartingItems(characterClass);
      set({ items: startingItems });
      console.log('Inventory initialized with starting items:', startingItems);
    },

    addItem: (item: Item) => {
      const { items } = get();
      
      // Check if item is stackable and already exists
      if (item.stackable) {
        const existingItemIndex = items.findIndex(i => i.id === item.id);
        if (existingItemIndex !== -1) {
          const updatedItems = [...items];
          const existingItem = updatedItems[existingItemIndex];
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: (existingItem.quantity || 1) + (item.quantity || 1)
          };
          set({ items: updatedItems });
          return;
        }
      }

      // Add new item or non-stackable item
      const newItem = { ...item, quantity: item.quantity || 1 };
      set({ items: [...items, newItem] });
      console.log('Item added to inventory:', newItem);
    },

    removeItem: (itemId: string, quantity: number = 1) => {
      const { items } = get();
      const itemIndex = items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) return;

      const updatedItems = [...items];
      const item = updatedItems[itemIndex];
      
      if (item.stackable && (item.quantity || 1) > quantity) {
        // Reduce quantity
        updatedItems[itemIndex] = {
          ...item,
          quantity: (item.quantity || 1) - quantity
        };
      } else {
        // Remove item entirely
        updatedItems.splice(itemIndex, 1);
      }

      set({ items: updatedItems });
      console.log(`Removed ${quantity} of ${item.name} from inventory`);
    },

    useItem: (itemId: string) => {
      const { items, gameEngine, removeItem } = get();
      
      // This would need access to character state
      // For now, we'll return a simple response
      const item = items.find(i => i.id === itemId);
      if (!item) {
        return { success: false, message: 'Item not found in inventory.' };
      }

      if (item.type !== 'consumable') {
        return { success: false, message: 'This item cannot be consumed.' };
      }

      // Remove the item from inventory
      removeItem(itemId, 1);
      
      return { success: true, message: `Used ${item.name}.` };
    },

    getItemById: (itemId: string) => {
      const { items } = get();
      return items.find(item => item.id === itemId);
    },

    getItemsByType: (type: Item['type']) => {
      const { items } = get();
      return items.filter(item => item.type === type);
    },

    getTotalValue: () => {
      const { items } = get();
      return items.reduce((total, item) => {
        return total + (item.value * (item.quantity || 1));
      }, 0);
    },

    hasItem: (itemId: string, quantity: number = 1) => {
      const { items } = get();
      const item = items.find(i => i.id === itemId);
      return item ? (item.quantity || 1) >= quantity : false;
    },

    clearInventory: () => {
      set({ items: [] });
      console.log('Inventory cleared');
    }
  }))
);
