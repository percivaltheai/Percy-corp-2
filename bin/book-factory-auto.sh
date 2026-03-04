#!/usr/bin/env python3
"""
Book Factory - Automated Expansion Pipeline
Clawker's writing engine using Ollama API
"""
import os
import re
import subprocess
import requests
import json
from pathlib import Path

WORKSPACE = Path.home() / ".openclaw/workspace/book-writing"
LOG = WORKSPACE / ".expansion-log.txt"
MODEL = "llama3.2"
OLLAMA_URL = "http://localhost:11434"

def log(msg):
    with open(LOG, "a") as f:
        f.write(f"{msg}\n")

def find_shortest_chapter():
    """Find chapter with fewest words under 2000"""
    shortest = None
    min_words = 99999
    
    for i in range(1, 51):
        ch_file = WORKSPACE / "chapters" / f"chapter-{i}.md"
        if ch_file.exists():
            words = len(ch_file.read_text().split())
            if words < 2000 and words < min_words:
                min_words = words
                shortest = i
    
    # Check epilogue
    epi_file = WORKSPACE / "chapters" / "epilogue.md"
    if not epi_file.exists() and (not shortest or min_words >= 2000):
        return "epilogue", 0
    
    return shortest, min_words

def expand_chapter(chapter_num, content):
    """Expand chapter using Ollama API"""
    
    prompt = f"""You are a best-selling sci-fi thriller writer expanding a chapter.

BOOK: Terms of Survival
GENRE: Sci-fi thriller  
VOICE: First-person Connor, wry/dry/deadpan. Like Han Solo, not Marvel.

TECHNIQUES:
- Start scenes in middle of action (in medias res)
- Dialogue reveals character through subtext
- Sensory details: smell, sound, touch, taste, sight
- Short sentences for impact, longer for tension
- Every scene advances plot or reveals character
- NO em dashes — use commas, periods, semicolons
- Show don't tell
- Ground readers in physical world with specific details

CURRENT CONTENT:
{content}

Expand to at least 2,500 words. Add scenes, dialogue, sensory details.
Keep Connor's voice consistent. Start directly with story.

OUTPUT ONLY THE EXPANDED STORY."""

    try:
        resp = requests.post(
            f"{OLLAMA_URL}/api/generate",
            json={
                "model": MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {"num_ctx": 8192, "num_predict": 4000}
            },
            timeout=300
        )
        
        output = resp.json().get("response", "")
        
        # Strip any remaining ANSI
        output = re.sub(r'\x1b\[[0-9;]*[a-zA-Z]', '', output)
        output = re.sub(r'\[.*?l', '', output)
        output = re.sub(r'\[.*?h', '', output)
        
        return output
        
    except Exception as e:
        log(f"ERROR: {e}")
        return None

def main():
    log("=== Book Factory Auto-Expand ===")
    log(f"{'='*40}")
    
    chapter, words = find_shortest_chapter()
    
    if not chapter:
        log("All chapters expanded!")
        return
    
    log(f"Expanding: Chapter {chapter} ({words} words)")
    
    # Get content
    if chapter == "epilogue":
        content = "Write an epilogue for Terms of Survival."
    else:
        ch_file = WORKSPACE / "chapters" / f"chapter-{chapter}.md"
        content = ch_file.read_text()
    
    # Expand
    output = expand_chapter(chapter, content)
    
    if not output:
        log("Failed to expand")
        return
    
    # Save
    if chapter == "epilogue":
        out_file = WORKSPACE / "chapters" / "epilogue.md"
    else:
        out_file = WORKSPACE / "chapters" / f"chapter-{chapter}.md"
    
    out_file.write_text(output)
    
    new_words = len(output.split())
    log(f"Expanded chapter {chapter} - {new_words} words")
    
    # Clean em dashes
    text = out_file.read_text()
    text = text.replace("—", " ").replace("--", " ")
    out_file.write_text(text)
    
    log(f"Done: Chapter {chapter} now {new_words} words")

if __name__ == "__main__":
    main()
