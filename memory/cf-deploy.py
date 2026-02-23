#!/usr/bin/env python3
"""Deploy and manage Cloudflare Memory Sync"""

import json
import os
import subprocess
import sys
import uuid
from pathlib import Path
from datetime import datetime

WORKER_PATH = Path(__file__).parent / "cf-worker"
CONFIG_FILE = Path(__file__).parent / "cf-config.json"

def load_config():
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE) as f:
            return json.load(f)
    return {}

def save_config(config):
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=2)

def run(cmd, cwd=None):
    result = subprocess.run(
        cmd, shell=True, capture_output=True, text=True, cwd=cwd or WORKER_PATH
    )
    return result.returncode, result.stdout, result.stderr

def generate_api_key():
    """Generate a secure API key"""
    return f"pmem_{uuid.uuid4().hex}"

def deploy():
    """Deploy the Cloudflare Worker"""
    print("🚀 Deploying Percy Memory Worker...")
    
    # Check wrangler
    code, out, err = run("wrangler --version")
    if code != 0:
        return False, "Wrangler not found"
    
    # Create KV namespace
    print("📦 Creating KV namespace...")
    code, out, err = run('wrangler kv:namespace create "percy-memory"')
    if code != 0 and "already exists" not in err.lower():
        # Try to get existing
        code, out, err = run('wrangler kv:namespace list')
        print(f"  (using existing KV: {out})")
    else:
        # Extract KV ID from output
        if "id =" in out:
            for line in out.split("\n"):
                if "id =" in line:
                    kv_id = line.split("id =")[1].strip()
                    print(f"  KV ID: {kv_id}")
                    break
    
    # Generate API key
    config = load_config()
    if "api_key" not in config:
        config["api_key"] = generate_api_key()
        print(f"  API Key: {config['api_key']}")
    
    # Update wrangler.toml with API key
    wrangler_path = WORKER_PATH / "wrangler.toml"
    content = wrangler_path.read_text()
    if "API_KEY" not in content or "your-secure" in content:
        content = content.replace(
            '# API_KEY = "your-secure-api-key-here"',
            f'API_KEY = "{config["api_key"]}"'
        )
        wrangler_path.write_text(content)
    
    # Deploy
    print("📤 Deploying worker...")
    code, out, err = run("wrangler deploy")
    if code != 0:
        return False, f"Deploy failed: {err}"
    
    # Get worker URL
    for line in out.split("\n"):
        if "https://" in line and "workers.dev" in line:
            worker_url = line.strip()
            config["worker_url"] = worker_url
            break
    
    config["deployed_at"] = datetime.now().isoformat()
    save_config(config)
    
    return True, f"Deployed! URL: {config.get('worker_url', 'check wrangler output')}"

def sync_to_cloudflare():
    """Sync local memory to Cloudflare KV"""
    config = load_config()
    
    if not config.get("worker_url"):
        print("❌ Worker not deployed yet. Run: python3 cf-deploy.py")
        return
    
    # Get local memory
    memory_file = Path(__file__).parent / "entity-memory.json"
    if not memory_file.exists():
        print("❌ No entity-memory.json found")
        return
    
    with open(memory_file) as f:
        memory = json.load(f)
    
    import requests
    
    # Upload each entity
    for key, value in memory.get("entities", {}).items():
        url = f"{config['worker_url']}/memory/{key}"
        response = requests.post(
            url,
            json={"key": key, "value": value},
            headers={"X-API-Key": config["api_key"]}
        )
        print(f"  Synced: {key}")
    
    print("✅ Sync complete")

def fetch_from_cloudflare():
    """Fetch memory from Cloudflare"""
    config = load_config()
    
    if not config.get("worker_url"):
        print("❌ Worker not deployed")
        return
    
    import requests
    
    response = requests.get(
        f"{config['worker_url']}/memory",
        headers={"X-API-Key": config["api_key"]}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2))
    else:
        print(f"❌ Error: {response.status_code}")

def search_cloudflare(query):
    """Search memory on Cloudflare"""
    config = load_config()
    
    if not config.get("worker_url"):
        print("❌ Worker not deployed")
        return
    
    import requests
    
    response = requests.get(
        f"{config['worker_url']}/search?q={query}",
        headers={"X-API-Key": config["api_key"]}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(json.dumps(data, indent=2))
    else:
        print(f"❌ Error: {response.status_code}")

# CLI
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  cf-deploy.py deploy         # Deploy worker to Cloudflare")
        print("  cf-deploy.py sync          # Sync local memory to cloud")
        print("  cf-deploy.py fetch        # Fetch memory from cloud")
        print('  cf-deploy.py search "query"')
    elif sys.argv[1] == "deploy":
        success, msg = deploy()
        print(msg)
    elif sys.argv[1] == "sync":
        sync_to_cloudflare()
    elif sys.argv[1] == "fetch":
        fetch_from_cloudflare()
    elif sys.argv[1] == "search" and len(sys.argv) > 2:
        search_cloudflare(sys.argv[2])
    else:
        print("Unknown command")
