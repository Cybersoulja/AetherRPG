import React, { useState } from 'react';
import { useCharacter } from '../../lib/stores/useCharacter';
import { useInventory } from '../../lib/stores/useInventory';
import { useAchievements } from '../../lib/stores/useAchievements';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Hammer,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Info,
  Package,
} from 'lucide-react';
import { Recipe } from '../../types/game';
import { RECIPES, getAvailableRecipes } from '../../data/recipes';

export const CraftingBench: React.FC = () => {
  const { character } = useCharacter();
  const { items, craftItem, canCraft } = useInventory();
  const { updateProgress } = useAchievements();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [craftMessage, setCraftMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!character) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">No character loaded.</p>
        </CardContent>
      </Card>
    );
  }

  const availableRecipes = getAvailableRecipes(character.class, character.level);

  const handleCraft = (recipe: Recipe) => {
    const result = craftItem(recipe);

    setCraftMessage({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });

    if (result.success) {
      // Update crafting achievements
      updateProgress('crafting_novice', 1);
      updateProgress('crafting_master', 1);
      setSelectedRecipe(null);

      // Clear message after 3 seconds
      setTimeout(() => setCraftMessage(null), 3000);
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'bg-gray-500',
      uncommon: 'bg-green-500',
      rare: 'bg-blue-500',
      epic: 'bg-purple-500',
      legendary: 'bg-orange-500',
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      weapon: '⚔️',
      armor: '🛡️',
      consumable: '🧪',
      misc: '✨',
    };
    return icons[category] || '📦';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-orange-400">
            <Hammer className="h-5 w-5" />
            Crafting Bench
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-400">
            Combine materials from your inventory to craft powerful items.
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {availableRecipes.length} recipes available at your level
          </div>
        </CardContent>
      </Card>

      {/* Craft Message */}
      {craftMessage && (
        <Alert className={craftMessage.type === 'success' ? 'bg-green-900 border-green-700' : 'bg-red-900 border-red-700'}>
          <AlertDescription className={craftMessage.type === 'success' ? 'text-green-200' : 'text-red-200'}>
            {craftMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4 inline mr-2" /> : <XCircle className="h-4 w-4 inline mr-2" />}
            {craftMessage.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recipe List */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-blue-400">Available Recipes</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {availableRecipes.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-500 mb-2" />
                  <p className="text-gray-400">No recipes available.</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Level up to unlock more recipes!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableRecipes.map((recipe) => {
                    const canCraftThis = canCraft(recipe);

                    return (
                      <div
                        key={recipe.id}
                        className={`p-3 rounded cursor-pointer transition-colors ${
                          selectedRecipe?.id === recipe.id
                            ? 'bg-blue-900 border border-blue-600'
                            : canCraftThis
                            ? 'bg-gray-700 hover:bg-gray-600'
                            : 'bg-gray-700/50 opacity-60'
                        }`}
                        onClick={() => setSelectedRecipe(recipe)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getCategoryIcon(recipe.category)}</span>
                            <span className="font-semibold text-white">
                              {recipe.output.name}
                            </span>
                          </div>
                          <Badge className={`${getRarityColor(recipe.output.rarity)} text-white text-xs`}>
                            {recipe.output.rarity}
                          </Badge>
                        </div>

                        <p className="text-xs text-gray-400 mb-2">
                          {recipe.description}
                        </p>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            {recipe.requiredItems.length} materials needed
                          </span>
                          {canCraftThis ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recipe Details */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-400">Recipe Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRecipe ? (
              <div className="space-y-4">
                {/* Output Item */}
                <div>
                  <div className="text-sm text-gray-400 mb-2">Crafted Item</div>
                  <div className="bg-gray-700 rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-semibold text-white">
                        {selectedRecipe.output.name}
                      </span>
                      <Badge className={`${getRarityColor(selectedRecipe.output.rarity)} text-white`}>
                        {selectedRecipe.output.rarity}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      {selectedRecipe.output.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.output.damage && (
                        <Badge variant="secondary" className="bg-red-900 text-red-200">
                          ⚔️ {selectedRecipe.output.damage} DMG
                        </Badge>
                      )}
                      {selectedRecipe.output.armor && (
                        <Badge variant="secondary" className="bg-blue-900 text-blue-200">
                          🛡️ {selectedRecipe.output.armor} ARM
                        </Badge>
                      )}
                      {selectedRecipe.output.stats &&
                        Object.entries(selectedRecipe.output.stats).map(
                          ([stat, value]) =>
                            value ? (
                              <Badge
                                key={stat}
                                variant="secondary"
                                className="bg-green-900 text-green-200"
                              >
                                {stat.slice(0, 3).toUpperCase()} +{value}
                              </Badge>
                            ) : null
                        )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-gray-500" />
                </div>

                {/* Required Materials */}
                <div>
                  <div className="text-sm text-gray-400 mb-2">Required Materials</div>
                  <div className="space-y-2">
                    {selectedRecipe.requiredItems.map((req) => {
                      const inventoryItem = items.find((i) => i.id === req.itemId);
                      const hasEnough =
                        inventoryItem && (inventoryItem.quantity || 1) >= req.quantity;

                      return (
                        <div
                          key={req.itemId}
                          className={`flex items-center justify-between p-2 rounded ${
                            hasEnough ? 'bg-green-900/30' : 'bg-red-900/30'
                          }`}
                        >
                          <span className="text-sm text-white">
                            {inventoryItem?.name || req.itemId}
                          </span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm ${
                                hasEnough ? 'text-green-400' : 'text-red-400'
                              }`}
                            >
                              {inventoryItem?.quantity || 0}/{req.quantity}
                            </span>
                            {hasEnough ? (
                              <CheckCircle2 className="h-4 w-4 text-green-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-400" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator className="bg-gray-600" />

                {/* Requirements */}
                <div>
                  <div className="text-sm text-gray-400 mb-2">Requirements</div>
                  <div className="space-y-1 text-sm">
                    {selectedRecipe.requiredLevel && (
                      <div
                        className={`flex items-center justify-between ${
                          character.level >= selectedRecipe.requiredLevel
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        <span>Level {selectedRecipe.requiredLevel}</span>
                        {character.level >= selectedRecipe.requiredLevel ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </div>
                    )}
                    {selectedRecipe.requiredClass && (
                      <div
                        className={`flex items-center justify-between ${
                          selectedRecipe.requiredClass.includes(character.class)
                            ? 'text-green-400'
                            : 'text-red-400'
                        }`}
                      >
                        <span>Class: {selectedRecipe.requiredClass.join(', ')}</span>
                        {selectedRecipe.requiredClass.includes(character.class) ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Craft Button */}
                <Button
                  onClick={() => handleCraft(selectedRecipe)}
                  disabled={!canCraft(selectedRecipe)}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Hammer className="h-4 w-4 mr-2" />
                  Craft Item
                </Button>
              </div>
            ) : (
              <div className="text-center py-16">
                <Info className="h-12 w-12 mx-auto text-gray-500 mb-2" />
                <p className="text-gray-400">Select a recipe to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
