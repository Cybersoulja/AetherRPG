import React, { useEffect, useState } from 'react';
import { useCharacter } from './lib/stores/useCharacter';
import { useInventory } from './lib/stores/useInventory';
import { useStoryEngine } from './lib/stores/useStoryEngine';
import { useAIAgents } from './lib/stores/useAIAgents';
import { useAudio } from './lib/stores/useAudio';
import { WelcomeScreen } from './components/game/WelcomeScreen';
import { CharacterCreation } from './components/game/CharacterCreation';
import { GameInterface } from './components/game/GameInterface';
import '@fontsource/inter';

function App() {
  const { character } = useCharacter();
  const { initializeInventory } = useInventory();
  const { initializeStory } = useStoryEngine();
  const { initializeAgents } = useAIAgents();
  const { toggleMute, isMuted } = useAudio();
  const [gamePhase, setGamePhase] = useState<'welcome' | 'character_creation' | 'playing'>('welcome');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize all game systems
  useEffect(() => {
    const initializeGame = async () => {
      try {
        console.log('Initializing game systems...');
        
        // Initialize AI agents
        initializeAgents();
        
        // Initialize story engine
        initializeStory();
        
        setIsInitialized(true);
        console.log('Game systems initialized successfully');
      } catch (error) {
        console.error('Failed to initialize game systems:', error);
      }
    };

    initializeGame();
  }, [initializeAgents, initializeStory]);

  // Handle character creation completion
  useEffect(() => {
    if (character && gamePhase === 'character_creation') {
      // Initialize inventory with character's starting items
      initializeInventory(character.class);
      setGamePhase('playing');
      console.log('Character created, starting game:', character.name);
    }
  }, [character, gamePhase, initializeInventory]);

  // Auto-unmute audio on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (isMuted) {
        console.log('First user interaction detected, unmuting audio');
        toggleMute();
      }
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [isMuted, toggleMute]);

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold mb-2">Loading Aethermoor Chronicles</h2>
          <p className="text-gray-400">Initializing game systems...</p>
        </div>
      </div>
    );
  }

  // Render appropriate game phase
  switch (gamePhase) {
    case 'welcome':
      return (
        <WelcomeScreen 
          onStartNewGame={() => setGamePhase('character_creation')}
          onContinueGame={() => {
            if (character) {
              setGamePhase('playing');
            } else {
              setGamePhase('character_creation');
            }
          }}
          hasSavedGame={!!character}
        />
      );

    case 'character_creation':
      return (
        <CharacterCreation 
          onCharacterCreated={() => setGamePhase('playing')}
          onBackToMenu={() => setGamePhase('welcome')}
        />
      );

    case 'playing':
      return <GameInterface />;

    default:
      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Unknown Game State</h2>
            <p className="text-gray-400">Please refresh the page to restart.</p>
          </div>
        </div>
      );
  }
}

export default App;
