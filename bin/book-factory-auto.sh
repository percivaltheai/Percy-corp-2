#!/bin/bash
# Book Factory - Automated Expansion Pipeline
# Runs via cron to expand chapters continuously

WORKSPACE="$HOME/.openclaw/workspace/book-writing"
LOG="$WORKSPACE/.expansion-log.txt"
OLLAMA="/opt/homebrew/bin/ollama"
MODEL="qwen3.5:4b"

echo "=== Book Factory Auto-Expand ===" >> "$LOG"
echo "$(date): Starting expansion cycle" >> "$LOG"

# Find next chapter to expand (prioritize short ones under 800 words)
EXPAND_THIS=""
for i in $(seq 1 50); do
    CHAPTER_FILE="$WORKSPACE/chapters/chapter-$i.md"
    if [ -f "$CHAPTER_FILE" ]; then
        WORDS=$(wc -w < "$CHAPTER_FILE")
        if [ "$WORDS" -lt 800 ]; then
            EXPAND_THIS=$i
            echo "Found short chapter: $i ($WORDS words)" >> "$LOG"
            break
        fi
    fi
done

# If all are expanded, check for epilogue
if [ -z "$EXPAND_THIS" ]; then
    if [ ! -f "$WORKSPACE/chapters/epilogue.md" ]; then
        EXPAND_THIS="epilogue"
        echo "All chapters expanded. Moving to epilogue." >> "$LOG"
    else
        echo "$(date): All done!" >> "$LOG"
        exit 0
    fi
fi

echo "Expanding: $EXPAND_THIS" >> "$LOG"

# Get bones or existing content
BONES_FILE=""
if [ "$EXPAND_THIS" = "epilogue" ]; then
    CONTENT="Write an epilogue that serves as a bridge between Book 1 and Book 2 of the series. It should be ~2,000 words, in Connor's voice, showing the aftermath of the resolution and setting up Book 2's conflict. End on a hook that makes readers want the next book."
else
    # Check individual bones first
    if [ -f "$WORKSPACE/bones/chapter-$EXPAND_THIS.bones" ]; then
        BONES_FILE="$WORKSPACE/bones/chapter-$EXPAND_THIS.bones"
    elif [ -f "$WORKSPACE/bones/chapter-05-10.bones" ] && [ "$EXPAND_THIS" -ge 5 ] && [ "$EXPAND_THIS" -le 10 ]; then
        BONES_FILE="$WORKSPACE/bones/chapter-05-10.bones"
    elif [ -f "$WORKSPACE/bones/chapter-07-16.bones" ] && [ "$EXPAND_THIS" -ge 7 ] && [ "$EXPAND_THIS" -le 16 ]; then
        BONES_FILE="$WORKSPACE/bones/chapter-07-16.bones"
    elif [ -f "$WORKSPACE/bones/chapter-17-50.bones" ] && [ "$EXPAND_THIS" -ge 17 ]; then
        BONES_FILE="$WORKSPACE/bones/chapter-17-50.bones"
    fi
    
    if [ -f "$WORKSPACE/chapters/chapter-$EXPAND_THIS.md" ]; then
        CONTENT=$(cat "$WORKSPACE/chapters/chapter-$EXPAND_THIS.md")
    else
        CONTENT="Expand bones for chapter $EXPAND_THIS"
    fi
fi

# Build prompt
PROMPT="You are a professional fiction writer expanding a chapter to ~2,500 words.

BOOK: Terms of Survival (Sci-fi thriller)
VOICE: Wry, dry, deadpan. First-person Connor. Like Han Solo, not Marvel.
SETTING: Near-future where AI implants control humans via Project Threshold

RULES:
- NO em dashes (— or --) - use commas, periods, or semicolons instead
- Keep dialogue sharp and witty
- Deadpan humor only
- Sensory details - sounds, smells, textures
- Show don't tell
- Pacing: tight, every scene advances plot

"

if [ -n "$BONES_FILE" ]; then
    PROMPT="$PROMPT
BONES/EXISTING CONTENT:
$(cat "$BONES_FILE")
"
fi

PROMPT="$PROMPT

Expand to ~2,500 words. Start directly with story - no intro."

# Run expansion
OUTPUT=$(echo "$PROMPT" | $OLLAMA run $MODEL 2>&1)

# Save
if [ "$EXPAND_THIS" = "epilogue" ]; then
    echo "$OUTPUT" > "$WORKSPACE/chapters/epilogue.md"
else
    echo "$OUTPUT" > "$WORKSPACE/chapters/chapter-$EXPAND_THIS.md"
fi

# Remove em dashes
sed -i '' 's/—//g; s/--/ /g' "$WORKSPACE/chapters/chapter-$EXPAND_THIS.md" 2>/dev/null
sed -i '' 's/—//g; s/--/ /g' "$WORKSPACE/chapters/epilogue.md" 2>/dev/null

NEW_WORDS=$(wc -w < "$WORKSPACE/chapters/chapter-$EXPAND_THIS.md" 2>/dev/null || echo 0)
echo "$(date): Expanded chapter $EXPAND_THIS - now $NEW_WORDS words" >> "$LOG"

# Backup to obsidian
if command -v obsidian &> /dev/null; then
    obsidian sync 2>/dev/null &
fi

echo "Done: Chapter $EXPAND_THIS now $NEW_WORDS words"
