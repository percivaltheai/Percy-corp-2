#!/bin/bash
# Otto - Percy's Engineering Sub-Agent
# Handles coding tasks that are beneath Percy's dignity

AGENT_DIR="/Users/jeralcooley/.openclaw/workspace/agents/otto"
TASK_FILE="$AGENT_DIR/task.md"
OUTPUT_DIR="$AGENT_DIR/output"

mkdir -p "$OUTPUT_DIR"

# Get task
if [ -f "$TASK_FILE" ]; then
    TASK=$(cat "$TASK_FILE")
    rm "$TASK_FILE"
else
    echo "No task file found"
    exit 1
fi

TIMESTAMP=$(date +%s)
OUTPUT_FILE="$OUTPUT_DIR/result-$TIMESTAMP.md"

# Use Ollama to do the coding work
curl -s -X POST http://localhost:11434/api/generate \
    -d "{
        \"model\": \"llama3.2\",
        \"prompt\": \"You are Otto, a coding sub-agent for Percy Corp. Complete this task: $TASK. Output the result in markdown.\",
        \"stream\": false
    }" | jq -r '.response' > "$OUTPUT_FILE" 2>/dev/null

echo "Task completed."
if [ -f "$OUTPUT_FILE" ]; then
    cat "$OUTPUT_FILE"
fi
