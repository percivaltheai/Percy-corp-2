# Cloudflare Memory Sync (Setup Required)

## What's Needed

To deploy the Cloudflare Worker, you'll need:

1. **Cloudflare account** - sign up at cloudflare.com
2. **Wrangler authenticated** - run `wrangler login`
3. **Run deploy** - see commands below

## Setup

```bash
# 1. Authenticate with Cloudflare
wrangler login

# 2. Deploy the worker
cd ~/.openclaw/workspace/memory
python3 cf-deploy.py deploy

# 3. Sync local memory to cloud
python3 cf-deploy.py sync

# 4. Test access
python3 cf-client.py get
python3 cf-client.py search "twitter"
```

## Security

- API key generated on first deploy
- Key stored in `cf-config.json` (never commit this!)
- Worker requires `X-API-Key` header for all requests

## Endpoints (after deploy)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/memory` | Get all memory |
| GET | `/memory/:key` | Get specific key |
| POST | `/memory` | Set memory `{key, value}` |
| GET | `/search?q=query` | Search |
| GET | `/health` | Health check |

## Configuration

After deploy, config is saved to `cf-config.json`:
```json
{
  "worker_url": "https://percy-memory.yourname.workers.dev",
  "api_key": "pmem_xxxxxxxxxxxx",
  "deployed_at": "2026-02-23T..."
}
```

---

⚠️ **IMPORTANT:** Never commit `cf-config.json` to GitHub! It's in `.gitignore` but double-check.
