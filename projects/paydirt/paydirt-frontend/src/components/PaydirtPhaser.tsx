'use client';

import { useEffect, useRef, useState } from 'react';
import { ethers } from 'ethers';

declare global { interface Window { ethereum?: any; } }

const TOKEN_GATE = ethers.parseEther('50000000');
const ERC20 = ['function balanceOf(address) view returns (uint256)'];
const CLAWKER = '0x18Ba45Eeff98c64AFAc52474d0C6cBa9546eC6F2';

export default function PaydirtPhaser() {
  const gameRef = useRef<any>(null);
  const [connected, setConnected] = useState(false);
  const [wallet, setWallet] = useState('');
  const [balance, setBalance] = useState('0');
  const [hasAccess, setHasAccess] = useState(false);

  const connect = async () => {
    if (!window.ethereum) return alert('Install MetaMask!');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const [addr] = await provider.send('eth_requestAccounts', []);
      setWallet(addr);
      setConnected(true);
      const token = new ethers.Contract(CLAWKER, ERC20, provider);
      const bal = await token.balanceOf(addr);
      setBalance(ethers.formatEther(bal));
      setHasAccess(bal >= TOKEN_GATE);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !connected) return;

    import('phaser').then((Phaser) => {
      if (gameRef.current) return;

      class GameScene extends Phaser.Scene {
        goldAmount: number = 0;
        
        preload() {
          // Create all game textures procedurally
          this.createTerrainTextures();
          this.createBuildingTextures();
          this.createDecorTextures();
        }

        createTerrainTextures() {
          // Desert ground tiles
          const groundColors = [
            [0x8B7355, 0x6B5344], // sand
            [0x9B8465, 0x7B6454], // light sand
            [0x7B6354, 0x5B5344], // dark sand
          ];
          
          groundColors.forEach((colors, i) => {
            const g = this.make.graphics({ add: false });
            // Base
            g.fillStyle(colors[0], 1);
            g.fillRect(0, 0, 64, 32);
            // Top edge (lighter)
            g.fillStyle(colors[1], 1);
            g.fillRect(0, 0, 64, 4);
            // Texture dots
            for (let j = 0; j < 20; j++) {
              g.fillStyle(colors[1], 0.3);
              g.fillCircle(5 + Math.random() * 54, 5 + Math.random() * 22, 1);
            }
            g.generateTexture(`ground_${i}`, 64, 32);
            g.destroy();
          });

          // Gold vein
          const goldG = this.make.graphics({ add: false });
          goldG.fillStyle(0x8B6914, 1);
          goldG.fillRect(0, 0, 64, 32);
          // Gold nuggets
          goldG.fillStyle(0xFFD700, 1);
          goldG.fillCircle(15, 12, 6);
          goldG.fillCircle(35, 18, 5);
          goldG.fillCircle(45, 8, 4);
          goldG.fillCircle(25, 24, 4);
          // Shine
          goldG.fillStyle(0xFFEC8B, 0.8);
          goldG.fillCircle(14, 10, 2);
          goldG.fillCircle(34, 16, 2);
          goldG.generateTexture('gold_vein', 64, 32);
          goldG.destroy();

          // Silver vein
          const silverG = this.make.graphics({ add: false });
          silverG.fillStyle(0x505050, 1);
          silverG.fillRect(0, 0, 64, 32);
          silverG.fillStyle(0xC0C0C0, 1);
          silverG.fillCircle(18, 14, 5);
          silverG.fillCircle(38, 16, 6);
          silverG.fillCircle(28, 8, 4);
          silverG.fillStyle(0xE8E8E8, 0.7);
          silverG.fillCircle(17, 12, 2);
          silverG.fillCircle(37, 14, 2);
          silverG.generateTexture('silver_vein', 64, 32);
          silverG.destroy();
        }

        createBuildingTextures() {
          // Western Saloon
          const saloon = this.make.graphics({ add: false });
          // Main building
          saloon.fillStyle(0x5C3D1E, 1);
          saloon.fillRect(0, 20, 64, 44);
          // Wood planks
          saloon.fillStyle(0x4A2E14, 1);
          for (let i = 0; i < 5; i++) {
            saloon.fillRect(0, 22 + i * 9, 64, 1);
          }
          // Roof
          saloon.fillStyle(0x3D2510, 1);
          saloon.fillRect(-4, 8, 72, 16);
          saloon.fillStyle(0x2A1A0A, 1);
          saloon.fillRect(-4, 8, 72, 4);
          // Door
          saloon.fillStyle(0x2A1A0A, 1);
          saloon.fillRect(24, 38, 16, 26);
          // Windows
          saloon.fillStyle(0xFFD700, 0.3);
          saloon.fillRect(6, 30, 12, 10);
          saloon.fillRect(46, 30, 12, 10);
          // Sign
          saloon.fillStyle(0x8B4513, 1);
          saloon.fillRect(18, 0, 28, 12);
          saloon.fillStyle(0xFFD700, 1);
          saloon.fillRect(20, 2, 24, 8);
          saloon.generateTexture('saloon', 64, 64);
          saloon.destroy();

          // Store
          const store = this.make.graphics({ add: false });
          store.fillStyle(0x6B5344, 1);
          store.fillRect(4, 24, 56, 40);
          store.fillStyle(0x5A4334, 1);
          for (let i = 0; i < 4; i++) {
            store.fillRect(4, 26 + i * 10, 56, 1);
          }
          // Awning
          store.fillStyle(0x8B0000, 1);
          store.fillRect(0, 16, 64, 12);
          store.fillStyle(0xA00000, 1);
          store.fillRect(0, 16, 64, 4);
          for (let i = 0; i < 8; i++) {
            store.fillRect(i * 8, 28, 1, 12);
          }
          // Door
          store.fillStyle(0x3D2510, 1);
          store.fillRect(26, 40, 12, 24);
          // Sign
          store.fillStyle(0x8B4513, 1);
          store.fillRect(14, 4, 36, 14);
          store.fillStyle(0xFFD700, 1);
          store.fillRect(16, 6, 32, 10);
          store.generateTexture('store', 64, 64);
          store.destroy();

          // Mine entrance
          const mine = this.make.graphics({ add: false });
          mine.fillStyle(0x4A4A4A, 1);
          mine.fillRect(16, 16, 32, 48);
          mine.fillStyle(0x3A3A3A, 1);
          mine.fillRect(16, 16, 32, 8);
          // Door
          mine.fillStyle(0x1A1A1A, 1);
          mine.fillRect(22, 32, 20, 32);
          // Timber supports
          mine.fillStyle(0x5C3D1E, 1);
          mine.fillRect(14, 12, 4, 56);
          mine.fillRect(46, 12, 4, 56);
          mine.fillRect(14, 12, 36, 4);
          mine.generateTexture('mine', 64, 64);
          mine.destroy();
        }

        createDecorTextures() {
          // Tree
          const tree = this.make.graphics({ add: false });
          // Trunk
          tree.fillStyle(0x5C3D1E, 1);
          tree.fillRect(28, 40, 8, 20);
          // Foliage
          tree.fillStyle(0x2D5A2D, 1);
          tree.fillCircle(32, 28, 18);
          tree.fillStyle(0x3D6A3D, 1);
          tree.fillCircle(32, 24, 14);
          tree.generateTexture('tree', 64, 64);
          tree.destroy();

          // Cactus
          const cactus = this.make.graphics({ add: false });
          cactus.fillStyle(0x2D5A2D, 1);
          cactus.fillRect(28, 20, 8, 40);
          cactus.fillRect(20, 28, 8, 6);
          cactus.fillRect(36, 32, 8, 6);
          cactus.fillCircle(24, 28, 4);
          cactus.fillCircle(40, 34, 4);
          cactus.fillStyle(0x3D6A3D, 1);
          cactus.fillCircle(28, 22, 3);
          cactus.generateTexture('cactus', 64, 64);
          cactus.destroy();

          // Rock
          const rock = this.make.graphics({ add: false });
          rock.fillStyle(0x6B6B6B, 1);
          rock.fillEllipse(24, 24, 32, 20);
          rock.fillStyle(0x7B7B7B, 1);
          rock.fillEllipse(22, 20, 20, 12);
          rock.generateTexture('rock', 48, 48);
          rock.destroy();
        }

        create() {
          this.drawSkyAndMountains();
          this.drawIsometricMap();
          this.drawBuildings();
          this.drawDecorations();
          this.drawWorkers();
          this.createUI();
        }

        drawSkyAndMountains() {
          // Gradient sky
          const sky = this.add.graphics();
          for (let i = 0; i < 15; i++) {
            const t = i / 15;
            // Sunset colors
            const r = Math.floor(60 + t * 40);
            const g = Math.floor(40 + t * 60);
            const b = Math.floor(80 + t * 100);
            sky.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
            sky.fillRect(0, i * 40, 1000, 41);
          }

          // Sun
          const sun = this.add.graphics();
          sun.fillStyle(0xFFD700, 1);
          sun.fillCircle(800, 80, 40);
          sun.fillStyle(0xFFEC8B, 0.5);
          sun.fillCircle(800, 80, 50);
          sun.fillStyle(0xFFFFFF, 0.3);
          sun.fillCircle(800, 80, 60);

          // Distant mountains (purple/brown)
          const mtn1 = this.add.graphics();
          mtn1.fillStyle(0x4A3A4A, 1);
          mtn1.fillTriangle(0, 250, 150, 100, 300, 250);
          mtn1.fillTriangle(200, 250, 400, 80, 600, 250);
          mtn1.fillTriangle(500, 250, 700, 120, 900, 250);
          mtn1.fillStyle(0x5A4A5A, 1);
          mtn1.fillTriangle(100, 250, 250, 130, 400, 250);

          // Mid mountains
          const mtn2 = this.add.graphics();
          mtn2.fillStyle(0x3D2D1D, 1);
          mtn2.fillTriangle(50, 280, 200, 150, 350, 280);
          mtn2.fillTriangle(250, 280, 450, 130, 650, 280);
          mtn2.fillTriangle(550, 280, 750, 170, 950, 280);

          // Desert ground
          const ground = this.add.graphics();
          ground.fillStyle(0x2A1F14, 1);
          ground.fillRect(0, 250, 1000, 400);
        }

        drawIsometricMap() {
          const tileW = 80;
          const tileH = 40;
          const startX = 180;
          const startY = 300;
          const gridSize = 10;

          // Terrain map
          const map = [
            [0,0,0,0,1,1,1,0,0,0],
            [0,0,0,1,1,2,2,1,0,0],
            [0,0,1,1,2,2,2,2,1,0],
            [0,1,1,2,2,2,3,2,1,0],
            [0,1,2,2,3,2,2,2,1,1],
            [0,1,2,2,2,2,2,2,1,1],
            [0,0,1,2,2,2,2,1,1,0],
            [0,0,1,1,2,2,1,1,0,0],
            [0,0,0,1,1,1,1,0,0,0],
            [0,0,0,0,1,1,0,0,0,0],
          ];

          const textures = ['ground_0', 'ground_1', 'gold_vein', 'silver_vein'];
          const veins: {x: number, y: number, type: number}[] = [];

          for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
              const isoX = startX + (x - y) * (tileW / 2);
              const isoY = startY + (x + y) * (tileH / 2);
              
              const terrain = map[y][x];
              const tile = this.add.image(isoX, isoY, textures[terrain]);
              tile.setOrigin(0.5, 0.5);

              // Gold/silver = mineable
              if (terrain >= 2) {
                veins.push({ x: isoX, y: isoY, type: terrain });
                tile.setInteractive();
                tile.on('pointerover', () => {
                  this.tweens.add({ targets: tile, scale: 1.1, duration: 100 });
                });
                tile.on('pointerout', () => {
                  this.tweens.add({ targets: tile, scale: 1, duration: 100 });
                });
                tile.on('pointerdown', () => this.mineTile(isoX, isoY, terrain));
              }
            }
          }
          (this as any).veins = veins;
        }

        drawBuildings() {
          // Saloon
          const saloon = this.add.image(220, 340, 'saloon');
          saloon.setScale(1.3);
          saloon.setOrigin(0.5, 1);

          // Store
          const store = this.add.image(580, 380, 'store');
          store.setScale(1.2);
          store.setOrigin(0.5, 1);

          // Mine
          const mine = this.add.image(450, 440, 'mine');
          mine.setScale(1.1);
          mine.setOrigin(0.5, 1);
        }

        drawDecorations() {
          // Trees
          [[120, 320], [160, 360], [720, 320], [760, 360], [680, 440]].forEach(([x, y]) => {
            const tree = this.add.image(x, y, 'tree');
            tree.setScale(0.8 + Math.random() * 0.3);
            tree.setOrigin(0.5, 1);
            this.tweens.add({
              targets: tree,
              angle: { from: -2, to: 2 },
              duration: 2000 + Math.random() * 2000,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut',
            });
          });

          // Cacti
          [[620, 480], [670, 500], [740, 460]].forEach(([x, y]) => {
            const cactus = this.add.image(x, y, 'cactus');
            cactus.setScale(0.7);
            cactus.setOrigin(0.5, 1);
          });

          // Rocks
          [[180, 420], [650, 400], [380, 520]].forEach(([x, y]) => {
            const rock = this.add.image(x, y, 'rock');
            rock.setScale(0.8);
            rock.setOrigin(0.5, 1);
          });
        }

        drawWorkers() {
          const positions = [[320, 380], [480, 420], [400, 360]];
          const sprites = ['⛏️', '👷', '🔨'];
          
          positions.forEach((pos, i) => {
            const worker = this.add.text(pos[0], pos[1], sprites[i], {
              fontSize: '28px',
            });
            worker.setOrigin(0.5);
            this.tweens.add({
              targets: worker,
              y: pos[1] - 8,
              duration: 400 + i * 100,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut',
            });
          });
        }

        createUI() {
          // Gold counter box
          const box = this.add.graphics();
          box.fillStyle(0x000000, 0.8);
          box.fillRoundedRect(20, 20, 200, 60, 12);
          box.lineStyle(3, 0xFFD700, 1);
          box.strokeRoundedRect(20, 20, 200, 60, 12);

          // Coin icon
          const coin = this.add.graphics();
          coin.fillStyle(0xFFD700, 1);
          coin.fillCircle(50, 50, 18);
          coin.lineStyle(2, 0xB8860B, 1);
          coin.strokeCircle(50, 50, 18);

          const goldLabel = this.add.text(75, 28, 'GOLD', {
            fontSize: '16px',
            fontFamily: 'Georgia, serif',
            color: '#FFD700',
            fontStyle: 'bold',
          });

          const goldValue = this.add.text(75, 50, '0.000', {
            fontSize: '24px',
            fontFamily: 'Georgia, serif',
            color: '#FFD700',
            fontStyle: 'bold',
          });
          (this as any).goldValue = goldValue;

          // Title
          const titleBox = this.add.graphics();
          titleBox.fillStyle(0x000000, 0.7);
          titleBox.fillRoundedRect(350, 15, 200, 45, 10);

          const title = this.add.text(380, 22, 'PAYDIRT', {
            fontSize: '32px',
            fontFamily: 'Georgia, serif',
            color: '#FF8C00',
            fontStyle: 'bold',
          });
          title.setShadow(2, 2, '#000', 3);

          // Instructions
          this.add.text(750, 560, 'Click gold/silver to mine', {
            fontSize: '14px',
            color: '#A89070',
          });
        }

        mineTile(x: number, y: number, type: number) {
          // Pickaxe animation
          const pick = this.add.text(x, y - 40, '⛏️', { fontSize: '40px' });
          pick.setOrigin(0.5);
          
          this.tweens.add({
            targets: pick,
            angle: 360,
            y: y - 60,
            duration: 350,
            ease: 'Back.easeOut',
            onComplete: () => {
              pick.destroy();
              
              // Particles
              const particleEmoji = type === 2 ? '✨' : '⚪';
              for (let i = 0; i < 12; i++) {
                const p = this.add.text(x, y, particleEmoji, { fontSize: '18px' });
                p.setOrigin(0.5);
                const angle = (i / 12) * Math.PI * 2;
                this.tweens.add({
                  targets: p,
                  x: x + Math.cos(angle) * 60,
                  y: y + Math.sin(angle) * 35,
                  alpha: 0,
                  scale: 0.5,
                  duration: 700,
                  onComplete: () => p.destroy(),
                });
              }
              
              // Reward
              const reward = type === 2 ? 0.01 : 0.005;
              this.goldAmount += reward;
              
              const goldValue = (this as any).goldValue;
              goldValue.setText(this.goldAmount.toFixed(3));
              this.tweens.add({
                targets: goldValue,
                scale: { from: 1.4, to: 1 },
                duration: 200,
              });

              // Floating text
              const float = this.add.text(x, y - 50, `+${reward}`, {
                fontSize: '28px',
                fontFamily: 'Georgia, serif',
                color: type === 2 ? '#FFD700' : '#C0C0C0',
                fontStyle: 'bold',
              });
              float.setOrigin(0.5);
              float.setShadow(2, 2, '#000', 2);
              
              this.tweens.add({
                targets: float,
                y: y - 100,
                alpha: 0,
                duration: 1800,
                onComplete: () => float.destroy(),
              });
            },
          });
        }
      }

      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        width: 1000,
        height: 650,
        parent: 'phaser-game',
        backgroundColor: '#1a1510',
        scene: GameScene,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      });
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [connected]);

  return (
    <div className="min-h-screen bg-stone-950 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-5xl font-bold text-orange-500 mb-1" style={{ fontFamily: 'Georgia, serif', textShadow: '3px 3px 0 #000' }}>
            PAYDIRT
          </h1>
          <p className="text-stone-400">Old West Mining Expedition</p>
        </div>

        <div className="wood-panel p-3 rounded-lg mb-4 flex flex-wrap justify-between items-center">
          <div className="flex items-center gap-3">
            {connected ? (
              <>
                <span className="text-green-400">●</span>
                <span className="text-amber-200 font-mono">{wallet.slice(0,8)}...{wallet.slice(-4)}</span>
                <span className={hasAccess ? 'text-green-400' : 'text-red-400'}>
                  {Number(balance).toLocaleString()} $CLAWKER
                </span>
              </>
            ) : (
              <span className="text-stone-400">Connect wallet to begin</span>
            )}
          </div>
          <button onClick={connect} className="vintage-btn px-6 py-2 font-bold">
            {connected ? '✓ Connected' : 'Connect Wallet'}
          </button>
        </div>

        <div className="wood-frame p-1">
          <div id="phaser-game" className="rounded-lg overflow-hidden"></div>
        </div>

        <div className="mt-4 parchment-panel p-4 rounded-lg flex flex-wrap justify-center gap-6 text-sm">
          <span>🏠 Saloon</span>
          <span>🏪 Store</span>
          <span>⛏️ Mine</span>
          <span>✨ Gold (0.01)</span>
          <span>⚪ Silver (0.005)</span>
        </div>
      </div>
    </div>
  );
}
