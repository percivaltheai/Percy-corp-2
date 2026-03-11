# Novel Pipeline Fixes — SOLVED ✅

**Date:** 2026-03-10
**Status:** PIPELINE v2.0 DEPLOYED

---

## The Core Problems — SOLVED

### 1. Front-Loading (Plot in Chapter 1) — SOLVED
- **Solution:** Stage gates. Can't write until outline exists.
- **Enforcement:** Chapter outline 80-120 words each = can't dump

### 2. Middle Bloat (80K Word Chapters) — SOLVED
- **Solution:** Hard 3,500 word ceiling per chapter
- **Enforcement:** Split or outline next chapter if exceeded

### 3. Context Drift — SOLVED
- **Solution:** Memory anchors before every writing stage
- **Enforcement:** "Read these files first" is mandatory header

---

## New Pipeline (v2.0) — DEPLOYED

### Stages:
1. Premise (200-400 words)
2. Story Spine (7-point, 500-800 words)
3. Chapter Outline (50 chapters, 80-120 words each)
4. Scene Planning (3-5 scenes per chapter, 60-80 words each)
5. Write Chapter (2,500-3,500 words)
6. Edit Pass (notes, not prose)

### Files:
- `~/.openclaw/workspace/skills/book-factory/pipeline-v2.md` — Full spec
- `~/.openclaw/workspace/skills/book-factory/QUICKREF.md` — Quick reference
- `~/.openclaw/workspace/skills/book-factory/stages/` — Stage prompts

---

## Action Items — COMPLETE

- [x] Create new chapter brief template → stages/stage-*.md
- [x] Implement word count enforcement → In each stage spec
- [x] Add beat sheet requirement → Stage 4: Scene Planning
- [x] Set up 5-chapter checkpoint review → In pipeline-v2.md

---

## Next Steps

For Terms of Survival:
1. Review chapters 1-30 with Stage 6 Edit Pass
2. Generate scenes for chapters 31-50
3. Write chapters 31-50 with new pipeline
