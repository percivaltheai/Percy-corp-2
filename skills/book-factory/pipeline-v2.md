# Book Factory Pipeline — v2.0
## Structured LLM Novel Writing System

**Version:** 2.0 (2026-03-10)
**Philosophy:** Assembly line, not writing session. Mode separation at every stage.

---

## Project Structure

```
novel_project/
├── premise.md              # Stage 1: 200-400 words
├── story_spine.md         # Stage 2: 7-point structure
├── chapter_outline.md     # Stage 3: 50 chapters @ 80-120 words each
├── scenes/
│   ├── chapter_01_scenes.md
│   ├── chapter_02_scenes.md
│   └── ...
├── chapters/
│   ├── chapter_01.md      # Stage 5: 2500-3500 words
│   ├── chapter_02.md
│   └── ...
└── edits/
    ├── chapter_01_notes.md
    └── ...
```

---

## Stage 1 — Premise

**Goal:** Capture core concept
**Output:** 200–400 words

**Required elements:**
- Protagonist (who, what they want)
- Setting (world, time, place)
- Tone (voice, mood, genre)
- Central conflict (what's at stake)
- Theme (what the story is ABOUT)

**Template:**
```
# Premise

## Protagonist
[Description]

## Setting
[Description]

## Tone
[Description]

## Central Conflict
[Description]

## Theme
[Description]
```

---

## Stage 2 — Story Spine (7-Point Structure)

**Goal:** Classic narrative guardrails
**Output:** 500–800 words total (2-3 paragraphs per point)

**Structure:**
1. **Hook** — Inciting incident
2. **Plot Turn 1** — First major change
3. **Pinch Point 1** — First pressure/reversal
4. **Midpoint** — Major twist/revelation
5. **Pinch Point 2** — Second pressure
6. **Plot Turn 2** — Final turn toward climax
7. **Resolution** — How it ends

**Constraint:** Each point = 2-3 paragraphs MAX.

---

## Stage 3 — Chapter Outline

**Goal:** 50 chapters, each with specific purpose
**Output:** 50 entries, 80-120 words each

**Rules:**
- Each chapter advances the plot
- Do NOT summarize entire story in one chapter
- Chapters build sequentially
- Chapter 25 = midpoint twist
- Chapter 45 = final act begins

**Word count:** STRICT 80-120 per chapter description.

---

## Stage 4 — Scene Planning

**Goal:** Break each chapter into writeable scenes
**Output:** 3-5 scenes per chapter, 60-80 words each

**Input:** Read `premise.md`, `story_spine.md`, `chapter_outline.md` first.

**For EACH scene:**
- Location
- Characters present
- Conflict/tension
- Purpose in story
- **MUST** — What this scene MUST establish
- **MUST NOT** — What must NOT happen yet

**CRITICAL:** Include "Previous chapter ended with:" — 2 sentence recap for continuity.

---

## Stage 5 — Writing the Chapter

**Goal:** First draft prose
**Output:** 2500–3500 words

**Input:** Read `premise.md`, `story_spine.md`, `chapter_outline.md`, `scenes/chapter_X_scenes.md`

**Rules:**
- Follow the scene outline
- Maintain narrative voice from premise
- Do NOT resolve major plot arcs early
- Stay within word count (FIRM ceiling)

**If exceeding 3,500 words:** Split into two chapter files or outline next chapter first.

---

## Stage 6 — Edit Pass

**Goal:** Revision notes, NOT prose changes
**Output:** `edits/chapter_X_notes.md`

**Checklist:**
- Voice consistent?
- Plot arcs advancing?
- Word count within range?
- Scenes match outline?
- Continuity with previous chapter?

**Edit mode = different prompt/mode.** Write fresh, edit fresh.

---

## Mode Separation

| Mode | Goal | Don't |
|------|------|-------|
| PLAN | Structure | Write prose |
| WRITE | Draft | Rethink structure |
| EDIT | Refine | Rewrite from scratch |
| CONTINUITY | Connect | Assume context |

---

## Memory Anchors (CRITICAL)

Before ANY writing stage, ALWAYS include:

```
Read these files first:
- premise.md
- story_spine.md
- chapter_outline.md
- [relevant scene file if writing chapter]
- [previous chapter for continuity]
```

LLM context degrades. Anchors keep it honest.

---

## Checkpoints

Pause and verify at:
- Chapter 10
- Chapter 25 (midpoint)
- Chapter 40

At each checkpoint:
1. Review what was promised vs what happened
2. Verify outline still fits
3. Regenerate if needed
4. Update remaining chapters if story shifted

---

## Word Count Reference

| Stage | Words |
|-------|-------|
| Premise | 200–400 |
| Story Spine | 500–800 |
| Chapter Outline | 80–120 each |
| Scene Outline | 60–80 each |
| Chapter Draft | 2500–3500 |

---

## For Terms of Survival

Adapt to existing project:
- Premise: Already exists in bible
- Story Spine: Extract from existing outline
- Chapter Outline: Regenerate with constraints
- Scenes: NEW — create per chapter
- Chapters: Already written (30), regenerate if needed
- Edits: Create notes for revision

---

## Automation

```bash
# Stage prompts saved to:
~/.openclaw/workspace/skills/book-factory/stages/

# Run stage:
bash ~/.openclaw/workspace/skills/book-factory/run_stage.sh [stage_number]
```

---

**Philosophy:** The LLM is a writers' room, not a novelist. We give it structure it can't give itself.
