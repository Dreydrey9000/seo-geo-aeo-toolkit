// Cloudflare Pages Function: POST /api/generate
// Takes content + brand fields, calls Gemini with the SEO+GEO+AEO master prompt,
// returns the optimized package. API key stays server-side (env secret).
// Protections: per-IP rate limit + global daily request cap + input length cap.
//
// Provider: Google Gemini free tier (GEMINI_API_KEY). Chosen over Anthropic so the
// public tool runs at $0 (free-first rule). Swap GEMINI_MODEL to change models.

const GEMINI_MODEL = "gemini-2.5-flash";
const MAX_TOKENS = 16000;       // output cap (Gemini bills none on free tier; high so 9 sections fit)
const MAX_CONTENT = 12000;      // chars of pasted content
const MAX_FIELD = 600;          // chars per short field
const IP_LIMIT = 12;            // requests per IP per hour
const DAILY_CAP = 250;          // total requests per day (abuse circuit breaker)

const clip = (s, n) => (typeof s === "string" ? s.slice(0, n).trim() : "");

function buildPrompt(b) {
  const plats = b.platforms && b.platforms.length ? b.platforms.join(", ") : "Instagram, LinkedIn, X / Twitter, YouTube";
  return `You are a senior SEO + GEO + AEO strategist. Optimize the content I give you so it (1) gets FOUND in search, (2) gets CITED inside AI answers, and (3) wins the exact buying questions my audience asks AI.

Definitions: SEO = found when people search. GEO = cited inside the answer AI gives (ChatGPT, Claude, Perplexity, Google AI Overviews). AEO = GEO aimed at buying questions.

=== ABOUT ME ===
- Brand / name: ${b.brand || "[brand]"}
- What I sell: ${b.offer || "[offer]"}
- Who it's for (ICP): ${b.icp || "[audience + their pain]"}
- Search I most want to own: ${b.kw || "[money keyword]"}
- Competitors / alternatives: ${b.comp || "(none given)"}
- Voice rules: ${b.voice || "(none given)"}
- Platforms: ${plats}

=== INPUT (${b.itype || "content"}) ===
${b.content}
=== END INPUT ===

Run all 9 steps and return them as clean Markdown under these exact headers:

## 0. READ
Input type, the ONE core idea (one sentence), the audience, the offer, the funnel stage (cold pain / warm solution / hot buyer).

## 1. SEO
1 primary keyword + 5 to 8 secondary keywords/angles. Then a searchable title, a strong first line, on-screen text suggestions, and image alt-text. Respect my voice rules.

## 2. AEO
5 to 8 buyer questions (the exact words people type into AI) this content can answer. Pick the ONE primary question to win. If relevant, give a comparison angle and be honest about when the alternative wins.

## 3. ANSWER BLOCK
The direct, quotable answer to the primary question in the first 50 words. Self-contained, no filler, names the offer naturally.

## 4. CITATION-BAIT
8 to 10 sentences engineered to be quoted verbatim by an AI. Each self-contained, factual, 15 to 35 words, names the brand/offer naturally. No fluff. Numbered list.

## 5. HOOKS
If social, 8 hooks using these combos (about 2 each): Curiosity x Question, Urgency/FOMO x Problem-Solution, Social-Proof x Contrarian, Aspiration x first-person story, Identity x Problem-Solution. Label each. Lead with the audience's pain.

## 6. TEXT-HOME VERSION
The part AI crawls and cites. A TL;DR up top, H2 headers phrased as the buyer's real questions, a key-takeaways list, a 5-question FAQ, and a valid JSON-LD FAQPage schema block in a code fence.

## 7. PLATFORM PACK
Ready-to-post copy for each platform I named: caption, tweet, LinkedIn post, YouTube title + description. Each carries the hook, one citation-bait line, and a clear CTA. Obey my voice rules.

## 8. SCORE & NEXT
Rate AI-citation readiness 1 to 10 for ChatGPT, Perplexity, and Google AI Overviews with a one-line reason each. List what is missing. Then: AI cites crawlable TEXT not social captions, so tell me exactly where to publish the TEXT-HOME version. End with a 15-minute monthly check.

Rules: be specific, not generic. No fabricated stats. Obey my voice rules in every piece of copy.`;
}

async function rateLimited(env, ip, dayKey) {
  if (!env.RATE_KV) return false; // degrade gracefully if binding missing
  try {
    const ipKey = `ip:${ip}:${dayKey}:${new Date().getUTCHours()}`;
    const ipCount = parseInt((await env.RATE_KV.get(ipKey)) || "0", 10);
    if (ipCount >= IP_LIMIT) return "ip";
    const dayCount = parseInt((await env.RATE_KV.get(`day:${dayKey}`)) || "0", 10);
    if (dayCount >= DAILY_CAP) return "day";
    // increment (best-effort, 1h / 26h TTL)
    await env.RATE_KV.put(ipKey, String(ipCount + 1), { expirationTtl: 3600 });
    await env.RATE_KV.put(`day:${dayKey}`, String(dayCount + 1), { expirationTtl: 93600 });
    return false;
  } catch (e) {
    return false; // never block on KV errors
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const json = (obj, status = 200) =>
    new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

  if (!env.GEMINI_API_KEY) return json({ ok: false, error: "Server is not configured yet (missing API key)." }, 503);

  let body;
  try { body = await request.json(); } catch (e) { return json({ ok: false, error: "Bad request." }, 400); }

  const content = clip(body.content, MAX_CONTENT);
  if (!content || content.length < 8) return json({ ok: false, error: "Paste some content first (a transcript, topic, or tweet)." }, 400);

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const dayKey = new Date().toISOString().slice(0, 10);
  const limited = await rateLimited(env, ip, dayKey);
  if (limited === "ip") return json({ ok: false, error: "You have hit the hourly limit. Try again in a bit." }, 429);
  if (limited === "day") return json({ ok: false, error: "The tool has hit today's usage cap. Try again tomorrow." }, 429);

  const fields = {
    brand: clip(body.brand, MAX_FIELD),
    offer: clip(body.offer, MAX_FIELD),
    icp: clip(body.icp, MAX_FIELD),
    kw: clip(body.kw, MAX_FIELD),
    comp: clip(body.comp, MAX_FIELD),
    voice: clip(body.voice, MAX_FIELD),
    itype: clip(body.itype, 60),
    platforms: Array.isArray(body.platforms) ? body.platforms.slice(0, 6).map((p) => clip(p, 30)) : [],
    content,
  };

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: buildPrompt(fields) }] }],
        generationConfig: {
          maxOutputTokens: MAX_TOKENS,
          temperature: 0.8,
          // Disable "thinking" tokens so the full visible answer isn't eaten by the budget.
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return json({ ok: false, error: `AI service error (${res.status}).`, detail: t.slice(0, 300) }, 502);
    }
    const data = await res.json();
    const cand = (data.candidates || [])[0];
    const out = ((cand && cand.content && cand.content.parts) || [])
      .map((p) => p.text || "")
      .join("")
      .trim();
    if (!out) return json({ ok: false, error: "Empty response from the AI. Try again." }, 502);
    return json({ ok: true, output: out });
  } catch (e) {
    return json({ ok: false, error: "Something went wrong reaching the AI. Try again." }, 502);
  }
}
