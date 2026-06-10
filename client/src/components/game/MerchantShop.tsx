/**
 * MerchantShop component — displays a merchant's inventory and handles item purchases.
 *
 * Design decision: Merchants have **finite stock**. Each ShopItem carries a `stock`
 * count that represents how many of that item the merchant currently has available.
 * When the player buys an item the stock is decremented in local component state.
 * Once stock reaches zero the buy button is disabled and an "Out of Stock" badge is
 * shown, preventing further purchases of that item for the duration of the session.
 *
 * This keeps the economy meaningful — rare items are genuinely scarce — while
 * avoiding the complexity of persisting per-merchant stock to the server on every
 * transaction. If merchants should restock over time, tie into the `refreshInterval`
 * field on the `Merchant` type and reset local state accordingly.
 */
import React, { useState } from 'react';
import { useCharacter } from '../../lib/stores/useCharacter';
import { useInventory } from '../../lib/stores/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Coins, Package, Sword, Shield, Heart, ShoppingBag, X } from 'lucide-react';
import { Merchant, ShopItem, Item } from '../../types/game';

interface MerchantShopProps {
  merchant: Merchant;
  onClose: () => void;
}

/**
 * MerchantShop renders the merchant's greeting, their inventory, and the player's
 * current gold balance. Purchasing an item deducts its cost from the player's gold,
 * adds the item to the player's inventory, and decrements the merchant's stock by 1.
 */
export const MerchantShop: React.FC<MerchantShopProps> = ({ merchant, onClose }) => {
  const { character, modifyGold } = useCharacter();
  const { addItem } = useInventory();

  // Maintain a local copy of shop inventory so stock changes are reflected in the UI
  // without mutating the original merchant prop.
  const [shopInventory, setShopInventory] = useState<ShopItem[]>(
    merchant.inventory.map((si) => ({ ...si }))
  );

  const [lastPurchaseMessage, setLastPurchaseMessage] = useState<string | null>(null);

  const getBuyPrice = (shopItem: ShopItem): number =>
    Math.ceil(shopItem.item.value * shopItem.priceModifier * merchant.buyPriceModifier);

  const handleBuyItem = (index: number) => {
    if (!character) {
      setLastPurchaseMessage('No character found.');
      return;
    }

    const shopItem = shopInventory[index];

    if (shopItem.stock <= 0) {
      setLastPurchaseMessage(`${shopItem.item.name} is out of stock.`);
      return;
    }

    const price = getBuyPrice(shopItem);

    if (character.gold < price) {
      setLastPurchaseMessage(
        `Not enough gold. You need ${price}g but only have ${character.gold}g.`
      );
      return;
    }

    // Deduct gold and add item to inventory
    modifyGold(-price);
    addItem({ ...shopItem.item, quantity: 1 });

    // Decrement stock in local state
    setShopInventory((prev) =>
      prev.map((si, i) => (i === index ? { ...si, stock: si.stock - 1 } : si))
    );

    setLastPurchaseMessage(`Purchased ${shopItem.item.name} for ${price}g.`);
    console.log(`Bought ${shopItem.item.name} for ${price}g. Stock remaining: ${shopItem.stock - 1}`);
  };

  const getItemIcon = (item: Item) => {
    switch (item.type) {
      case 'weapon':
        return <Sword className="h-4 w-4" />;
      case 'armor':
        return <Shield className="h-4 w-4" />;
      case 'consumable':
        return <Heart className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getRarityColor = (rarity: Item['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-600 text-gray-300';
      case 'uncommon':
        return 'bg-green-600 text-green-100';
      case 'rare':
        return 'bg-blue-600 text-blue-100';
      case 'epic':
        return 'bg-purple-600 text-purple-100';
      case 'legendary':
        return 'bg-yellow-600 text-yellow-100';
      default:
        return 'bg-gray-600 text-gray-300';
    }
  };

  const renderShopItem = (shopItem: ShopItem, index: number) => {
    const price = getBuyPrice(shopItem);
    const outOfStock = shopItem.stock <= 0;
    const canAfford = !!character && character.gold >= price;

    return (
      <Card
        key={`${shopItem.item.id}-${index}`}
        className="bg-gray-700 border-gray-600"
        data-testid={`shop-item-${shopItem.item.id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            {/* Item info */}
            <div className="flex items-start gap-2 flex-1 min-w-0">
              {getItemIcon(shopItem.item)}
              <div className="min-w-0">
                <h4 className="font-semibold text-white text-sm truncate">
                  {shopItem.item.name}
                </h4>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                  {shopItem.item.description}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getRarityColor(shopItem.item.rarity)}`}
                  >
                    {shopItem.item.rarity}
                  </Badge>

                  {/* Stock indicator */}
                  {outOfStock ? (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-red-900 text-red-300"
                      data-testid={`stock-badge-${shopItem.item.id}`}
                    >
                      Out of Stock
                    </Badge>
                  ) : (
                    <span
                      className="text-xs text-gray-400"
                      data-testid={`stock-count-${shopItem.item.id}`}
                    >
                      Stock: {shopItem.stock}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Price & buy button */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="flex items-center gap-1 text-yellow-400">
                <Coins className="h-3 w-3" />
                <span className="text-sm font-semibold">{price}g</span>
              </div>
              <Button
                size="sm"
                onClick={() => handleBuyItem(index)}
                disabled={outOfStock || !canAfford}
                className="text-xs bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
                data-testid={`buy-button-${shopItem.item.id}`}
              >
                {outOfStock ? 'Sold Out' : 'Buy'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4" data-testid="merchant-shop">
      {/* Header */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <ShoppingBag className="h-5 w-5" />
              {merchant.name}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
              data-testid="close-button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-300 italic">"{merchant.greeting}"</p>
          {character && (
            <div className="flex items-center gap-1 mt-3 text-yellow-400">
              <Coins className="h-4 w-4" />
              <span className="text-sm font-semibold" data-testid="player-gold">
                {character.gold}g
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase feedback */}
      {lastPurchaseMessage && (
        <p
          className="text-sm text-center text-gray-300 bg-gray-800 rounded px-3 py-2"
          data-testid="purchase-message"
        >
          {lastPurchaseMessage}
        </p>
      )}

      {/* Inventory */}
      <div className="space-y-3">
        {shopInventory.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <Package className="h-10 w-10 text-gray-500 mx-auto mb-3" />
              <p className="text-sm text-gray-400">This merchant has nothing for sale.</p>
            </CardContent>
          </Card>
        ) : (
          shopInventory.map((shopItem, index) => renderShopItem(shopItem, index))
        )}
      </div>
    </div>
  );
};
