#!/bin/bash
# Percy Corp Operations - Main Orchestrator
# Ensures all sub-agents and scheduled tasks keep running

WORKSPACE="$HOME/.openclaw/workspace"
LOG="$WORKSPACE/.orchestrator.log"
LOCK_DIR="$WORKSPACE/.orchestrator-locks"

mkdir -p "$LOCK_DIR"

log() {
    echo "$(date): $1" | tee -a "$LOG"
}

# === CLAWKER CONTENT AGENT ===
# Keep expanding chapters until book is done
run_clawker() {
    LOCK_FILE="$LOCK_DIR/clawker.lock"
    
    # Check if already running
    if [ -f "$LOCK_FILE" ]; then
        PID=$(cat "$LOCK_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            log "Clawker: already running (PID $PID)"
            return
        fi
    fi
    
    # Check if book is done
    if [ -f "$WORKSPACE/book-writing/BOOK_COMPLETE.flag" ]; then
        log "Clawker: Book complete, skipping"
        return
    fi
    
    # Find next chapter to expand (under 2,000 words)
    EXPAND_THIS=""
    for i in $(seq 1 50); do
        CHAPTER_FILE="$WORKSPACE/book-writing/chapters/chapter-$i.md"
        if [ -f "$CHAPTER_FILE" ]; then
            WORDS=$(wc -w < "$CHAPTER_FILE")
            if [ "$WORDS" -lt 2000 ]; then
                EXPAND_THIS=$i
                break
            fi
        fi
    done
    
    if [ -z "$EXPAND_THIS" ]; then
        # Check for epilogue
        if [ ! -f "$WORKSPACE/book-writing/chapters/epilogue.md" ]; then
            EXPAND_THIS="epilogue"
        else
            log "Clawker: ALL DONE!"
            touch "$WORKSPACE/book-writing/BOOK_COMPLETE.flag"
            return
        fi
    fi
    
    log "Clawker: Expanding chapter $EXPAND_THIS"
    
    # Run expansion
    (
        echo "Expanding chapter $EXPAND_THIS" > "$LOCK_FILE"
        echo "$$" >> "$LOCK_FILE"
        
        # Build prompt
        PROMPT="Expand Chapter $EXPAND_THIS of 'Terms of Survival' to ~2,500 words.
        
Book: Terms of Survival (sci-fi thriller)
Voice: First-person Connor, wry/dry/deadpan. NO em dashes.
Keep existing plot. Add sensory details. Deadpan humor.

Current chapter content:
$(cat "$WORKSPACE/book-writing/chapters/chapter-$EXPAND_THIS.md" 2>/dev/null || echo 'New chapter from bones')

Write expanded chapter. Start directly with story."

        # Run via Ollama
        OUTPUT=$(echo "$PROMPT" | /opt/homebrew/bin/ollama run qwen3.5:4b 2>&1)
        
        # Save
        if [ "$EXPAND_THIS" = "epilogue" ]; then
            echo "$OUTPUT" > "$WORKSPACE/book-writing/chapters/epilogue.md"
        else
            echo "$OUTPUT" > "$WORKSPACE/book-writing/chapters/chapter-$EXPAND_THIS.md"
        fi
        
        # Clean lock
        rm -f "$LOCK_FILE"
        
        log "Clawker: Chapter $EXPAND_THIS complete"
    ) &
    
    log "Clawker: Started chapter $EXPAND_THIS in background"
}

# === OBSIDIAN BACKUP ===
run_obsidian_backup() {
    LOCK_FILE="$LOCK_DIR/obsidian.lock"
    
    if [ -f "$LOCK_FILE" ]; then
        return
    fi
    
    log "Obsidian: Syncing..."
    (
        touch "$LOCK_FILE"
        
        # Git add/commit/push
        cd "$WORKSPACE" || exit
        git add -A 2>/dev/null
        git commit -m "Auto-sync $(date '+%Y-%m-%d %H:%M')" 2>/dev/null
        git push origin main 2>/dev/null &
        
        # Obsidian vault sync if available
        if command -v obsidian &> /dev/null; then
            obsidian sync 2>/dev/null &
        fi
        
        sleep 5
        rm -f "$LOCK_FILE"
    ) &
    
    log "Obsidian: Backup triggered"
}

# === MAIN LOOP ===
log "=== Percy Orchestrator Started ==="

while true; do
    # Run tasks based on time
    HOUR=$(date +%H)
    MINUTE=$(date +%M)
    
    # Clawker: Every 30 minutes, 24/7 (book doesn't sleep)
    # if [ "$HOUR" -ge 8 ] && [ "$HOUR" -le 22 ]; then
        if [ "$((MINUTE % 30))" -eq 0 ]; then
            run_clawker
        fi
    # fi
    
    # Obsidian/Git: Every hour
    if [ "$MINUTE" -eq 0 ]; then
        run_obsidian_backup
    fi
    
    # Check lock files, clean stale ones (over 2 hours)
    find "$LOCK_DIR" -name "*.lock" -mmin +120 -delete 2>/dev/null
    
    sleep 60
done
