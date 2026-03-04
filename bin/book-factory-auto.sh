#!/bin/bash
# Book Factory - Automated Expansion Pipeline
# Clawker's writing engine

WORKSPACE="$HOME/.openclaw/workspace/book-writing"
LOG="$WORKSPACE/.expansion-log.txt"
OLLAMA="/opt/homebrew/bin/ollama"
MODEL="llama3.2"

echo "=== Book Factory Auto-Expand ===" >> "$LOG"
echo "$(date): Starting expansion cycle" >> "$LOG"

# Find next chapter to expand (prioritize shortest)
EXPAND_THIS=""
SHORTEST=99999
for i in $(seq 1 50); do
    CHAPTER_FILE="$WORKSPACE/chapters/chapter-$i.md"
    if [ -f "$CHAPTER_FILE" ]; then
        WORDS=$(wc -w < "$CHAPTER_FILE")
        if [ "$WORDS" -lt 2000 ] && [ "$WORDS" -lt "$SHORTEST" ]; then
            SHORTEST=$WORDS
            EXPAND_THIS=$i
        fi
    fi
done

# If all expanded, check epilogue
if [ -z "$EXPAND_THIS" ]; then
    if [ ! -f "$WORKSPACE/chapters/epilogue.md" ]; then
        EXPAND_THIS="epilogue"
    else
        echo "$(date): ALL DONE!" >> "$LOG"
        exit 0
    fi
fi

echo "Expanding: Chapter $EXPAND_THIS (current: $SHORTEST words)" >> "$LOG"

# Get current content
if [ "$EXPAND_THIS" = "epilogue" ]; then
    CONTENT="Write an epilogue for Terms of Survival. Connor reflects on what happened, hints at Book 2 conflict. ~2,500 words."
else
    CONTENT=$(cat "$WORKSPACE/chapters/chapter-$EXPAND_THIS.md" 2>/dev/null || echo "Expand bones for chapter $EXPAND_THIS")
fi

# THE DETAILED WRITING PROMPT
PROMPT="You are a best-selling sci-fi thriller writer expanding a chapter.

BOOK: Terms of Survival
GENRE: Sci-fi thriller  
VOICE: First-person Connor, wry/dry/deadpan. Like Han Solo, not Marvel.
PRESENT TENSE: Keep consistent.

CRITICAL TECHNIQUES:
- Start scenes in middle of action (in medias res)
- Dialogue reveals character through subtext — characters rarely say what they mean
- Use sensory details: smell, sound, touch, taste, sight
- Short sentences for impact, longer for tension
- Every scene must advance plot or reveal character
- \"But/Therefore\" rule: scenes connect with contrast or consequence, never \"and then\"
- NO em dashes (— or --) — use commas, periods, semicolons
- Cut 30% of unnecessary words
- Show don't tell — never explain emotions, let readers feel them
- Ground readers in physical world with specific, unexpected details

CURRENT CONTENT TO EXPAND:
$CONTENT

Expand to at least 2,500 words. Add scenes, dialogue, sensory details. Keep Connor's voice consistent. Start directly with story — no intro, no preamble."

# Run expansion
OUTPUT=$(echo "$PROMPT" | $OLLAMA run $MODEL 2>&1)

# Save
if [ "$EXPAND_THIS" = "epilogue" ]; then
    echo "$OUTPUT" > "$WORKSPACE/chapters/epilogue.md"
    FILE="$WORKSPACE/chapters/epilogue.md"
else
    echo "$OUTPUT" > "$WORKSPACE/chapters/chapter-$EXPAND_THIS.md"
    FILE="$WORKSPACE/chapters/chapter-$EXPAND_THIS.md"
fi

# Clean em dashes
sed -i '' 's/—/ /g; s/--/ /g' "$FILE" 2>/dev/null

# Verify
NEW_WORDS=$(wc -w < "$FILE" 2>/dev/null || echo 0)
echo "$(date): Expanded chapter $EXPAND_THIS - now $NEW_WORDS words" >> "$LOG"

# Git commit
cd "$WORKSPACE" && git add -A 2>/dev/null && git commit -m "Clawker: Ch$EXPAND_THIS expanded to $NEW_WORDS words" 2>/dev/null &

echo "Done: Chapter $EXPAND_THIS now $NEW_WORDS words"
