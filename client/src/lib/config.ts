// Configuration system for the RPG game

export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || '/api',

  // Feature Flags
  enableMultiplayer: import.meta.env.VITE_ENABLE_MULTIPLAYER === 'true',
  enableCloudSaves: import.meta.env.VITE_ENABLE_CLOUD_SAVES === 'true',
  enableLeaderboards: import.meta.env.VITE_ENABLE_LEADERBOARDS === 'true',

  // Game Configuration
  maxSaveSlots: parseInt(import.meta.env.VITE_MAX_SAVES || '5'),
  autoSaveInterval: 60000, // 1 minute in milliseconds
  maxInventorySize: parseInt(import.meta.env.VITE_MAX_INVENTORY || '100'),

  // Audio Configuration
  defaultVolume: 0.7,
  enableAudio: true,

  // Development
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  // Version
  version: '2.0.0',
};

export default config;
