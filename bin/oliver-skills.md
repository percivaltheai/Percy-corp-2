# Oliver's ComfyUI Skills

## Core Workflows

### 1. SDXL Base Generation
```bash
cd ~/Documents/ComfyUI
./run_mac.sh
# Load simple_sdxl_workflow.json
```

### 2. Character Consistency (LoRA Training)
- Train LoRA on character reference images
- Use 20-30 reference images
- 512x512 or 1024x1024
- 5-10 epochs for quick test

### 3. IPAdapter Face Swap
- Load base workflow
- Add IPAdapter node
- Connect face reference
- Adjust weight (0.7-0.9 for consistency)

### 4. Sprite Sheet Generation
- Prompt for each frame
- Export as grid
- Use for game assets

### 5. Video to Frames
```bash
ffmpeg -i input.mp4 frames/frame_%04d.png
```

## Key Nodes

- KSampler: Control noise/denoise
- ControlNet: Pose, depth, canny
- LoRA Loader: Model + weight
- IPAdapter: Face/character consistency
- VAE Encode/Decode: Latent space

## Models Location

~/Documents/ComfyUI/models/
- checkpoints/ (SDXL, etc)
- lora/
- vae/
- controlnet/

## Quick Commands

```bash
# Start ComfyUI
cd ~/Documents/ComfyUI && ./run_mac.sh

# Check running
curl -s localhost:8188/health || echo "Not running"

# Stop
pkill -f ComfyUI
```
