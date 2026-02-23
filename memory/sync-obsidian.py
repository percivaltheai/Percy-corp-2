#!/usr/bin/env python3
"""Sync entity memory to Obsidian"""

import json
import subprocess
from pathlib import Path

MEMORY_FILE = Path(__file__).parent / "entity-memory.json"
OBSIDIAN_PATH = Path.home() / "Library/Mobile Documents/iCloud~md~obsidian/Documents/Openclaw Knowledge Core/Openclaw Knowledge Core"

def get_obsidian_note(name):
    """Get note path in vault"""
    return OBSIDIAN_PATH / f"memory-{name}.md"

def sync_to_obsidian():
    with open(MEMORY_FILE) as f:
        mem = json.load(f)
    
    content = """---
tags: [memory, entities]
updated: """ + json.dumps(mem.get("updated", "")) + """
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
        for item in learned[-10:]:  # last 10
            content += f"- {item.get('fact', '')} ({item.get('added', '')[:10]})\n"
    
    # Write to Obsidian
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

if __name__ == "__main__":
    sync_to_obsidian()
