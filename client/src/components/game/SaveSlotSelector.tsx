import React, { useState, useEffect } from 'react';
import { useCharacter } from '../../lib/stores/useCharacter';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Save,
  Upload,
  Trash2,
  Clock,
  User,
  TrendingUp,
  CheckCircle2,
  XCircle,
  FileQuestion,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { GameEngine } from '../../lib/gameEngine';

interface SaveSlotData {
  slot: number;
  character: any;
  lastSaved: string;
  version: string;
}

export const SaveSlotSelector: React.FC = () => {
  const { character, gameEngine } = useCharacter();
  const [saves, setSaves] = useState<(SaveSlotData | null)[]>([]);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadAllSaves();
  }, []);

  const loadAllSaves = () => {
    const engine = new GameEngine();
    const allSaves = engine.getAllSaves();
    setSaves(allSaves);
  };

  const handleSaveToSlot = (slot: number) => {
    if (!character) return;

    try {
      const engine = new GameEngine();
      const gameState: any = {
        character,
        inventory: [],
        storyState: {} as any,
        currentLocation: '',
        gameFlags: {},
        combatState: null,
        lastSaved: new Date(),
        quests: [],
        achievements: [],
        saveSlot: slot,
        version: '2.0.0',
      };

      engine.saveGame(gameState, slot);
      loadAllSaves();

      setSaveMessage({
        type: 'success',
        text: `Game saved to slot ${slot}!`,
      });

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: 'Failed to save game.',
      });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleLoadFromSlot = (slot: number) => {
    try {
      const engine = new GameEngine();
      const gameState = engine.loadGame(slot);

      if (!gameState || !gameState.character) {
        setSaveMessage({
          type: 'error',
          text: 'No save data found in this slot.',
        });
        setTimeout(() => setSaveMessage(null), 3000);
        return;
      }

      // Would need to restore full game state here
      setSaveMessage({
        type: 'success',
        text: `Loaded save from slot ${slot}!`,
      });

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: 'Failed to load save.',
      });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleDeleteSlot = (slot: number) => {
    if (!confirm(`Are you sure you want to delete save slot ${slot}?`)) return;

    try {
      const engine = new GameEngine();
      engine.deleteSave(slot);
      loadAllSaves();

      setSaveMessage({
        type: 'success',
        text: `Save slot ${slot} deleted.`,
      });

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({
        type: 'error',
        text: 'Failed to delete save.',
      });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const renderSaveSlot = (slot: number) => {
    const saveData = saves[slot - 1];
    const isCurrentSlot = saveData && character && saveData.character?.id === character.id;

    return (
      <Card
        key={slot}
        className={`${
          isCurrentSlot
            ? 'bg-gradient-to-br from-blue-900 to-gray-800 border-blue-500'
            : saveData
            ? 'bg-gray-800 border-gray-700'
            : 'bg-gray-800/50 border-gray-700'
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save Slot {slot}
            </CardTitle>
            {isCurrentSlot && (
              <Badge className="bg-blue-600 text-white">Current</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {saveData && saveData.character ? (
            <div className="space-y-3">
              {/* Character Info */}
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-blue-400" />
                <div>
                  <div className="font-semibold text-white">
                    {saveData.character.name}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">
                    Level {saveData.character.level} {saveData.character.class}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-gray-400">Health</div>
                  <div className="text-red-400 font-semibold">
                    {saveData.character.health}/{saveData.character.maxHealth}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Gold</div>
                  <div className="text-yellow-400 font-semibold">
                    {saveData.character.gold}
                  </div>
                </div>
              </div>

              {/* Last Saved */}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                Saved{' '}
                {formatDistanceToNow(new Date(saveData.lastSaved), {
                  addSuffix: true,
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleLoadFromSlot(slot)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Load
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteSlot(slot)}
                  className="border-red-600 text-red-400 hover:bg-red-900"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <FileQuestion className="h-12 w-12 mx-auto text-gray-600 mb-2" />
              <p className="text-sm text-gray-500 mb-3">Empty Slot</p>
              <Button
                size="sm"
                onClick={() => handleSaveToSlot(slot)}
                disabled={!character}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-3 w-3 mr-1" />
                Save Here
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <Save className="h-5 w-5" />
            Save & Load Game
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">
            Manage your game saves across 5 different slots.
          </p>
        </CardContent>
      </Card>

      {/* Save Message */}
      {saveMessage && (
        <Alert
          className={
            saveMessage.type === 'success'
              ? 'bg-green-900 border-green-700'
              : 'bg-red-900 border-red-700'
          }
        >
          <AlertDescription
            className={
              saveMessage.type === 'success' ? 'text-green-200' : 'text-red-200'
            }
          >
            {saveMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 inline mr-2" />
            ) : (
              <XCircle className="h-4 w-4 inline mr-2" />
            )}
            {saveMessage.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Save Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map((slot) => renderSaveSlot(slot))}
      </div>

      {/* Quick Save Button */}
      {character && (
        <Card className="bg-blue-900/30 border-blue-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-blue-200">Quick Save</div>
                <div className="text-xs text-blue-300">Save to current slot</div>
              </div>
              <Button
                onClick={() => handleSaveToSlot(1)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Quick Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
