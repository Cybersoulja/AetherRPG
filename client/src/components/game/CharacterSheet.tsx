import React from 'react';
import { useCharacter } from '../../lib/stores/useCharacter';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { User, Heart, Zap, Coins, Star, TrendingUp } from 'lucide-react';

export const CharacterSheet: React.FC = () => {
  const { character, gameEngine } = useCharacter();

  if (!character) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">No character data available.</p>
        </CardContent>
      </Card>
    );
  }

  const experienceToNext = gameEngine.calculateExperienceToNextLevel(character.level);
  const experienceProgress = (character.experience / experienceToNext) * 100;
  const healthPercentage = (character.health / character.maxHealth) * 100;
  const manaPercentage = (character.mana / character.maxMana) * 100;

  const getStatColor = (statValue: number) => {
    if (statValue >= 16) return 'text-green-400';
    if (statValue >= 13) return 'text-blue-400';
    if (statValue >= 10) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getStatModifier = (statValue: number) => {
    const modifier = Math.floor((statValue - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Character Overview */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <User className="h-5 w-5" />
            Character Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">{character.name}</h2>
            <Badge variant="secondary" className="mt-1 bg-gray-700 text-gray-300">
              Level {character.level} {character.class}
            </Badge>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Experience</span>
                <span className="text-sm text-white">
                  {character.experience} / {experienceToNext}
                </span>
              </div>
              <Progress value={experienceProgress} className="h-2 bg-gray-700" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Heart className="h-4 w-4 text-red-400" />
                  Health
                </span>
                <span className="text-sm text-red-400">
                  {character.health} / {character.maxHealth}
                </span>
              </div>
              <Progress value={healthPercentage} className="h-2 bg-gray-700" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Zap className="h-4 w-4 text-blue-400" />
                  Mana
                </span>
                <span className="text-sm text-blue-400">
                  {character.mana} / {character.maxMana}
                </span>
              </div>
              <Progress value={manaPercentage} className="h-2 bg-gray-700" />
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-gray-400 flex items-center gap-1">
                <Coins className="h-4 w-4 text-yellow-400" />
                Gold
              </span>
              <span className="text-lg font-semibold text-yellow-400">
                {character.gold}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ability Scores */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Star className="h-5 w-5" />
            Ability Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(character.stats).map(([statName, value]) => (
              <div
                key={statName}
                className="bg-gray-700 rounded-lg p-3 text-center"
              >
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  {statName.substring(0, 3)}
                </div>
                <div className={`text-2xl font-bold ${getStatColor(value)}`}>
                  {value}
                </div>
                <div className="text-xs text-gray-500">
                  {getStatModifier(value)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-gray-500">
            <p>Modifiers are calculated as (Score - 10) / 2</p>
          </div>
        </CardContent>
      </Card>

      {/* Character Progression */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <TrendingUp className="h-5 w-5" />
            Progression
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Current Level</span>
              <span className="text-sm font-semibold text-white">{character.level}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Experience Points</span>
              <span className="text-sm font-semibold text-white">{character.experience}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">To Next Level</span>
              <span className="text-sm font-semibold text-white">
                {experienceToNext - character.experience}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Class Features</h4>
            <div className="text-xs text-gray-400 space-y-1">
              {character.class === 'warrior' && (
                <>
                  <p>• Combat Expertise: Bonus to attack rolls</p>
                  <p>• Defender: Enhanced armor effectiveness</p>
                </>
              )}
              {character.class === 'mage' && (
                <>
                  <p>• Spellcasting: Access to magical abilities</p>
                  <p>• Arcane Knowledge: Bonus to magic-related checks</p>
                </>
              )}
              {character.class === 'rogue' && (
                <>
                  <p>• Stealth: Move unseen in shadows</p>
                  <p>• Sneak Attack: Bonus damage from hiding</p>
                </>
              )}
              {character.class === 'cleric' && (
                <>
                  <p>• Divine Magic: Healing and protective spells</p>
                  <p>• Turn Undead: Repel undead creatures</p>
                </>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              Created: {character.createdAt.toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
