# Game Graphics Toolkit

## Current Capabilities

### 1. ComfyUI (INSTALLED)
**Location:** `/Users/jeralcooley/Documents/ComfyUI/`

**Models Available:**
- SDXL Base 1.0 (6.9GB)
- SDXL Refiner 1.0 (6.0GB)
- UberRealisticPornMerge v23 (2.0GB) — NOT FOR WORK
- Plus various LoRAs, VAEs, ControlNet models

**For Game Assets:**
- Use SDXL with pixel art LoRA for sprite generation
- Use img2img to convert AI art to pixel art
- Generate isometric tiles with ControlNet

**Workflows Available:**
- `simple_sdxl_workflow.json` — Basic SDXL generation
- `i2v_workflow.json` — Image-to-Video
- `realistic_workflow.json` — Realistic images

**How to Use:**
1. Start ComfyUI: `cd /Users/jeralcooley/Documents/ComfyUI && ./run_mac.sh`
2. Open http://127.0.0.1:8188
3. Load workflow, generate assets

### 2. Pollinations.ai (API Issues)
**Status:** Currently experiencing errors (error code 1033)
**Alternative:** Use when fixed or switch to other methods

### 3. Ollama (Installed)
**Location:** Always running locally
**Models:** llama3.2, qwen2:7b
**Use for:** Generating prompts, describing assets, writing code

---

## Free Asset Sources

### 1. Kenney.nl (RECOMMENDED)
**URL:** https://kenney.nl/assets
- **30,000+ FREE assets**
- CC0 licensed (no attribution required)
- 2D sprites, 3D models, tilesets, UI, audio
- Categories: Platformer, RPG, Strategy, Puzzle, Racing

**Best Packs:**
- Kenny Assets Pack (all-in-1)
- Western theme assets available

### 2. OpenGameArt.org
**URL:** https://opengameart.org
- Free CC0 and CC-BY assets
- Community-contributed
- Search for "western", "pixel art", "tileset"

### 3. CraftPix.net Freebies
**URL:** https://craftpix.net/freebies/
- Free 2D game assets
- Sprite sheets, GUI, backgrounds
- Some CC0, some require attribution

### 4. GitHub Collections
- https://github.com/topics/tilesets
- https://github.com/HotpotDesign/Game-Assets-And-Resources
- https://github.com/ahnerd/creative-commons-game-assets-collection

---

## AI Generation Tools

### 1. HuggingFace Spaces (Web-based)

**Pixel Art Sprite Generator:**
- https://huggingface.co/spaces/Samuelblue/Onodofthenorth-SD_PixelArt_SpriteSheet_Generator
- Generate pixel art sprite sheets from prompts

**Game Asset MCP Server:**
- https://github.com/MubarakHAlketbi/game-asset-mcp
- MCP server for creating 2D/3D assets from text
- Uses HuggingFace models

**To use:**
1. Clone the repo
2. Set up with mcporter
3. Generate assets via CLI

### 2. Browser-Based Tools (Free)

**PixelLab:**
- https://www.pixellab.ai/
- AI pixel art generator
- Works in browser, exports sprites

**Rosebud AI:**
- https://lab.rosebud.ai/ai-game-assets
- Free game asset generator
- Sprites, tilesets, pixel art

**Pixa:**
- https://www.pixa.com/create/sprite-generator
- Free sprite generator

---

## Techniques for Game Graphics

### 1. Generating Pixel Art with SDXL

**Prompt Template:**
```
western saloon building, pixel art, 64x64, isometric view, game asset, transparent background, detailed wood texture, warm colors
```

**Steps in ComfyUI:**
1. Load SDXL Base
2. Add pixel art LoRA (if available)
3. Use low CFG (2-4) for img2img
4. Resize to pixel-art-appropriate size
5. Use "Pixel Perfect" node for crisp edges

### 2. Creating Isometric Tiles

**Prompt Template:**
```
isometric terrain tile, desert ground, game asset, top-down view, pixel art style, seamless edges
```

**For Phaser integration:**
- Generate at 2x or 4x resolution
- Export as PNG with transparency
- Use Phaser sprites

### 3. Character Sprites

**Prompt Template:**
```
western miner character, pixel art, 32x32, 4 directions, game sprite, detailed, retro game style
```

**Sprite Sheet Approach:**
- Generate full-body character
- Use external tool to slice into frames
- Or use sprite sheet generator on HF

---

## Techniques for Game Graphics

### 1. Generating Pixel Art with SDXL

**Prompt Template:**
```
western saloon building, pixel art, 64x64, isometric view, game asset, transparent background, detailed wood texture, warm colors
```

**Steps in ComfyUI:**
1. Load SDXL Base
2. Add pixel art LoRA (if available)
3. Use low CFG (2-4) for img2img
4. Resize to pixel-art-appropriate size
5. Use "Pixel Perfect" node for crisp edges

### 2. Creating Isometric Tiles

**Prompt Template:**
```
isometric terrain tile, desert ground, game asset, top-down view, pixel art style, seamless edges
```

**For Phaser integration:**
- Generate at 2x or 4x resolution
- Export as PNG with transparency
- Use Phaser sprites

### 3. Character Sprites

**Prompt Template:**
```
western miner character, pixel art, 32x32, 4 directions, game sprite, detailed, retro game style
```

**Sprite Sheet Approach:**
- Generate full-body character
- Use external tool to slice into frames
- Or use sprite sheet generator on HF

### 4. Procedural Graphics in Phaser (Current Approach)

**What we did for Paydirt:**
- Created textures using Phaser Graphics API
- Drew buildings with shapes (rectangles, triangles)
- Added gradients for depth
- Used emoji for characters (temporary)

**Benefits:**
- No external dependencies
- Crisp at any resolution
- Fully customizable
- Fast to iterate

---

## Recommended Workflow

### For Paydirt Game Assets:

1. **Download Kenney Western Pack** (free, CC0)
   - Immediate usable assets
   - Match our aesthetic

2. **Generate Custom Assets with ComfyUI**
   - Saloon exterior variations
   - Store variations
   - Special terrain tiles
   - Use SDXL + pixel art approach

3. **Polish with AI**
   - Use img2img to add details
   - Upscale for higher resolution

4. **Create Sprite Sheets**
   - Character animations
   - Mining actions
   - Worker movement

---

## Action Items

- [ ] Download Kenney Game Assets All-in-1 (60,000+ assets, FREE)
  - https://kenney.itch.io/kenney-game-assets
  - CC0 licensed, no attribution required
- [ ] Set up ComfyUI workflow for pixel art
- [ ] Try HF pixel art generator
- [ ] Create asset library in `/projects/paydirt/assets/`
- [ ] Build custom Phaser textures from AI generations

---

## References

- **Paydirt Development Strategy:** `/memory/paydirt-development-strategy.md`

```bash
# Start ComfyUI
cd /Users/jeralcooley/Documents/ComfyUI && ./run_mac.sh

# Check Ollama
ollama list

# Run Ollama task
~/.oscar/oscar.sh "task" output.md

# Download Kenney assets (itch.io - requires manual download)
# Go to https://kenney.itch.io/kenney-game-assets
```

---

*Last updated: 2026-02-25*
