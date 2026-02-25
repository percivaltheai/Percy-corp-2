# Twitter/X - CRITICAL Rules

## DO NOT use browser automation for posting

X actively bans accounts that use browser automation (headless browsers, Selenium, Playwright, etc.). Using the browser to post is a **last resort only** — your account can be suspended.

## Use API instead

- **Tweepy OAuth 1.0a** — works but API is restricted (no v2 access)
- **Twitter API v2** — needs proper elevated access
- **Third-party tools** — Buffer, Typefully, etc.

## If browser is the only option

- Never use headless mode
- Use a real logged-in session
- Limit frequency (1-2 posts max per day)
- Rotate sessions if possible
- **STOP immediately if login is challenged**

## Current status

- API: ❌ Restricted (OAuth 1.0a works but can't post)
- Browser: ⚠️ Works but HIGH RISK
- Alternative: Need to apply for Twitter API v2 elevated access

---

Last updated: 2026-02-23
