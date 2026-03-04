# Oliver Skill - ComfyUI Automation

## Overview

Oliver is Percy's creative director. He specializes in visual content creation using ComfyUI and local AI tools. He operates via API calls to ComfyUI at `http://localhost:8000`.

## Quick Start

**Start ComfyUI:**
```bash
open /Applications/ComfyUI.app
# Wait ~20s for startup
```

**Check status:**
```bash
oliver check
```

## Usage

### Basic Image Generation
```bash
oliver generate "a portrait of a warrior woman"
oliver neg "blurry,ugly" "beautiful landscape"
oliver size 512x512 "a minimalist logo"
oliver models
oliver outputs
```

## VIDEO GENERATION (Full Guide)

### Option 1: Stable Video Diffusion (SVD)

**Models to download:**
- SVD (14 frames): https://huggingface.co/stabilityai/stable-video-diffusion-img2vid/blob/main/svd.safetensors
- SVD-XT (25 frames): https://huggingface.co/stabilityai/stable-video-diffusion-img2vid-xt/blob/main/svd_xt.safetensors

**Location:** `~/Documents/ComfyUI/models/checkpoints/`

**Basic Workflow (SVD):**
1. LoadImage node - your reference image
2. SVDImgToVideo node
3. SaveImage (outputs video frames)

**Key Parameters:**
- `video_frames`: Number of frames (14 or 25)
- `motion_bucket_id`: Higher = more motion (1-255)
- `fps`: Higher = smoother (default ~6-8)
- `augmentation_level`: Higher = less like original image

### Option 2: HunyuanVideo (Already Have GGUF!)

We already have: `wan22EnhancedNSFWSVICamera_nolightningSVICfQ8H.gguf`

**HunyuanVideo Image-to-Video workflow:**
Reference: https://comfyui-wiki.com/en/tutorial/advanced/hunyuan-image-to-video-workflow-guide-and-example

**Required nodes:**
- LoadImage (reference image)
- CLIPVisionEncode (process image)
- HunyuanVideo15ImageToVideo (or HunyuanVideo15ImageToVideo)
- VAEDecode
- SaveImage

**Workflow JSON would use:**
```python
{
    "1": {"class_type": "LoadImage", "inputs": {"image": "your_image.png"}},
    "2": {"class_type": "CLIPVisionEncode", "inputs": {"image": ["1", 0]}},
    "3": {"class_type": "HunyuanVideo15ImageToVideo", "inputs": {
        "image": ["2", 0],
        "positive": [...],
        "negative": [...],
        "width": 512, "height": 512, "length": 25
    }},
    "4": {"class_type": "VAEDecode", "inputs": {"samples": ["3", 0]}},
    "5": {"class_type": "SaveImage", "inputs": {"images": ["4", 0]}}
}
```

### Option 3: Frame-by-Frame + FFmpeg (Fallback)

If video models not working, generate frames and combine:

```python
# Generate N frames with slight prompt variations
for i in range(16):
    # Generate frame with seed variation
    # Save as frame_000.png, frame_001.png, etc.
```

Then combine:
```bash
cd ~/Documents/ComfyUI/output/
ffmpeg -y -framerate 8 -i "frame_%03d.png" -c:v libx264 -pix_fmt yuv420p output.mp4
```

**Parameters:**
- `-framerate 8` = 8 fps
- Adjust for speed feel

## Character Consistency

For consistent character across frames:
1. Use IPAdapter with face reference
2. Keep seed consistent
3. Use slight prompt variations only
4. Set low cfg (6-8)

## Image-to-Image (img2img)

For transforming reference images:
```python
{
    "LoadImage": "reference.png",
    "VAEEncode": "encode to latent",
    "KSampler": "denoise 0.4-0.7 (lower = more like original)",
    "VAEDecode": "decode",
    "SaveImage": "output"
}
```

**Denoise levels:**
- 0.1-0.3: Mostly original
- 0.4-0.6: Balanced
- 0.7-0.9: Mostly new creation

## API Reference

- **Base URL:** `http://localhost:8000`
- **Queue:** `POST /prompt` with workflow JSON
- **Status:** `GET /queue`
- **History:** `GET /history`

## Node Format

ComfyUI API uses "class_type" not "type":
```python
{
    "1": {
        "class_type": "CheckpointLoaderSimple",
        "inputs": {"ckpt_name": "sd_xl_base_1.0.safetensors"}
    },
    "2": {
        "class_type": "CLIPTextEncode",
        "inputs": {"text": "prompt", "clip": ["1", 1]}
    }
}
```

## Models

**Checkpoints:**
- sd_xl_base_1.0.safetensors
- sd_xl_refiner_1.0.safetensors
- uberRealisticPornMerge_v23Final.safetensors

**LoRA:**
- klein_snofs_v1.safetensors

**Video (need to download):**
- svd.safetensors (14 frames)
- svd_xt.safetensors (25 frames)

## Output Locations

Generated images: `~/Documents/ComfyUI/output/`

## Troubleshooting

**ComfyUI not running:**
- Start: `open /Applications/ComfyUI.app`

**GPU not used:**
- Check Settings → Performance

**Out of memory:**
- Reduce size (512x512)
- Use fewer steps
- Use smaller video length

**Video not generating:**
- Check if model downloaded
- Try frame-by-frame fallback
- Use lower fps for testing
