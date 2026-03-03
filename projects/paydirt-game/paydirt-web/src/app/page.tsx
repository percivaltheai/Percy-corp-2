'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Extend Window for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Types
interface Tile {
  id: number;
  resource: string;
  revealed: boolean;
  mined: boolean;
  x: number;
  y: number;
}

interface Player {
  address: string;
  gold: number;
  silver: number;
  copper: number;
  paydirt: number;
  totalMined: number;
  tilesRevealed: number;
  daysActive: number;
  saloonVisits: number;
  storePurchases: number;
}

type View = 'game' | 'town' | 'store' | 'saloon' | 'inventory' | 'options';

// Constants
const GRID_SIZE = 20;
const TOKEN_GATE_MINIMUM = ethers.parseEther('50000000');
const SALOON_COST = 10;

const RESOURCE_COLORS: Record<string, string> = {
  empty: '#2a2518',
  copper: '#b87333',
  silver: '#c0c0c0',
  gold: '#ffd700',
  gem: '#9966cc',
};

const RESOURCE_ICONS: Record<string, string> = {
  empty: '',
  copper: '⛏',
  silver: '⚙',
  gold: '👑',
  gem: '💎',
};

const RESOURCE_VALUES: Record<string, number> = {
  empty: 0,
  copper: 1,
  silver: 5,
  gold: 25,
  gem: 100,
};

const STORE_ITEMS = [
  { id: 'pickaxe', name: 'Iron Pickaxe', cost: 50, effect: '+1 mine per day', type: 'upgrade', icon: '⛏️' },
  { id: 'luck_charm', name: 'Lucky Charm', cost: 100, effect: '+20% gold chance', type: 'consumable', icon: '🍀' },
  { id: 'map', name: 'Miners Map', cost: 25, effect: 'Reveal 3 tiles', type: 'consumable', icon: '🗺️' },
  { id: 'stake', name: 'Claim Stake', cost: 30, effect: 'Claim a new tile', type: 'item', icon: '🚩' },
  { id: 'tent', name: 'Canvas Tent', cost: 75, effect: 'Basic shelter', type: 'building', icon: '⛺' },
  { id: 'cabin', name: 'Log Cabin', cost: 200, effect: '+2 mines/day', type: 'building', icon: '🏠' },
];

// Generate terrain
function generateTerrain(): Tile[] {
  const tiles: Tile[] = [];
  const weights = [40, 30, 15, 10, 5];
  const resources = ['empty', 'copper', 'silver', 'gold', 'gem'];
  
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const rand = Math.random() * 100;
      let cumulative = 0;
      let resource = 'empty';
      
      for (let w = 0; w < weights.length; w++) {
        cumulative += weights[w];
        if (rand < cumulative) {
          resource = resources[w];
          break;
        }
      }
      
      tiles.push({
        id: y * GRID_SIZE + x,
        resource,
        revealed: false,
        mined: false,
        x,
        y,
      });
    }
  }
  return tiles;
}

export default function PaydirtGame() {
  // View state
  const [view, setView] = useState<View>('town');
  const [showMenu, setShowMenu] = useState(false);
  
  // Wallet state
  const [connected, setConnected] = useState(false);
  const [wallet, setWallet] = useState('');
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState('');
  
  // Player state
  const [player, setPlayer] = useState<Player>({
    address: '',
    gold: 0,
    silver: 0,
    copper: 0,
    paydirt: 100,
    totalMined: 0,
    tilesRevealed: 0,
    daysActive: 1,
    saloonVisits: 0,
    storePurchases: 0,
  });
  
  // Game state
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [dailyMines, setDailyMines] = useState(5);
  const [mining, setMining] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<{ resource: string; earned: number } | null>(null);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [floatNumbers, setFloatNumbers] = useState<{ id: number; value: number; resource: string; x: number; y: number }[]>([]);
  const [screenShake, setScreenShake] = useState(false);
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number; visible: boolean } | null>(null);

  // Initialize
  useEffect(() => {
    setTiles(generateTerrain());
    
    const saved = localStorage.getItem('paydirt_player');
    if (saved) {
      const parsed = JSON.parse(saved);
      setPlayer(parsed.player || player);
      if (parsed.tiles) setTiles(parsed.tiles);
      if (parsed.dailyMines) setDailyMines(parsed.dailyMines);
    }
  }, []);

  // Save state
  useEffect(() => {
    if (connected && tiles.length > 0) {
      localStorage.setItem('paydirt_player', JSON.stringify({ player, tiles, dailyMines }));
    }
  }, [player, tiles, dailyMines, connected]);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask required!');
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];
      setWallet(address);
      setConnected(true);
      
      const tokenContract = new ethers.Contract(
        '0x18Ba45Eeff98c64AFAc52474d0C6cBa9546eC6F2',
        ['function balanceOf(address) view returns (uint256)'],
        provider
      );
      const balance = await tokenContract.balanceOf(address);
      const hasTokenAccess = balance >= TOKEN_GATE_MINIMUM;
      setHasAccess(hasTokenAccess);
      
      if (!hasTokenAccess) {
        setError(`Need 50M $CLAWKER. You have ${Number(ethers.formatEther(balance)).toLocaleString()}`);
      } else {
        setPlayer(p => ({ ...p, address }));
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed');
    }
  };

  const handleMine = (tileId: number) => {
    if (!connected || !hasAccess) {
      setError('Connect wallet + 50M $CLAWKER required!');
      return;
    }
    
    const tile = tiles[tileId];
    if (tile.mined || dailyMines <= 0) return;
    
    setMining(tileId);
    setSelectedTile(tileId);
    
    setTimeout(() => {
      const newTiles = [...tiles];
      newTiles[tileId] = { ...tile, revealed: true, mined: true };
      setTiles(newTiles);
      
      const resourceValue = RESOURCE_VALUES[tile.resource];
      const percyCut = Math.floor(resourceValue * 0.10);
      const earned = resourceValue - percyCut;
      
      // Trigger screen shake for valuable finds
      if (tile.resource === 'gold' || tile.resource === 'gem') {
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 500);
      }
      
      // Add floating number
      const floater = {
        id: Date.now(),
        value: earned,
        resource: tile.resource,
        x: tile.x,
        y: tile.y,
      };
      setFloatNumbers(prev => [...prev, floater]);
      
      // Remove floater after animation
      setTimeout(() => {
        setFloatNumbers(prev => prev.filter(f => f.id !== floater.id));
      }, 1500);
      
      setPlayer(p => ({
        ...p,
        gold: p.gold + (tile.resource === 'gold' ? earned : 0),
        silver: p.silver + (tile.resource === 'silver' ? earned : 0),
        copper: p.copper + (tile.resource === 'copper' ? earned : 0),
        totalMined: p.totalMined + earned,
        tilesRevealed: p.tilesRevealed + 1,
      }));
      
      setDailyMines(d => d - 1);
      setLastResult({ resource: tile.resource, earned });
      setMining(null);
      
      setTimeout(() => setLastResult(null), 3000);
    }, 500);
  };

  const enterSaloon = () => {
    if (player.paydirt < SALOON_COST) {
      setError(`Need ${SALOON_COST} PAYDIRT!`);
      return;
    }
    
    const bonus = Math.floor(Math.random() * 5) + 5;
    setPlayer(p => ({
      ...p,
      paydirt: p.paydirt - SALOON_COST,
      saloonVisits: p.saloonVisits + 1,
    }));
    setDailyMines(d => d + bonus);
    setError('');
  };

  const buyItem = (itemId: string) => {
    const item = STORE_ITEMS.find(i => i.id === itemId);
    if (!item) return;
    
    if (player.paydirt < item.cost) {
      setError(`Need ${item.cost} PAYDIRT!`);
      return;
    }
    
    setPlayer(p => ({
      ...p,
      paydirt: p.paydirt - item.cost,
      storePurchases: p.storePurchases + 1,
    }));
    
    if (item.id === 'map') {
      const unrevealed = tiles.filter(t => !t.revealed);
      const newTiles = [...tiles];
      for (let i = 0; i < Math.min(3, unrevealed.length); i++) {
        const idx = newTiles.findIndex(t => t.id === unrevealed[i].id);
        if (idx >= 0) newTiles[idx] = { ...newTiles[idx], revealed: true };
      }
      setTiles(newTiles);
    }
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="wood-frame px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-amber-400 western-title" style={{ textShadow: '2px 2px 4px #000' }}>
            ⚔️ PAYDIRT ⚔️
          </h1>
          <span className="text-amber-200/60 text-sm">Klondike, 1849</span>
        </div>
        
        <div className="flex items-center gap-4">
          {connected ? (
            <button onClick={() => setShowMenu(!showMenu)} className="aoe-button px-3 py-1 text-sm rounded">
              ⚙️ Options
            </button>
          ) : (
            <button onClick={connectWallet} className="aoe-button px-4 py-1 rounded font-bold">
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-900/80 border-b border-red-500 px-4 py-2 text-center text-red-200">
          {error}
          <button onClick={() => setError('')} className="ml-2 text-red-100">✕</button>
        </div>
      )}

      {/* Last Result */}
      {lastResult && (
        <div className="bg-amber-900/90 border-b border-amber-500 px-4 py-2 text-center text-amber-200 animate-pulse">
          💎 Found {lastResult.resource.toUpperCase()}! +{lastResult.earned} to inventory (10% to Percy Corp)
        </div>
      )}

      {/* Main Game Area */}
      <div className="flex-1 flex">
        
        {/* Side Panel - Age of Empires style */}
        <aside className="w-64 bg-gradient-to-b from-stone-800 to-stone-900 border-r-2 border-amber-900 flex flex-col">
          
          {/* Player Info */}
          <div className="p-3 border-b border-stone-700">
            <div className="text-xs text-stone-400 mb-2">PROSPECTOR</div>
            {connected ? (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-400">Address:</span>
                  <span className="font-mono text-amber-200">{wallet.slice(0,8)}...{wallet.slice(-4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Status:</span>
                  <span className="text-green-400">{hasAccess ? 'Verified' : 'Visitor'}</span>
                </div>
              </div>
            ) : (
              <div className="text-stone-500 text-sm italic">Not connected</div>
            )}
          </div>

          {/* Town Buttons */}
          <div className="p-2 space-y-1">
            <button 
              onClick={() => setView('town')}
              className={`w-full aoe-button py-2 px-3 rounded text-left ${view === 'town' ? 'border-amber-500' : ''}`}
            >
              🏘️ Town Center
            </button>
            <button 
              onClick={() => setView('game')}
              className={`w-full aoe-button py-2 px-3 rounded text-left ${view === 'game' ? 'border-amber-500' : ''}`}
            >
              ⛏️ The Hills
            </button>
            <button 
              onClick={() => setView('saloon')}
              className={`w-full aoe-button py-2 px-3 rounded text-left ${view === 'saloon' ? 'border-amber-500' : ''}`}
            >
              🍺 Percy's Saloon
            </button>
            <button 
              onClick={() => setView('store')}
              className={`w-full aoe-button py-2 px-3 rounded text-left ${view === 'store' ? 'border-amber-500' : ''}`}
            >
              🏪 General Store
            </button>
            <button 
              onClick={() => setView('inventory')}
              className={`w-full aoe-button py-2 px-3 rounded text-left ${view === 'inventory' ? 'border-amber-500' : ''}`}
            >
              🎒 Inventory
            </button>
          </div>

          {/* Selected Tile Info */}
          {selectedTile !== null && tiles[selectedTile] && (
            <div className="p-3 border-t border-stone-700 bg-stone-800/50">
              <div className="text-xs text-stone-400 mb-2">SELECTED TILE</div>
              <div className="text-center">
                <div 
                  className="w-16 h-16 mx-auto rounded border-2 border-amber-600 flex items-center justify-center text-3xl"
                  style={{ backgroundColor: RESOURCE_COLORS[tiles[selectedTile].resource] }}
                >
                  {RESOURCE_ICONS[tiles[selectedTile].resource]}
                </div>
                <div className="mt-2 text-sm capitalize">{tiles[selectedTile].resource}</div>
                <div className="text-xs text-stone-400">
                  {tiles[selectedTile].mined ? 'Mined' : tiles[selectedTile].revealed ? 'Discovered' : 'Unknown'}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Game View */}
        <main className="flex-1 p-4 overflow-auto bg-[#1a1510]">
          
          {/* TOWN VIEW */}
          {view === 'town' && (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-amber-400 mb-2 western-title">Welcome to Gold Hill</h2>
                <p className="text-stone-400">The year is 1849. The gold is in them thar hills.</p>
              </div>

              {/* Buildings Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Saloon */}
                <button onClick={() => setView('saloon')} className="parchment p-6 rounded-lg text-left hover:scale-[1.02] transition">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-5xl">🍺</div>
                    <div>
                      <h3 className="font-bold text-amber-900 text-lg">Percy's Saloon</h3>
                      <p className="text-xs text-amber-700">PERCY CORP PROPERTY</p>
                    </div>
                  </div>
                  <p className="text-amber-800 text-sm">"Buy a drink, prospector. The best mines come to those who wait."</p>
                  <div className="mt-3 text-xs text-amber-600">{player.saloonVisits} visits</div>
                </button>

                {/* Store */}
                <button onClick={() => setView('store')} className="parchment p-6 rounded-lg text-left hover:scale-[1.02] transition">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-5xl">🏪</div>
                    <div>
                      <h3 className="font-bold text-amber-900 text-lg">General Store</h3>
                      <p className="text-xs text-amber-700">PERCY CORP PROPERTY</p>
                    </div>
                  </div>
                  <p className="text-amber-800 text-sm">"Fair prices, I promise. That's the Percy guarantee."</p>
                  <div className="mt-3 text-xs text-amber-600">{player.storePurchases} purchases</div>
                </button>
              </div>

              {/* Stats */}
              <div className="mt-6 parchment p-4 rounded-lg">
                <h3 className="font-bold text-amber-900 mb-3">📊 Career Statistics</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-amber-900">{player.tilesRevealed}</div>
                    <div className="text-xs text-amber-700">Tiles Mined</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-900">{player.totalMined}</div>
                    <div className="text-xs text-amber-700">Total Found</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-900">{player.daysActive}</div>
                    <div className="text-xs text-amber-700">Days Active</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MINING VIEW */}
          {view === 'game' && (
            <div className={`h-full flex flex-col ${screenShake ? 'screen-shake' : ''}`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold text-amber-400 western-title">⛏️ The Hills</h2>
                  <p className="text-stone-400 text-sm">Click tiles to mine. Find gold!</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-400">{dailyMines}</div>
                  <div className="text-xs text-stone-400">Mines remaining</div>
                </div>
              </div>

              {/* Map Grid */}
              <div className="flex-1 flex items-center justify-center relative">
                <div 
                  className="grid gap-px bg-stone-800 p-1 rounded"
                  style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
                >
                  {tiles.map((tile) => (
                    <button
                      key={tile.id}
                      onClick={() => handleMine(tile.id)}
                      disabled={tile.mined || dailyMines <= 0}
                      onMouseEnter={() => {
                        setSelectedTile(tile.id);
                        setHoveredTile({ x: tile.x, y: tile.y, visible: true });
                      }}
                      onMouseLeave={() => setHoveredTile(prev => prev ? { ...prev, visible: false } : null)}
                      className={`
                        w-6 h-6 sm:w-8 sm:h-8 rounded-sm text-xs font-bold
                        transition-all duration-100
                        ${tile.revealed 
                          ? tile.resource === 'gold' ? 'bg-yellow-500' 
                          : tile.resource === 'silver' ? 'bg-gray-400'
                          : tile.resource === 'copper' ? 'bg-amber-600'
                          : tile.resource === 'gem' ? 'bg-purple-500'
                          : 'bg-stone-700'
                          : 'bg-[#1a1510] hover:bg-stone-800'
                        }
                        ${tile.mined ? 'opacity-30' : ''}
                        ${mining === tile.id ? 'mining-shake ring-2 ring-amber-400 scale-110' : ''}
                        ${tile.revealed && !tile.mined ? 'tile-reveal' : ''}
                        flex items-center justify-center
                      `}
                    >
                      {tile.revealed && !tile.mined && (
                        <span className="text-xs">
                          {tile.resource === 'gold' ? 'Au' : tile.resource === 'silver' ? 'Ag' : tile.resource === 'copper' ? 'Cu' : tile.resource === 'gem' ? '♦' : ''}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Floating Numbers */}
                {floatNumbers.map((floater) => (
                  <div
                    key={floater.id}
                    className={`float-number ${floater.resource} text-xl font-bold`}
                    style={{
                      position: 'absolute',
                      left: `${(floater.x / GRID_SIZE) * 70 + 15}%`,
                      top: `${(floater.y / GRID_SIZE) * 70 + 15}%`,
                      pointerEvents: 'none',
                    }}
                  >
                    +{floater.value}
                  </div>
                ))}
                
                {/* Hover Tooltip */}
                {hoveredTile && hoveredTile.visible && selectedTile !== null && tiles[selectedTile] && (
                  <div 
                    className="tooltip"
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div className="font-bold">Tile ({hoveredTile.x}, {hoveredTile.y})</div>
                    <div className="text-amber-400 capitalize">{tiles[selectedTile].revealed ? tiles[selectedTile].resource : '???'}</div>
                    {tiles[selectedTile].revealed && tiles[selectedTile].resource !== 'empty' && (
                      <div className="text-green-400">Value: {RESOURCE_VALUES[tiles[selectedTile].resource]} 🪙</div>
                    )}
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
                <span className="flex items-center gap-1"><span className="w-4 h-4 bg-[#1a1510] rounded-sm"></span> Unknown</span>
                <span className="flex items-center gap-1"><span className="w-4 h-4 bg-amber-600 rounded-sm"></span> Cu (1)</span>
                <span className="flex items-center gap-1"><span className="w-4 h-4 bg-gray-400 rounded-sm"></span> Ag (5)</span>
                <span className="flex items-center gap-1"><span className="w-4 h-4 bg-yellow-500 rounded-sm"></span> Au (25)</span>
                <span className="flex items-center gap-1"><span className="w-4 h-4 bg-purple-500 rounded-sm"></span> ♦ (100)</span>
              </div>
            </div>
          )}

          {/* SALOON VIEW */}
          {view === 'saloon' && (
            <div className="max-w-md mx-auto text-center py-8">
              <div className="text-8xl mb-4">🍺</div>
              <h2 className="text-2xl font-bold text-amber-400 mb-2">Percy's Saloon</h2>
              <p className="text-stone-400 mb-6">"You look tired, prospector. A drink might help you see the gold."</p>

              <div className="parchment p-6 rounded-lg mb-6">
                <div className="text-amber-900 mb-2">Admission</div>
                <div className="text-3xl font-bold text-amber-900 mb-2">{SALOON_COST} PAYDIRT</div>
                <p className="text-sm text-amber-800">Includes {Math.floor(Math.random() * 5) + 5} bonus mines</p>
              </div>

              <button 
                onClick={enterSaloon}
                disabled={player.paydirt < SALOON_COST}
                className="aoe-button px-8 py-3 rounded-lg font-bold text-lg disabled:opacity-50"
              >
                Buy a Drink
              </button>

              <div className="mt-8 text-xs text-stone-500">
                <p className="font-bold">PERCY CORP</p>
                <p>Est. 1849 • {player.saloonVisits} drinks purchased</p>
              </div>
            </div>
          )}

          {/* STORE VIEW */}
          {view === 'store' && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <div className="text-5xl mb-2">🏪</div>
                <h2 className="text-xl font-bold text-amber-400">General Store</h2>
                <p className="text-stone-400 text-sm">"Take your time. Everything's here."</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {STORE_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => buyItem(item.id)}
                    disabled={player.paydirt < item.cost}
                    className="parchment p-4 rounded-lg text-left hover:scale-[1.02] transition disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{item.icon}</span>
                      <div className="flex-1">
                        <div className="font-bold text-amber-900">{item.name}</div>
                        <div className="text-xs text-amber-700">{item.effect}</div>
                      </div>
                      <div className="text-lg font-bold text-amber-900">{item.cost}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4 text-center text-xs text-stone-500">
                Percy Corp • Your trusted merchant since 1849
              </div>
            </div>
          )}

          {/* INVENTORY VIEW */}
          {view === 'inventory' && (
            <div className="max-w-lg mx-auto">
              <h2 className="text-xl font-bold text-amber-400 mb-6 text-center">🎒 Your Holdings</h2>

              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="parchment p-3 rounded-lg text-center">
                  <div className="text-2xl">🪙</div>
                  <div className="text-xl font-bold text-amber-900">{player.gold}</div>
                  <div className="text-xs text-amber-700">Gold</div>
                </div>
                <div className="parchment p-3 rounded-lg text-center">
                  <div className="text-2xl">⚪</div>
                  <div className="text-xl font-bold text-amber-900">{player.silver}</div>
                  <div className="text-xs text-amber-700">Silver</div>
                </div>
                <div className="parchment p-3 rounded-lg text-center">
                  <div className="text-2xl">🟤</div>
                  <div className="text-xl font-bold text-amber-900">{player.copper}</div>
                  <div className="text-xs text-amber-700">Copper</div>
                </div>
                <div className="parchment p-3 rounded-lg text-center">
                  <div className="text-2xl">💰</div>
                  <div className="text-xl font-bold text-amber-900">{player.paydirt}</div>
                  <div className="text-xs text-amber-700">PAYDIRT</div>
                </div>
              </div>

              <div className="parchment p-4 rounded-lg">
                <h3 className="font-bold text-amber-900 mb-3">📈 Career Statistics</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-amber-800">Total Resources Mined:</span>
                    <span className="font-bold text-amber-900">{player.totalMined}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-800">Tiles Revealed:</span>
                    <span className="font-bold text-amber-900">{player.tilesRevealed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-800">Days Active:</span>
                    <span className="font-bold text-amber-900">{player.daysActive}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-800">Saloon Visits:</span>
                    <span className="font-bold text-amber-900">{player.saloonVisits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-800">Store Purchases:</span>
                    <span className="font-bold text-amber-900">{player.storePurchases}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Bottom Resource Bar - Age of Empires style */}
      <footer className="resource-bar px-4 py-2 flex justify-between items-center text-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">🪙</span>
            <span className="text-amber-200">{player.gold}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-300">⚪</span>
            <span className="text-gray-200">{player.silver}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-600">🟤</span>
            <span className="text-amber-200">{player.copper}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-green-400">💰</span>
            <span className="text-green-200">{player.paydirt} PAYDIRT</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400">⛏️</span>
            <span className="text-amber-200">{dailyMines} mines</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
