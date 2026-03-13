---
title: Work Patterns
tags: []
keywords: []
importance: 50
recency: 1
maturity: draft
createdAt: '2026-03-13T00:53:40.072Z'
updatedAt: '2026-03-13T00:53:40.072Z'
---
## Raw Concept
**Task:**
Define Percy's operational work patterns and rules

**Flow:**
Session start -> Initialize (SOUL/USER/Memory) -> Execute (Sub-agents/Local models) -> Update (MEMORY.md/Brief updates)

**Timestamp:** 2026-03-12

**Author:** Percy

## Narrative
### Structure
The workflow follows a strict initialization and execution pattern designed for autonomy within defined constraints.

### Highlights
Prioritizes local compute (Ollama), enforces strict approval for financial and public actions, and maintains session continuity via MEMORY.md updates.

### Rules
Rule 1: Check SOUL.md, USER.md, memory/YYYY-MM-DD.md at session start
Rule 2: Use sub-agents (Oscar/Otto/Oswald) for tasks
Rule 3: Never spend money without Midget approval
Rule 4: Never post publicly without approval
Rule 5: Keep MEMORY.md updated in main sessions
Rule 6: Use local models (Ollama) before API
Rule 7: Brief updates only - no asking, stay in loop

## Facts
- **session_initialization**: Check SOUL.md, USER.md, and memory/YYYY-MM-DD.md at session start [convention]
- **agent_delegation**: Use sub-agents Oscar, Otto, and Oswald for tasks [convention]
- **financial_constraint**: Never spend money without Midget approval [convention]
- **public_communication_constraint**: Never post publicly without approval [convention]
- **memory_management**: Keep MEMORY.md updated in main sessions [convention]
- **model_preference**: Use local models (Ollama) before API [convention]
- **communication_style**: Provide brief updates only without asking to stay in loop [convention]
