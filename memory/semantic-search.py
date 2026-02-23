#!/usr/bin/env python3
"""Semantic Search - keyword-based search across memory + notes

MVP: Keyword matching
Upgrade: Vector embeddings via Ollama (when nomic-embed-text available)
"""

import json
import os
import re
from pathlib import Path
from datetime import datetime

MEMORY_DIR = Path(__file__).parent
OBSIDIAN_PATH = Path.home() / "Library/Mobile Documents/iCloud~md~obsidian/Documents/Openclaw Knowledge Core/Openclaw Knowledge Core"

# Files to search
SEARCH_SOURCES = [
    MEMORY_DIR / "entity-memory.json",
    MEMORY_DIR / "decisions.json",
]

def search_files(query, sources):
    """Keyword search across files"""
    query_lower = query.lower()
    results = []
    
    for source in sources:
        if not source.exists():
            continue
            
        if source.suffix == ".json":
            with open(source) as f:
                content = json.load(f)
            text = json.dumps(content)
        else:
            text = source.read_text()
        
        # Simple keyword matching
        if query_lower in text.lower():
            # Find context around matches
            lines = text.split("\n")
            for i, line in enumerate(lines):
                if query_lower in line.lower():
                    # Get surrounding context
                    start = max(0, i - 2)
                    end = min(len(lines), i + 3)
                    context = "\n".join(lines[start:end])
                    
                    results.append({
                        "file": source.name,
                        "line": i + 1,
                        "context": context.strip()
                    })
    
    return results

def search_obsidian(query, limit=10):
    """Search Obsidian daily notes"""
    results = []
    query_lower = query.lower()
    
    daily_path = OBSIDIAN_PATH / "daily"
    if not daily_path.exists():
        return results
    
    # Get recent notes
    notes = sorted(daily_path.glob("*.md"), reverse=True)[:30]
    
    for note in notes:
        content = note.read_text()
        if query_lower in content.lower():
            # Find matching lines
            lines = content.split("\n")
            matches = []
            for i, line in enumerate(lines):
                if query_lower in line.lower():
                    matches.append(line.strip())
            
            if matches:
                results.append({
                    "file": note.name,
                    "matches": matches[:3]  # top 3 matches
                })
        
        if len(results) >= limit:
            break
    
    return results

def search_all(query):
    """Search everything"""
    print(f"🔍 Searching for: \"{query}\"\n")
    print("=" * 50)
    
    # Search memory files
    print("\n📁 Memory Files:")
    print("-" * 30)
    results = search_files(query, SEARCH_SOURCES)
    if results:
        for r in results[:5]:
            print(f"\n[{r['file']} line {r['line']}]")
            print(r['context'][:200])
    else:
        print("  No matches")
    
    # Search Obsidian
    print("\n\n📓 Obsidian Notes:")
    print("-" * 30)
    results = search_obsidian(query)
    if results:
        for r in results:
            print(f"\n[{r['file']}]")
            for m in r['matches'][:2]:
                print(f"  • {m[:100]}")
    else:
        print("  No matches")
    
    print("\n" + "=" * 50)

def index_memory():
    """Build search index (placeholder for vector upgrade)"""
    print("Building index...")
    
    index = {
        "version": "1.0",
        "indexed": datetime.now().isoformat(),
        "sources": [str(s) for s in SEARCH_SOURCES],
        "type": "keyword"  # will be "vector" when_embeddings available
    }
    
    index_file = MEMORY_DIR / "search-index.json"
    with open(index_file, "w") as f:
        json.dump(index, f, indent=2)
    
    print(f"Index built: {index_file}")
    print("Type: keyword-based (upgrade to vector when Ollama + nomic-embed-text available)")

# CLI
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  semantic-search.py <query>")
        print("  semantic-search.py --index")
        print("\nExamples:")
        print('  semantic-search.py "Twitter"')
        print('  semantic-search.py "Paydirt"')
        print('  semantic-search.py "preference"')
        index_memory()
    elif sys.argv[1] == "--index":
        index_memory()
    else:
        query = " ".join(sys.argv[1:])
        search_all(query)
