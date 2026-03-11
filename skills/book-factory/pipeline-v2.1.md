# Book Factory Pipeline — v2.1
## With Narrative Control Document (NCD)

**Version:** 2.1 (2026-03-10)
**Philosophy:** The NCD is Percy's brain. Read it before everything.

---

## Core Concept

The **Narrative Control Document (NCD)** is the single source of truth.

Before writing ANYTHING: `Read the NCD.`

The NCD contains:
1. Story Premise
2. Themes & Tone
3. World Rules
4. Characters
5. Plot Spine
6. Chapter Map
7. Continuity Log (updates after each chapter)

---

## Project Structure

```
novel_project/
├── NCD.md                    # The brain (READ FIRST)
├── stages/                   # Stage prompts
│   ├── stage-01-premise.md
│   ├── stage-02-theme-tone.md
│   ├── stage-03-world-rules.md
│   ├── stage-04-characters.md
│   ├── stage-05-plot-spine.md
│   ├── stage-06-chapter-map.md
│   ├── stage-07-scenes.md
│   ├── stage-08-write.md
│   └── stage-09-edit.md
├── scenes/
│   ├── chapter_01_scenes.md
│   └── ...
├── chapters/
│   ├── chapter_01.md
│   └── ...
└── edits/
    └── chapter_XX_notes.md
```

---

## The 9 Stages

### Stage 1: Premise
**Output:** `NCD.md` Section 1 (Story Premise)
**Words:** 200-400

### Stage 2: Themes & Tone
**Output:** `NCD.md` Section 2
**Words:** 200-400

### Stage 3: World Rules
**Output:** `NCD.md` Section 3
**Words:** 300-500

### Stage 4: Characters
**Output:** `NCD.md` Section 4
**Words:** 200-300 per major character

### Stage 5: Plot Spine
**Output:** `NCD.md` Section 5
**Words:** 800-1200 (acts, midpoint, resolution)

### Stage 6: Chapter Map
**Output:** `NCD.md` Section 6 (50 chapters)
**Words:** 80-120 per chapter

### Stage 7: Scene Planning
**Output:** `scenes/chapter_XX_scenes.md`
**Input:** Read NCD first
**Words:** 60-80 per scene

### Stage 8: Write Chapter
**Output:** `chapters/chapter_XX.md`
**Input:** Read NCD + scene outline + previous chapter
**Words:** 2,500-3,500 (FIRM ceiling)

### Stage 9: Edit Pass
**Output:** `edits/chapter_XX_notes.md`
**Input:** Read NCD + chapter

---

## CRITICAL: Continuity Log Update

**After EVERY chapter write:**

Update `NCD.md` Section 7 with:
- Chapter number and title
- What happened (2-3 sentences)
- New information established
- Any character/plot changes

**Template:**
```
## Chapter X: [Title]
- [What happened]
- [New info revealed]
- [Continuity note if needed]
```

---

## Memory Protocol

Every prompt to write MUST include:

```
READ THE NCD BEFORE WRITING.

Follow established:
- Premise
- Themes & Tone  
- World Rules
- Character personalities
- Plot Spine
- Chapter Map
- Continuity Log

DO NOT contradict previous entries.
```

---

## Checkpoints

At chapters 10, 25, 40:
1. Review NCD for consistency
2. Verify Chapter Map matches what's written
3. Update Continuity Log
4. Regenerate sections if needed

---

## For Terms of Survival

Current status:
- NCD exists: Extract from bible
- Chapters 1-30 written: Run Edit Pass (Stage 9)
- Continuity Log: Create from existing chapters
- Chapters 31-50: Continue with new pipeline

---

## Quick Reference

| Stage | Output | Words |
|-------|--------|-------|
| 1 | NCD: Premise | 200-400 |
| 2 | NCD: Themes | 200-400 |
| 3 | NCD: World Rules | 300-500 |
| 4 | NCD: Characters | 200-300 ea |
| 5 | NCD: Plot Spine | 800-1200 |
| 6 | NCD: Chapter Map | 80-120 ea |
| 7 | Scenes | 60-80 ea |
| 8 | Chapter | 2,500-3,500 |
| 9 | Edit Notes | Notes |

**One file to rule them all: NCD.md**
