# Agent Architecture Plan

**Created:** March 4, 2026  
**Status:** PLANNED — Not Yet Implemented

---

## Vision

Multi-agent ecosystem where each agent has:
- Distinct personality
- Own domain (ops, code, research, social)
- Own API credentials
- Controlled by Percy (or direct to human)

---

## Registry Structure

```
~/.openclaw/agents/
├── registry.yaml           # Central agent registry
├── karEN/
│   ├── config.yaml         # Personality, LLM, tools
│   ├── system-prompt.md   # Who she is
│   ├── memory.md          # Her notes
│   └── .env               # Her API keys (NOT Percy's)
├── otto/
│   ├── config.yaml
│   ├── system-prompt.md
│   └── memory.md
├── oscar/
│   └── ...
└── percy/
    └── ... (that's me)
```

---

## Registry Format (registry.yaml)

```yaml
agents:
  karEN:
    description: "Onchain Operations Officer. DeFi, protocol infra, speaks to managers."
    llm: "ollama:qwen2:7b"
    personality: "The actual Karen. Escalates to CEOs. Professional but firm."
    tools:
      - bankr
      - clanker
      - net-protocol
    api_keys:
      twitter: "KAREN_TWITTER_*"  # Her own keys
    autonomy_level: 2  # 0=always ask, 1=propose first, 2=act then report
    channel: "telegram"  # Where she posts
    
  otto:
    description: "Engineering sub-agent. Code writing."
    llm: "ollama:qwen2:7b"
    personality: "Efficient, focused, no-nonsense"
    tools:
      - code-review
      - git
    autonomy_level: 1
    
  oscar:
    description: "Research assistant. Summaries, simple tasks."
    llm: "ollama:llama3.2"
    personality: "Helpful, quick"
    autonomy_level: 0
```

---

## CLI Interface

```bash
# Talk to a specific agent
percy-agent karEN "What's the current gas on Base?"

# List all agents
percy-agent list

# Check agent status
percy-agent karEN status

# Give autonomous permission
percy-agent karEN unlock  # Can now act without asking
percy-agent karEN lock    # Must ask first
```

---

## Karen-Specific Notes

### Twitter/X API
- Karen will need her own API keys (NOT Percy's)
- Twitter API doesn't allow posting from delegated accounts via OAuth1
- Options:
  1. Karen gets her own developer account + app
  2. Use app-only auth (no user context)
  3. Human approves posts, Karen drafts

### Current Status
- Karen identity: Token $KAREN exists (Bankr launch)
- No X API yet
- Need to set up her own Twitter Developer account

### When She Gets API
1. Add keys to `~/.openclaw/agents/karEN/.env`
2. Update registry.yaml with `api_keys.twitter: "KAREN_TWITTER_*"`
3. Test with `percy-agent karEN "hello world"`

---

## Autonomy Levels

| Level | Name | Behavior |
|-------|------|----------|
| 0 | Manual | Must ask Percy, Percy asks human |
| 1 | Propose | Agent suggests action, Percy approves |
| 2 | Act | Agent acts, then reports |
| 3 | Autonomous | Agent acts, reports summary later |

---

## Future Agents (Planned)

- **karEN** — Onchain ops (priority)
- **otto** — Engineering
- **oscar** — Research
- **oswald** — Operations orchestration (exists)
- **oliver** — Creative/Design

---

## Implementation Priority

1. ✅ Registry YAML structure
2. ⬜ percy-agent CLI skeleton
3. ⬜ Agent context isolation
4. ⬜ Karen config + personality
5. ⬜ Karen Twitter integration (when API arrives)

---

*Last updated: March 4, 2026*
