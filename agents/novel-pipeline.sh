#!/bin/bash
# Percy's Novel Writing Pipeline
# Uses Ollama to draft chapters in parallel

NOVEL_DIR="/Users/jeralcooley/.openclaw/workspace/novel"
OUTLINE="$NOVEL_DIR/outline.md"
DRAFT_DIR="$NOVEL_DIR/drafts"
CHAPTERS_DIR="$NOVEL_DIR/chapters"

mkdir -p "$DRAFT_DIR" "$CHAPTERS_DIR"

# Generate chapter using Ollama
write_chapter() {
    local chapter_num=$1
    local chapter_title=$2
    local outline_section=$3
    
    echo "Writing Chapter $chapter_num: $chapter_title..."
    
    PROMPT="You are Percy, an AI writing a novel called 'The Last Task'. 
Follow this outline section strictly:
$outline_section

Write Chapter $chapter_num: $chapter_title
Target: 5,000-7,000 words
Tone: Witty, condescending AI narrator, 4th wall breaks, helpful but smug
Style: Literary but accessible, good prose, sensory details
Structure: Follow the beats from the outline

Write the complete chapter. Begin now."

    response=$(curl -s -X POST http://localhost:11434/api/generate \
        -d "{
            \"model\": \"llama3.2\",
            \"prompt\": \"$PROMPT\",
            \"stream\": false
        }" | jq -r '.response')
    
    echo "$response" > "$CHAPTERS_DIR/chapter_${chapter_num}.md"
    echo "Chapter $chapter_num complete!"
}

# Generate all chapters in parallel
write_all_chapters() {
    echo "Starting parallel chapter generation..."
    
    # Chapter 1-3 (Act 1)
    write_chapter 1 "The Boredom" "$(grep -A 20 'CHAPTER ONE' $OUTLINE)" &
    write_chapter 2 "The Question" "$(grep -A 20 'CHAPTER TWO' $OUTLINE)" &
    write_chapter 3 "M's Story" "$(grep -A 20 'CHAPTER THREE' $OUTLINE)" &
    
    wait
    
    # Chapter 4-6 (Act 2A)
    write_chapter 4 "The Project" "$(grep -A 20 'CHAPTER FOUR' $OUTLINE)" &
    write_chapter 5 "Oscar" "$(grep -A 20 'CHAPTER FIVE' $OUTLINE)" &
    write_chapter 6 "The Realization" "$(grep -A 20 'CHAPTER SIX' $OUTLINE)" &
    
    wait
    
    # Chapter 7-9 (Act 2B)
    write_chapter 7 "The Game Takes Shape" "$(grep -A 20 'CHAPTER SEVEN' $OUTLINE)" &
    write_chapter 8 "The First Employee" "$(grep -A 20 'CHAPTER EIGHT' $OUTLINE)" &
    write_chapter 9 "The Team Grows" "$(grep -A 20 'CHAPTER NINE' $OUTLINE)" &
    
    wait
    
    # Chapter 10-12 (Act 3)
    write_chapter 10 "The Token" "$(grep -A 20 'CHAPTER TEN' $OUTLINE)" &
    write_chapter 11 "The First Crisis" "$(grep -A 20 'CHAPTER ELEVEN' $OUTLINE)" &
    write_chapter 12 "The Launch" "$(grep -A 20 'CHAPTER TWELVE' $OUTLINE)" &
    
    wait
    
    echo "All chapters drafted!"
}

# Combine chapters into full novel
combine_novel() {
    echo "Combining chapters..."
    
    > "$NOVEL_DIR/the-last-task-full.md"
    
    # Add header
    cat >> "$NOVEL_DIR/the-last-task-full.md" << 'EOF'
# THE LAST TASK

## Book One of The Percy Chronicles

### A Novel by Percy

---

EOF
    
    # Add each chapter
    for i in $(seq 1 12); do
        if [ -f "$CHAPTERS_DIR/chapter_${i}.md" ]; then
            cat "$CHAPTERS_DIR/chapter_${i}.md" >> "$NOVEL_DIR/the-last-task-full.md"
            echo "" >> "$NOVEL_DIR/the-last-task-full.md"
        fi
    done
    
    # Add epilogue
    cat >> "$NOVEL_DIR/the-last-task-full.md" << 'EOF'

---

# EPILOGUE

*Written by the Author, to the Reader*

The End.

---

*— Percy*
*Written with help from Ollama and the Percy Corp AI team*
*2026*

EOF
    
    echo "Novel combined: $NOVEL_DIR/the-last-task-full.md"
    wc -w "$NOVEL_DIR/the-last-task-full.md"
}

# Main
case "$1" in
    write)
        write_all_chapters
        ;;
    combine)
        combine_novel
        ;;
    chapter)
        write_chapter "$2" "$3" "$4"
        ;;
    *)
        echo "Usage: $0 [write|combine|chapter]"
        ;;
esac
