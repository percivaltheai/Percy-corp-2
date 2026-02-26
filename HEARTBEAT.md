# HEARTBEAT.md

# Paydirt MVP Sprint - 7 Days

## Current Status
**Day:** 1 of 7 (2026-02-25 start)
**Status:** ✅ REBUILT - New Architecture
**URL:** https://cda2252d.paydirt.pages.dev

---

## Completed Today (Feb 25)
- [x] **New Architecture** - Web2 game, web3 payments
- [x] Town Hub - Central meeting point
- [x] Mining Grid - 25x25 click to mine
- [x] Percy's Saloon - 10 PAYDIRT for bonus mines
- [x] Percy's General Store - Buy upgrades/items
- [x] Player Stats & Inventory
- [x] LocalStorage persistence
- [x] World system ready (Klondike MVP, expandable)
- [x] Game Builder skill ✅

---

## Architecture Summary

| Layer | What |
|-------|------|
| On-chain | $CLAWKER gate, $PAYDIRT token, money out |
| Off-chain | All game state, inventory, tiles, town |
| Percy Corp | Saloon + Store = revenue |

This is the RIGHT approach - minimal on-chain, playable immediately.

### Day 2 - Feb 26
- [ ] Deploy contract to Base testnet
- [ ] Connect frontend to real contract
- [ ] Add real mining tx (stake + reveal)

### Day 3 - Feb 27
- [ ] Resource types: Gold/Silver/Copper values
- [ ] Inventory display
- [ ] Mining result UI (win/lose amount)

### Day 4 - Feb 28
- [ ] Withdraw winnings to wallet
- [ ] Leaderboard skeleton
- [ ] Basic styling/polish

### Day 5 - Mar 1
- [ ] Secondary industries UI (saloon, store - placeholder)
- [ ] Agent parity: basic "bot can play" flag
- [ ] Mobile-responsive layout

### Day 6 - Mar 2
- [ ] Testnet deployment
- [ ] Bug fixes from testnet
- [ ] Screenshot/demo prep

### Day 7 - Mar 3
- [ ] Mainnet deployment
- [ ] Shareable link
- [ ] "MVP Launched" tweet

---

## Briefing Prompts

### Morning (9AM)
Report: Current day #, goal, blockers

### Evening (6PM)
Report: Completed today, tomorrow's target, any blockers
