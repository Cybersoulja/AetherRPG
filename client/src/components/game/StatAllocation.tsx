import React from 'react';
import { useCharacter } from '../../lib/stores/useCharacter';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import {
  TrendingUp,
  Plus,
  Info,
  Zap,
  Shield,
  Brain,
  Heart,
  Eye,
  MessageCircle,
} from 'lucide-react';

export const StatAllocation: React.FC = () => {
  const { character, spendStatPoint, getTotalStats } = useCharacter();

  if (!character) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">No character loaded.</p>
        </CardContent>
      </Card>
    );
  }

  const totalStats = getTotalStats();

  const statInfo: Record<keyof typeof character.stats, { icon: any; color: string; description: string }> = {
    strength: {
      icon: Zap,
      color: 'text-red-400',
      description: 'Increases physical damage and carrying capacity',
    },
    dexterity: {
      icon: Eye,
      color: 'text-green-400',
      description: 'Improves accuracy, evasion, and critical chance',
    },
    intelligence: {
      icon: Brain,
      color: 'text-blue-400',
      description: 'Enhances spell damage and mana pool',
    },
    constitution: {
      icon: Heart,
      color: 'text-pink-400',
      description: 'Increases health and physical defense',
    },
    wisdom: {
      icon: MessageCircle,
      color: 'text-purple-400',
      description: 'Boosts healing and magical defense',
    },
    charisma: {
      icon: MessageCircle,
      color: 'text-yellow-400',
      description: 'Improves prices and NPC interactions',
    },
  };

  const handleIncreaseStat = (stat: keyof typeof character.stats) => {
    spendStatPoint(stat);
  };

  const renderStatRow = (stat: keyof typeof character.stats) => {
    const info = statInfo[stat];
    const Icon = info.icon;
    const baseValue = character.stats[stat];
    const totalValue = totalStats?.[stat] || baseValue;
    const bonus = totalValue - baseValue;

    return (
      <Card key={stat} className="bg-gray-700 border-gray-600">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Icon className={`h-6 w-6 ${info.color}`} />
              <div>
                <div className="font-semibold text-white capitalize">
                  {stat}
                </div>
                <div className="text-xs text-gray-400">{info.description}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className={`text-2xl font-bold ${info.color}`}>
                  {totalValue}
                </div>
                {bonus > 0 && (
                  <div className="text-xs text-green-400">
                    Base: {baseValue} (+{bonus} bonus)
                  </div>
                )}
              </div>

              <Button
                size="sm"
                onClick={() => handleIncreaseStat(stat)}
                disabled={character.unspentStatPoints === 0}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Progress value={(totalValue / 30) * 100} className="h-1" />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-900/30 to-gray-800 border-purple-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <TrendingUp className="h-5 w-5" />
            Stat Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Unspent Stat Points</div>
              <div className="text-3xl font-bold text-purple-400 mt-1">
                {character.unspentStatPoints}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Earn 2 points every 5 levels
              </div>
            </div>

            {character.unspentStatPoints > 0 && (
              <Badge className="bg-purple-600 text-white px-4 py-2">
                Points Available!
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      {character.unspentStatPoints === 0 && (
        <Card className="bg-blue-900/30 border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-200">
                <p className="font-semibold mb-1">No stat points available</p>
                <p className="text-xs">
                  You'll earn 2 stat points when you reach level {Math.ceil(character.level / 5) * 5}.
                  Keep adventuring!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stat Grid */}
      <div className="space-y-3">
        {(Object.keys(character.stats) as Array<keyof typeof character.stats>).map((stat) =>
          renderStatRow(stat)
        )}
      </div>

      {/* Stats Summary */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Stat Effects Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-400">Health</div>
              <div className="text-white font-semibold">
                {character.health}/{character.maxHealth}
              </div>
              <div className="text-xs text-gray-500">
                +{Math.floor(character.stats.constitution * 2)} from CON
              </div>
            </div>

            <div>
              <div className="text-gray-400">Mana</div>
              <div className="text-white font-semibold">
                {character.mana}/{character.maxMana}
              </div>
              <div className="text-xs text-gray-500">
                +{Math.floor(character.stats.intelligence * 1.5)} from INT
              </div>
            </div>

            <div>
              <div className="text-gray-400">Physical Damage</div>
              <div className="text-white font-semibold">
                +{Math.floor(character.stats.strength / 2)}
              </div>
              <div className="text-xs text-gray-500">from STR</div>
            </div>

            <div>
              <div className="text-gray-400">Physical Defense</div>
              <div className="text-white font-semibold">
                +{Math.floor(character.stats.constitution / 4)}
              </div>
              <div className="text-xs text-gray-500">from CON</div>
            </div>

            <div>
              <div className="text-gray-400">Spell Power</div>
              <div className="text-white font-semibold">
                +{Math.floor((character.stats.intelligence + character.stats.wisdom) / 2)}
              </div>
              <div className="text-xs text-gray-500">from INT + WIS</div>
            </div>

            <div>
              <div className="text-gray-400">Shop Discount</div>
              <div className="text-white font-semibold">
                {Math.max(0, (character.stats.charisma - 10) * 2)}%
              </div>
              <div className="text-xs text-gray-500">from CHA</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
