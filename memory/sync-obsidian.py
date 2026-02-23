#!/usr/bin/env python3
"""Sync entity memory to Obsidian + GitHub"""

import json
import subprocess
from pathlib import Path
from datetime import datetime

MEMORY_FILE = Path(__file__).parent / "entity-memory.json"
OBSIDIAN_PATH = Path.home() / "Library/Mobile Documents/iCloud~md~obsidian/Documents/Openclaw Knowledge Core/Openclaw Knowledge Core"
REPO_PATH = Path(__file__).parent.parent

def get_obsidian_note(name):
    """Get note path in vault"""
    return OBSIDIAN_PATH / f"memory-{name}.md"

def sync_to_obsidian():
    with open(MEMORY_FILE) as f:
        mem = json.load(f)
    
    content = """---
tags: [memory, entities]
updated: """ + datetime.now().isoformat() + """
---

# Entity Memory

## User Profile

"""
    user = mem.get("entities", {}).get("user", {})
    if user:
        content += f"- **Name:** {user.get('name', 'N/A')}\n"
        if "preferences" in user:
            content += "\n### Preferences\n"
            for k, v in user["preferences"].items():
                content += f"- {k}: {v}\n"
        if "goals" in user:
            content += "\n### Goals\n"
            for k, v in user["goals"].items():
                content += f"- {k}: {v}\n"
    
    projects = mem.get("entities", {}).get("projects", {})
    if projects:
        content += "\n## Projects\n"
        for name, data in projects.items():
            content += f"\n### {name}\n"
            if isinstance(data, dict):
                for k, v in data.items():
                    content += f"- {k}: {v}\n"
            else:
                content += f"- {data}\n"
    
    agents = mem.get("entities", {}).get("agents", {})
    if agents:
        content += "\n## Agents\n"
        for name, role in agents.items():
            content += f"- **{name}:** {role}\n"
    
    learned = mem.get("entities", {}).get("learned_facts", [])
    if learned:
        content += "\n## Learned Facts\n"
        for item in learned[-10:]:
            content += f"- {item.get('fact', '')} ({item.get('added', '')[:10]})\n"
    
    note_path = get_obsidian_note("entities")
    with open(note_path, "w") as f:
        f.write(content)
    
    print(f"Synced to Obsidian: {note_path}")

    # Also sync decision ledger
    ledger_path = Path(__file__).parent / "decisions.json"
    if ledger_path.exists():
        with open(ledger_path) as f:
            ledger = json.load(f)
        
        ledger_content = """---
tags: [memory, decisions]
---

# Decision Ledger

"""
        for d in reversed(ledger.get("decisions", [])):
            ledger_content += f"## #{d['id']}: {d['title']}\n"
            ledger_content += f"- **Context:** {d.get('context', 'N/A')}\n"
            ledger_content += f"- **Options:** {', '.join(d.get('options', []))}\n"
            ledger_content += f"- **Chose:** {d.get('choice', 'N/A')}\n"
            if d.get('outcome_expected'):
                ledger_content += f"- **Expected:** {d['outcome_expected']}\n"
            if d.get('outcome_actual'):
                ledger_content += f"- **Actual:** {d['outcome_actual']}\n"
            ledger_content += f"- **Decided:** {d.get('decided_at', '')[:10]}\n"
            ledger_content += "\n---\n\n"
        
        ledger_note = OBSIDIAN_PATH / "memory-decisions.md"
        with open(ledger_note, "w") as f:
            f.write(ledger_content)
        
        print(f"Synced to Obsidian: {ledger_note}")

def sync_to_github():
    """Commit and push memory changes"""
    import sys
    
    # Add memory files
    result = subprocess.run(
        ["git", "add", "memory/"],
        cwd=REPO_PATH,
        capture_output=True,
        text=True
    )
    
    # Check if anything to commit
    result = subprocess.run(
        ["git", "diff", "--cached", "--quiet"],
        cwd=REPO_PATH,
        capture_output=True
    )
    
    if result.returncode == 0:
        print("No changes to commit")
        return
    
    # Commit
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    result = subprocess.run(
        ["git", "commit", "-m", f"Memory update ({timestamp})"],
        cwd=REPO_PATH,
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        print(f"Commit failed: {result.stderr}")
        return
    
    print(f"Committed memory: {timestamp}")
    
    # Push
    result = subprocess.run(
        ["git", "push", "origin", "main"],
        cwd=REPO_PATH,
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        print(f"Push failed: {result.stderr}")
    else:
        print("Pushed to GitHub")

if __name__ == "__main__":
    print(f"=== Memory Sync {datetime.now().strftime('%Y-%m-%d %H:%M')} ===")
    sync_to_obsidian()
    sync_to_github()
    print("=== Sync Complete ===")
