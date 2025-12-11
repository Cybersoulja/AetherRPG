import React, { useEffect } from 'react';
import { useQuests } from '../../lib/stores/useQuests';
import { useCharacter } from '../../lib/stores/useCharacter';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import {
  ScrollText,
  CheckCircle2,
  Circle,
  XCircle,
  Star,
  Coins,
  Zap,
  Gift,
  Target,
} from 'lucide-react';
import { Quest } from '../../types/game';

export const QuestLog: React.FC = () => {
  const {
    quests,
    initializeQuests,
    activateQuest,
    getActiveQuests,
    getCompletedQuests,
    getAvailableQuests,
  } = useQuests();
  const { character, gainExperience, modifyGold, learnSpell } = useCharacter();

  useEffect(() => {
    if (quests.length === 0) {
      initializeQuests();
    }
  }, [quests.length, initializeQuests]);

  const handleActivateQuest = (questId: string) => {
    activateQuest(questId);
  };

  const handleClaimReward = (quest: Quest) => {
    if (quest.status !== 'completed') return;

    // Grant rewards
    gainExperience(quest.rewards.experience);
    modifyGold(quest.rewards.gold);

    if (quest.rewards.unlockSpell) {
      learnSpell(quest.rewards.unlockSpell);
    }

    // Could add items to inventory here
    // if (quest.rewards.items) {
    //   quest.rewards.items.forEach(item => addItem(item));
    // }
  };

  const renderQuestCard = (quest: Quest, showActivateButton: boolean = false) => {
    const allObjectivesComplete = quest.objectives.every(obj => obj.completed);
    const completedCount = quest.objectives.filter(obj => obj.completed).length;

    return (
      <Card key={quest.id} className="bg-gray-800 border-gray-700 mb-3">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg text-white">{quest.title}</CardTitle>
                {quest.isMainQuest && (
                  <Badge className="bg-yellow-600 text-yellow-100">
                    <Star className="h-3 w-3 mr-1" />
                    Main
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                  Lv. {quest.level}
                </Badge>
              </div>
              <p className="text-sm text-gray-400">{quest.description}</p>
              {quest.questGiver && (
                <p className="text-xs text-gray-500 mt-1">Quest Giver: {quest.questGiver}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Objectives */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-1">
                <Target className="h-4 w-4" />
                Objectives
              </span>
              <span className="text-gray-500">
                {completedCount}/{quest.objectives.length}
              </span>
            </div>

            {quest.objectives.map((objective) => (
              <div key={objective.id} className="flex items-start gap-2">
                {objective.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-sm ${objective.completed ? 'text-green-400 line-through' : 'text-gray-300'}`}>
                    {objective.description}
                  </p>
                  {!objective.completed && objective.required > 1 && (
                    <div className="mt-1">
                      <Progress
                        value={(objective.current / objective.required) * 100}
                        className="h-1"
                      />
                      <p className="text-xs text-gray-500 mt-0.5">
                        {objective.current}/{objective.required}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-3 bg-gray-600" />

          {/* Rewards */}
          <div className="space-y-2">
            <div className="text-sm text-gray-400 flex items-center gap-1">
              <Gift className="h-4 w-4" />
              Rewards
            </div>
            <div className="flex flex-wrap gap-2">
              {quest.rewards.experience > 0 && (
                <Badge variant="secondary" className="bg-blue-900 text-blue-200">
                  <Zap className="h-3 w-3 mr-1" />
                  {quest.rewards.experience} XP
                </Badge>
              )}
              {quest.rewards.gold > 0 && (
                <Badge variant="secondary" className="bg-yellow-900 text-yellow-200">
                  <Coins className="h-3 w-3 mr-1" />
                  {quest.rewards.gold} Gold
                </Badge>
              )}
              {quest.rewards.unlockSpell && (
                <Badge variant="secondary" className="bg-purple-900 text-purple-200">
                  ✨ Unlock Spell
                </Badge>
              )}
              {quest.rewards.items && quest.rewards.items.length > 0 && (
                <Badge variant="secondary" className="bg-green-900 text-green-200">
                  🎁 {quest.rewards.items.length} Items
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            {showActivateButton && quest.status === 'available' && (
              <Button
                onClick={() => handleActivateQuest(quest.id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Accept Quest
              </Button>
            )}
            {quest.status === 'completed' && (
              <Button
                onClick={() => handleClaimReward(quest)}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Claim Rewards
              </Button>
            )}
            {quest.status === 'active' && allObjectivesComplete && (
              <Badge className="flex-1 bg-green-600 text-white justify-center py-2">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete! Return to Quest Giver
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!character) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">No character loaded.</p>
        </CardContent>
      </Card>
    );
  }

  const activeQuests = getActiveQuests();
  const completedQuests = getCompletedQuests();
  const availableQuests = getAvailableQuests(character.level);

  return (
    <div className="space-y-4">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <ScrollText className="h-5 w-5" />
            Quest Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">{activeQuests.length}</div>
              <div className="text-xs text-gray-400">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{completedQuests.length}</div>
              <div className="text-xs text-gray-400">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-400">{availableQuests.length}</div>
              <div className="text-xs text-gray-400">Available</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="active">Active ({activeQuests.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({availableQuests.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedQuests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <ScrollArea className="h-[500px] pr-4">
            {activeQuests.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <ScrollText className="h-12 w-12 mx-auto text-gray-500 mb-2" />
                  <p className="text-gray-400">No active quests.</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Check the Available tab to start a new quest!
                  </p>
                </CardContent>
              </Card>
            ) : (
              activeQuests.map((quest) => renderQuestCard(quest))
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="available" className="mt-4">
          <ScrollArea className="h-[500px] pr-4">
            {availableQuests.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-gray-500 mb-2" />
                  <p className="text-gray-400">No quests available at your level.</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Level up to unlock more quests!
                  </p>
                </CardContent>
              </Card>
            ) : (
              availableQuests.map((quest) => renderQuestCard(quest, true))
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <ScrollArea className="h-[500px] pr-4">
            {completedQuests.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <XCircle className="h-12 w-12 mx-auto text-gray-500 mb-2" />
                  <p className="text-gray-400">No completed quests yet.</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Complete quests to earn rewards!
                  </p>
                </CardContent>
              </Card>
            ) : (
              completedQuests.map((quest) => renderQuestCard(quest))
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
