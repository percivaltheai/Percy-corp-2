#!/usr/bin/env python3
"""Cloudflare Memory Client - Access memory from anywhere

This module provides a client for the Percy Memory Cloudflare Worker.
Before using, deploy the worker with: python3 cf-deploy.py deploy
"""

import json
import os
import sys
from pathlib import Path
from typing import Any, Optional

# Try to load config
CONFIG_FILE = Path(__file__).parent / "cf-config.json"

def load_config():
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE) as f:
            return json.load(f)
    return {}

class MemoryClient:
    """Client for Percy Memory Cloudflare Worker"""
    
    def __init__(self, config: dict = None):
        self.config = config or load_config()
        self.base_url = self.config.get("worker_url")
        self.api_key = self.config.get("api_key")
        
        if not self.base_url or not self.api_key:
            raise ValueError("Cloudflare memory not configured. Run cf-deploy.py deploy")
    
    def _request(self, method: str, endpoint: str, data: Any = None:
        import) -> dict requests
        
        url = f"{self.base_url}{endpoint}"
        headers = {"X-API-Key": self.api_key}
        
        if data:
            response = requests.request(method, url, json=data, headers=headers)
        else:
            response = requests.request(method, url, headers=headers)
        
        if response.status_code >= 400:
            raise Exception(f"Request failed: {response.status_code} - {response.text}")
        
        return response.json() if response.content else {}
    
    def get_all(self) -> dict:
        """Get all memory"""
        return self._request("GET", "/memory")
    
    def get(self, key: str) -> Any:
        """Get a specific memory key"""
        return self._request("GET", f"/memory/{key}")
    
    def set(self, key: str, value: Any) -> dict:
        """Set a memory key"""
        return self._request("POST", "/memory", {"key": key, "value": value})
    
    def search(self, query: str) -> dict:
        """Search memory"""
        return self._request("GET", f"/search?q={query}")
    
    def health(self) -> bool:
        """Check if worker is healthy"""
        import requests
        try:
            resp = requests.get(f"{self.base_url}/health")
            return resp.status_code == 200
        except:
            return False


def get_client() -> Optional[MemoryClient]:
    """Get a Cloudflare memory client if configured"""
    config = load_config()
    if config.get("worker_url") and config.get("api_key"):
        return MemoryClient(config)
    return None


# CLI
if __name__ == "__main__":
    client = get_client()
    
    if not client:
        print("❌ Cloudflare memory not configured")
        print("   Run: python3 cf-deploy.py deploy")
        sys.exit(1)
    
    if len(sys.argv) < 2:
        print("Cloudflare Memory Client")
        print("=" * 30)
        print(f"Worker: {client.base_url}")
        print(f"Health: {'✅' if client.health() else '❌'}")
        print("\nCommands:")
        print("  cf-client.py get           # Get all memory")
        print("  cf-client.py get user      # Get user entity")
        print('  cf-client.py search "x"   # Search')
    elif sys.argv[1] == "get":
        if len(sys.argv) > 2:
            result = client.get(sys.argv[2])
            print(json.dumps(result, indent=2))
        else:
            result = client.get_all()
            print(json.dumps(result, indent=2))
    elif sys.argv[1] == "search" and len(sys.argv) > 2:
        result = client.search(sys.argv[2])
        print(json.dumps(result, indent=2))
