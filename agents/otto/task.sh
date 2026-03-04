#!/bin/bash
# Otto Task Interface
# Usage: ./task.sh "Your coding task here"

AGENT_DIR="/Users/jeralcooley/.openclaw/workspace/agents/otto"

# Write task
echo "$1" > "$AGENT_DIR/task.md"

# Run the task
bash "$AGENT_DIR/run.sh"
