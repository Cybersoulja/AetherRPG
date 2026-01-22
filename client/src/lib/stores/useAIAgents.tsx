/**
 * Zustand store for managing AI agents.
 */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { AIAgent } from '../../types/game';
import { AIAgentEngine } from '../aiAgents';

interface AIAgentState {
  aiEngine: AIAgentEngine;
  activeAgents: AIAgent[];
  lastResponse: string;
  isThinking: boolean;
  conversationHistory: Array<{
    agentId: string;
    message: string;
    timestamp: Date;
    context?: string;
  }>;
  
  // Actions
  initializeAgents: () => void;
  getResponse: (agentId: string, context: string, playerName?: string) => Promise<string>;
  addToHistory: (agentId: string, message: string, context?: string) => void;
  clearHistory: () => void;
  getAgentById: (id: string) => AIAgent | undefined;
  getAgentsByRole: (role: AIAgent['role']) => AIAgent[];
  simulateThinking: (agentId: string, complexity?: 'simple' | 'moderate' | 'complex') => Promise<void>;
}

export const useAIAgents = create<AIAgentState>()(
  subscribeWithSelector((set, get) => ({
    aiEngine: new AIAgentEngine(),
    activeAgents: [],
    lastResponse: '',
    isThinking: false,
    conversationHistory: [],

    initializeAgents: () => {
      const { aiEngine } = get();
      const agents = aiEngine.getAllAgents();
      set({ activeAgents: agents });
      console.log('AI Agents initialized:', agents.length);
    },

    getResponse: async (agentId: string, context: string, playerName?: string) => {
      const { aiEngine, addToHistory } = get();
      
      set({ isThinking: true });
      
      try {
        // Simulate thinking time
        await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
        
        const response = aiEngine.generateResponse(agentId, context, { playerName });
        
        set({ 
          lastResponse: response,
          isThinking: false 
        });
        
        // Add to conversation history
        addToHistory(agentId, response, context);
        
        console.log(`AI Response from ${agentId}:`, response);
        return response;
        
      } catch (error) {
        console.error('Error generating AI response:', error);
        const fallbackResponse = "I apologize, but I'm having trouble responding right now.";
        
        set({ 
          lastResponse: fallbackResponse,
          isThinking: false 
        });
        
        return fallbackResponse;
      }
    },

    addToHistory: (agentId: string, message: string, context?: string) => {
      const { conversationHistory } = get();
      
      const newEntry = {
        agentId,
        message,
        context,
        timestamp: new Date()
      };
      
      // Keep only the last 50 entries to prevent memory issues
      const updatedHistory = [...conversationHistory, newEntry].slice(-50);
      
      set({ conversationHistory: updatedHistory });
    },

    clearHistory: () => {
      set({ conversationHistory: [] });
      console.log('Conversation history cleared');
    },

    getAgentById: (id: string) => {
      const { activeAgents } = get();
      return activeAgents.find(agent => agent.id === id);
    },

    getAgentsByRole: (role: AIAgent['role']) => {
      const { activeAgents } = get();
      return activeAgents.filter(agent => agent.role === role);
    },

    simulateThinking: async (agentId: string, complexity: 'simple' | 'moderate' | 'complex' = 'moderate') => {
      const { aiEngine } = get();
      
      set({ isThinking: true });
      
      try {
        await aiEngine.simulateAIThinking(agentId, complexity);
      } finally {
        set({ isThinking: false });
      }
    }
  }))
);
