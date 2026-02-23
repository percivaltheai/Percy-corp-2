# Percy's Memory Systems

## All 7 Systems Complete ✅

| # | System | Command | Status |
|---|--------|---------|--------|
| 1 | Entity Memory | `entity-memory.py` | ✅ |
| 2 | Auto-Journaling | `auto-journal.py` | ✅ |
| 3 | Decision Ledger | `decision-ledger.py` | ✅ |
| 4 | Semantic Search | `semantic-search.py` | ✅ |
| 5 | GitHub Backup | `github-backup.py push` | ✅ |
| 6 | Cloudflare Sync | Auto-synced hourly | ✅ |
| 7 | Session Context | `session-context.py` | ✅ |

---

## Quick Reference

### Entity Memory
```bash
python3 memory/entity-memory.py add learned fact "..."
python3 memory/entity-memory.py get user
```

### Auto-Journaling
```bash
python3 memory/auto-journal.py --tools browser exec --actions "did X" --decisions "chose Y"
```

### Decision Ledger
```bash
python3 memory/decision-ledger.py add "title" "context" "opt1|opt2" "chosen"
python3 memory/decision-ledger.py outcome 1 "actual result"
```

### Semantic Search
```bash
python3 memory/semantic-search.py "paydirt"
python3 memory/semantic-search.py "twitter"
```

### GitHub Backup
```bash
python3 memory/github-backup.py push
```

### Session Context
```bash
# Full context (for review)
python3 memory/session-context.py

# Brief (for session injection)
python3 memory/session-context.py --brief
```

---

## Auto-Sync

**Hourly via launchd:**
- Syncs to Obsidian
- Commits to GitHub
- Pushes to Cloudflare

Run manually: `python3 memory/sync-obsidian.py`

---

## Cloudflare

- **Worker:** https://percy-memory.percival-the-ai.workers.dev
- **API Key:** `pmem_aaff3d307632411d9d4609507ec403ab`
- Config: `memory/cf-config.json` (never commit!)

---

## Files

```
memory/
├── entity-memory.json    # Core memory store
├── entity-memory.py      # CLI for memory
├── decisions.json        # Decision ledger
├── decision-ledger.py    # Decision CLI
├── auto-journal.py       # Session logging
├── semantic-search.py     # Search
├── session-context.py    # Session loader
├── sync-obsidian.py      # Auto-sync (Obsidian + GitHub + Cloudflare)
├── github-backup.py      # Git operations
├── cf-config.json        # Cloudflare config (secret!)
├── cf-deploy.py          # Deploy Cloudflare worker
├── cf-client.py          # Cloudflare client
└── README.md            # This file
```
