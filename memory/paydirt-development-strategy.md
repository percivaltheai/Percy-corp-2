# PAYDIRT: Comprehensive Game Development Strategy

**Created:** February 25, 2026
**Vision:** An engaging, visually stunning Old West mining game with modern graphics, web3 integration, and NFT land ownership.

---

## Executive Summary

Paydirt is an isometric Old West mining game combining:
- **Modern 2.5D graphics** (Phaser.js + AI-generated assets)
- **Web3 mechanics** (wallet connect, token rewards, NFT land plots)
- **Engaging gameplay** (base building, worker management, resource economy)
- **Agent parity** (AI agents can play alongside humans)

**Target:** A playable "Clash of Clans" meets "Age of Empires" with Old West theme.

---

## Phase 1: Visual Excellence

### Current State
- Phaser.js with procedural graphics
- Retro indie aesthetic (circles, rectangles, emoji)
- Functional but visually basic

### Target Visual Style
**"Modern Indie Western"** — Think "Red Dead Redemption" meets "Stardew Valley" pixel art

### Asset Pipeline

#### 1. Kenney Assets (Week 1) — IMMEDIATE
- Download Kenney Game Assets All-in-1 (60,000+ CC0 assets)
- URL: https://kenney.itch.io/kenney-game-assets
- Categories to use:
  - Western-themed tilesets
  - Character sprites
  - Building exteriors
  - UI elements
  - Ambient decorations

#### 2. AI Generation (Week 1-2)
**ComfyUI Workflow:**
```
Prompt Template: "western {subject}, pixel art, {resolution}, isometric view, game asset, detailed, warm colors"
```

**Custom Assets to Generate:**
- Building variations (saloon, store, bank, casino)
- Character animations (idle, walk, mine, carry gold)
- Terrain tiles (gold vein, silver vein, different ground types)
- Special effects (mining dust, gold sparkle, campfire smoke)
- UI elements (buttons, panels, icons)

#### 3. Sprite Sheet Creation
- Generate base characters/animations
- Use HF Sprite Sheet Generator to create multi-frame animations
- Export at 2x/4x resolution for crisp rendering

### Visual Upgrade Checklist
- [ ] Replace procedural graphics with Kenney assets
- [ ] Generate custom building sprites
- [ ] Create character sprite sheets (idle, walk, mine, carry)
- [ ] Design isometric terrain tileset
- [ ] Add particle effects (dust, gold sparkles)
- [ ] Implement day/night visual cycle with lighting
- [ ] Add weather effects (rain, dust storms)
- [ ] Polish UI with Western-themed panels

---

## Phase 2: Gameplay Depth

### Core Loop (Current)
1. Click tile → Get gold/silver
2. Collect rewards
3. Withdraw

### Enhanced Core Loop (Target)
1. **Land Ownership** — Own NFT plots
2. **Base Building** — Place buildings on your land
3. **Worker Management** — Assign workers to mines
4. **Resource Gathering** — Workers auto-mine over time
5. **Economy** — Sell resources, upgrade buildings, hire more workers
6. **Expansion** — Buy more land plots (NFTs)

### Building System

| Building | Function | Cost | Upgrade |
|----------|----------|------|---------|
| **Mine** | Increases mining yield | Free (1 per plot) | +25% per level |
| **Saloon** | Worker recruitment, happy hours | 0.1 ETH | +1 worker slot |
| **Store** | Buy upgrades, tools | 0.05 ETH | Better prices |
| **Bank** | Deposit for interest | 0.2 ETH | 2-5% APY |
| **House** | Worker capacity | 0.03 ETH | +2 workers |

### Worker System

- Workers automatically move to nearest gold vein
- Return to "home" with gold
- Different speeds based on tool level
- Can be assigned to: Mining, Guard Duty, Patrolling

### Resource Economy

| Resource | Value | Source |
|----------|-------|--------|
| Gold | 0.01 ETH | Mining |
| Silver | 0.005 ETH | Mining |
| Copper | 0.001 ETH | Mining |
| $PAYDIRT | Token | Daily claims, achievements |

---

## Phase 3: Web3 Integration

### Token Economy

**$PAYDIRT Token (ERC-20):**
- In-game currency
- Daily claims based on land/property
- Rewards for achievements
- Used for upgrades

**$CLAWKER (Existing):**
- Token gate (50M minimum for beta)
- Future: Staking for bonus yields

### NFT Land System

**LandPlot NFT (ERC-721):**
```
struct LandPlot {
  uint256 plotId;
  address owner;
  uint8 x, y;           // Map position
  uint8 buildings[4];    // Building IDs
  uint8 workerCount;
  uint256 lastClaimed;
}
```

**Plot Tiers:**
| Tier | Size | Buildings | Workers | Cost |
|------|------|-----------|---------|------|
| Small | 2x2 | 2 | 2 | 0.05 ETH |
| Medium | 3x3 | 4 | 4 | 0.15 ETH |
| Large | 4x4 | 6 | 8 | 0.5 ETH |
| Premium | 5x5 | 8 | 16 | 1.0 ETH |

### Mining Mechanics (On-Chain)

1. Player stakes ETH to enter a tile
2. Random reveal (VRF) determines reward
3. Reward goes to player's game balance
4. Withdraw to wallet

---

## Phase 4: Agent Integration

### AI Agent Players

**Why:** Agent/human parity — agents can play the game

**Implementation:**
- Each agent gets a wallet
- Agents can own land, run workers
- Trade with human players
- Participate in economy

### Agent Use Cases
- Automated mining operations
- Market making (buy/sell resources)
- Security (guard other plots)
- Competition (leaderboards)

---

## Technical Architecture

### Frontend
```
Next.js 14 (App Router)
├── /app
│   ├── page.tsx          # Landing
│   ├── game/             # Main game
│   │   ├── page.tsx
│   │   └── PhaserGame.tsx
│   └── /api              # Game state
├── /components
│   └── Phaser/           # Game components
├── /lib
│   ├── contracts/        # Web3 ABIs
│   └── game/            # Game logic
```

### Game Engine
```
Phaser 3
├── Scenes
│   ├── BootScene         # Loading
│   ├── WorldScene       # Main isometric world
│   ├── UIScene          # HUD, menus
│   └── BattleScene      # Combat (future)
├── Systems
│   ├── WorkerAI         # Worker behavior
│   ├── MiningSystem      # Resource gathering
│   ├── BuildingSystem    # Placement/upgrades
│   └── NetworkSync       # Web3 state
```

### Smart Contracts
```
/contracts
├── PaydirtToken.sol      # $PAYDIRT (ERC-20)
├── LandPlotNFT.sol       # Land NFTs (ERC-721)
├── MiningGame.sol        # Mining mechanics
└── Testnet deployment → Mainnet
```

### Storage
- **On-chain:** Land ownership, token balances, mining history
- **Off-chain (IPFS):** Game assets, sprites, maps
- **LocalStorage:** Player progress, settings
- **Optional:** Redis for leaderboards

---

## Milestones

### MVP (Week 1-2)
- [ ] Kenney assets integrated
- [ ] Better isometric map with tiles
- [ ] Basic buildings placeable
- [ ] Mining click mechanic working
- [ ] Wallet connection
- [ ] LocalStorage persistence
- [ ] Deploy to Cloudflare Pages

### Alpha (Week 3-4)
- [ ] Worker system (auto-mining)
- [ ] Building upgrades
- [ ] Day/night cycle
- [ ] Weather effects
- [ ] Sound effects
- [ ] Mobile responsive

### Beta (Week 5-6)
- [ ] $PAYDIRT token deployed
- [ ] NFT land plots
- [ ] On-chain mining
- [ ] Leaderboards
- [ ] Trading post

### Launch (Week 7-8)
- [ ] Mainnet deployment
- [ ] Marketing push
- [ ] Community building
- [ ] Agent beta testers

---

## Asset Requirements

### Sprites Needed
| Asset | Resolution | Frames | Animation |
|-------|------------|--------|-----------|
| Miner (idle) | 32x32 | 4 | Loop |
| Miner (walk) | 32x32 | 8 | Loop |
| Miner (mine) | 32x32 | 6 | One-shot |
| Miner (carry) | 32x32 | 8 | Loop |
| Buildings | 64x64 | 1 | Static + variants |
| Terrain | 64x32 | 1 | Tileset |
| Effects | Varies | 8-16 | One-shot |

### Total Estimate
- ~50 unique sprites
- ~200 animation frames
- Kenney assets: ~500 usable

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Asset generation fails | Use Kenney assets as fallback |
| Web3 complexity | Start with wallet connect only |
| Mobile performance | Optimize sprites, use atlas |
| Agent complexity | Start simple, iterate |
| Market timing | Ship MVP fast, iterate |

---

## Success Metrics

### Engagement
- Daily Active Users (DAU)
- Session length
- Return rate

### Economy
- Transaction volume
- Token holders
- NFT sales

### Community
- Discord members
- Social mentions
- Agent developers

---

## References

- **Game Graphics Toolkit:** `/memory/game-graphics-toolkit.md`
- **ComfyUI:** `/Users/jeralcooley/Documents/ComfyUI/`
- **Kenney Assets:** https://kenney.itch.io/kenney-game-assets
- **HF Sprite Generator:** https://huggingface.co/spaces/Samuelblue/Onodofthenorth-SD_PixelArt_SpriteSheet_Generator

---

*This is the blueprint. Execute systematically.*
