# Changelog — seo-geo-aeo-toolkit

## [2026-06-16] (later same day)
### Added
- **Master Prompts tab** in the web tool: a library of 5 copy-paste, plug-into-any-AI prompts (SEO + GEO + AEO, Ideal Client (ICP) Builder, Brand Voice & Positioning Builder, Viral Hook Generator, Content Repurposer). Brand-neutral, fill-the-brackets. Lives in public/prompts.js, rendered as a second tab next to the Generator. Linkable at /#prompts.
- master-prompts/ now also ships the 4 new prompts as standalone .md files.

## [2026-06-16]
### Added
- **Initial public release.** A complete SEO + GEO + AEO toolkit in four pieces:
  - **Live web tool** (paste content, get the full 9-section package on the page). Two instances:
    - Drey's personal one: https://seo.dreythomas.com
    - General one for any brand or client (with a saved-profile switcher): https://seo-geo-aeo-tool.pages.dev
  - **`master-prompts/drey-master-prompt.md`** — Drey's brand baked in, paste into any AI.
  - **`master-prompts/neutral-master-prompt.md`** — brand-neutral, fill the brackets, paste into any AI.
  - **`skill/seo-geo-aeo-generator/`** — a portable Claude Code skill, brand-neutral, multi-client.
  - **`web-tool/`** — the Cloudflare Pages source (static `public/` + `functions/api/generate.js`).
- **Multi-client profile switcher** in the web tool: keep one saved profile per client, switch any time. Auto-seeds Drey's brand on `dreythomas.com`, a blank "Client 1" everywhere else.
- **Gemini free-tier backend** (`gemini-2.5-flash`) so the tool runs at $0. API key stays server-side, never in the browser.
### Notes
- Content frameworks adapted from the open-source AiCMO Autonomous Marketing Engine (Apache-2.0).
- No API keys are stored in this repo. The web tool reads `GEMINI_API_KEY` from a server-side secret.
- App-level per-IP / daily rate limiting is coded in `web-tool/functions/api/generate.js` but inactive until a `RATE_KV` namespace is bound. The Gemini free-tier limit is the natural circuit breaker until then.
