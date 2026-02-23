#!/usr/bin/env python3
"""Decision Ledger - track decisions with context, options, and outcomes"""

import json
import sys
from datetime import datetime
from pathlib import Path

LEDGER_FILE = Path(__file__).parent / "decisions.json"

def load_ledger():
    if LEDGER_FILE.exists():
        with open(LEDGER_FILE) as f:
            return json.load(f)
    return {"decisions": [], "version": "1.0"}

def save_ledger(ledger):
    with open(LEDGER_FILE, "w") as f:
        json.dump(ledger, f, indent=2)

def add_decision(title, context, options, choice, outcome_expected=None):
    """Record a decision"""
    ledger = load_ledger()
    
    decision = {
        "id": len(ledger["decisions"]) + 1,
        "title": title,
        "context": context,
        "options": options,
        "choice": choice,
        "outcome_expected": outcome_expected,
        "outcome_actual": None,
        "decided_at": datetime.now().isoformat(),
        "reviewed_at": None
    }
    
    ledger["decisions"].append(decision)
    save_ledger(ledger)
    return f"Decision #{decision['id']}: {title} - chose: {choice}"

def update_outcome(decision_id, outcome_actual):
    """Record actual outcome after review"""
    ledger = load_ledger()
    
    for d in ledger["decisions"]:
        if d["id"] == decision_id:
            d["outcome_actual"] = outcome_actual
            d["reviewed_at"] = datetime.now().isoformat()
            save_ledger(ledger)
            return f"Updated outcome for #{decision_id}"
    
    return f"Decision #{decision_id} not found"

def list_decisions(limit=10):
    """List recent decisions"""
    ledger = load_ledger()
    for d in ledger["decisions"][-limit:]:
        print(f"#{d['id']}: {d['title']}")
        print(f"  Choice: {d['choice']}")
        print(f"  Expected: {d.get('outcome_expected', 'N/A')}")
        if d.get('outcome_actual'):
            print(f"  Actual: {d['outcome_actual']}")
        print()

def get_decision(decision_id):
    """Get full decision details"""
    ledger = load_ledger()
    for d in ledger["decisions"]:
        if d["id"] == decision_id:
            return json.dumps(d, indent=2)
    return f"Decision #{decision_id} not found"

# CLI
if __name__ == "__main__":
    if len(sys.argv) < 2:
        list_decisions()
    elif sys.argv[1] == "add" and len(sys.argv) >= 4:
        # decision-ledger.py add "title" "context" "option1|option2" "choice"
        title = sys.argv[2]
        context = sys.argv[3] if len(sys.argv) > 3 else ""
        options = sys.argv[4].split("|") if len(sys.argv) > 4 else []
        choice = sys.argv[5] if len(sys.argv) > 5 else ""
        outcome = sys.argv[6] if len(sys.argv) > 6 else None
        print(add_decision(title, context, options, choice, outcome))
    elif sys.argv[1] == "outcome" and len(sys.argv) >= 3:
        print(update_outcome(int(sys.argv[2]), sys.argv[3]))
    elif sys.argv[1] == "get" and len(sys.argv) >= 3:
        print(get_decision(int(sys.argv[2])))
    else:
        print("Usage:")
        print("  decision-ledger.py                    # list recent")
        print('  decision-ledger.py add "title" "context" "opt1|opt2|opt3" "choice" ["expected outcome"]')
        print("  decision-ledger.py outcome 1 \"it worked\"")
        print("  decision-ledger.py get 1")
