'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';

declare global { interface Window { ethereum?: any; } }

const GRID_SIZE = 10;
const TOKEN_GATE = ethers.parseEther('50000000');
const CLAWKER = '0x18Ba45Eeff98c64AFAc52474d0C6cBa9546eC6F2';
const ERC20 = ['function balanceOf(address) view returns (uint256)'];

const REWARDS: Record<number, string> = { 1: '0.001', 2: '0.005', 3: '0.01' };
const NAMES: Record<number, string> = { 1: 'Cu', 2: 'Ag', 3: 'Au' };
type Tab = 'game' | 'town' | 'store' | 'saloon' | 'inventory';
const TABS: Tab[] = ['game', 'town', 'store', 'saloon', 'inventory'];
const TAB_ICONS: Record<Tab, string> = { game: '⛏', town: '🏘', store: '🏪', saloon: '🍺', inventory: '🎒' };

interface Tile { id: number; resource: number; revealed: boolean; }
interface Toast { id: number; msg: string; type: 'good' | 'bad' | 'info' };

export default function PaydirtGame() {
  const [tab, setTab] = useState<Tab>('game');
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [connected, setConnected] = useState(false);
  const [wallet, setWallet] = useState('');
  const [clawker, setClawker] = useState('0');
  const [balance, setBalance] = useState('0');
  const [total, setTotal] = useState('0');
  const [hasAccess, setHasAccess] = useState(false);
  const [mining, setMining] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealing, setRevealing] = useState<number | null>(null);
  const [rewards, setRewards] = useState<{id: number; amount: string; res: number}[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [error, setError] = useState('');
  const [inventory, setInventory] = useState<Record<number, number>>({});
  const [saved, setSaved] = useState(false);
  const [weather, setWeather] = useState<'sunny' | 'rain' | 'drought'>('sunny');
  const [reputation, setReputation] = useState(0);
  const [dailyClaims, setDailyClaims] = useState<number[]>([]);
  const [claimCooldown, setClaimCooldown] = useState<number>(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [toolLevel, setToolLevel] = useState(1);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'dusk' | 'night'>('day');
  const [flavorText, setFlavorText] = useState('');
  const [musicOn, setMusicOn] = useState(false);
  const toastId = useRef(0);
  
  const FLAVOR_TEXTS = [
    '"A man\'s gotta know his limits."',
    '"Gold is where you find it."',
    '"This ground\'s been worked over."',
    '"Don\'t dig where you sleep."',
    '"Fortune favors the bold."',
    '"Dry holes ain\'t the worst thing."',
    '"Sun\'s gonna set sooner\'n you think."',
    '"That pickaxe ain\'t getting lighter."',
    '"You look like you\'ve been chewing dirt."',
    '"Reckon you\'ll strike it rich?"',
  ];
  
  const NPC_DIALOGUES = {
    barkeep: [
      '"Mind the mines, stranger."',
      '"Gold? In this town? Ha!"',
      '"Drought\'s been good for... some."',
      '"New pickaxe? Good luck."',
      '"You again? Buy a drink."',
      '"Heard there\'s gold to the east."',
    ],
    store: [
      '"I don\'t suffer fools, but I sell them picks."',
      '"That lens won\'t find gold for you."',
      '"You need a better tool, partner."',
      '"Come back when you\'ve got coin."',
    ],
  };

  // Init grid
  useEffect(() => {
    document.body.className = timeOfDay;
  }, [timeOfDay]);
  
  useEffect(() => {
    const saved = localStorage.getItem('paydirt_tiles');
    const bal = localStorage.getItem('paydirt_balance');
    const tot = localStorage.getItem('paydirt_total');
    const savedTime = localStorage.getItem('paydirt_time');
    
    if (saved) setTiles(JSON.parse(saved));
    else {
      const res = [0,0,0,0,1,1,1,2,2,3];
      setTiles(Array.from({length: 100}, (_, i) => ({ 
        id: i, resource: res[Math.floor(Math.random()*res.length)], revealed: false 
      })));
    }
    if (bal) setBalance(bal);
    if (tot) setTotal(tot);
    if (savedTime) setTimeOfDay(savedTime as 'day' | 'dusk' | 'night');
    
    // Random flavor text
    setFlavorText(FLAVOR_TEXTS[Math.floor(Math.random() * FLAVOR_TEXTS.length)]);
  }, []);

  // Auto-save
  useEffect(() => {
    if (tiles.length) {
      localStorage.setItem('paydirt_tiles', JSON.stringify(tiles));
      localStorage.setItem('paydirt_balance', balance);
      localStorage.setItem('paydirt_total', total);
      localStorage.setItem('paydirt_time', timeOfDay);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  }, [tiles, balance, total, timeOfDay]);

  // Keyboard: space to mine
  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if (e.code === 'Space' && selected !== null && !mining && hasAccess) {
        e.preventDefault();
        handleMine(selected);
      }
    };
    window.addEventListener('keydown', kd);
    return () => window.removeEventListener('keydown', kd);
  }, [selected, mining, hasAccess]);

  const toast = (msg: string, type: Toast['type'] = 'info') => {
    const id = ++toastId.current;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };

  const connect = async () => {
    if (!window.ethereum) return toast('Install MetaMask', 'bad');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const [addr] = await provider.send('eth_requestAccounts', []);
      setWallet(addr);
      setConnected(true);
      const tk = new ethers.Contract(CLAWKER, ERC20, provider);
      const bal = await tk.balanceOf(addr);
      const fmt = ethers.formatEther(bal);
      setClawker(fmt);
      const access = bal >= TOKEN_GATE;
      setHasAccess(access);
      if (access) toast('Welcome, partner!', 'good');
      else { setError(`Need 50M $CLAWKER. You have ${Number(fmt).toLocaleString()}`); toast('Token gate failed', 'bad'); }
    } catch (e: any) { setError(e.message); toast('Connection failed', 'bad'); }
  };

  const handleMine = async (id: number) => {
    if (!connected || !hasAccess) return;
    setMining(id);
    setError('');
    
    await new Promise(r => setTimeout(r, 600));
    
    const tile = tiles.find(t => t.id === id)!;
    setRevealing(id);
    setTimeout(() => setRevealing(null), 400);
    
    const res = tile.resource;
    setTiles(p => p.map(t => t.id === id ? {...t, revealed: true} : t));
    
    if (res > 0) {
      const amt = REWARDS[res];
      // Weather effects: drought = +50%, rain = -50%
      let multiplier = 1;
      if (weather === 'drought') multiplier = 1.5;
      if (weather === 'rain') multiplier = 0.5;
      const finalAmt = (Number(amt) * multiplier).toFixed(4);
      
      setBalance(b => (Number(b) + Number(finalAmt)).toFixed(4));
      setTotal(t => (Number(t) + Number(finalAmt)).toFixed(4));
      setInventory(i => ({...i, [res]: (i[res]||0)+1}));
      setRewards(r => [...r, {id: Date.now(), amount: finalAmt, res}]);
      setTimeout(() => setRewards(r => r.slice(1)), 1500);
      
      // Achievements
      if (res === 3 && !achievements.includes('first-gold')) {
        setAchievements(a => [...a, 'first-gold']);
        toast('🏆 FIRST GOLD!', 'good');
      }
      if (inventory[3] >= 10 && !achievements.includes('gold-rush')) {
        setAchievements(a => [...a, 'gold-rush']);
        toast('🏆 GOLD RUSH! 10 gold mined', 'good');
      }
      
      toast(`+${finalAmt} ETH — ${NAMES[res]}${multiplier !== 1 ? ` (${weather})` : ''}!`, 'good');
    } else {
      toast('Dry hole...', 'info');
    }
    setMining(null);
  };

  const withdraw = async () => {
    if (!balance || balance === '0.0000') return toast('Nothing to withdraw', 'info');
    await new Promise(r => setTimeout(r, 800));
    toast(`Withdrew ${balance} ETH!`, 'good');
    setBalance('0');
  };

  const claimDaily = () => {
    if (claimCooldown > 0) return toast(`Wait ${claimCooldown}h to claim`, 'info');
    const bonus = (0.01 * (1 + toolLevel * 0.25)).toFixed(4);
    setBalance(b => (Number(b) + Number(bonus)).toFixed(4));
    setClaimCooldown(24);
    setReputation(r => r + 5);
    toast(`+${bonus} ETH Daily Bonus! (+5 rep)`, 'good');
    
    // Cooldown timer
    const interval = setInterval(() => {
      setClaimCooldown(c => { if (c <= 1) { clearInterval(interval); return 0; } return c - 1; });
    }, 3600000);
  };

  const visitSaloon = () => {
    const dialogues = NPC_DIALOGUES.barkeep;
    const dial = dialogues[Math.floor(Math.random() * dialogues.length)];
    toast(dial, 'info');
    setReputation(r => Math.min(r + 1, 100));
  };

  // Tool upgrade
  const upgradeTool = () => {
    const cost = (0.1 * toolLevel).toFixed(2);
    if (Number(balance) < Number(cost)) return toast(`Need ${cost} ETH`, 'bad');
    setBalance(b => (Number(b) - Number(cost)).toFixed(4));
    setToolLevel(t => t + 1);
    toast(`⛏ Tool upgraded to level ${toolLevel + 1}!`, 'good');
  };

  // Render content
  const content = () => {
    if (tab === 'game') return (
      <div className="space-y-4">
        {/* Mining Grid */}
        <div className="wood-frame p-4">
          <div className="grid grid-cols-10 gap-1">
            {tiles.map(t => (
              <button
                key={t.id}
                onClick={() => { setSelected(t.id); handleMine(t.id); }}
                disabled={mining !== null || !hasAccess}
                className={`
                  game-tile flex items-center justify-center text-[10px] font-bold
                  ${!t.revealed ? 'unrevealed' : t.resource === 1 ? 'copper' : t.resource === 2 ? 'silver' : 'gold'}
                  ${selected === t.id ? 'selected' : ''}
                  ${mining === t.id ? 'mining' : ''}
                  ${revealing === t.id ? 'tile-revealing' : ''}
                `}
              >
                {t.revealed ? NAMES[t.resource] : '?'}
              </button>
            ))}
          </div>
          {/* Floating rewards */}
          <div className="relative h-0">
            {rewards.map(r => (
              <div key={r.id} className={`float-reward absolute left-1/2 -translate-x-1/2 text-sm font-bold
                ${r.res === 3 ? 'text-yellow-300' : r.res === 2 ? 'text-gray-200' : 'text-amber-400'}`}>
                +{r.amount}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="parchment-panel p-3 rounded-lg">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="flex items-center gap-1"><span className="w-3 h-3 unrevealed rounded"></span> ?</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 copper rounded"></span> Cu 0.001</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 silver rounded"></span> Ag 0.005</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 gold rounded"></span> Au 0.01</span>
          </div>
          <div className="text-center text-xs text-stone-500 mt-2">
            ☀️ Normal | 🔥 Drought +50% | 🌧️ Rain -50%
          </div>
        </div>

        {/* Flavor Text */}
        <div className="text-center mt-4">
          <p className="text-stone-500 text-sm italic px-4">
            {flavorText}
          </p>
          <button onClick={() => setFlavorText(FLAVOR_TEXTS[Math.floor(Math.random() * FLAVOR_TEXTS.length)])} 
            className="text-stone-600 text-xs mt-1 hover:text-stone-400">
            [new proverb]
          </button>
        </div>

        {connected && hasAccess && (
          <div className="flex justify-center">
            <button onClick={withdraw} disabled={!balance || balance === '0.0000'} className="vintage-btn px-6 py-2 font-bold">
              💰 Withdraw
            </button>
          </div>
        )}
      </div>
    );

    if (tab === 'town') return (
      <div className="parchment-panel p-6 rounded-lg text-center">
        <div className="text-5xl mb-3">🏘</div>
        <h2 className="text-2xl western-title text-amber-900 mb-2">PAYDIRT TOWN</h2>
        <p className="text-stone-600 italic mb-4">"...Where fortunes are made and lost."</p>
        <div className="space-y-2 text-left text-sm">
          <div className="flex justify-between border-b border-amber-200 pb-2"><span>🏪 General Store</span><span className="text-green-700">Open</span></div>
          <div className="flex justify-between border-b border-amber-200 pb-2"><span>🍺 Percy's Saloon</span><span className="text-green-700">Open</span></div>
          <div className="flex justify-between"><span>🏦 Bank</span><span className="text-red-600">Coming Soon</span></div>
        </div>
      </div>
    );

    if (tab === 'store') return (
      <div className="parchment-panel p-6 rounded-lg">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🏪</div>
          <h2 className="text-xl western-title text-amber-900">PERCY'S GENERAL STORE</h2>
          <p className="text-stone-600 text-sm italic">"...I don't suffer fools."</p>
        </div>
        <div className="space-y-2">
          {[
            { n: 'Iron Pickaxe', p: '0.05 ETH' },
            { n: 'Steel Pickaxe', p: '0.15 ETH' },
            { n: "Prospector's Lens", p: '0.5 ETH' },
          ].map((i, x) => (
            <div key={x} className="flex justify-between p-3 bg-amber-100/50 rounded border border-amber-200">
              <span>⛏ {i.n}</span><span className="font-bold text-amber-800">{i.p}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-stone-500 text-xs mt-4">Phase 3</p>
      </div>
    );

    if (tab === 'saloon') return (
      <div className="parchment-panel p-6 rounded-lg">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🍺</div>
          <h2 className="text-xl western-title text-amber-900">PERCY'S SALOON</h2>
          <p className="text-stone-600 text-sm italic">"...Drink up. Tomorrow hurts."</p>
        </div>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-amber-100/50 rounded border border-amber-200">
            <div className="font-bold text-amber-900">The Barkeep</div>
            <div className="italic text-stone-600">"Wrong direction, friend."</div>
          </div>
          <div className="p-3 bg-amber-100/50 rounded border border-amber-200">
            <div className="font-bold text-amber-900">Happy Hour</div>
            <div>Mon-Fri 6-8PM <span className="text-amber-700">(2x bonus)</span></div>
          </div>
        </div>
        <p className="text-center text-stone-500 text-xs mt-4">Phase 3</p>
      </div>
    );

    if (tab === 'inventory') return (
      <div className="parchment-panel p-6 rounded-lg">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🎒</div>
          <h2 className="text-xl western-title text-amber-900">YOUR SATCHEL</h2>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { l: 'Balance', v: balance + ' ETH', i: '💰' },
            { l: 'Tiles', v: tiles.filter(t=>t.revealed).length, i: '⛏' },
            { l: 'Total', v: total + ' ETH', i: '📈' },
          ].map((s, x) => (
            <div key={x} className="text-center p-3 bg-amber-100/30 rounded">
              <div className="text-xl">{s.i}</div>
              <div className="text-[10px] text-stone-500">{s.l}</div>
              <div className="font-bold text-amber-900">{s.v}</div>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between p-2 bg-amber-100/30 rounded"><span>Copper</span><span className="font-bold">{inventory[1]||0}</span></div>
          <div className="flex justify-between p-2 bg-amber-100/30 rounded"><span>Silver</span><span className="font-bold">{inventory[2]||0}</span></div>
          <div className="flex justify-between p-2 bg-amber-100/30 rounded"><span>Gold</span><span className="font-bold">{inventory[3]||0}</span></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-3 md:p-4">
      {/* Day/night overlay */}
      <div 
        className={`fixed inset-0 pointer-events-none z-0 transition-all duration-1000 ${
          timeOfDay === 'day' ? 'bg-transparent' :
          timeOfDay === 'dusk' ? 'bg-orange-900/20 sepia-[30%]' : 
          'bg-blue-950/50 brightness-75 saturate-75'
        }`}
      />
      {timeOfDay === 'night' && (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(1px 1px at 10% 10%, white, transparent), radial-gradient(1px 1px at 20% 30%, white, transparent), radial-gradient(2px 2px at 40% 15%, white, transparent), radial-gradient(1px 1px at 60% 40%, white, transparent), radial-gradient(2px 2px at 80% 20%, white, transparent), radial-gradient(1px 1px at 90% 60%, white, transparent)',
            animation: 'twinkle 3s ease-in-out infinite'
          }}
        />
      )}
      <div className="max-w-xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-4 fade-in">
          <div className="wood-frame inline-block px-8 py-3">
            <h1 className="text-4xl md:text-5xl western-title text-amber-200">PAYDIRT</h1>
          </div>
          <p className="text-stone-400 text-sm mt-2 italic">Old West Frontier Mining</p>
        </div>

        {/* Wallet Bar */}
        <div className="wood-panel p-3 mb-3 rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm">
              {connected ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-green-400 font-bold">Connected</span>
                  <span className="text-amber-200 font-mono bg-black/30 px-2 rounded">{wallet.slice(0,6)}...{wallet.slice(-4)}</span>
                  <span className={hasAccess ? 'text-green-400' : 'text-red-400'}>{Number(clawker).toLocaleString()} $CLAWKER</span>
                  <span className="text-amber-400 coin px-2 py-0.5 text-xs">{balance} ETH</span>
                  {saved && <span className="text-green-400 text-xs animate-pulse">✓ Saved</span>}
                </>
              ) : <span className="text-stone-400">Connect wallet to start</span>}
            </div>
            <button onClick={connect} disabled={connected} className="vintage-btn px-4 py-1.5 text-sm font-bold">
              {connected ? '✓' : 'Connect'}
            </button>
          </div>
          {error && <div className="mt-2 text-red-400 text-xs">{error}</div>}
        </div>

        {/* Stats */}
        {connected && hasAccess && tab === 'game' && (
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2 mb-3 fade-in">
              <div className="wood-panel p-2 rounded text-center">
                <div className="text-[10px] text-stone-400">BALANCE</div>
                <div className="text-amber-400 font-bold">{balance} ETH</div>
              </div>
              <div className="wood-panel p-2 rounded text-center">
                <div className="text-[10px] text-stone-400">TOTAL</div>
                <div className="gold-text font-bold">{total} ETH</div>
              </div>
              <div className="wood-panel p-2 rounded text-center">
                <div className="text-[10px] text-stone-400">TILES</div>
                <div className="text-amber-200 font-bold">{tiles.filter(t=>t.revealed).length}/{GRID_SIZE*GRID_SIZE}</div>
              </div>
              <div className="wood-panel p-2 rounded text-center">
                <div className="text-[10px] text-stone-400">WEATHER</div>
                <div className={`font-bold ${weather === 'sunny' ? 'text-yellow-400' : weather === 'drought' ? 'text-orange-500' : 'text-blue-400'}`}>
                  {weather === 'sunny' ? '☀️' : weather === 'drought' ? '🔥' : '🌧️'}
                </div>
              </div>
            </div>
            
            {/* Tool Level & Actions */}
            <div className="flex gap-2 flex-wrap">
              <div className="wood-panel px-3 py-1 rounded flex items-center gap-2">
                <span className="text-stone-400 text-xs">TOOL:</span>
                <span className="text-amber-400 font-bold">Lv.{toolLevel}</span>
                <button onClick={upgradeTool} className="vintage-btn px-2 py-0.5 text-xs">Upgrade</button>
              </div>
              <div className="wood-panel px-3 py-1 rounded flex items-center gap-2">
                <span className="text-stone-400 text-xs">REP:</span>
                <span className="text-green-400 font-bold">{reputation}</span>
              </div>
              <button onClick={claimDaily} disabled={claimCooldown > 0} className="vintage-btn px-3 py-1 text-xs">
                📅 Daily {claimCooldown > 0 ? `(${claimCooldown}h)` : 'Claim'}
              </button>
              <button onClick={visitSaloon} className="vintage-btn px-3 py-1 text-xs">
                🍺 Saloon
              </button>
              <button onClick={() => setTimeOfDay(t => t === 'day' ? 'dusk' : t === 'dusk' ? 'night' : 'day')} className="vintage-btn px-3 py-1 text-xs">
                {timeOfDay === 'day' ? '☀️' : timeOfDay === 'dusk' ? '🌆' : '🌙'} {timeOfDay}
              </button>
              <button onClick={() => setWeather(w => w === 'sunny' ? 'drought' : w === 'drought' ? 'rain' : 'sunny')} className="vintage-btn px-3 py-1 text-xs">
                {weather === 'sunny' ? '☀️' : weather === 'drought' ? '🔥' : '🌧️'} {weather}
              </button>
              <button onClick={() => setMusicOn(m => !m)} className={`vintage-btn px-3 py-1 text-xs ${musicOn ? 'bg-green-900' : ''}`}>
                {musicOn ? '🔊' : '🔇'} Music
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-3 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} 
              className={`tab-btn flex-1 min-w-fit px-3 py-2 rounded-lg text-sm font-bold capitalize ${tab === t ? 'active' : ''}`}>
              {TAB_ICONS[t]} {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="fade-in">{content()}</div>

        {/* Footer hint & flavor text */}
        <div className="mt-4 text-center space-y-1">
          <p className="text-stone-500 text-xs">{selected !== null ? `Tile ${selected} selected — Press SPACE` : 'Click tile to select + mine'}</p>
          <p className="text-amber-700/60 text-sm italic font-serif">{flavorText}</p>
          <button onClick={() => setFlavorText(FLAVOR_TEXTS[Math.floor(Math.random() * FLAVOR_TEXTS.length)])} className="text-stone-500 text-xs hover:text-amber-600">
            🔄 New saying
          </button>
        </div>

        {/* Toasts */}
        <div className="fixed bottom-3 right-3 z-50 flex flex-col gap-2">
          {toasts.map(t => (
            <div key={t.id} className={`toast px-3 py-2 rounded-lg text-sm font-bold
              ${t.type === 'good' ? 'bg-green-900/90 text-green-300 border border-green-600' : 
                t.type === 'bad' ? 'bg-red-900/90 text-red-300 border border-red-600' : 
                'bg-stone-800/90 text-stone-300 border border-stone-600'}`}>
              {t.msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
