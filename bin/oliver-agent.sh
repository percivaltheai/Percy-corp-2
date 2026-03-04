#!/usr/bin/env python3
"""
Oliver - Creative Sub-Agent
Handles image/video generation via ComfyUI and local tools
"""
import subprocess
import json
import os
from pathlib import Path

COMFY_PATH = Path.home() / "Documents/ComfyUI"
API_URL = "http://localhost:8188"

def is_comfy_running():
    """Check if ComfyUI is running"""
    try:
        import requests
        r = requests.get(f"{API_URL}/system_stats", timeout=2)
        return r.status_code == 200
    except:
        return False

def start_comfy():
    """Start ComfyUI if not running"""
    if not is_comfy_running():
        print("Starting ComfyUI...")
        subprocess.Popen(
            ["./run_mac.sh"],
            cwd=str(COMFY_PATH),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        print("ComfyUI starting (wait 30s for load)")

def generate_image(prompt, workflow="simple"):
    """Generate image via ComfyUI API"""
    if not is_comfy_running():
        start_comfy()
        return "ComfyUI starting..."
    
    # Load workflow
    wf_path = COMFY_PATH / "user" / "default" / f"{workflow}_sdxl_workflow.json"
    if not wf_path.exists():
        wf_path = COMFY_PATH / "workflows" / f"{workflow}_sdxl_workflow.json"
    
    # TODO: API call to queue prompt
    return "Not implemented yet - use ComfyUI directly"

def main():
    import sys
    task = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "No task"
    print(f"Oliver received: {task}")
    
    if "start" in task or "comfy" in task:
        start_comfy()
    elif "check" in task:
        print(f"ComfyUI running: {is_comfy_running()}")

if __name__ == "__main__":
    main()
