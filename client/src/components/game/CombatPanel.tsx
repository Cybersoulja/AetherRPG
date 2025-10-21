import React, { useState, useEffect } from 'react';
import { useCharacter } from '../../lib/stores/useCharacter';
import { useAIAgents } from '../../lib/stores/useAIAgents';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Sword, 
  Shield, 
  Heart, 
  Zap, 
  Target, 
  Users, 
  Skull,
  Crown,
  Timer
} from 'lucide-react';
import { Enemy, CombatAction, CombatState } from '../../types/game';

/**
 * Props for the CombatPanel component.
 */
interface CombatPanelProps {
  /**
   * Callback function to be called when combat ends.
   */
  onCombatEnd: (victory: boolean, rewards?: { experience: number; gold: number; items?: any[] }) => void;
  /**
   * An array of enemies to fight.
   */
  enemies: Enemy[];
}

/**
 * A component that displays the combat interface.
 * @param {CombatPanelProps} props - The props for the component.
 * @returns {JSX.Element} The rendered combat panel.
 */
export const CombatPanel: React.FC<CombatPanelProps> = ({ onCombatEnd, enemies: initialEnemies }) => {
  const { character, takeDamage, gainExperience, modifyGold, gameEngine } = useCharacter();
  const { getResponse } = useAIAgents();
  
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const [enemies, setEnemies] = useState<Enemy[]>(initialEnemies);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [selectedAction, setSelectedAction] = useState<CombatAction | null>(null);
  const [turnTimer, setTurnTimer] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize combat
  useEffect(() => {
    if (character && initialEnemies.length > 0) {
      const newCombatState = gameEngine.initiateCombat(initialEnemies);
      setCombatState(newCombatState);
      addToCombatLog('🏴‍☠️ Combat begins! Choose your actions wisely.');
      
      // Get DM commentary
      getResponse('dungeon_master', 'combat_start', character.name).then(response => {
        addToCombatLog(`👑 DM: ${response}`);
      });
    }
  }, [character, initialEnemies, gameEngine, getResponse]);

  // Turn timer
  useEffect(() => {
    if (isPlayerTurn && !isProcessing && turnTimer > 0) {
      const timer = setTimeout(() => setTurnTimer(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (turnTimer === 0 && isPlayerTurn) {
      // Auto-defend if time runs out
      handlePlayerAction(combatState?.playerActions.find(a => a.type === 'defend') || combatState?.playerActions[0]);
    }
  }, [isPlayerTurn, isProcessing, turnTimer, combatState]);

  const addToCombatLog = (message: string) => {
    setCombatLog(prev => [...prev.slice(-9), message]); // Keep last 10 messages
  };

  const handlePlayerAction = async (action: CombatAction | undefined) => {
    if (!action || !character || !combatState || isProcessing) return;

    setIsProcessing(true);
    setSelectedAction(action);
    
    try {
      let damage = 0;
      let message = '';

      switch (action.type) {
        case 'attack':
          // Calculate damage to random enemy
          const targetIndex = Math.floor(Math.random() * enemies.length);
          const target = enemies[targetIndex];
          damage = gameEngine.calculateDamage(character, target);
          
          // Apply damage
          const updatedEnemies = [...enemies];
          updatedEnemies[targetIndex] = {
            ...target,
            health: Math.max(0, target.health - damage)
          };
          setEnemies(updatedEnemies);
          
          message = `⚔️ You attack ${target.name} for ${damage} damage!`;
          
          // Check if enemy is defeated
          if (updatedEnemies[targetIndex].health === 0) {
            message += ` ${target.name} is defeated!`;
            // Remove defeated enemy
            setEnemies(prev => prev.filter((_, i) => i !== targetIndex));
          }
          break;

        case 'defend':
          message = '🛡️ You raise your guard, reducing incoming damage this turn.';
          break;

        case 'spell':
          if (character.mana >= (action.cost || 5)) {
            // Implement spell logic based on character class
            if (character.class === 'mage') {
              damage = Math.floor(character.stats.intelligence * 1.5);
              message = `✨ You cast a spell, dealing ${damage} magic damage!`;
            } else if (character.class === 'cleric') {
              const healing = Math.floor(character.stats.wisdom * 1.2);
              message = `🙏 You cast a healing spell, restoring ${healing} health!`;
            }
          } else {
            message = '💫 Not enough mana to cast spell!';
          }
          break;

        default:
          message = `You use ${action.name}.`;
      }

      addToCombatLog(message);

      // Check for victory
      if (enemies.filter(e => e.health > 0).length === 0) {
        setTimeout(() => handleVictory(), 1000);
        return;
      }

      // Enemy turn
      setTimeout(() => handleEnemyTurn(), 1500);

    } catch (error) {
      console.error('Error processing player action:', error);
      addToCombatLog('❌ Action failed due to an error.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEnemyTurn = async () => {
    if (!character || enemies.filter(e => e.health > 0).length === 0) return;

    setIsPlayerTurn(false);
    
    for (const enemy of enemies.filter(e => e.health > 0)) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const damage = gameEngine.calculateDamage(enemy, character);
      takeDamage(damage);
      addToCombatLog(`💀 ${enemy.name} attacks you for ${damage} damage!`);

      // Check for defeat
      if (character.health - damage <= 0) {
        setTimeout(() => handleDefeat(), 1000);
        return;
      }
    }

    // Start next player turn
    setTimeout(() => {
      setIsPlayerTurn(true);
      setTurnTimer(30);
    }, 1000);
  };

  const handleVictory = async () => {
    const baseExperience = enemies.reduce((total, enemy) => total + (enemy.level * 10), 0);
    const baseGold = enemies.reduce((total, enemy) => total + (enemy.level * 5), 0);

    gainExperience(baseExperience);
    modifyGold(baseGold);

    addToCombatLog(`🎉 Victory! You gained ${baseExperience} experience and ${baseGold} gold!`);

    // Get DM victory response
    const dmResponse = await getResponse('dungeon_master', 'victory', character?.name);
    addToCombatLog(`👑 DM: ${dmResponse}`);

    setTimeout(() => {
      onCombatEnd(true, {
        experience: baseExperience,
        gold: baseGold
      });
    }, 2000);
  };

  const handleDefeat = async () => {
    addToCombatLog('💀 You have been defeated...');

    // Get DM defeat response
    const dmResponse = await getResponse('dungeon_master', 'death', character?.name);
    addToCombatLog(`👑 DM: ${dmResponse}`);

    setTimeout(() => {
      onCombatEnd(false);
    }, 2000);
  };

  if (!character || !combatState) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">Combat system unavailable.</p>
        </CardContent>
      </Card>
    );
  }

  const aliveEnemies = enemies.filter(e => e.health > 0);
  const playerHealthPercent = (character.health / character.maxHealth) * 100;

  return (
    <div className="space-y-4">
      {/* Combat Header */}
      <Card className="bg-red-900 border-red-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-200">
            <Sword className="h-5 w-5" />
            Combat Encounter
            {isPlayerTurn && (
              <Badge variant="secondary" className="ml-auto bg-blue-600 text-blue-100">
                <Timer className="h-3 w-3 mr-1" />
                {turnTimer}s
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Player Status */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <Users className="h-4 w-4" />
              {character.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Heart className="h-3 w-3 text-red-400" />
                  Health
                </span>
                <span className="text-sm text-red-400">
                  {character.health}/{character.maxHealth}
                </span>
              </div>
              <Progress value={playerHealthPercent} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Zap className="h-3 w-3 text-blue-400" />
                  Mana
                </span>
                <span className="text-sm text-blue-400">
                  {character.mana}/{character.maxMana}
                </span>
              </div>
              <Progress value={(character.mana / character.maxMana) * 100} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="text-gray-400">Level</div>
                <div className="font-semibold">{character.level}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Class</div>
                <div className="font-semibold capitalize">{character.class}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Combat Log */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Target className="h-4 w-4" />
              Combat Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 overflow-y-auto space-y-1">
              {combatLog.map((message, index) => (
                <div
                  key={index}
                  className="text-sm p-2 rounded bg-gray-700 text-gray-200"
                >
                  {message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enemies */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-400">
              <Skull className="h-4 w-4" />
              Enemies ({aliveEnemies.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aliveEnemies.map((enemy, index) => (
              <div key={enemy.id} className="bg-gray-700 rounded p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-white">{enemy.name}</span>
                  <Badge variant="secondary" className="bg-red-600 text-red-100">
                    Lv. {enemy.level}
                  </Badge>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Health</span>
                    <span className="text-xs text-red-400">
                      {enemy.health}/{enemy.maxHealth}
                    </span>
                  </div>
                  <Progress 
                    value={(enemy.health / enemy.maxHealth) * 100} 
                    className="h-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div>
                    <span className="text-gray-400">Damage: </span>
                    <span className="text-orange-400">{enemy.damage}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Armor: </span>
                    <span className="text-blue-400">{enemy.armor}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {isPlayerTurn && !isProcessing && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-400">Choose your action:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {combatState.playerActions.map((action) => (
                <Button
                  key={action.id}
                  onClick={() => handlePlayerAction(action)}
                  disabled={isProcessing}
                  className="h-auto p-4 flex flex-col items-center gap-2 bg-gray-700 hover:bg-gray-600 border-gray-600"
                >
                  {action.type === 'attack' && <Sword className="h-5 w-5" />}
                  {action.type === 'defend' && <Shield className="h-5 w-5" />}
                  {action.type === 'spell' && <Zap className="h-5 w-5" />}
                  {action.type === 'item' && <Heart className="h-5 w-5" />}
                  
                  <div className="text-center">
                    <div className="font-semibold text-sm">{action.name}</div>
                    <div className="text-xs text-gray-400">{action.description}</div>
                    {action.cost && (
                      <div className="text-xs text-blue-400">Cost: {action.cost} MP</div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <Alert className="bg-blue-900 border-blue-700">
          <AlertDescription className="text-blue-200">
            Processing action...
          </AlertDescription>
        </Alert>
      )}

      {/* Enemy Turn Indicator */}
      {!isPlayerTurn && (
        <Alert className="bg-red-900 border-red-700">
          <AlertDescription className="text-red-200">
            Enemy turn - prepare for incoming attacks!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
