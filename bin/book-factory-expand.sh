#!/bin/bash
# Book Factory - Ollama Expansion Pipeline
# Usage: ./expand-chapter.sh <chapter-number> [model]

CHAPTER=$1
MODEL=${2:-qwen2:7b}
VOICE="wry, dry, deadpan - like Han Solo"

echo "=== Book Factory: Expanding Chapter $CHAPTER ==="
echo "Model: $MODEL"
echo "Voice: $VOICE"
echo ""

# Check if bones file exists
BONES_FILE="$HOME/.openclaw/workspace/book-writing/bones/chapter-${CHAPTER}.bones"
if [ ! -f "$BONES_FILE" ]; then
    echo "ERROR: Bones file not found: $BONES_FILE"
    exit 1
fi

# Read the bones
BONES=$(cat "$BONES_FILE")

# Create expansion prompt
EXPAND_PROMPT="You are expanding a chapter from first-draft bones to a full chapter (~1,500-2,000 words).

CONTEXT:
- Book: Terms of Survival
- Genre: Sci-fi thriller/conspiracy
- POV: First person, Connor's voice
- Voice: Wry, dry, deadpan humor. NOT jokes. Think Han Solo, not Marvel.
- Setting: Near-future where AI implants control humans via Project Threshold

VOICE EXAMPLE:
\"The crosswalk signal turned white, and Hector lost his mind.\"
\"Crossing zone identified. Three hostiles on the opposite corner.\"
\"It's a crosswalk, Hector.\"
\"Acknowledged. Executing staggered crossing pattern.\"

RULES:
1. Keep EXACT dialogue lines marked in bones - do NOT change them
2. Add sensory details: sounds, smells, textures, temperatures
3. Minimize exposition - show don't tell
4. Humor is deadpan, not jokes
5. Pacing should be tight - every scene advances plot
6. Maintain Connor's wry internal voice
7. Hector speaks in tactical, military terms but shows warmth toward Connor

EXPAND THIS CHAPTER:

$BONES

Write the expanded chapter. Start directly with the story - no intro."

# Run ollama
echo "Running Ollama..."
echo "$EXPAND_PROMPT" | ollama run $MODEL 2>&1

echo ""
echo "=== Expansion Complete ==="
