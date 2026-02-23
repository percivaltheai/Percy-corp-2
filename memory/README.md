# Memory Commands

## Entity Memory (Built ✅)

```bash
# List all memory
python3 memory/entity-memory.py

# Get user prefs
python3 memory/entity-memory.py get user

# Get projects
python3 memory/entity-memory.py get projects

# Add a learned fact
python3 memory/entity-memory.py add learned fact "X browser posting = ban risk"

# Add user preference
python3 memory/entity-memory.py add user preference "likes_voice_stories" "true"

# Sync to Obsidian
python3 memory/sync-obsidian.py
```

## Auto-Journaling (Built ✅)

```bash
# Log session activity
python3 memory/auto-journal.py --tools browser exec --actions "posted to X" --decisions "API over browser" --open "fix discord"
```

- Appends to today's daily note in Obsidian
- Format: tools, actions, decisions, open items

## Cron/Auto-Sync (Running ✅)

- **Entity Memory:** launchd agent syncs every hour
- **Journal:** run manually or add to session-end hooks

## Decision Ledger (Built ✅)

```bash
# List recent decisions
python3 memory/decision-ledger.py

# Add a decision
python3 memory/decision-ledger.py add "Decision Title" "Context" "opt1|opt2|opt3" "chosen option" "expected outcome"

# Record actual outcome later
python3 memory/decision-ledger.py outcome 1 "actual result"

# Get full details
python3 memory/decision-ledger.py get 1
```

- Tracks: context, options considered, choice, expected vs actual outcome
- Syncs to Obsidian (`memory-decisions.md`)
- Review regularly to learn from outcomes

## Future Enhancements

- [x] Entity Memory ✅
- [x] Auto-Journaling ✅
- [x] Decision Ledger ✅
- [x] Semantic Search ✅
- [ ] GitHub Backup
- [ ] Cloudflare Sync

## Semantic Search (Built ✅)

```bash
# Search everything
python3 memory/semantic-search.py "Twitter"

# Search specific topic
python3 memory/semantic-search.py "Paydirt"

# Rebuild index
python3 memory/semantic-search.py --index
```

- Searches: entity-memory.json, decisions.json, Obsidian daily notes
- Keyword-based (fast, works now)
- Upgrade path: vector embeddings via Ollama + nomic-embed-text
