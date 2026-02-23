#!/usr/bin/env python3
"""
Percy's Unified Memory Manager
Single entry point for all memory operations
"""

import json
import sys
import subprocess
from datetime import datetime
from pathlib import Path

# Config
MEMORY_DIR = Path(__file__).parent
CONFIG_FILE = MEMORY_DIR / "cf-config.json"
ENTITY_FILE = MEMORY_DIR / "entity-memory.json"
DECISIONS_FILE = MEMORY_DIR / "decisions.json"

# Colors
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
RESET = "\033[0m"

def log(msg, color=GREEN):
    print(f"{color}{msg}{RESET}")

def load_cf_config():
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE) as f:
            return json.load(f)
    return {}

def load_entity_memory():
    if ENTITY_FILE.exists():
        with open(ENTITY_FILE) as f:
            return json.load(f)
    return {"version": "1.0", "entities": {}}

def save_entity_memory(mem):
    with open(ENTITY_FILE, "w") as f:
        json.dump(mem, f, indent=2)

# ============== GET ==============

def cmd_get(args):
    """Get memory value"""
    if not args:
        # Get all
        mem = load_entity_memory()
        print(json.dumps(mem.get("entities", {}), indent=2))
        return
    
    key = args[0]
    
    # Try Cloudflare first
    config = load_cf_config()
    if config.get("worker_url") and config.get("api_key"):
        try:
            import requests
            resp = requests.get(
                f"{config['worker_url']}/memory/{key}",
                headers={"X-API-Key": config["api_key"]},
                timeout=5
            )
            if resp.status_code == 200:
                print(resp.text)
                return
        except:
            pass
    
    # Fallback to local
    mem = load_entity_memory()
    entities = mem.get("entities", {})
    
    if "." in key:
        # Nested: user.preferences.updates
        parts = key.split(".")
        val = entities
        for p in parts:
            if isinstance(val, dict):
                val = val.get(p)
            else:
                print(f"Key not found: {key}")
                return
        print(json.dumps(val, indent=2) if isinstance(val, (dict, list)) else val)
    else:
        # Top level
        val = entities.get(key)
        if val:
            print(json.dumps(val, indent=2) if isinstance(val, (dict, list)) else val)
        else:
            print(f"Key not found: {key}")

# ============== SET ==============

def cmd_set(args):
    """Set memory value"""
    if len(args) < 2:
        print("Usage: memory set <key> <value>")
        return
    
    key = args[0]
    value = " ".join(args[1:])
    
    # Try to parse as JSON
    try:
        value = json.loads(value)
    except:
        pass  # Keep as string
    
    mem = load_entity_memory()
    entities = mem.setdefault("entities", {})
    
    if "." in key:
        # Nested: user.preferences.updates
        parts = key.split(".")
        current = entities
        for p in parts[:-1]:
            current = current.setdefault(p, {})
        current[parts[-1]] = value
    else:
        entities[key] = value
    
    save_entity_memory(mem)
    log(f"✓ Set {key}")
    
    # Sync
    cmd_sync([])

# ============== LOG ==============

def cmd_log(args):
    """Log an action (auto-routes to journal + decision if relevant)"""
    if not args:
        print("Usage: memory log <message>")
        return
    
    message = " ".join(args)
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    # Add to learned facts
    mem = load_entity_memory()
    learned = mem.get("entities", {}).setdefault("learned_facts", [])
    learned.append({
        "fact": message,
        "added": datetime.now().isoformat()
    })
    save_entity_memory(mem)
    
    log(f"✓ Logged: {message}")
    cmd_sync([])

# ============== DECIDE ==============

def cmd_decide(args):
    """Record a decision"""
    if len(args) < 3:
        print('Usage: memory decide "title" "context" "choice"')
        return
    
    title = args[0]
    context = args[1] if len(args) > 1 else ""
    choice = args[2] if len(args) > 2 else ""
    
    # Load decisions
    if DECISIONS_FILE.exists():
        with open(DECISIONS_FILE) as f:
            data = json.load(f)
    else:
        data = {"decisions": [], "version": "1.0"}
    
    decision = {
        "id": len(data["decisions"]) + 1,
        "title": title,
        "context": context,
        "options": [],
        "choice": choice,
        "decided_at": datetime.now().isoformat()
    }
    
    data["decisions"].append(decision)
    
    with open(DECISIONS_FILE, "w") as f:
        json.dump(data, f, indent=2)
    
    log(f"✓ Decision #{decision['id']}: {title} -> {choice}")
    cmd_sync([])

# ============== SEARCH ==============

def cmd_search(args):
    """Search memory"""
    if not args:
        print("Usage: memory search <query>")
        return
    
    query = " ".join(args)
    
    # Try Cloudflare first
    config = load_cf_config()
    if config.get("worker_url") and config.get("api_key"):
        try:
            import requests
            resp = requests.get(
                f"{config['worker_url']}/search?q={query}",
                headers={"X-API-Key": config["api_key"]},
                timeout=5
            )
            if resp.status_code == 200:
                data = resp.json()
                print(json.dumps(data, indent=2))
                return
        except:
            pass
    
    # Fallback to local search
    import subprocess
    result = subprocess.run(
        [sys.executable, str(MEMORY_DIR / "semantic-search.py"), query],
        capture_output=True,
        text=True
    )
    print(result.stdout)

# ============== SYNC ==============

def cmd_sync(args):
    """Sync to all stores"""
    log("Syncing...")
    
    # Run the sync script
    result = subprocess.run(
        [sys.executable, str(MEMORY_DIR / "sync-obsidian.py")],
        capture_output=True,
        text=True,
        cwd=MEMORY_DIR
    )
    
    if result.returncode == 0:
        log("✓ Synced to Obsidian, GitHub, Cloudflare")
    else:
        log(f"⚠ Sync issue: {result.stderr}", YELLOW)

# ============== STATUS ==============

def cmd_status(args):
    """Show memory status"""
    print("=" * 40)
    print("PERCY MEMORY STATUS")
    print("=" * 40)
    
    # Local files
    print(f"\n📁 Local Files:")
    for f in ["entity-memory.json", "decisions.json"]:
        path = MEMORY_FILE = MEMORY_DIR / f
        if path.exists():
            size = path.stat().st_size
            print(f"  ✓ {f} ({size} bytes)")
        else:
            print(f"  ✗ {f} (missing)")
    
    # Cloudflare
    config = load_cf_config()
    if config.get("worker_url"):
        print(f"\n☁️  Cloudflare:")
        print(f"  ✓ Worker: {config['worker_url']}")
        
        try:
            import requests
            resp = requests.get(
                f"{config['worker_url']}/health",
                headers={"X-API-Key": config["api_key"]},
                timeout=5
            )
            if resp.status_code == 200:
                print(f"  ✓ Health check passed")
            else:
                print(f"  ⚠ Health check failed")
        except Exception as e:
            print(f"  ⚠ Could not reach: {e}")
    else:
        print(f"\n☁️  Cloudflare: Not configured")
    
    # Obsidian
    obsidian_path = Path.home() / "Library/Mobile Documents/iCloud~md~obsidian/Documents/Openclaw Knowledge Core/Openclaw Knowledge Core"
    if obsidian_path.exists():
        print(f"\n📓 Obsidian:")
        notes = list(obsidian_path.glob("memory*.md"))
        print(f"  ✓ {len(notes)} memory notes")
    else:
        print(f"\n📓 Obsidian: Not accessible")
    
    # GitHub
    try:
        result = subprocess.run(
            ["git", "log", "-1", "--oneline"],
            cwd=MEMORY_DIR.parent,
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print(f"\n🐙 GitHub:")
            print(f"  ✓ Last commit: {result.stdout.strip()}")
    except:
        pass
    
    print()

# ============== CONTEXT ==============

def cmd_context(args):
    """Get session context"""
    brief = "--brief" in args
    
    result = subprocess.run(
        [sys.executable, str(MEMORY_DIR / "session-context.py")] + (["--brief"] if brief else []),
        capture_output=True,
        text=True
    )
    print(result.stdout)

# ============== HELP ==============

def cmd_help(args):
    print("""
Percy's Unified Memory Manager
===============================

USAGE:
    memory <command> [args]

COMMANDS:
    get <key>           Get value (e.g., memory get user.preferences)
    set <key> <value>   Set value (e.g., memory set user.name "Midge")
    log <message>       Log an action/fact
    decide "t" "c" "ch" Record a decision
    search <query>      Search all memory
    sync                Sync to all stores
    status              Show memory status
    context             Get session context
    help                Show this help

EXAMPLES:
    memory get user
    memory get user.preferences.updates
    memory set user.preferences.likes_voice "true"
    memory log "started Paydirt UI development"
    memory decide "UI Framework" "React vs Vue" "React"
    memory search "twitter"
    memory status

SHORTCUTS:
    memory              → status
    memory u            → get user
    memory p            → get projects
""")

# ============== MAIN ==============

COMMANDS = {
    "get": cmd_get,
    "set": cmd_set,
    "log": cmd_log,
    "decide": cmd_decide,
    "search": cmd_search,
    "sync": cmd_sync,
    "status": cmd_status,
    "context": cmd_context,
    "help": cmd_help,
}

# Shortcuts
SHORTCUTS = {
    "u": "get user",
    "p": "get projects",
    "a": "get agents",
}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        cmd_status([])
    else:
        cmd = sys.argv[1]
        
        # Check shortcuts
        if cmd in SHORTCUTS:
            parts = SHORTCUTS[cmd].split()
            cmd = parts[0]
            args = parts[1:] + sys.argv[2:]
        else:
            args = sys.argv[2:]
        
        if cmd in COMMANDS:
            COMMANDS[cmd](args)
        else:
            print(f"Unknown command: {cmd}")
            print("Run 'memory help' for usage")
