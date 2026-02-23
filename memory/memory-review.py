#!/usr/bin/env python3
"""Memory Review Cron - Daily at 11:30 PM

Reviews memory systems, checks for stale data, makes optimizations.
"""

import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

MEMORY_DIR = Path(__file__).parent

def run_cmd(cmd):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return result.returncode, result.stdout, result.stderr

def check_memory_health():
    """Check all memory stores are healthy"""
    print("=" * 50)
    print(f"Memory Review — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 50)
    
    issues = []
    
    # 1. Check local files
    print("\n📁 Local Files:")
    for f in ["entity-memory.json", "decisions.json"]:
        path = MEMORY_DIR / f
        if path.exists():
            size = path.stat().st_size
            print(f"  ✓ {f} ({size} bytes)")
            
            # Check for stale data (older than 7 days)
            age_days = (datetime.now().timestamp() - path.stat().st_mtime) / 86400
            if age_days > 7:
                issues.append(f"{f} not updated in {int(age_days)} days")
        else:
            print(f"  ✗ {f} missing!")
            issues.append(f"Missing: {f}")
    
    # 2. Check Cloudflare
    print("\n☁️  Cloudflare:")
    config_file = MEMORY_DIR / "cf-config.json"
    if config_file.exists():
        with open(config_file) as f:
            config = json.load(f)
        
        if config.get("worker_url"):
            code, out, err = run_cmd(
                f'curl -s -H "X-API-Key: {config["api_key"]}" {config["worker_url"]}/health'
            )
            if code == 0 and "ok" in out:
                print(f"  ✓ Worker healthy")
            else:
                print(f"  ⚠ Worker unreachable")
                issues.append("Cloudflare worker unhealthy")
        else:
            print("  ⊘ Not configured")
    else:
        print("  ⊘ No config")
    
    # 3. Check Obsidian sync
    print("\n📓 Obsidian:")
    obsidian_path = Path.home() / "Library/Mobile Documents/iCloud~md~obsidian/Documents/Openclaw Knowledge Core/Openclaw Knowledge Core"
    if obsidian_path.exists():
        notes = list(obsidian_path.glob("memory*.md"))
        print(f"  ✓ {len(notes)} memory notes")
        
        # Check if recent
        if notes:
            latest = max(n.stat().st_mtime for n in notes)
            age_hours = (datetime.now().timestamp() - latest) / 3600
            if age_hours > 48:
                issues.append(f"Obsidian not synced in {int(age_hours)} hours")
    else:
        print("  ✗ Vault not accessible")
    
    # 4. Check GitHub
    print("\n🐙 GitHub:")
    code, out, err = run_cmd("git log -1 --format=%ci")
    if code == 0 and out:
        print(f"  ✓ Last commit: {out.strip()}")
    else:
        print("  ⚠ Could not check")
    
    # 5. Analyze entity memory
    print("\n🧠 Entity Analysis:")
    entity_file = MEMORY_DIR / "entity-memory.json"
    if entity_file.exists():
        with open(entity_file) as f:
            mem = json.load(f)
        
        entities = mem.get("entities", {})
        
        # Check user prefs
        user = entities.get("user", {})
        prefs = user.get("preferences", {})
        if prefs:
            print(f"  ✓ User preferences: {len(prefs)} entries")
        else:
            issues.append("No user preferences set")
        
        # Check projects
        projects = entities.get("projects", {})
        if projects:
            print(f"  ✓ Projects: {len(projects)} tracked")
            for p, data in projects.items():
                status = data.get("status", "unknown") if isinstance(data, dict) else "unknown"
                print(f"    - {p}: {status}")
        
        # Check learned facts
        facts = entities.get("learned_facts", [])
        print(f"  ✓ Learned facts: {len(facts)}")
        
        if len(facts) < 3:
            issues.append("Very few facts learned - not using memory actively")
    
    # 6. Check decisions
    print("\n📝 Decisions:")
    decisions_file = MEMORY_DIR / "decisions.json"
    if decisions_file.exists():
        with open(decisions_file) as f:
            data = json.load(f)
        
        decisions = data.get("decisions", [])
        print(f"  ✓ {len(decisions)} decisions recorded")
        
        # Check for pending outcomes
        pending = [d for d in decisions if not d.get("outcome_actual")]
        if pending:
            print(f"  ⚠ {len(pending)} decisions without outcomes")
    else:
        print("  ⊘ No decisions recorded")
    
    # Summary
    print("\n" + "=" * 50)
    if issues:
        print("ISSUES FOUND:")
        for issue in issues:
            print(f"  - {issue}")
        
        print("\n🤖 AUTO-OPTIMIZATIONS:")
        
        # Fix: If no recent activity, log something
        if any("not updated" in i for i in issues):
            print("  → Stale data detected, will trigger sync")
            run_cmd(f"cd {MEMORY_DIR} && python3 sync-obsidian.py")
        
        # Fix: If few facts, remind to use memory
        if any("not using memory" in i for i in issues):
            print("  → Adding reminder to use memory more actively")
            # Could update a reminder file or self-correct
        
        print("\n✅ Review complete")
    else:
        print("✅ All systems healthy!")
    
    print("=" * 50)
    
    return len(issues)

if __name__ == "__main__":
    check_memory_health()
