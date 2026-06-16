# Changelog — dreythomas-seo-tool

## [2026-06-16]
### Added
- **Functional SEO + GEO + AEO generator website — LIVE at https://seo.dreythomas.com.** Paste a transcript / topic / tweet → the AI returns the full 9-section package on the page (SEO keywords, AEO buyer questions, GEO answer block + citation-bait, hooks, crawlable text-home version + JSON-LD FAQ schema, per-platform pack, citation score). Why: Drey asked for a real working website that does the optimization for him, not just a prompt builder.
- `functions/api/generate.js` — Cloudflare Pages Function calling the AI server-side. API key never reaches the browser.
- `public/index.html` — vanilla front-end, inline markdown renderer (zero dependencies, no CDN, no CSP risk). Prefills Drey's brand; editable + saved per-browser so Isabella can use it for her own brand.
- `public/instead-of-hiring.html` — the GEO text-home crawl target (valid JSON-LD FAQPage).
- `seo.dreythomas.com` custom domain attached (Cloudflare Pages domain + proxied CNAME in the dreythomas.com zone). Verified 200 end-to-end (page + /api/generate, all 9 sections).
### Changed
- **Backend repointed from Claude (Sonnet 4.6) to Gemini 2.5 Flash free tier.** The Anthropic key wired in had $0 credits, so generation 400'd. Gemini free tier makes the public tool run at **$0** (Drey's free-first rule) with no billing risk. "Thinking" tokens disabled + 16k output cap so the full 9-section answer always fits. To move back to Claude later, repoint the fetch and set a funded `ANTHROPIC_API_KEY`.
### Known follow-ups
- KV-based app rate limiting is coded but inactive — the current Cloudflare token lacks KV permission. Bind `RATE_KV` to activate per-IP + daily caps. Until then the Gemini free-tier limits are the natural circuit breaker.
