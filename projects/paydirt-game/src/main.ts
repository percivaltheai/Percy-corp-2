// PAYDIRT - Old West Mining Game
// Built with Phaser 3
import Phaser from 'phaser';

console.log('PAYDIRT: Game initializing...');

// Global wallet state - updated by HTML
let walletState = {
  address: null,
  balance: '0',
  connected: false,
  hasAccess: false
};

// Listen for wallet updates from HTML
window.addEventListener('walletUpdate', (e: Event) => {
  walletState = (e as CustomEvent).detail;
  console.log('GAME: Wallet update received:', walletState);
  
  // Update game scenes
  if (gameInstance) {
    gameInstance.events.emit('walletUpdate', walletState);
  }
});

// Game Configuration
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1510',
  parent: 'game-container',
  scene: [BootScene, GameScene, UIScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

let gameInstance: Phaser.Game;

try {
  gameInstance = new Phaser.Game(config);
  console.log('PAYDIRT: Game created successfully');
  
  // Hide loading text
  const loadingEl = document.querySelector('#game-container .loading');
  if (loadingEl) {
    (loadingEl as HTMLElement).style.display = 'none';
  }
} catch (err) {
  console.error('PAYDIRT: Failed to create game:', err);
}

// Boot Scene
class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x3d2817, 0.8);
    progressBox.fillRect(w/2 - 160, h/2 - 25, 320, 50);
    
    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xd4a84b, 1);
      progressBar.fillRect(w/2 - 150, h/2 - 15, 300 * value, 30);
    });
  }

  create() {
    this.scene.start('GameScene');
  }
}

// Main Game Scene
class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  create() {
    this.player = null;
    this.cursors = null;
    this.mapGrid = [];
    this.selectedTile = null;
    this.isMining = false;
    this.inventory = { copper: 0, silver: 0, gold: 0 };
    this.balance = 0;

    this.createBackground();
    this.createMiningGrid();
    this.createPlayer();
    
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.on('pointerdown', this.handleClick, this);
    
    this.cameras.main.setBounds(0, 0, 1600, 1200);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    
    // Listen for wallet updates
    this.events.on('walletUpdate', this.handleWalletUpdate, this);
  }

  handleWalletUpdate(state) {
    walletState = state;
    // Emit to UI scene
    this.scene.get('UIScene').events.emit('walletUpdate', state);
  }

  createBackground() {
    // Sky gradient
    const sky = this.add.graphics();
    for (let i = 0; i < 20; i++) {
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        { r: 135, g: 206, b: 235 },
        { r: 255, g: 160, b: 100 },
        20, i
      );
      sky.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1);
      sky.fillRect(0, i * 20, 800, 20);
    }
    
    // Mountains (parallax)
    const mountains = this.add.graphics();
    mountains.fillStyle(0x2d1f14, 1);
    for (let i = 0; i < 20; i++) {
      const x = i * 120;
      const h = 100 + Math.random() * 150;
      mountains.fillTriangle(x, 400, x + 60, 400 - h, x + 120, 400);
    }
    mountains.setScrollFactor(0.3);
    
    // Ground
    const ground = this.add.graphics();
    ground.fillStyle(0x4a3728, 1);
    ground.fillRect(0, 380, 1600, 400);
    
    // Grass tufts
    const grass = this.add.graphics();
    grass.fillStyle(0x3d5a3d, 1);
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 800;
      const y = 375 + Math.random() * 15;
      grass.fillTriangle(x, y, x + 3, y - 8, x + 6, y);
    }
    
    // Town silhouette (distant)
    const town = this.add.graphics();
    town.fillStyle(0x1a1510, 0.8);
    // Buildings
    town.fillRect(100, 340, 30, 45);
    town.fillRect(140, 330, 40, 55);
    town.fillRect(190, 345, 25, 40);
    // Church steeple
    town.fillRect(250, 310, 8, 75);
    town.fillTriangle(240, 310, 254, 310, 254, 280);
    town.setScrollFactor(0.2);
  }

  weightedRandom(options) {
    const total = options.reduce((sum, o) => sum + o.weight, 0);
    let random = Math.random() * total;
    for (const opt of options) {
      random -= opt.weight;
      if (random <= 0) return opt.type;
    }
    return 'empty';
  }

  createMiningGrid() {
    const gridSize = 10;
    const tileSize = 64;
    const startX = 400;
    const startY = 420;
    
    const resourceTypes = [
      { type: 'empty', weight: 50 },
      { type: 'copper', weight: 30 },
      { type: 'silver', weight: 15 },
      { type: 'gold', weight: 5 }
    ];
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const tile = this.createTile(
          startX + x * (tileSize + 4),
          startY + y * (tileSize + 4),
          x, y,
          this.weightedRandom(resourceTypes)
        );
        this.mapGrid.push(tile);
      }
    }
  }

  createTile(x, y, gridX, gridY, type) {
    // Tile shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillEllipse(x + 30, y + 55, 50, 15);
    
    // Tile base (dirt mound)
    const base = this.add.graphics();
    base.fillStyle(0x3d2817, 1);
    base.fillRoundedRect(x, y, 60, 50, 8);
    
    // Tile highlight
    const highlight = this.add.graphics();
    highlight.fillStyle(0x5a4025, 0.5);
    highlight.fillRoundedRect(x + 4, y + 4, 52, 15, 4);
    
    // Resource indicator (colored soil)
    const top = this.add.graphics();
    const colors = {
      empty: 0x5c4a3a,
      copper: 0xb87333,
      silver: 0xc0c0c0,
      gold: 0xffd700
    };
    top.fillStyle(colors[type] || 0x5c4a3a, 1);
    top.fillRoundedRect(x + 8, y + 25, 44, 18, 4);
    
    // Question mark for unrevealed
    const label = this.add.text(x + 30, y + 35, '?', {
      fontSize: '24px',
      color: '#8b7355',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const zone = this.add.zone(x + 30, y + 30, 60, 50).setInteractive({ useHandCursor: true });
    
    const tile = { base, top, label, zone, x, y, gridX, gridY, type, revealed: false };
    
    zone.on('pointerover', () => {
      if (!this.isMining) {
        base.clear();
        base.fillStyle(0x5a4025, 1);
        base.fillRoundedRect(x, y, 60, 50, 8);
      }
    });
    
    zone.on('pointerout', () => {
      if (!this.selectedTile || this.selectedTile.gridX !== gridX || this.selectedTile.gridY !== gridY) {
        base.clear();
        base.fillStyle(0x3d2817, 1);
        base.fillRoundedRect(x, y, 60, 50, 8);
      }
    });
    
    return tile;
  }

  createPlayer() {
    // Procedural cowboy sprite
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Body (poncho)
    playerGraphics.fillStyle(0x8b4513, 1);
    playerGraphics.fillRect(12, 20, 16, 24);
    
    // Head
    playerGraphics.fillStyle(0xffdbac, 1);
    playerGraphics.fillCircle(20, 12, 10);
    
    // Hat brim
    playerGraphics.fillStyle(0x4a3728, 1);
    playerGraphics.fillEllipse(20, 8, 32, 10);
    // Hat top
    playerGraphics.fillRect(10, 0, 20, 10);
    
    // Pickaxe handle
    playerGraphics.fillStyle(0x8b4513, 1);
    playerGraphics.fillRect(32, 10, 4, 25);
    // Pickaxe head
    playerGraphics.fillStyle(0x8b8b8b, 1);
    playerGraphics.fillTriangle(28, 10, 40, 10, 34, 2);
    
    playerGraphics.generateTexture('player', 44, 50);
    playerGraphics.destroy();
    
    this.player = this.add.container(430, 450);
    const sprite = this.add.sprite(0, 0, 'player');
    this.player.add(sprite);
    
    // Idle bob animation
    this.tweens.add({
      targets: sprite,
      y: -3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  handleClick(pointer) {
    // Check wallet access first
    if (!walletState.connected) {
      this.showMessage('Connect wallet to play!', 0xff4444);
      return;
    }
    if (!walletState.hasAccess) {
      this.showMessage('Need 50M $CLAWKER for access!', 0xff4444);
      return;
    }
    
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    
    for (const tile of this.mapGrid) {
      const bounds = tile.zone.getBounds();
      if (bounds.contains(worldPoint.x, worldPoint.y)) {
        this.selectTile(tile);
        break;
      }
    }
  }

  showMessage(text, color) {
    const msg = this.add.text(400, 300, text, {
      fontSize: '20px',
      color: '#' + color.toString(16).padStart(6, '0'),
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: msg,
      alpha: 0,
      y: msg.y - 50,
      duration: 2000,
      onComplete: () => msg.destroy()
    });
  }

  selectTile(tile) {
    if (this.selectedTile) {
      this.selectedTile.base.clear();
      this.selectedTile.base.fillStyle(0x3d2817, 1);
      this.selectedTile.base.fillRoundedRect(this.selectedTile.x, this.selectedTile.y, 60, 50, 8);
    }
    
    this.selectedTile = tile;
    
    tile.base.clear();
    tile.base.fillStyle(0xd4a84b, 1);
    tile.base.fillRoundedRect(tile.x, tile.y, 60, 50, 8);
    
    this.tweens.add({
      targets: this.player,
      x: tile.x + 30,
      y: tile.y + 30,
      duration: 300,
      ease: 'Power2',
      onComplete: () => this.startMining(tile)
    });
  }

  startMining(tile) {
    if (this.isMining || tile.revealed) return;
    
    this.isMining = true;
    
    const sprite = this.player.list[0];
    
    this.tweens.add({
      targets: sprite,
      angle: { from: -30, to: 30 },
      duration: 150,
      yoyo: true,
      repeat: 5,
      onYoyo: () => {
        this.spawnMiningParticles(tile.x + 30, tile.y + 30);
      },
      onComplete: () => {
        this.completeMining(tile);
      }
    });
  }

  spawnMiningParticles(x, y) {
    for (let i = 0; i < 5; i++) {
      const particle = this.add.circle(
        x + (Math.random() - 0.5) * 30,
        y + Math.random() * 20,
        3 + Math.random() * 4,
        0x8b7355
      );
      
      this.tweens.add({
        targets: particle,
        x: x + (Math.random() - 0.5) * 60,
        y: y + (Math.random() - 0.5) * 40 - 30,
        alpha: 0,
        scale: 0,
        duration: 400,
        ease: 'Power2',
        onComplete: () => particle.destroy()
      });
    }
  }

  completeMining(tile) {
    this.isMining = false;
    tile.revealed = true;
    
    this.tweens.add({
      targets: tile.label,
      scale: 1.5,
      duration: 200,
      yoyo: true,
      onComplete: () => {
        if (tile.type === 'empty') {
          tile.label.setText('×');
          tile.label.setColor('#666666');
          this.showMessage('Dry hole...', 0x888888);
        } else {
          const icons = { copper: 'Cu', silver: 'Ag', gold: 'Au' };
          tile.label.setText(icons[tile.type]);
          
          const colors = { copper: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700' };
          tile.label.setColor(colors[tile.type]);
          
          this.inventory[tile.type]++;
          this.showReward(tile);
        }
      }
    });
    
    // Screen shake for valuable finds
    if (tile.type === 'gold' || tile.type === 'silver') {
      this.cameras.main.shake(200, 0.01);
    }
  }

  showReward(tile) {
    const amounts = { copper: '+0.001', silver: '+0.005', gold: '+0.01' };
    const colors = { copper: 0xcd7f32, silver: 0xc0c0c0, gold: 0xffd700 };
    
    const reward = this.add.text(tile.x + 30, tile.y - 20, amounts[tile.type], {
      fontSize: '20px',
      color: '#' + colors[tile.type].toString(16).padStart(6, '0'),
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
    
    this.balance += parseFloat(amounts[tile.type].replace('+', ''));
    
    // Animate reward text
    this.tweens.add({
      targets: reward,
      y: reward.y - 50,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => reward.destroy()
    });
    
    // Show message
    const msgs = { copper: 'Found copper!', silver: 'Found silver!', gold: 'GOLD RUSH!' };
    const msgColors = { copper: 0xcd7f32, silver: 0xc0c0c0, gold: 0xffd700 };
    this.showMessage(msgs[tile.type], msgColors[tile.type]);
    
    // Update UI
    this.events.emit('inventoryUpdate', this.inventory);
    this.events.emit('balanceUpdate', this.balance);
  }

  update() {
    const speed = 200;
    
    if (this.cursors?.left?.isDown) {
      this.player.x -= speed * 0.016;
    } else if (this.cursors?.right?.isDown) {
      this.player.x += speed * 0.016;
    }
    
    if (this.cursors?.up?.isDown) {
      this.player.y -= speed * 0.016;
    } else if (this.cursors?.down?.isDown) {
      this.player.y += speed * 0.016;
    }
  }
}

// UI Scene
class UIScene extends Phaser.Scene {
  constructor() { super({ key: 'UIScene' }); }

  create() {
    this.cameras.main.setScrollFactor(0);
    
    // Top bar background
    const bar = this.add.graphics();
    bar.fillStyle(0x1a1510, 0.85);
    bar.fillRect(0, 0, 800, 60);
    bar.fillStyle(0x3d2817, 1);
    bar.fillRect(0, 58, 800, 2);
    
    // Title
    this.add.text(20, 12, 'PAYDIRT', {
      fontSize: '32px',
      color: '#d4a84b',
      fontStyle: 'bold'
    }).setScrollFactor(0);
    
    // Subtitle
    this.add.text(140, 22, 'Old West Mining', {
      fontSize: '12px',
      color: '#8b7355'
    }).setScrollFactor(0);
    
    // Balance
    this.balanceText = this.add.text(300, 18, '0.000 ETH', {
      fontSize: '24px',
      color: '#4ade80',
      fontStyle: 'bold'
    }).setScrollFactor(0);
    
    // Inventory
    this.inventoryText = this.add.text(500, 18, 'Cu:0  Ag:0  Au:0', {
      fontSize: '18px',
      color: '#ffffff'
    }).setScrollFactor(0);
    
    // Wallet status
    this.walletText = this.add.text(20, 420, 'Connect wallet to play', {
      fontSize: '16px',
      color: '#ff6b6b'
    }).setScrollFactor(0);
    
    // Event listeners
    this.events.on('balanceUpdate', (balance) => {
      this.balanceText.setText(balance.toFixed(3) + ' ETH');
    });
    
    this.events.on('inventoryUpdate', (inv) => {
      this.inventoryText.setText(`Cu:${inv.copper}  Ag:${inv.silver}  Au:${inv.gold}`);
    });
    
    this.events.on('walletUpdate', (state) => {
      if (state.connected) {
        const access = state.hasAccess ? '✓ ACCESS' : '✗ NEED 50M CLAWKER';
        const color = state.hasAccess ? '#4ade80' : '#ff6b6b';
        this.walletText.setText(`${state.address.slice(0,6)}...${state.address.slice(-4)} | ${access}`);
        this.walletText.setColor(color);
      } else {
        this.walletText.setText('Connect wallet to play');
        this.walletText.setColor('#ff6b6b');
      }
    });
  }
}
