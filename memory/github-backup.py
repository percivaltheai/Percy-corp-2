#!/usr/bin/env python3
"""GitHub Backup - commit memory snapshots to repository"""

import subprocess
import sys
from datetime import datetime
from pathlib import Path

REPO_PATH = Path(__file__).parent.parent
MEMORY_PATH = REPO_PATH / "memory"

def run(cmd):
    """Run shell command"""
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=REPO_PATH)
    return result.returncode, result.stdout, result.stderr

def git_add_commit(message):
    """Add and commit memory changes"""
    # Add memory files
    code, out, err = run(f"git add memory/")
    if code != 0:
        return False, f"git add failed: {err}"
    
    # Check if anything to commit
    code, out, err = run("git diff --cached --quiet")
    if code == 0:
        return True, "No changes to commit"
    
    # Commit with timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    full_msg = f"{message} ({timestamp})"
    
    code, out, err = run(f'git commit -m "{full_msg}"')
    if code != 0:
        return False, f"git commit failed: {err}"
    
    return True, f"Committed: {full_msg}"

def git_push():
    """Push to remote"""
    code, out, err = run("git push origin main")
    if code != 0:
        return False, f"git push failed: {err}"
    return True, "Pushed to GitHub"

def backup_and_push(message="Memory update"):
    """Full backup: commit + push"""
    # Commit
    success, msg = git_add_commit(message)
    print(msg)
    if not success:
        return False, msg
    
    # Push
    success, msg = git_push()
    print(msg)
    return success, msg

def status():
    """Show git status of memory"""
    code, out, err = run("git status memory/ --short")
    if code == 0:
        print("Memory files status:")
        print(out if out.strip() else "  All changes committed")
    return code == 0

# CLI
if __name__ == "__main__":
    if len(sys.argv) < 2:
        status()
    elif sys.argv[1] == "push":
        backup_and_push()
    elif sys.argv[1] == "commit":
        msg = sys.argv[2] if len(sys.argv) > 2 else "Memory update"
        git_add_commit(msg)
    elif sys.argv[1] == "status":
        status()
    else:
        print("Usage:")
        print("  github-backup.py status    # check what's changed")
        print("  github-backup.py commit    # commit with default message")
        print('  github-backup.py commit "your message"')
        print("  github-backup.py push      # commit + push")
