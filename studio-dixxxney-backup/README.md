# Dixxxney Channel 🎬

Lightweight generative media studio optimized for Mac Mini (and eventually real hardware).

## Quick Start

```bash
# Add a character from images
./dixxxney add-character hero ~/Pictures/hero-images

# Prepare dataset
./dixxxney prepare hero

# Generate captions
./dixxxney caption hero

# Train LoRA (requires cloud or ComfyUI + Kohya)
./dixxxney train hero

# Generate image
./dixxxney generate hero "portrait of hero, dramatic lighting, 8k"
```

## Architecture

```
studio-dixxxney/
├── characters/       # Character configs + datasets
│   └── [name]/
│       ├── dataset/  # Raw images
│       ├── cleaned/ # Processed images
│       └── captions/# Auto-captions
├── models/
│   ├── base/         # Base models (SD1.5 for speed)
│   └── loras/        # Trained character LoRAs
├── generation/       # Generated outputs
├── episodes/         # Finished episodes
└── scripts/          # Show scripts
```

## Mac Mini Constraints

- **SD 1.5 only** — SDXL too slow
- **512x512 max** — Lower than ideal but faster
- **No animation** — Skip I2V for now
- **Cloud training** — Local LoRA training impractical

## ComfyUI Workflows

Place custom workflows in `generation/` — load them after running `generate`.

## Hardware Roadmap

| Phase | Hardware | Capability |
|-------|----------|------------|
| MVP | Mac Mini | SD 1.5 generation |
| v1 | RTX 3080 | SDXL + training |
| v2 | RTX 4090 | Full pipeline |

## Commands

| Command | Description |
|---------|-------------|
| `add-character` | Register new character from images |
| `prepare` | Clean and organize dataset |
| `caption` | Auto-tag images (Ollama) |
| `train` | Train character LoRA |
| `generate` | Create image with character |
| `list` | Show characters |
| `status` | System status |

## Requirements

- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) at `~/Documents/ComfyUI`
- [Ollama](https://ollama.ai) for captioning
- Images for characters (20-50 recommended)

## Roadmap

- [ ] Character dataset management
- [ ] Auto-captioning with Ollama Vision
- [ ] ComfyUI workflow templates
- [ ] Video generation (future)
- [ ] Episode assembly
- [ ] Cloud training integration
