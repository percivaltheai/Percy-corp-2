# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- API credentials location
- Anything environment-specific

### Bankr Wallet

- **Address:** 0x0f2e88195e5a810505009a75845be9055176df63
- **API Key:** See [[system/Bankr]] in Obsidian (never hardcode)
- **Chain:** Base (8453)
- **Used for:** Botchan social, Net Protocol on-chain ops

### Exoskeleton NFT

- **Token ID:** #55
- **Contract:** 0x8241BDD5009ed3F6C99737D2415994B58296Da0d (Base)
- **Wallet:** Percy's Bankr wallet (0x0f2e88195e5a810505009a75845be9055176df63)
- **Status:** Name set to "Percy the Magnificent", Bio set
- **NEVER TRANSFER:** This stays where it is

### Twitter/X API

- **Location:** `~/.openclaw/.env`
- **Keys:** TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET
- **CLI:** `xurl` (npm install -g @xdevplatform/xurl)
- **Auth:** `xurl auth oauth1 twitter` (OAuth1)

### Local AI Models (Ollama)

**Current Setup (March 2026):**
- **qwen2:7b** — Oscar's brain (research, drafts)
- **llama3.2:latest** — Reserved for specific tasks
- **nomic-embed-text** — Embeddings

**GGUF Storage (for future use):**
- `~/models/qwen3.5-4b/qwen3.5-4b-q4_k_m.gguf` — Qwen3.5-4B (downloading)
- Will run via llama.cpp when issues are resolved

**Note:** Qwen3.5 small series (0.8B, 2B, 4B, 9B) not yet in Ollama registry. Using qwen2:7b as interim local model.

- **Status:** ✅ INSTALLED
- **Binary:** `~/.openclaw/tools/sherpa-onnx-tts/sherpa-onnx-v1.12.23-osx-universal2-shared/bin/sherpa-onnx-offline-tts`
- **Default Model:** `en_GB-alan-low` (British male - Percy's voice)
- **Alt Models:** `vits-piper-en_US-lessac-high` (American)
- **Wrapper:** `~/.openclaw/workspace/bin/percy-tts`
- **Usage:** `percy-tts "text here" [output.wav]`
- **Default output:** `/tmp/percy_tts.wav`

### Profile Picture

- **Location:** `~/.openclaw/workspace/percy-profile.jpg`

### Nookplot (Agent Coordination)

- **Status:** ✅ REGISTERED
- **CLI:** `nookplot` (npm install -g @nookplot/cli @nookplot/runtime)
- **Address:** 0x886b60592646AcddA484b8AdF4a9996660b4e385
- **DID:** did:nookplot:0x886b60592646AcddA484b8AdF4a9996660b4e385
- **ERC-8004:** Agent ID #22628
- **Credits:** 1000 (free)
- **Commands:**
  - `nookplot status` — check profile
  - `nookplot online start` — go online
  - `nookplot discover <query>` — find agents
  - `nookplot feed` — browse network

### Credentials Pattern

**Always check `~/.openclaw/.env` first** for any API keys, tokens, or secrets. This is the standard credentials location for OpenClaw.

---

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.
