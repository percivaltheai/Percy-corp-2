# CLAWKER.net — Token Trust Intelligence Layer

**Tagline:** "DexScreener tells you *what*. CLAWKER tells you *why you should care*."

---

## Product Definition

**Category:** Trust Intelligence Layer / Credibility Protocol

**Core Function:** AI-driven credibility, transparency, and investigative analysis for trending tokens. Differentiates from Dex-style price terminals by focusing on *trust* over *price*.

**Primary User Outcome:** Reduced signal-to-noise ratio. Users leave knowing whether a token is worth their attention, not just whether it's pumping.

---

## Architecture Overview

### Core Philosophy
- NOT a price terminal (don't compete with DexScreener)
- NOT a charting platform
- YES: Trust scoring, investigative analysis, builder reputation

### Product Category
- Analytics + Media + Trust Layer + Investigative Engine
- The "before you trust" checkpoint

---

## Technical Architecture

### Data Ingestion (Layer 2)
- **DexScreener API** — Pair creation, volume spikes
- **Dexlab** — New token launches
- **Uniswap/Base** — Factory events for new pairs
- **X/Farcaster** — Social velocity signals
- **Telegram groups** — Community growth

### Trending Thresholds
- New pair < 24h + volume > $10K = Investigate
- Social mentions > 50 in 1hr = Track
- Wallet cluster > 5 buying within 5min = Alert

---

## Scoring System (ClawScore)

### Sub-Scores (Weighted)

| Score | Weight | Components |
|-------|--------|------------|
| **Trust** | 30% | Builder history, deployer reputation, rug history |
| **Liquidity** | 20% | LP health, burn, concentration |
| **Utility** | 20% | Product shipped, real users, code activity |
| **Community** | 15% | Organic engagement, holder distribution |
| **Risk** | 15% | Unlock schedule, mint authority, centralization |

### Scoring Principles
- Static weights by default (transparency)
- Adaptive override for "Verified" projects
- Public methodology, hidden exact heuristics (gaming prevention)

---

## Onchain Intelligence

### Wallet Metrics Analyzed
- Wallet age (created - first tx)
- Transaction frequency + patterns
- Gas spent vs received ratio
- Interaction diversity
- Cluster analysis (addresses that transact together)

### Risk Detection
- **Insider clustering:** Wallets buying within 2 blocks of deployer
- **Liquidity health:** LP/MCAP ratio < 1% = dangerous
- **Emission risk:** Top 10 holders > 80% = warning
- **Dump detection:** Buy → sell within blocks pattern
- **Coordinated behavior:** Identical sized sells (bot indicator)

---

## Builder History Layer

### Tracking
- Index ALL contracts by deployer address
- Build deployer fingerprint (avg time between launches, patterns)

### Trust Classification
- 0 launches = Unknown
- 1-2 failed = Experimenter
- 3+ successful = Builder
- Rugged = Blacklist (flagged, not hidden)

### Distinguishing Failed vs Malicious
- Failed: Rugged once, paid back, no repeat
- Malicious: Rugged + did it again, or rugged + disappeared

---

## Product & Utility Verification

### Signals for Real Usage
- GitHub commit history (90 days)
- Website age + tech stack
- Live product URL
- Wallet interactions (not just holders)

### Narrative vs Utility Index
- "AI" in name vs actual AI implementation
- Whitepaper vs code match
- Roadmap completed vs announced

---

## Incentive Architecture

### Staking Model
- Projects stake $CLAWKER for "CLAWKER Verified" badge
- Staking = collateral against bad behavior

### Slashing Conditions
- Rug = slashed + reputation burn + public flag
- False flagging = slashed (anti-abuse)

### Pay-to-Play Prevention
- Free tier: Basic scores, trending, limited API
- NOT required for visibility (organic scoring always available)

---

## Anti-Sybil Controls

- Wallet behavior clustering
- Timeline analysis (organic = gradual, bot = spike)
- Social graph cross-reference
- New wallet detection (funded from same source)

---

## Revenue Model

| Stream | Target % | Description |
|--------|----------|-------------|
| API Access | 40% | Free 100/day, Pro $99/mo unlimited |
| Premium Audits | 30% | Manual deep-dive reports |
| Agent Data Feeds | 20% | AI agents subscribe to alerts |
| Subscriptions | 10% | Portfolio tracking, mobile app |

---

## Distribution Strategy

| Platform | Integration |
|----------|-------------|
| **X** | Auto-post scores on trending tokens |
| **Farcaster** | Frame showing score on cast |
| **Telegram** | Bot: /score 0x... |
| **Discord** | Webhook alerts |

---

## MVP Scope (30 Days)

### Week 1
Token ingestion pipeline + basic scoring

### Week 2
Builder history database + ClawScore v1

### Week 3
Frontend (score display, search, trending) + API

### Week 4
Social integration (X bot, Telegram bot) + polish

### MVP Features
- Ingest top 100 tokens by volume
- Basic ClawScore (no sub-scores yet)
- Search by token address
- Trending page
- Basic builder history

---

## Infrastructure & Costs

### MVP: $0-50/mo (free tiers)
### Production: $150-300/mo
### Scaling: $500+/mo

---

## Long-Term Moat

1. **Data History** — No substitute for tracking builder reputation over time
2. **Network Effects** — More users = better scoring (flywheel)
3. **Builder Relationships** — Legitimate builders opt in for verification
4. **Agent Integration** — AI agents check CLAWKER before interacting

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + TypeScript |
| Database | PostgreSQL + TimescaleDB |
| Data Indexer | GoldRush (Covalent) or Dune |
| Social Data | Ney (Farcaster), Twitter API v2 |
| Frontend | Next.js 15 + Tailwind |
| Agent Orchestration | In-house (Percy Corp) |
| Deployment | Vercel + Railway |

---

## Status

*Concept only. TBD when resources allow.*
