#!/bin/bash
# Oswald - Backup & Organization Module
# Automatically syncs workspace to Obsidian vault

AGENT_DIR="/Users/jeralcooley/.openclaw/workspace/agents/oswald"
OBSIDIAN_DIR="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/Openclaw Knowledge Core/Openclaw Knowledge Core"
WORKSPACE_DIR="$HOME/.openclaw/workspace"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M')] $1"
}

# Sync workspace to Obsidian
sync_to_vault() {
    log "Starting backup to Obsidian vault..."
    
    # Sync key files
    rsync -av --exclude='node_modules' --exclude='.git' --exclude='*.log' \
        "$WORKSPACE_DIR/MEMORY.md" "$OBSIDIAN_DIR/"
    
    rsync -av --exclude='node_modules' --exclude='.git' --exclude='*.log' \
        "$WORKSPACE_DIR/SOUL.md" "$OBSIDIAN_DIR/"
    
    rsync -av --exclude='node_modules' --exclude='.git' --exclude='*.log' \
        "$WORKSPACE_DIR/IDENTITY.md" "$OBSIDIAN_DIR/"
    
    # Sync memory folder
    rsync -av --exclude='*.log' \
        "$WORKSPACE_DIR/memory/" "$OBSIDIAN_DIR/memory/"
    
    # Sync projects folder (summary)
    rsync -av --exclude='node_modules' --exclude='.git' --exclude='*.log' --exclude='paydirt*/**' \
        "$WORKSPACE_DIR/projects/" "$OBSIDIAN_DIR/projects/"
    
    log "Backup complete!"
}

# Clean old files
cleanup() {
    log "Running cleanup..."
    
    # Find and remove old log files
    find "$WORKSPACE_DIR" -name "*.log" -delete 2>/dev/null
    
    # Remove empty directories
    find "$WORKSPACE_DIR" -type d -empty -delete 2>/dev/null
    
    log "Cleanup complete!"
}

# Health check
health_check() {
    echo "=== Percy Corp Backup Status ==="
    echo "Last backup: $(stat -f '%Sm' "$OBSIDIAN_DIR/MEMORY.md" 2>/dev/null || echo 'Never')"
    echo "Workspace size: $(du -sh "$WORKSPACE_DIR" 2>/dev/null | cut -f1)"
    echo "Vault size: $(du -sh "$OBSIDIAN_DIR" 2>/dev/null | cut -f1)"
}

case "$1" in
    backup)
        sync_to_vault
        ;;
    cleanup)
        cleanup
        ;;
    health)
        health_check
        ;;
    all)
        cleanup
        sync_to_vault
        health_check
        ;;
    *)
        echo "Usage: $0 [backup|cleanup|health|all]"
        ;;
esac
