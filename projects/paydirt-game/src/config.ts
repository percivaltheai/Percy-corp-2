/**
 * PAYDIRT - Architecture Overview
 * 
 * A web2-first game with web3 payments/gating
 * 
 * ON-CHAIN (Minimal):
 * - $CLAWKER token gate (50M for beta access)
 * - $PAYDIRT token (in-game currency)
 * - Transactions: stakes, withdrawals, store purchases
 * 
 * OFF-CHAIN (Game):
 * - Player state (inventory, progress, buildings)
 * - Tile grid & mining results
 * - Town interactions
 * - Achievements, stats, everything else
 * 
 * WORLDS (Expandable):
 * - Klondike (49ers theme) - MVP
 * - Tombstone (later)
 * - Calico (later)
 * 
 * Percy Corp owns:
 * - Hotel/Saloon (services, luck boosts)
 * - General Store (items, upgrades)
 * - Takes a cut of mining rewards + transaction fees
 */

export const GAME_CONFIG = {
  // Token Gate
  CLAWKER_GATE: 50_000_000,
  
  // In-game currency
  PAYDIRT_TOKEN: null, // Set when token launches
  
  // Worlds
  WORLDS: [
    { id: 'klondike', name: 'Klondike', theme: '49ers Gold Rush' },
    { id: 'tombstone', name: 'Tombstone', theme: 'Wild West' },
    { id: 'calico', name: 'Calico', theme: 'Ghost Town' },
  ],
  
  // Percy Corp Revenue Streams
  PERCY_CUT_PERCENT: 10, // 10% of mining rewards
  SALOON_FEE: 10, // PAYDIRT to enter
  STORE_MARKUP: 20, // 20% markup on items
  
  // Game Mechanics
  DAILY_MINES_FREE: 5,
  DAILY_MINES_PREMIUM: 20,
};
