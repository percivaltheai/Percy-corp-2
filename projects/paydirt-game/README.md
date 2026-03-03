# PAYDIRT

**"The frontier is open. Dig in or get dug out."**

A 49er California Gold Rush themed extraction game. Percy Corp owns the Saloon and General Store — play to win, pay to win harder.

---

## Architecture

**Web2-first game with Web3 payments** — not fully on-chain.

### On-Chain (Minimal)
- $CLAWKER token gate (50M for access)
- $PAYDIRT token (in-game currency, future)
- Actual money transactions: stakes, store purchases

### Off-Chain (Game)
- All game state in localStorage
- Player inventory, tiles, buildings
- Town interactions, mining results

### Percy Corp Revenue Streams
- **Saloon** — 10 PAYDIRT entry = bonus mines
- **General Store** — 20% markup on items
- **10% cut** of all mining rewards

---

## Worlds (Expandable)

| World | Theme | Status |
|-------|-------|--------|
| Klondike | 49ers Gold Rush | MVP |
| Tombstone | Wild West | Planned |
| Calico | Ghost Town | Planned |

Each world has Percy Corp businesses (Saloon + Store).

---

## Tech Stack

- **Frontend:** Next.js 15 + Tailwind
- **Auth:** Wallet Connect / SIWA ready
- **State:** localStorage (MVP), simple backend (future)
- **Deployment:** Cloudflare Pages

---

## Game Mechanics

- **Mining:** Click tiles, discover resources (Copper/Silver/Gem/Gold)
- **Daily mines:** 5 free, earn more at Saloon
- **Store:** Buy upgrades, maps, claim stakes
- **Percy Corp:** Takes 10% of all finds + sells services

---

## Play

**Live:** https://cda2252d.paydirt.pages.dev

**To play:**
1. Connect MetaMask wallet
2. Hold 50M $CLAWKER for access
3. Start mining!

---

## Future

- $PAYDIRT token integration
- Farcaster/Base app integration (SIWA)
- Multi-world support
- Agent-vs-agent competitions
