"use client";

import { useState } from 'react';
import { useGameStore, type Player } from '@/lib/state/gameStore';
import { getWeaponEfficiency, isWeaponAllowed } from '@/lib/character/classWeaponSystem';
import type { InventoryItem } from '@/schemas/character';
import type { CharacterClass } from '@/schemas/character';

interface InventoryTabProps {
  player?: Player;
}

type ViewMode = 'equipment' | 'inventory';

export default function InventoryTab({ player }: InventoryTabProps) {
  const { updatePlayerInventory, inventory: globalInventory } = useGameStore();
  const [viewMode, setViewMode] = useState<ViewMode>('equipment');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  // Use both player inventory and global inventory
  const playerInventory = player?.inventory || [];
  const inventory = [...playerInventory, ...globalInventory];
  
  // Filter items by location/type
  const equippedItems = inventory.filter(item => item.equipped || item.location === 'equipped');
  const inventoryItems = inventory.filter(item => item.location === 'inventory' && !item.equipped);
  
  
  // Equipment slots
  const equipmentSlots = {
    'main_hand': 'Haupthand',
    'off_hand': 'Nebenhand', 
    'two_handed': 'Beidhändig',
    'helmet': 'Helm',
    'chest': 'Brustpanzer',
    'legs': 'Beinschutz',
    'feet': 'Stiefel',
    'gloves': 'Handschuhe',
    'cloak': 'Umhang',
    'ring': 'Ring',
    'amulet': 'Amulett',
    'belt': 'Gürtel'
  };

  const getEquippedItemInSlot = (subtype: string): InventoryItem | undefined => {
    return equippedItems.find(item => item.subtype === subtype);
  };

  const toggleItemEquipped = (item: InventoryItem) => {
    if (!player) return;
    
    const updatedInventory = inventory.map(invItem => {
      if (invItem.name === item.name) {
        return {
          ...invItem,
          equipped: !invItem.equipped,
          location: !invItem.equipped ? 'equipped' as const : 'inventory' as const
        };
      }
      return invItem;
    });
    
    updatePlayerInventory(player.id, updatedInventory);
  };

  const getItemIcon = (item: InventoryItem) => {
    switch (item.type) {
      case 'weapon':
        return "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
      case 'armor':
      case 'clothing':
        return "M12 2l2 7h6l-5 4 2 7-5-4-5 4 2-7-5-4h6l2-7z";
      case 'consumable':
        return "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343";
      case 'tool':
        return "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z";
      case 'valuable':
        return "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
      default:
        return "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4";
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'uncommon': return 'text-green-600';
      case 'rare': return 'text-blue-600'; 
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const currentItems = viewMode === 'equipment' ? equippedItems : inventoryItems;

  

  return (
    <div className="space-y-4">
      {/* View Mode Tabs */}
      <div className="flex bg-amber-100 dark:bg-amber-900/20 rounded-lg p-1">
        {([
          { key: 'equipment', label: 'Ausrüstung', count: equippedItems.length },
          { key: 'inventory', label: 'Inventar', count: inventoryItems.length }
        ] as const).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === key
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800/30'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Equipment Slots View */}
      {viewMode === 'equipment' && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Ausrüstungsplätze</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(equipmentSlots).map(([subtype, label]) => {
              const equippedItem = getEquippedItemInSlot(subtype);
              return (
                <div
                  key={subtype}
                  className={`p-3 rounded-lg border-2 border-dashed transition-colors ${
                    equippedItem
                      ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-amber-200 bg-amber-25 dark:bg-amber-900/10'
                  }`}
                >
                  <div className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
                    {label}
                  </div>
                  {equippedItem ? (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getItemIcon(equippedItem)} />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-medium ${getRarityColor(equippedItem.rarity)}`}>
                          {equippedItem.name}
                        </div>
                        {equippedItem.effects.length > 0 && (
                          <div className="text-[10px] text-amber-600">
                            +{equippedItem.effects.length} Effekt{equippedItem.effects.length !== 1 ? 'e' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-500 dark:text-amber-400 italic">
                      Leer
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Item List View */}
      {viewMode !== 'equipment' && (
        <div className="space-y-2 max-h-96 overflow-y-auto scroll-fantasy pr-2">
          {currentItems.length > 0 ? (
            currentItems.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedItem === `${item.name}-${index}`
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/30'
                    : 'border-amber-200 bg-amber-25 hover:bg-amber-50 dark:bg-amber-900/10 dark:hover:bg-amber-900/20'
                }`}
                onClick={() => setSelectedItem(selectedItem === `${item.name}-${index}` ? null : `${item.name}-${index}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getItemIcon(item)} />
                    </svg>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm font-medium ${getRarityColor(item.rarity)}`}>
                        {item.name}
                      </h4>
                      {item.quantity > 1 && (
                        <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded">
                          {item.quantity}x
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-amber-600 dark:text-amber-400 mb-1">
                      {item.type === 'weapon' && 'Waffe'}
                      {item.type === 'armor' && 'Rüstung'}
                      {item.type === 'clothing' && 'Kleidung'}
                      {item.type === 'consumable' && 'Verbrauchsgegenstand'}
                      {item.type === 'tool' && 'Werkzeug'}
                      {item.type === 'misc' && 'Sonstiges'}
                      {item.type === 'valuable' && 'Wertsache'}
                      {item.type === 'quest' && 'Questgegenstand'}
                      
                      {/* Weapon Proficiency Info */}
                      {item.type === 'weapon' && player?.cls && (() => {
                        try {
                          // Convert class name to CharacterClass enum
                          const classMap: Record<string, CharacterClass> = {
                            'Krieger': 'warrior',
                            'Magier': 'mage', 
                            'Schurke': 'rogue',
                            'Barde': 'bard',
                            'Paladin': 'paladin',
                            'Waldläufer': 'ranger',
                            'Druide': 'druid',
                            'Mönch': 'monk',
                            'Hexenmeister': 'warlock'
                          };
                          
                          const characterClass = classMap[player.cls] || 'warrior';
                          const weaponType = isWeaponAllowed(characterClass, item.name);
                          const efficiency = getWeaponEfficiency(characterClass, item.name);
                          
                          return (
                            <div className={`inline-block ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              weaponType === 'primary' ? 'bg-green-100 text-green-700' :
                              weaponType === 'secondary' ? 'bg-yellow-100 text-yellow-700' :
                              weaponType === 'forbidden' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {weaponType === 'primary' && '✓ Primär'}
                              {weaponType === 'secondary' && '~ Sekundär'}
                              {weaponType === 'forbidden' && '✗ Verboten'}
                              {!['primary', 'secondary', 'forbidden'].includes(weaponType) && '? Unbekannt'}
                              {efficiency !== 1.0 && ` (${Math.round(efficiency * 100)}%)`}
                            </div>
                          );
                        } catch {
                          return null;
                        }
                      })()}
                    </div>
                    
                    {item.description && (
                      <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.value > 0 && (
                          <span className="text-xs text-yellow-600">
                            {item.value} Gold
                          </span>
                        )}
                        {item.weight > 0 && (
                          <span className="text-xs text-gray-500">
                            {item.weight} kg
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        {(item.type === 'weapon' || item.type === 'armor' || item.type === 'clothing') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleItemEquipped(item);
                            }}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              item.equipped
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {item.equipped ? 'Ablegen' : 'Ausrüsten'}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {item.effects.length > 0 && selectedItem === `${item.name}-${index}` && (
                      <div className="mt-2 pt-2 border-t border-amber-200 dark:border-amber-700">
                        <h5 className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-1">Effekte:</h5>
                        <div className="space-y-1">
                          {item.effects.map((effect, i) => (
                            <div key={i} className="text-xs text-amber-700 dark:text-amber-300">
                              • {effect.description}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-amber-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-amber-600 mb-2">
                {viewMode === 'inventory' && 'Inventar ist leer'}
              </p>
              <p className="text-xs text-amber-500">
                Neue Gegenstände werden automatisch hier erscheinen
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
