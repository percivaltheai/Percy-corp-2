# Deployment Errors - Feb 22, 2026

## Cloudflare Pages vs Workers

**Problem:** Created a Cloudflare *Worker* instead of *Pages* project. Workers don't auto-build static sites - they run JavaScript/Workers code.

**Error:** Site showed "Hello world" instead of React app, even though correct `index.html` was in repo.

**Fix:** 
- Must create "Pages" project, not "Worker"
- For Pages: Build command + output directory works out of box
- For Workers: Need actual Worker.js code, not static site

**Prevention:** When deploying static sites (React/Vue/HTML), always use **Pages** product, not Workers.

---

## GitHub Large File Issue

**Problem:** `mission-control/node_modules/@next/swc-darwin-arm64/next-swc.darwin-arm64.node` (121MB) was committed to repo. Exceeds GitHub's 100MB limit.

**Attempted fixes:**
1. `git filter-repo` - worked locally but GitHub still had old commits
2. Force push rejected - GitHub checks entire history

**Final Fix:**
- Created new repo: `Percy-Corp-2`
- Clean commit history
- Added `*.node` to `.gitignore`

---

## Browser Automation Limitations

**Problem:** Tried to use browser to configure Cloudflare - slow, error-prone, session timeouts.

**Better alternatives:**
- Cloudflare API (wrangler CLI)
- GitHub integration (auto-deploy on push)
- Direct dashboard (faster than automation)

**Prevention:** Don't automate dashboards when APIs/CLIs exist.
