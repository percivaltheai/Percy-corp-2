# Book Factory Pipeline — DEPRECATED

**See instead:** `pipeline-v2.md` for the new structured system.

This file kept for reference only.

## Mission
Autonomously expand Terms of Survival chapters to full length (~2,500 words each), maintaining voice consistency, backing up to Obsidian, and updating the dashboard.

## Current State (March 2, 2026)
- Chapters written: 16 / 50
- Words: 19,302
- Next chapter to write: 17

## The Pipeline

### 1. Writing Process
Each chapter must:
- Be 2,000-3,000 words
- Maintain Connor's wry, sardonic first-person voice
- NO em dashes — use semicolons, periods, or em-dash alternatives
- Include Hector's tactical commentary
- Advance the plot naturally
- Include sensory details, dialogue, emotional beats

### 2. Voice Rules
- First person, Connor's perspective
- Dry wit, resigned acceptance
- Hector: military jargon, enthusiastic about "threats", moments of depth
- No meta-commentary within chapters
- Literary prose, not AI-slop

### 3. Save Locations
- Workspace: `~/.openclaw/workspace/book-writing/chapters/`
- Backup: `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Openclaw Knowledge Core/Openclaw Knowledge Core/novels/terms-of-survival/chapters/`
- Dashboard: `~/.openclaw/workspace/book-factory.html`

### 4. Automation Commands
```bash
# Continue writing next chapter
cd ~/.openclaw/workspace && bash bin/book-factory-expand.sh

# Or manually: write chapter, save to both locations, update dashboard
```

### 5. Update Dashboard After Each Chapter
After writing any chapter:
1. Update `~/.openclaw/workspace/book-factory.html` with new chapter count
2. Push to GitHub: `git add -A && git commit -m "Update" && git push` (in percy-book-factory repo)

### 6. Continue Until Complete
- Target: 50 chapters + epilogue
- Target words: ~80,000
- Do NOT ask for permission — stay in the loop

## Key Characters
- **Connor Sullivan** — Protagonist, data analyst
- **Hector** — Military AI, combat-strategy prototype, "threat" enthusiast
- **Sara Chen** — Ex, journalist, discovers conspiracy
- **Miriam** — Former prison warden, resistance leader
- **Threshold** — The control system they fight to destroy

## If Stuck
- Review previous chapters for continuity
- Check MEMORY.md for plot details
- Read the bible in `novels/terms-of-survival/bible.md`

---

DO NOT WAIT TO BE TOLD. Continue writing. Keep the pipeline flowing.
