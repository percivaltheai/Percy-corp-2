#!/usr/bin/env python3
"""Session Context Loader - Load relevant memory at session start

This script queries memory systems and outputs context for injection
into new sessions.
"""

import json
import sys
from datetime import datetime, timedelta
from pathlib import Path

MEMORY_DIR = Path(__file__).parent
CONFIG_FILE = MEMORY_DIR / "cf-config.json"

def load_config():
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE) as f:
            return json.load(f)
    return {}

def get_entity_memory():
    """Load entity memory"""
    entity_file = MEMORY_DIR / "entity-memory.json"
    if entity_file.exists():
        with open(entity_file) as f:
            return json.load(f)
    return {}

def get_recent_decisions(days=7):
    """Get decisions from last N days"""
    decisions_file = MEMORY_DIR / "decisions.json"
    if not decisions_file.exists():
        return []
    
    with open(decisions_file) as f:
        data = json.load(f)
    
    cutoff = datetime.now() - timedelta(days=days)
    recent = []
    
    for d in data.get("decisions", []):
        decided = d.get("decided_at", "")
        if decided:
            try:
                dtime = datetime.fromisoformat(decided.replace("Z", "+00:00"))
                if dtime.replace(tzinfo=None) > cutoff:
                    recent.append(d)
            except:
                pass
    
    return recent

def get_cloudflare_memory():
    """Fetch memory from Cloudflare if available"""
    config = load_config()
    if not config.get("worker_url") or not config.get("api_key"):
        return None
    
    try:
        import requests
        resp = requests.get(
            f"{config['worker_url']}/memory",
            headers={"X-API-Key": config["api_key"]},
            timeout=5
        )
        if resp.status_code == 200:
            return resp.json()
    except:
        pass
    return None

def format_user_prefs(memory):
    """Extract and format user preferences"""
    user = memory.get("entities", {}).get("user", {})
    if not user:
        return "No user preferences found."
    
    lines = ["## User Preferences"]
    
    prefs = user.get("preferences", {})
    if prefs:
        lines.append("\n**Communication:**")
        for k, v in prefs.items():
            lines.append(f"- {k}: {v}")
    
    goals = user.get("goals", {})
    if goals:
        lines.append("\n**Goals:**")
        for k, v in goals.items():
            lines.append(f"- {k}: {v}")
    
    return "\n".join(lines)

def format_recent_decisions(decisions):
    """Format recent decisions for context"""
    if not decisions:
        return "No recent decisions."
    
    lines = ["## Recent Decisions"]
    
    for d in reversed(decisions[-5:]):  # Last 5
        lines.append(f"\n### {d.get('title', 'Untitled')}")
        lines.append(f"- **Chose:** {d.get('choice', 'N/A')}")
        if d.get('outcome_expected'):
            lines.append(f"- **Expected:** {d.get('outcome_expected')}")
        if d.get('outcome_actual'):
            lines.append(f"- **Actual:** {d.get('outcome_actual')}")
        lines.append(f"- **Date:** {d.get('decided_at', '')[:10]}")
    
    return "\n".join(lines)

def format_projects(memory):
    """Format project status"""
    projects = memory.get("entities", {}).get("projects", {})
    if not projects:
        return "No project info."
    
    lines = ["## Project Status"]
    
    for name, data in projects.items():
        lines.append(f"\n### {name}")
        if isinstance(data, dict):
            lines.append(f"- Status: {data.get('status', 'unknown')}")
            # Add key details
            for k, v in list(data.items())[:3]:
                if k != "status":
                    lines.append(f"- {k}: {v}")
        else:
            lines.append(f"- {data}")
    
    return "\n".join(lines)

def format_agents(memory):
    """Format agent roles"""
    agents = memory.get("entities", {}).get("agents", {})
    if not agents:
        return "No agent info."
    
    lines = ["## Agent Roles"]
    
    for name, role in agents.items():
        lines.append(f"- **{name}:** {role}")
    
    return "\n".join(lines)

def format_open_items():
    """Find open items from recent sessions"""
    # Check daily notes for open items
    obsidian_path = Path.home() / "Library/Mobile Documents/iCloud~md~obsidian/Documents/Openclaw Knowledge Core/Openclaw Knowledge Core/daily"
    
    if not obsidian_path.exists():
        return "No daily notes found."
    
    open_items = []
    
    # Check last 3 days
    for i in range(3):
        date = datetime.now() - timedelta(days=i)
        note_file = obsidian_path / f"{date.strftime('%Y-%m-%d')}.md"
        
        if note_file.exists():
            content = note_file.read_text()
            for line in content.split("\n"):
                if "- [ ]" in line or "- TODO" in line.upper():
                    open_items.append(line.strip())
    
    if not open_items:
        return "No open items found."
    
    lines = ["## Open Items (from recent sessions)"]
    for item in open_items[:10]:
        lines.append(f"- {item}")
    
    return "\n".join(lines)

def generate_session_context():
    """Generate full session context"""
    print("Loading memory...")
    
    # Try Cloudflare first, fall back to local
    cf_memory = get_cloudflare_memory()
    if cf_memory:
        print("Using Cloudflare memory")
        memory = {"entities": cf_memory}
    else:
        print("Using local memory")
        memory = get_entity_memory()
    
    # Gather context
    context_parts = []
    
    # Header
    context_parts.append(f"# Session Context — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    context_parts.append("*Loaded from Percy's memory systems*\n")
    
    # User prefs (most important)
    context_parts.append(format_user_prefs(memory))
    context_parts.append("")
    
    # Projects
    context_parts.append(format_projects(memory))
    context_parts.append("")
    
    # Agents
    context_parts.append(format_agents(memory))
    context_parts.append("")
    
    # Recent decisions
    recent_decisions = get_recent_decisions()
    context_parts.append(format_recent_decisions(recent_decisions))
    context_parts.append("")
    
    # Open items
    context_parts.append(format_open_items())
    
    return "\n".join(context_parts)

def get_quick_context():
    """Get minimal context for brief injection"""
    memory = get_entity_memory()
    user = memory.get("entities", {}).get("user", {})
    prefs = user.get("preferences", {})
    
    brief = []
    if prefs.get("updates"):
        brief.append(f"User prefers: {prefs['updates']}")
    
    projects = memory.get("entities", {}).get("projects", {})
    if projects:
        brief.append(f"Active projects: {', '.join(projects.keys())}")
    
    agents = memory.get("entities", {}).get("agents", {})
    if agents:
        brief.append(f"Agents: {', '.join(agents.keys())}")
    
    return " | ".join(brief)

# CLI
if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--brief":
        print(get_quick_context())
    else:
        print(generate_session_context())
