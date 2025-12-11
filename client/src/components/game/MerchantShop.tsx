import React, { useState } from 'react';
import { useCharacter } from '../../lib/stores/useCharacter';
import { useInventory } from '../../lib/stores/useInventory';
import { useAchievements } from '../../lib/stores/useAchievements';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Store,
  Coins,
  ShoppingCart,
  TrendingDown,
  User,
  CheckCircle2,
  XCircle,
  ArrowLeftRight,
} from 'lucide-react';
import { Item, Merchant } from '../../types/game';
import { MERCHANTS, calculateBuyPrice, calculateSellPrice } from '../../data/merchants';

export const MerchantShop: React.FC = () => {
  const { character, modifyGold } = useCharacter();
  const { items, addItem, sellItem } = useInventory();
  const { updateProgress } = useAchievements();
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant>(MERCHANTS.gareth);
  const [tradeMessage, setTradeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!character) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">No character loaded.</p>
        </CardContent>
      </Card>
    );
  }

  const handleBuyItem = (item: Item, basePrice: number) => {
    const price = calculateBuyPrice(basePrice, selectedMerchant, character.stats.charisma);

    if (character.gold < price) {
      setTradeMessage({
        type: 'error',
        text: `Not enough gold! Need ${price} gold.`,
      });
      setTimeout(() => setTradeMessage(null), 3000);
      return;
    }

    modifyGold(-price);
    addItem({ ...item, quantity: 1 });
    updateProgress('merchant_friend', price);

    setTradeMessage({
      type: 'success',
      text: `Purchased ${item.name} for ${price} gold!`,
    });
    setTimeout(() => setTradeMessage(null), 3000);
  };

  const handleSellItem = (item: Item) => {
    const price = calculateSellPrice(item.value, selectedMerchant, character.stats.charisma);
    const result = sellItem(item.id, 1, price);

    if (result.success) {
      modifyGold(result.goldEarned);
      setTradeMessage({
        type: 'success',
        text: `Sold ${item.name} for ${result.goldEarned} gold!`,
      });
    } else {
      setTradeMessage({
        type: 'error',
        text: 'Failed to sell item.',
      });
    }

    setTimeout(() => setTradeMessage(null), 3000);
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

  const renderShopItem = (item: Item, basePrice: number, inStock: number) => {
    const buyPrice = calculateBuyPrice(basePrice, selectedMerchant, character.stats.charisma);
    const canAfford = character.gold >= buyPrice;

    return (
      <div
        key={item.id}
        className="bg-gray-700 rounded p-3 hover:bg-gray-600 transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{item.name}</span>
            <Badge className={`${getRarityColor(item.rarity)} text-white text-xs`}>
              {item.rarity}
            </Badge>
          </div>
          <Badge variant="secondary" className="bg-gray-600 text-gray-300 text-xs">
            Stock: {inStock}
          </Badge>
        </div>

        <p className="text-xs text-gray-400 mb-2">{item.description}</p>

        <div className="flex flex-wrap gap-1 mb-3">
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
          {item.healing && (
            <Badge variant="secondary" className="bg-green-900 text-green-200 text-xs">
              ❤️ +{item.healing} HP
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Coins className="h-4 w-4 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">{buyPrice}</span>
            {buyPrice < basePrice && (
              <span className="text-xs text-green-400 line-through ml-1">
                {basePrice}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => handleBuyItem(item, basePrice)}
            disabled={!canAfford || inStock === 0}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            Buy
          </Button>
        </div>
      </div>
    );
  };

  const renderInventoryItem = (item: Item) => {
    const sellPrice = calculateSellPrice(item.value, selectedMerchant, character.stats.charisma);

    return (
      <div
        key={item.id}
        className="bg-gray-700 rounded p-3 hover:bg-gray-600 transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{item.name}</span>
            <Badge className={`${getRarityColor(item.rarity)} text-white text-xs`}>
              {item.rarity}
            </Badge>
          </div>
          {item.quantity && item.quantity > 1 && (
            <Badge variant="secondary" className="bg-gray-600 text-gray-300 text-xs">
              x{item.quantity}
            </Badge>
          )}
        </div>

        <p className="text-xs text-gray-400 mb-2">{item.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <TrendingDown className="h-4 w-4 text-orange-400" />
            <span className="text-orange-400 font-semibold">{sellPrice}</span>
            {sellPrice > item.value * 0.5 && (
              <span className="text-xs text-green-400 ml-1">
                (Good price!)
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => handleSellItem(item)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Coins className="h-3 w-3 mr-1" />
            Sell
          </Button>
        </div>
      </div>
    );
  };

  const charismaDiscount = Math.max(0, (character.stats.charisma - 10) * 2);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-400">
            <Store className="h-5 w-5" />
            Merchant Shop
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Your Gold</div>
              <div className="flex items-center gap-1 mt-1">
                <Coins className="h-5 w-5 text-yellow-400" />
                <span className="text-2xl font-bold text-yellow-400">
                  {character.gold}
                </span>
              </div>
            </div>

            {charismaDiscount > 0 && (
              <Badge className="bg-green-600 text-white">
                -{charismaDiscount}% prices (CHA bonus)
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trade Message */}
      {tradeMessage && (
        <Alert
          className={
            tradeMessage.type === 'success'
              ? 'bg-green-900 border-green-700'
              : 'bg-red-900 border-red-700'
          }
        >
          <AlertDescription
            className={
              tradeMessage.type === 'success' ? 'text-green-200' : 'text-red-200'
            }
          >
            {tradeMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 inline mr-2" />
            ) : (
              <XCircle className="h-4 w-4 inline mr-2" />
            )}
            {tradeMessage.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Merchant Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.values(MERCHANTS).map((merchant) => (
          <Button
            key={merchant.id}
            variant={selectedMerchant.id === merchant.id ? 'default' : 'outline'}
            onClick={() => setSelectedMerchant(merchant)}
            className="flex-shrink-0"
          >
            <User className="h-4 w-4 mr-2" />
            {merchant.name}
          </Button>
        ))}
      </div>

      {/* Merchant Info */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-8 w-8 text-blue-400" />
            <div>
              <div className="font-semibold text-white">{selectedMerchant.name}</div>
              <div className="text-xs text-gray-400">{selectedMerchant.greeting}</div>
            </div>
          </div>

          <Separator className="my-2 bg-gray-600" />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Buy Price</div>
              <div className="text-yellow-400 font-semibold">
                {(selectedMerchant.buyPriceModifier * 100).toFixed(0)}% of value
              </div>
            </div>
            <div>
              <div className="text-gray-400">Sell Price</div>
              <div className="text-orange-400 font-semibold">
                {(selectedMerchant.sellPriceModifier * 100).toFixed(0)}% of value
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shop Tabs */}
      <Tabs defaultValue="buy" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800">
          <TabsTrigger value="buy">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy
          </TabsTrigger>
          <TabsTrigger value="sell">
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Sell
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="mt-4">
          <ScrollArea className="h-[500px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedMerchant.inventory.map((shopItem) =>
                renderShopItem(shopItem.item, shopItem.item.value, shopItem.stock)
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="sell" className="mt-4">
          <ScrollArea className="h-[500px] pr-4">
            {items.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto text-gray-500 mb-2" />
                  <p className="text-gray-400">No items to sell.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {items
                  .filter((item) => item.type !== 'quest')
                  .map((item) => renderInventoryItem(item))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
