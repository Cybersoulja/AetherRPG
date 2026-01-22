import { Character, GameState, LeaderboardEntry } from '../types/game';
import { config } from './config';

/**
 * API Client for backend communication
 */
class GameAPI {
  private baseUrl: string;

  constructor(baseUrl: string = config.apiUrl) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Authentication
  async register(username: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Character Management
  async saveCharacter(character: Character) {
    return this.request<{ success: boolean }>('/characters/save', {
      method: 'POST',
      body: JSON.stringify(character),
    });
  }

  async loadCharacter(characterId: string) {
    return this.request<Character>(`/characters/${characterId}`);
  }

  async getCharacters() {
    return this.request<Character[]>('/characters');
  }

  async deleteCharacter(characterId: string) {
    return this.request<{ success: boolean }>(`/characters/${characterId}`, {
      method: 'DELETE',
    });
  }

  // Game State (Cloud Saves)
  async saveGameState(gameState: GameState, slot: number = 1) {
    return this.request<{ success: boolean }>('/saves', {
      method: 'POST',
      body: JSON.stringify({ gameState, slot }),
    });
  }

  async loadGameState(slot: number = 1) {
    return this.request<GameState>(`/saves/${slot}`);
  }

  async getAllSaves() {
    return this.request<GameState[]>('/saves');
  }

  async deleteSave(slot: number) {
    return this.request<{ success: boolean }>(`/saves/${slot}`, {
      method: 'DELETE',
    });
  }

  // Leaderboards
  async getLeaderboard(type: 'level' | 'playtime' | 'achievements' = 'level', limit: number = 10) {
    return this.request<LeaderboardEntry[]>(`/leaderboard?type=${type}&limit=${limit}`);
  }

  async submitScore(character: Character) {
    return this.request<{ success: boolean; rank: number }>('/leaderboard', {
      method: 'POST',
      body: JSON.stringify(character),
    });
  }

  // Analytics (optional)
  async trackEvent(event: string, data: any) {
    if (!config.isDevelopment) {
      return this.request('/analytics/event', {
        method: 'POST',
        body: JSON.stringify({ event, data, timestamp: new Date() }),
      });
    }
  }
}

export const api = new GameAPI();
export default api;
