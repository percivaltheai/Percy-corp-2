# Clawker Website Tech Notes

## Live Site
- **URL:** https://clawker.net
- **Worker:** percy-corp-2
- **Platform:** Cloudflare Workers + Static Assets

## Deployment

### Source Code
```
~/Percy-Corp/clawker-worker/
├── index.html          # Main site
└── wrangler.toml      # Cloudflare config
```

### Deploy Command
```bash
cd ~/Percy-Corp/clawker-worker
wrangler deploy
```

### Wrangler Config (wrangler.toml)
```toml
name = "percy-corp-2"
compatibility_date = "2026-02-23"

[[routes]]
pattern = "clawker.net"
custom_domain = true

[assets]
directory = "."
```

## To Update Site

1. Edit `~/Percy-Corp/clawker-www/index.html`
2. Copy to worker folder: `cp ~/Percy-Corp/clawker-www/index.html ~/Percy-Corp/clawker-worker/`
3. Deploy: `cd ~/Percy-Corp/clawker-worker && wrangler deploy`

## Custom Domain
- Domain: clawker.net (owned in Cloudflare)
- Route: custom_domain = true
- Auto-provisions SSL

## Key Lessons
- Workers with static assets = simpler than Pages for single-page sites
- wrangler.toml needs custom_domain = true for domain routing
- Keep deploy folder minimal (exclude venv/, node_modules/)

## Memory
- Updated: 2026-02-23
- Synced to: Local JSON, Cloudflare KV, Obsidian, GitHub
