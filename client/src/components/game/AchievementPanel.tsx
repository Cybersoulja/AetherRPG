import React, { useEffect } from 'react';
import { useAchievements } from '../../lib/stores/useAchievements';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import {
  Trophy,
  Lock,
  CheckCircle2,
  Coins,
  Gift,
  Star,
} from 'lucide-react';
import { Achievement } from '../../types/game';
import { formatDistanceToNow } from 'date-fns';

export const AchievementPanel: React.FC = () => {
  const {
    achievements,
    initializeAchievements,
    getUnlockedAchievements,
    getLockedAchievements,
    getTotalUnlocked,
  } = useAchievements();

  useEffect(() => {
    if (achievements.length === 0) {
      initializeAchievements();
    }
  }, [initializeAchievements]);

  const renderAchievement = (achievement: Achievement) => {
    const progress = (achievement.progress / achievement.required) * 100;
    const isComplete = achievement.unlocked;

    return (
      <Card
        key={achievement.id}
        className={`${
          isComplete
            ? 'bg-gradient-to-br from-yellow-900/30 to-gray-800 border-yellow-600'
            : 'bg-gray-800 border-gray-700'
        } mb-3`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={`text-4xl flex-shrink-0 ${
                isComplete ? 'animate-pulse' : 'opacity-50 grayscale'
              }`}
            >
              {achievement.icon}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3
                  className={`font-semibold ${
                    isComplete ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  {achievement.name}
                </h3>
                {isComplete && (
                  <CheckCircle2 className="h-5 w-5 text-yellow-400" />
                )}
              </div>

              <p className="text-sm text-gray-400 mb-3">
                {achievement.description}
              </p>

              {/* Progress Bar */}
              {!isComplete && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>
                      {achievement.progress}/{achievement.required}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Unlocked Info */}
              {isComplete && achievement.unlockedAt && (
                <div className="text-xs text-gray-500 mb-2">
                  Unlocked{' '}
                  {formatDistanceToNow(new Date(achievement.unlockedAt), {
                    addSuffix: true,
                  })}
                </div>
              )}

              {/* Rewards */}
              {achievement.reward && (
                <div className="flex flex-wrap gap-2">
                  {achievement.reward.gold && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-900 text-yellow-200 text-xs"
                    >
                      <Coins className="h-3 w-3 mr-1" />
                      {achievement.reward.gold} Gold
                    </Badge>
                  )}
                  {achievement.reward.title && (
                    <Badge
                      variant="secondary"
                      className="bg-purple-900 text-purple-200 text-xs"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {achievement.reward.title}
                    </Badge>
                  )}
                  {achievement.reward.item && (
                    <Badge
                      variant="secondary"
                      className="bg-green-900 text-green-200 text-xs"
                    >
                      <Gift className="h-3 w-3 mr-1" />
                      Item Reward
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const unlockedAchievements = getUnlockedAchievements();
  const lockedAchievements = getLockedAchievements();
  const totalAchievements = achievements.filter((a) => !a.hidden).length;
  const completionPercentage = (getTotalUnlocked() / totalAchievements) * 100;

  return (
    <div className="space-y-4">
      {/* Stats Card */}
      <Card className="bg-gradient-to-br from-yellow-900/20 to-gray-800 border-yellow-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <Trophy className="h-5 w-5" />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Completion</span>
                <span className="text-yellow-400 font-semibold">
                  {getTotalUnlocked()}/{totalAchievements}
                </span>
              </div>
              <Progress value={completionPercentage} className="h-3" />
              <div className="text-center text-sm text-gray-400 mt-1">
                {completionPercentage.toFixed(1)}% Complete
              </div>
            </div>

            <Separator className="bg-gray-600" />

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {unlockedAchievements.length}
                </div>
                <div className="text-xs text-gray-400">Unlocked</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-400">
                  {lockedAchievements.length}
                </div>
                <div className="text-xs text-gray-400">Locked</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {achievements.filter((a) => a.hidden && !a.unlocked).length}
                </div>
                <div className="text-xs text-gray-400">Hidden</div>
              </div>
            </div>

            {/* Recent Unlocks */}
            {unlockedAchievements.length > 0 && (
              <>
                <Separator className="bg-gray-600" />
                <div>
                  <div className="text-sm text-gray-400 mb-2">
                    Recent Unlocks
                  </div>
                  <div className="flex gap-2">
                    {unlockedAchievements
                      .slice(0, 5)
                      .map((ach) => (
                        <div
                          key={ach.id}
                          className="text-2xl"
                          title={ach.name}
                        >
                          {ach.icon}
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Achievement List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="all">
            All ({achievements.filter((a) => !a.hidden).length})
          </TabsTrigger>
          <TabsTrigger value="unlocked">
            Unlocked ({unlockedAchievements.length})
          </TabsTrigger>
          <TabsTrigger value="locked">
            Locked ({lockedAchievements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <ScrollArea className="h-[500px] pr-4">
            {achievements
              .filter((a) => !a.hidden)
              .map((achievement) => renderAchievement(achievement))}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="unlocked" className="mt-4">
          <ScrollArea className="h-[500px] pr-4">
            {unlockedAchievements.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Lock className="h-12 w-12 mx-auto text-gray-500 mb-2" />
                  <p className="text-gray-400">No achievements unlocked yet.</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Start your adventure to earn achievements!
                  </p>
                </CardContent>
              </Card>
            ) : (
              unlockedAchievements.map((achievement) =>
                renderAchievement(achievement)
              )
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="locked" className="mt-4">
          <ScrollArea className="h-[500px] pr-4">
            {lockedAchievements.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-yellow-400 mb-2" />
                  <p className="text-yellow-400 font-semibold">
                    All achievements unlocked!
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    You're a true completionist! 🎉
                  </p>
                </CardContent>
              </Card>
            ) : (
              lockedAchievements.map((achievement) =>
                renderAchievement(achievement)
              )
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
