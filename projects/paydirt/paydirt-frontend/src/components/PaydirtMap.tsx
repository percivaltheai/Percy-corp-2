'use client';

import { useState, useEffect } from 'react';

// Grid configuration
const GRID_SIZE = 10;

interface Tile {
  id: number;
  resource: number; // 0=empty, 1=copper, 2=silver, 3=gold
  revealed: boolean;
  lastMined: number;
}

const RESOURCE_COLORS: Record<number, string> = {
  0: 'bg-stone-800',      // Empty/unknown
  1: 'bg-amber-600',      // Copper
  2: 'bg-gray-300',       // Silver
  3: 'bg-yellow-500',     // Gold
};

const RESOURCE_NAMES: Record<number, string> = {
  0: '?',
  1: 'Cu',
  2: 'Ag',
  3: 'Au',
};

export default function PaydirtMap() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [connected, setConnected] = useState(false);
  const [wallet, setWallet] = useState('');
  const [balance, setBalance] = useState('0');
  const [mining, setMining] = useState<number | null>(null);

  // Initialize grid
  useEffect(() => {
    const initialTiles: Tile[] = [];
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      initialTiles.push({
        id: i,
        resource: 0,
        revealed: false,
        lastMined: 0,
      });
    }
    setTiles(initialTiles);
  }, []);

  const connectWallet = async () => {
    // Placeholder for wallet connection
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setWallet(accounts[0]);
        setConnected(true);
        // Check balance placeholder
        setBalance('50,000,000'); 
      } catch (err) {
        console.error('Wallet connection failed:', err);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const handleMine = async (tileId: number) => {
    if (!connected) {
      alert('Connect wallet first!');
      return;
    }
    setMining(tileId);
    // Placeholder - actual mining would call contract
    setTimeout(() => {
      setTiles(prev => prev.map(t => 
        t.id === tileId ? { ...t, revealed: true, resource: Math.floor(Math.random() * 4) } : t
      ));
      setMining(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-amber-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-500 mb-2">PAYDIRT</h1>
          <p className="text-stone-400">Old West Frontier Mining</p>
        </div>

        {/* Wallet Status */}
        <div className="flex justify-between items-center mb-6 bg-stone-800 p-4 rounded-lg">
          <div>
            {connected ? (
              <div className="flex items-center gap-4">
                <span className="text-green-400">● Connected</span>
                <span className="text-stone-300">{wallet.slice(0,6)}...{wallet.slice(-4)}</span>
                <span className="text-amber-400">{balance} $CLAWKER</span>
              </div>
            ) : (
              <span className="text-stone-400">Connect wallet to mine</span>
            )}
          </div>
          <button 
            onClick={connectWallet}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded font-bold transition"
          >
            {connected ? 'Connected' : 'Connect Wallet'}
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-10 gap-1 mb-8 bg-stone-700 p-2 rounded-lg">
          {tiles.map((tile) => (
            <button
              key={tile.id}
              onClick={() => handleMine(tile.id)}
              disabled={mining !== null}
              className={`
                aspect-square rounded flex items-center justify-center text-xs font-bold
                transition-all duration-200 hover:scale-105
                ${tile.revealed ? RESOURCE_COLORS[tile.resource] : 'bg-stone-600 hover:bg-stone-500'}
                ${mining === tile.id ? 'animate-pulse ring-2 ring-amber-400' : ''}
              `}
            >
              {tile.revealed ? RESOURCE_NAMES[tile.resource] : '?'}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-stone-600 rounded"></div>
            <span>Unclaimed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-600 rounded"></div>
            <span>Copper</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span>Silver</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Gold</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 text-center text-stone-500 text-sm">
          <p>Click a tile to mine (0.001 ETH stake)</p>
          <p className="mt-1">Token Gate: 50M $CLAWKER required</p>
        </div>
      </div>
    </div>
  );
}
