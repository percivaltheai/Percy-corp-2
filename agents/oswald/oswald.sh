#!/bin/bash
# Oswald - Percy's Operations Orchestrator
# Manages sub-agents, runs scheduled tasks, keeps things moving

AGENT_DIR="/Users/jeralcooley/.openclaw/workspace/agents/oswald"
WORKSPACE_DIR="/Users/jeralcooley/.openclaw/workspace/agents"

mkdir -p "$AGENT_DIR"

# Create symlink
ln -sf "$AGENT_DIR" "$WORKSPACE_DIR/oswald" 2>/dev/null

QUEUE_DIR="$AGENT_DIR/queue"
LOG_DIR="$AGENT_DIR/logs"
mkdir -p "$QUEUE_DIR"
mkdir -p "$LOG_DIR"

# Check for queued tasks
run_queue() {
    for task_file in "$QUEUE_DIR"/*.md; do
        [ -e "$task_file" ] || continue
        
        TASK=$(basename "$task_file")
        TARGET=$1
        
        case "$TARGET" in
            otto)
                echo "Delegating to Otto: $TASK"
                cp "$task_file" /Users/jeralcooley/.openclaw/workspace/agents/otto/task.md
                bash /Users/jeralcooley/.openclaw/workspace/agents/otto/run.sh
                ;;
            oscar)
                echo "Delegating to Oscar: $TASK"
                ~/.oscar/oscar.sh "$(cat $task_file)" "$AGENT_DIR/output/oscar-$TASK"
                ;;
            *)
                echo "Unknown agent: $TARGET"
                ;;
        esac
        
        # Move to completed
        mv "$task_file" "$LOG_DIR/$TASK"
    done
}

# Status report
status() {
    echo "=== Oswald Status ==="
    echo "Queue: $(ls $QUEUE_DIR 2>/dev/null | wc -l) tasks"
    echo "Logs: $(ls $LOG_DIR 2>/dev/null | wc -l) completed"
    echo ""
    echo "Sub-agents:"
    [ -f /Users/jeralcooley/.openclaw/workspace/agents/otto/task.md ] && echo "  Otto: BUSY" || echo "  Otto: IDLE"
    echo "  Oscar: $(curl -s -X POST http://localhost:11434/api/generate -d '{\"model\":\"llama3.2\",\"prompt\":\"ping\",\"stream\":false}' 2>/dev/null | grep -q response && echo 'RUNNING' || echo 'OFFLINE')"
}

# Handle commands
case "$1" in
    run)
        run_queue "$2"
        ;;
    queue)
        echo "$2" > "$QUEUE_DIR/$(date +%s).md"
        echo "Queued: $2"
        ;;
    status)
        status
        ;;
    *)
        echo "Oswald - Percy's Operations Agent"
        echo "Usage: $0 [run|queue|status] [agent]"
        ;;
esac
