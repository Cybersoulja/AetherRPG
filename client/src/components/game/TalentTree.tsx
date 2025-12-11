import React from 'react';
import { useCharacter } from '../../lib/stores/useCharacter';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import {
  Sparkles,
  Lock,
  CheckCircle2,
  Info,
  TrendingUp,
} from 'lucide-react';
import { Talent } from '../../types/game';
import { getTalentsByClass, getAvailableTalents } from '../../data/talents';

export const TalentTree: React.FC = () => {
  const { character, chooseTalent } = useCharacter();

  if (!character) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">No character loaded.</p>
        </CardContent>
      </Card>
    );
  }

  const classTalents = getTalentsByClass(character.class);
  const chosenTalentIds = character.talents.map((t) => t.talentId);
  const availableTalents = getAvailableTalents(
    character.class,
    character.level,
    chosenTalentIds
  );

  const talentsByTree = {
    left: classTalents.filter((t) => t.tree === 'left'),
    middle: classTalents.filter((t) => t.tree === 'middle'),
    right: classTalents.filter((t) => t.tree === 'right'),
  };

  const treeNames = {
    warrior: { left: 'Tank', middle: 'Balanced', right: 'DPS' },
    mage: { left: 'Fire', middle: 'Arcane', right: 'Frost' },
    rogue: { left: 'Stealth', middle: 'Assassin', right: 'Poison' },
    cleric: { left: 'Healing', middle: 'Champion', right: 'Smite' },
  };

  const handleChooseTalent = (talent: Talent) => {
    chooseTalent(talent.id);
  };

  const isTalentAvailable = (talent: Talent): boolean => {
    return availableTalents.some((t) => t.id === talent.id);
  };

  const isTalentChosen = (talentId: string): boolean => {
    return chosenTalentIds.includes(talentId);
  };

  const renderTalent = (talent: Talent) => {
    const isChosen = isTalentChosen(talent.id);
    const isAvailable = isTalentAvailable(talent);
    const isLocked = !isChosen && !isAvailable;

    return (
      <Card
        key={talent.id}
        className={`${
          isChosen
            ? 'bg-gradient-to-br from-purple-900 to-gray-800 border-purple-500'
            : isAvailable
            ? 'bg-gray-800 border-blue-500 hover:border-blue-400 cursor-pointer'
            : 'bg-gray-800/50 border-gray-700 opacity-60'
        } transition-all`}
        onClick={() => isAvailable && !isChosen && handleChooseTalent(talent)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              className={`text-3xl ${
                isChosen ? 'animate-pulse' : isLocked ? 'grayscale opacity-50' : ''
              }`}
            >
              {talent.icon}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`font-semibold ${
                    isChosen
                      ? 'text-purple-300'
                      : isAvailable
                      ? 'text-white'
                      : 'text-gray-500'
                  }`}
                >
                  {talent.name}
                </span>
                {isChosen && <CheckCircle2 className="h-4 w-4 text-purple-400" />}
                {isLocked && <Lock className="h-4 w-4 text-gray-500" />}
              </div>

              <p
                className={`text-xs mb-2 ${
                  isAvailable ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                {talent.description}
              </p>

              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                  Tier {talent.tier}
                </Badge>
                <Badge variant="secondary" className="text-xs bg-blue-900 text-blue-200">
                  Lv. {talent.requiredLevel}
                </Badge>
              </div>

              {talent.requirements && talent.requirements.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Requires: {talent.requirements.map((req) => {
                    const reqTalent = classTalents.find((t) => t.id === req);
                    return reqTalent?.name || req;
                  }).join(', ')}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <Sparkles className="h-5 w-5" />
            Talent Trees - {character.class.charAt(0).toUpperCase() + character.class.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {chosenTalentIds.length}
              </div>
              <div className="text-xs text-gray-400">Talents Chosen</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {availableTalents.length}
              </div>
              <div className="text-xs text-gray-400">Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-400">
                {character.level}
              </div>
              <div className="text-xs text-gray-400">Current Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Talent Trees */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {(['left', 'middle', 'right'] as const).map((tree) => (
          <Card key={tree} className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-center">
                {treeNames[character.class][tree]} Tree
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-2">
                <div className="space-y-3">
                  {talentsByTree[tree].map((talent) => renderTalent(talent))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-blue-900/30 border-blue-700">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <p className="font-semibold mb-1">How Talents Work:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Talents unlock at specific level milestones</li>
                <li>Some talents require other talents to be chosen first</li>
                <li>Choose wisely - talents define your playstyle!</li>
                <li>Higher tier talents are more powerful but require more prerequisites</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
