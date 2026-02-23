#!/usr/bin/env python3
"""Entity Memory Manager - Percy's long-term memory system"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

MEMORY_FILE = Path(__file__).parent / "entity-memory.json"

def load_memory():
    if MEMORY_FILE.exists():
        with open(MEMORY_FILE) as f:
            return json.load(f)
    return {"version": "1.0", "entities": {}}

def save_memory(mem):
    with open(MEMORY_FILE, "w") as f:
        json.dump(mem, f, indent=2)

def add_fact(category, key, value):
    """Add a learned fact to memory"""
    mem = load_memory()
    
    if category == "user":
        if "preferences" not in mem["entities"]["user"]:
            mem["entities"]["user"]["preferences"] = {}
        mem["entities"]["user"]["preferences"][key] = value
    elif category == "learned":
        mem["entities"].setdefault("learned_facts", [])
        mem["entities"]["learned_facts"].append({
            "fact": value,
            "added": datetime.now().isoformat()
        })
    else:
        mem["entities"].setdefault(category, {})[key] = value
    
    save_memory(mem)
    return f"Added: {category}.{key} = {value}"

def get_entity(category, key=None):
    """Retrieve from memory"""
    mem = load_memory()
    if key:
        return mem.get("entities", {}).get(category, {}).get(key)
    return mem.get("entities", {}).get(category, {})

def list_all():
    """List all entities"""
    mem = load_memory()
    return mem.get("entities", {})

# CLI interface
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps(list_all(), indent=2))
    elif sys.argv[1] == "add" and len(sys.argv) >= 5:
        print(add_fact(sys.argv[2], sys.argv[3], sys.argv[4]))
    elif sys.argv[1] == "get" and len(sys.argv) >= 3:
        result = get_entity(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None)
        print(json.dumps(result, indent=2))
    else:
        print("Usage: entity-memory.py [add <category> <key> <value> | get <category> [key]]")
