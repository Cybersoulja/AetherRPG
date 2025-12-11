import React, { useState } from 'react';
import { useCharacter } from '../../lib/stores/useCharacter';
import { useInventory } from '../../lib/stores/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import {
  Sword,
  Shield,
  Sparkles,
  X,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Item } from '../../types/game';

export const EquipmentPanel: React.FC = () => {
  const { character, equipItem, unequipItem, getEquippedItem, getTotalStats, getTotalArmor } = useCharacter();
  const { items, getItemsByType } = useInventory();
  const [selectedSlot, setSelectedSlot] = useState<keyof typeof character.equippedItems | null>(null);

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
  const totalArmor = getTotalArmor();

  const handleEquip = (item: Item) => {
    if (!selectedSlot) return;

    const success = equipItem(item, selectedSlot);
    if (success) {
      setSelectedSlot(null);
    }
  };

  const handleUnequip = (slot: keyof typeof character.equippedItems) => {
    unequipItem(slot);
  };

  const getAvailableItems = () => {
    if (!selectedSlot) return [];

    if (selectedSlot === 'weapon') {
      return getItemsByType('weapon');
    } else if (selectedSlot === 'armor') {
      return getItemsByType('armor');
    } else {
      return getItemsByType('misc');
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

  const getSlotIcon = (slot: string) => {
    if (slot === 'weapon') return <Sword className="h-4 w-4" />;
    if (slot === 'armor') return <Shield className="h-4 w-4" />;
    return <Sparkles className="h-4 w-4" />;
  };

  const renderEquipmentSlot = (
    slot: keyof typeof character.equippedItems,
    label: string
  ) => {
    const item = getEquippedItem(slot);

    return (
      <div className="bg-gray-700 rounded-lg p-4 relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getSlotIcon(slot)}
            <span className="text-sm font-medium text-gray-300">{label}</span>
          </div>
          {item && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleUnequip(slot)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {item ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">{item.name}</span>
              <Badge className={`${getRarityColor(item.rarity)} text-white text-xs`}>
                {item.rarity}
              </Badge>
            </div>
            <p className="text-xs text-gray-400">{item.description}</p>

            <div className="flex flex-wrap gap-2 text-xs">
              {item.damage && (
                <Badge variant="secondary" className="bg-red-900 text-red-200">
                  ⚔️ {item.damage} DMG
                </Badge>
              )}
              {item.armor && (
                <Badge variant="secondary" className="bg-blue-900 text-blue-200">
                  🛡️ {item.armor} ARM
                </Badge>
              )}
              {item.stats && Object.entries(item.stats).map(([stat, value]) => (
                value ? (
                  <Badge key={stat} variant="secondary" className="bg-green-900 text-green-200">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.slice(0, 3).toUpperCase()} +{value}
                  </Badge>
                ) : null
              ))}
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => setSelectedSlot(slot)}
          >
            Equip Item
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-yellow-400 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Total Stats (with Equipment)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {totalStats && Object.entries(totalStats).map(([stat, value]) => {
              const baseValue = character.stats[stat as keyof typeof character.stats];
              const bonus = value - baseValue;

              return (
                <div key={stat} className="text-center">
                  <div className="text-xs text-gray-400 uppercase">{stat.slice(0, 3)}</div>
                  <div className="text-lg font-bold text-white">
                    {value}
                    {bonus > 0 && (
                      <span className="text-green-400 text-sm ml-1">+{bonus}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Separator className="my-3 bg-gray-600" />

          <div className="flex justify-around text-sm">
            <div className="text-center">
              <div className="text-gray-400">Total Armor</div>
              <div className="text-xl font-bold text-blue-400">{totalArmor}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Damage Bonus</div>
              <div className="text-xl font-bold text-red-400">
                +{getEquippedItem('weapon')?.damage || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Slots */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-blue-400">Equipment Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderEquipmentSlot('weapon', 'Weapon')}
            {renderEquipmentSlot('armor', 'Armor')}
            {renderEquipmentSlot('accessory1', 'Accessory 1')}
            {renderEquipmentSlot('accessory2', 'Accessory 2')}
          </div>
        </CardContent>
      </Card>

      {/* Item Selection Modal */}
      {selectedSlot && (
        <Card className="bg-gray-900 border-yellow-500 border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-yellow-400">
                Select {selectedSlot.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())}
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedSlot(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {getAvailableItems().length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No items available for this slot.
                  </p>
                ) : (
                  getAvailableItems().map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-800 rounded p-3 hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => handleEquip(item)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white">{item.name}</span>
                        <Badge className={`${getRarityColor(item.rarity)} text-white text-xs`}>
                          {item.rarity}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{item.description}</p>

                      <div className="flex flex-wrap gap-1">
                        {item.damage && (
                          <Badge variant="secondary" className="bg-red-900 text-red-200 text-xs">
                            ⚔️ {item.damage}
                          </Badge>
                        )}
                        {item.armor && (
                          <Badge variant="secondary" className="bg-blue-900 text-blue-200 text-xs">
                            🛡️ {item.armor}
                          </Badge>
                        )}
                        {item.stats && Object.entries(item.stats).map(([stat, value]) => (
                          value ? (
                            <Badge key={stat} variant="secondary" className="bg-green-900 text-green-200 text-xs">
                              {stat.slice(0, 3).toUpperCase()} +{value}
                            </Badge>
                          ) : null
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
