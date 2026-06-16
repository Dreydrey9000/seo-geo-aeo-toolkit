# dreythomas-seo-tool

A live web tool: paste a video transcript, a topic, or a tweet, and get it optimized for **SEO + GEO + AEO** — keywords, AI-citation lines, buyer questions, hooks, a crawlable long-form version with FAQ schema, and ready-to-post copy.

- **Live:** https://seo.dreythomas.com (Cloudflare Pages) — verified 200 end-to-end 2026-06-16.
- **Front-end:** `public/index.html` (no build step, no dependencies — vanilla HTML/CSS/JS with an inline markdown renderer)
- **Backend:** `functions/api/generate.js` (Cloudflare Pages Function) — calls the Google Gemini API server-side. The API key is **never** in the browser.
- **Example text-home page:** `public/instead-of-hiring.html` (the GEO crawl target — `/instead-of-hiring`)

## How it works
```
browser (form + paste)  ->  POST /api/generate  ->  Gemini 2.5 Flash  ->  9-section package  ->  rendered on page
```

## Deploy
```bash
cd "~/My Apps/dreythomas-seo-tool"
# 1. set the server-side key (one time) — pipe, never echo the value into history
printf '%s' "$GEMINI_API_KEY" | wrangler pages secret put GEMINI_API_KEY --project-name dreythomas-seo-tool
# 2. deploy
wrangler pages deploy public --project-name dreythomas-seo-tool --branch main
# 3. custom domain (one time) — this wrangler build has no `pages domain` cmd, so use the API:
#    POST /accounts/{acct}/pages/projects/dreythomas-seo-tool/domains  {"name":"seo.dreythomas.com"}
#    + a proxied CNAME  seo -> dreythomas-seo-tool.pages.dev  in the dreythomas.com zone
```

## Cost + safety (read before sharing the URL widely)
- **Cost: $0.** Runs on the Gemini free tier (`GEMINI_API_KEY`). No per-call charge, no Anthropic credits needed — this is why it's on Gemini, not Claude (Drey's free-first rule).
- **In code now:** input length cap (12k chars), output cap (16k tokens), graceful errors. Gemini "thinking" tokens are disabled so the full 9-section answer always fits.
- **Free-tier rate limits are the natural circuit breaker** — Gemini caps requests-per-minute/day on its side, so a runaway can't bill you. It can still get throttled (503/429) under abuse.
- **App rate limiting (fast-follow):** per-IP + daily caps are coded in `functions/api/generate.js` but need a KV namespace bound as `RATE_KV`. The current Cloudflare token lacks KV permission; grant it, create the namespace, bind it, and the limits activate automatically.
- Keep the URL semi-private (share with specific people) until app rate limiting is on.

## Models
- `gemini-2.5-flash` (free tier, strong quality for this task). Swap the `GEMINI_MODEL` constant in the function to change. To move to Claude later, repoint the fetch to the Anthropic Messages API and set `ANTHROPIC_API_KEY` (needs funded credits).

## Changelog
- [2026-06-16]: Repointed backend from Claude (Sonnet 4.6, $0 credits) to Gemini 2.5 Flash free tier so the public tool runs at $0. Live + verified at seo.dreythomas.com.
- [2026-06-16]: Built. Functional SEO+GEO+AEO generator. Frameworks adapted from the AiCMO Autonomous Marketing Engine (Apache-2.0).
