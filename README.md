# seo-geo-aeo-toolkit

Paste in a piece of content — a video transcript, a tweet, a topic, raw notes — and get back everything you need to make it **rank in search AND get quoted by AI**. This repo bundles the whole kit: a live web tool, two copy-paste AI prompts, and an installable Claude Code skill. Pick whichever fits how you like to work.

---

## The three things this optimizes for (plain English)

- **SEO = Search Engine Optimization.** Get *found* when someone searches (Google, plus in-app search on IG, TikTok, YouTube).
- **GEO = Generative Engine Optimization.** Get *quoted inside the answer* an AI gives (ChatGPT, Claude, Perplexity, Google AI Overviews).
- **AEO = Answer Engine Optimization.** Same idea as GEO, but pointed at the exact *buying* questions people ask ("what's the best way to X?"). GEO and AEO overlap, so the tools run them together.

Every tool here produces the same **9-section package**: input read-out, SEO keywords + titles, the buyer questions to win (AEO), a quotable 50-word answer block, 8–10 "citation-bait" lines built to be lifted verbatim by an AI, social hooks, a crawlable long-form version with FAQ schema, ready-to-post copy per platform, and a citation-readiness score with next steps.

---

## Which one do I use?

| Tool | Best for | Setup | Where it runs |
|------|----------|-------|---------------|
| **Web tool** | Fast, no-thinking-required. Paste, click, copy the result. | None — just open the URL | In your browser |
| **Master prompt** | You already use ChatGPT or Claude and want to do it there. | Paste once (neutral version: fill in the brackets) | Any AI chat |
| **Claude Code skill** | You live in Claude Code and want it on tap for any client. | Copy the folder into `~/.claude/skills/` once | Inside Claude Code |

Quick rule: **Isabella → start with the web tool** (her instance has saved client profiles). Reach for the neutral master prompt or the skill when you want to run it somewhere else.

---

## 1. The live web tool

Paste your content into the box, hit generate, and the full 9-section package renders right on the page. No login, no install, nothing to set up. It runs on Google Gemini's free tier, so it costs **$0** to use.

There are two instances:

- **Drey's personal one** — https://seo.dreythomas.com
  Drey's brand, voice, and audience are baked in. Built for his content only.

- **The general one (for Isabella and her clients)** — https://seo-geo-aeo-tool.pages.dev
  Brand-neutral, with a **saved-profile switcher**: keep one profile per client (their brand, audience, offer, voice rules), then switch between them from a dropdown. Set up a client once, reuse it every time you make content for them.

**Who it's for:** anyone who wants the result without touching code or AI prompts. This is the default starting point for Isabella and the people she shares it with.

---

## 2. master-prompts/drey-master-prompt.md

A single big prompt with **Drey's brand baked in** — his audience, his money keyword, his voice rules (no hashtags, no dashes, lead with the burnout angle). Copy the whole file, paste it into any AI (ChatGPT, Claude, Gemini), then paste your content under it. Out comes the 9-section package in Drey's voice.

**Who it's for:** Drey, or anyone making content *for* Drey's brand.

---

## 3. master-prompts/neutral-master-prompt.md

The same engine, but **brand-neutral**. It has `[BRACKETS]` you fill in — your brand name, your audience, your offer, your voice rules — then paste it into any AI followed by your content.

**Who it's for:** **Isabella and her clients.** Fill in the brackets once per client (keep a saved copy per client), and you've got a custom optimizer for each one without needing the web tool or Claude Code.

---

## 4. skill/ — the Claude Code skill (`seo-geo-aeo-generator`)

A portable **Claude Code skill** that runs this whole pipeline from *inside* Claude Code. A "skill" is just a folder Claude Code reads — drop it in the right place and Claude can run it on command for any client.

**How to install a Claude Code skill** (about 10 seconds):

1. Copy the `skill/` folder into your skills directory:
   ```bash
   cp -R skill ~/.claude/skills/seo-geo-aeo-generator
   ```
   (The skills folder is `~/.claude/skills/`. If it doesn't exist yet, create it.)
2. Restart Claude Code so it picks up the new skill.
3. Trigger it by saying things like *"seo this,"* *"geo this,"* *"optimize my transcript,"* or `/seo-geo-aeo`.

**Who it's for:** Isabella (or anyone) who uses Claude Code and wants to run optimization for any client right where they already work, no browser tab needed.

---

## 5. web-tool/ — the source for the web tool

This is the actual code behind the live tool, so anyone can deploy their own copy. It's a **Cloudflare Pages** project with two parts:

- `public/` — a plain static folder (the page you see and type into). No build step, no dependencies.
- `functions/api/generate.js` — a Cloudflare Pages Function (server-side code) that does the AI call.

**How the AI call stays safe and free:** the function calls **Google Gemini** on the server side using the free tier, so it costs **$0**. The Gemini API key lives only on the server as a secret — it is **never** sent to the browser, so nobody can grab it by viewing the page source.

```
browser (paste content) → POST /api/generate → Google Gemini (free tier) → 9-section package → rendered on the page
```

### Deploy your own

1. Install Cloudflare's CLI (`npm install -g wrangler`) and log in (`wrangler login`).
2. Deploy the static site:
   ```bash
   wrangler pages deploy public
   ```
3. Set your Gemini key as a server-side secret (never commit it, never paste it into the page):
   ```bash
   wrangler pages secret put GEMINI_API_KEY
   ```

That's it — the tool is live and the key stays server-side.

### Where to get a free Gemini API key

Go to **Google AI Studio** (aistudio.google.com), sign in with a Google account, and create an API key. The free tier is plenty for this tool — no card, no per-call charge.

### Built-in rate limiting (turns on automatically)

The function already includes **per-IP and daily rate-limit code** so one person (or a bot) can't hammer the tool. It stays dormant until you bind a Cloudflare **KV namespace** named `RATE_KV` to the project. Create that namespace, bind it as `RATE_KV`, and the limits activate on their own — no code change needed. Until then, Gemini's own free-tier caps act as a natural backstop.

**Who it's for:** anyone who wants to host their own private copy of the tool.

---

## A note on keys

**No API keys are stored anywhere in this repo.** The Gemini key is set as a server-side secret on your own Cloudflare deployment and never appears in the code or the browser.

---

## Attribution

The SEO/GEO/AEO frameworks here are adapted from the open-source **AiCMO Autonomous Marketing Engine**, which is licensed under the **Apache License 2.0**. That license is preserved and credited per its terms; this toolkit re-uses and adapts AiCMO's optimization frameworks while remaining a separate work.

---

## Repo

https://github.com/Dreydrey9000/seo-geo-aeo-toolkit
