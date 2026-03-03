/**
 * Paydirt Game Engine
 * Core game logic - mining, store, saloon
 */

import { 
  GameState, 
  Player, 
  Tile, 
  RESOURCE_VALUES, 
  ResourceType,
  DEFAULT_PLAYER,
  createGrid 
} from './game-types';

const GRID_SIZE = 25;
const DAILY_FREE_MINES = 5;
const DAILY_PREMIUM_MINES = 20;
const Percy_CUT = 0.10; // 10% to Percy Corp

export class PaydirtGame {
  private state: GameState;
  private onStateChange: (state: GameState) => void;

  constructor(initialState?: GameState, onChange?: (state: GameState) => void) {
    this.state = initialState || this.newGame();
    this.onStateChange = onChange || (() => {});
  }

  private newGame(): GameState {
    return {
      player: { ...DEFAULT_PLAYER },
      tiles: createGrid(GRID_SIZE),
      lastMineTime: 0,
      dailyMinesRemaining: DAILY_FREE_MINES,
      lastDailyReset: Date.now(),
    };
  }

  // ===== STATE MANAGEMENT =====
  
  getState(): GameState {
    return this.state;
  }

  loadState(state: GameState): void {
    this.state = state;
    this.onStateChange(this.state);
  }

  saveState(): string {
    return JSON.stringify(this.state);
  }

  private updateState(): void {
    this.onStateChange(this.state);
    // Auto-save to localStorage could happen here
  }

  // ===== PLAYER ACTIONS =====

  connectWallet(address: string): void {
    this.state.player.address = address;
    this.updateState();
  }

  // ===== MINING =====

  canMine(): { allowed: boolean; reason: string } {
    if (this.state.dailyMinesRemaining <= 0) {
      return { allowed: false, reason: 'No mines remaining today. Visit the Saloon for more!' };
    }
    return { allowed: true, reason: '' };
  }

  mineTile(tileId: number): { success: boolean; result: ResourceType; earned: number; toPercy: number } {
    // Check daily mines
    const canMine = this.canMine();
    if (!canMine.allowed) {
      return { success: false, result: 'empty', earned: 0, toPercy: 0 };
    }

    const tile = this.state.tiles[tileId];
    if (!tile || tile.mined) {
      return { success: false, result: 'empty', earned: 0, toPercy: 0 };
    }

    // Reveal and mine
    tile.revealed = true;
    tile.mined = true;
    tile.minedAt = Date.now();

    const resourceValue = RESOURCE_VALUES[tile.resource];
    const percyCut = Math.floor(resourceValue * Percy_CUT);
    const playerEarned = resourceValue - percyCut;

    // Update player
    this.state.player.totalMined += playerEarned;
    this.state.player.tilesRevealed++;
    
    // Add to inventory
    if (tile.resource === 'gold') this.state.player.gold += playerEarned;
    else if (tile.resource === 'silver') this.state.player.silver += playerEarned;
    else if (tile.resource === 'copper') this.state.player.copper += playerEarned;

    // Deduct daily mine
    this.state.dailyMinesRemaining--;
    this.state.lastMineTime = Date.now();

    this.updateState();

    return { 
      success: true, 
      result: tile.resource, 
      earned: playerEarned,
      toPercy: percyCut
    };
  }

  // ===== SALOON (Percy Corp Revenue Stream #1) =====

  enterSaloon(cost: number = 10): { success: boolean; message: string; bonus: number } {
    if (this.state.player.paydirt < cost) {
      return { success: false, message: 'Not enough PAYDIRT!', bonus: 0 };
    }

    this.state.player.paydirt -= cost;
    this.state.player.saloonVisits++;

    // Bonus: extra mines or luck boost
    const bonus = Math.floor(Math.random() * 5) + 5; // 5-10 extra mines
    
    this.updateState();

    return { 
      success: true, 
      message: `You paid ${cost} PAYDIRT. The bartender nods. +${bonus} mines!`,
      bonus 
    };
  }

  // ===== GENERAL STORE (Percy Corp Revenue Stream #2) =====

  getStoreItems(): StoreItem[] {
    return [
      { id: 'pickaxe', name: 'Better Pickaxe', cost: 50, effect: '+1 mine per day', type: 'upgrade' },
      { id: 'luck_charm', name: 'Lucky Charm', cost: 100, effect: '+20% gold chance', type: 'consumable' },
      { id: 'map', name: 'Miners Map', cost: 25, effect: 'Reveal 3 tiles', type: 'consumable' },
      { id: 'stake', name: 'Claim Stake', cost: 30, effect: 'Claim a new tile', type: 'item' },
      { id: 'tent', name: 'Tent', cost: 75, effect: 'Basic shelter', type: 'building' },
      { id: 'cabin', name: 'Cabin', cost: 200, effect: '+2 mines/day', type: 'building' },
    ];
  }

  buyItem(itemId: string): { success: boolean; message: string } {
    const items = this.getStoreItems();
    const item = items.find(i => i.id === itemId);
    
    if (!item) {
      return { success: false, message: 'Item not found.' };
    }

    if (this.state.player.paydirt < item.cost) {
      return { success: false, message: `Need ${item.cost} PAYDIRT. You have ${this.state.player.paydirt}.` };
    }

    this.state.player.paydirt -= item.cost;
    this.state.player.storePurchases++;
    
    // Apply effect (simplified for MVP)
    if (item.id === 'map') {
      // Reveal 3 random unrevealed tiles
      const unrevealed = this.state.tiles.filter(t => !t.revealed);
      for (let i = 0; i < Math.min(3, unrevealed.length); i++) {
        unrevealed[i].revealed = true;
      }
    }

    this.updateState();

    return { success: true, message: `Bought ${item.name} for ${item.cost} PAYDIRT!` };
  }

  // ===== DAILY RESET =====

  checkDailyReset(): void {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    if (now - this.state.lastDailyReset > dayMs) {
      this.state.dailyMinesRemaining = DAILY_FREE_MINES;
      this.state.lastDailyReset = now;
      this.state.player.daysActive++;
      this.updateState();
    }
  }

  // ===== TOWN HUB =====

  getTownBuildings(): TownBuilding[] {
    return [
      { id: 'percy_saloon', name: "Percy's Saloon", type: 'saloon', owner: 'Percy Corp', description: 'Buy drinks for bonus mines' },
      { id: 'percy_store', name: "Percy's General Store", type: 'store', owner: 'Percy Corp', description: 'Buy upgrades and items' },
      { id: 'player_home', name: 'Your Camp', type: 'home', owner: 'player', description: 'Your starting area' },
    ];
  }
}

export interface StoreItem {
  id: string;
  name: string;
  cost: number;
  effect: string;
  type: string;
}

export interface TownBuilding {
  id: string;
  name: string;
  type: string;
  owner: string;
  description: string;
}
