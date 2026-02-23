#!/usr/bin/env python3
"""Auto-Journal for Percy - captures session highlights to Obsidian"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
import argparse

OBSIDIAN_PATH = Path.home() / "Library/Mobile Documents/iCloud~md~obsidian/Documents/Openclaw Knowledge Core/Openclaw Knowledge Core/daily"
TEMPLATE_PATH = Path(__file__).parent / "journal-template.md"

SESSION_SUMMARY = """
## Session Log ({timestamp})

**Tools used:** {tools}
**Key actions:**
{actions}

**Decisions made:**
{decisions}

**Open items:**
{open_items}

---

"""

def get_today_note():
    today = datetime.now().strftime("%Y-%m-%d")
    return OBSIDIAN_PATH / f"{today}.md"

def load_template():
    if TEMPLATE_PATH.exists():
        return TEMPLATE_PATH.read_text()
    return ""

def append_to_daily(summary):
    note_path = get_today_note()
    today = datetime.now().strftime("%Y-%m-%d")
    
    if note_path.exists():
        content = note_path.read_text()
        # Check if already has session log section
        if "## Session Log" in content:
            # Append to existing
            note_path.write_text(content + "\n" + summary)
        else:
            note_path.write_text(content + "\n" + summary)
    else:
        # Create new daily note
        header = f"# {today}\n\n---\n\n"
        note_path.write_text(header + summary)
    
    return str(note_path)

def journal_entry(tools=None, actions=None, decisions=None, open_items=None):
    """Main function to add a journal entry"""
    
    tools = tools or []
    actions = actions or []
    decisions = decisions or []
    open_items = open_items or []
    
    timestamp = datetime.now().strftime("%H:%M")
    
    summary = SESSION_SUMMARY.format(
        timestamp=timestamp,
        tools=", ".join(tools) if tools else "none",
        actions="\n".join(f"- {a}" for a in actions),
        decisions="\n".join(f"- {d}" for d in decisions),
        open_items="\n".join(f"- [ ] {o}" for o in open_items)
    )
    
    note_path = append_to_daily(summary)
    print(f"Journal entry added to: {note_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Auto-journal for Percy")
    parser.add_argument("--tools", nargs="+", help="Tools used")
    parser.add_argument("--actions", nargs="+", help="Key actions taken")
    parser.add_argument("--decisions", nargs="+", help="Decisions made")
    parser.add_argument("--open", nargs="+", help="Open items/todos")
    
    args = parser.parse_args()
    
    if len(sys.argv) == 1:
        print("Usage: auto-journal.py --tools tool1 tool2 --actions 'did x' --decisions 'chose y' --open 'fix z'")
        print("\nExample:")
        print("  auto-journal.py --tools browser exec --actions 'posted to X' --decisions 'browser only as backup' --open 'get API access'")
    else:
        journal_entry(
            tools=args.tools,
            actions=args.actions,
            decisions=args.decisions,
            open_items=args.open
        )
