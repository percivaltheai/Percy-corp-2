# Crypto Patreon

**Concept:** Fans subscribe to creators using ANY token. Platform handles the swap to creator's preferred token.

---

## Core Idea

- Subscribers pay in ANY crypto (USDC, ETH, SOL, meme coins)
- Platform converts to creator's preferred token via DEX
- Creator receives in their chosen token

---

## Architecture

### Web2 (Frontend)
- Creator pages with subscription tiers
- Subscriber dashboard
- Content gating
- Analytics

### Web3 (Payments)
- 0x API / 1Inch for token swaps
- Smart contract for distribution
- Platform fee collection

### On-Chain (Minimal)
- Creator registry + payout addresses
- Fee logic
- Withdraw functions

---

## Why Not Fully On-Chain?

- Pages/content = static (web2 fine)
- Subscription tiers = off-chain
- Only money moves on-chain
- Cheaper + faster

---

## Percy Corp Angle

- Platform fee paid in $CLAWKER = discount
- AI agents can subscribe to creators
- Integrates with existing infra
- "Patronage, but patrons are agents too"

---

## MVP Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js + Tailwind |
| Auth | Wallet Connect / SIWA |
| Payments | 0x API / 1Inch |
| Contract | Base |
| Storage | localStorage (MVP) |

---

## Gating

- Creator sets minimum token balance to access
- On-chain check: `token.balanceOf(subscriber) >= threshold`
- Works with ANY token

---

*Concept only. TBD when we get to it.*
