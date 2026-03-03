/**
 * Paydirt Game Types
 */

export interface Player {
  address: string;
  world: string;
  joinedAt: number;
  
  // Resources
  gold: number;
  silver: number;
  copper: number;
  paydirt: number; // In-game currency
  
  // Stats
  totalMined: number;
  tilesRevealed: number;
  daysActive: number;
  
  // Property
  tiles: number[];
  buildings: Building[];
  
  // Percy Corp Services Used
  saloonVisits: number;
  storePurchases: number;
}

export interface Building {
  id: string;
  type: 'tent' | 'cabin' | 'house' | 'mine' | 'saloon' | 'store';
  level: number;
  builtAt: number;
}

export interface Tile {
  id: number;
  resource: ResourceType;
  revealed: boolean;
  mined: boolean;
  minedAt?: number;
}

export type ResourceType = 'empty' | 'copper' | 'silver' | 'gold' | 'gem';

export const RESOURCE_VALUES: Record<ResourceType, number> = {
  empty: 0,
  copper: 1,
  silver: 5,
  gold: 25,
  gem: 100,
};

export interface GameState {
  player: Player;
  tiles: Tile[];
  lastMineTime: number;
  dailyMinesRemaining: number;
  lastDailyReset: number;
}

export const DEFAULT_PLAYER: Player = {
  address: '',
  world: 'klondike',
  joinedAt: Date.now(),
  gold: 0,
  silver: 0,
  copper: 0,
  paydirt: 100, // Starting currency
  totalMined: 0,
  tilesRevealed: 0,
  daysActive: 1,
  tiles: [],
  buildings: [],
  saloonVisits: 0,
  storePurchases: 0,
};

export function createGrid(size: number = 25): Tile[] {
  const tiles: Tile[] = [];
  const weights = [40, 30, 15, 10, 5]; // empty, copper, silver, gold, gem
  
  for (let i = 0; i < size * size; i++) {
    const rand = Math.random() * 100;
    let resource: ResourceType = 'empty';
    let cumulative = 0;
    
    for (let w = 0; w < weights.length; w++) {
      cumulative += weights[w];
      if (rand < cumulative) {
        resource = ['empty', 'copper', 'silver', 'gold', 'gem'][w] as ResourceType;
        break;
      }
    }
    
    tiles.push({
      id: i,
      resource,
      revealed: false,
      mined: false,
    });
  }
  
  return tiles;
}
