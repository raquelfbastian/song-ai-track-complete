// contentService.js — Track A (Node.js) — SOLVED

const llm = require('./llmService');

const BRAND_VOICE = `You write product content for Kape Ko, a Filipino single-origin coffee brand.
Brand voice rules:
1. Warm and proud. Celebrate the farmer and the region first.
2. Culturally grounded. Tagalog words welcome — don't translate.
3. BANNED: "artisanal", "premium", "craft", "world-class", "finest quality", "carefully selected", "sustainably sourced".
4. Specific over vague. Use altitude, process, variety — not "specialty coffee".
5. Reader: urban Filipino professional, 28-40, Metro Manila.
6. Every piece of content must name the farmer at least once.
7. Respond with valid JSON only. No markdown. No explanation.`;

async function enrichProduct(product) {
  console.log(`📝 ContentService: enriching → ${product.name}`);
  const prompt = buildContentPrompt(product);
  let rawJson = await llm.complete(BRAND_VOICE, prompt);
  rawJson = rawJson.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  return { ...product, ...JSON.parse(rawJson) };
}

function buildContentPrompt(p) {
  return `Generate product content for:
Name: ${p.name} | Category: ${p.category} | Origin: ${p.origin} | Farmer: ${p.farmer}
Altitude: ${p.altitude} | Variety: ${p.variety} | Process: ${p.process} | Roast: ${p.roast}
Flavors: ${(p.flavor_notes||[]).join(', ')} | Price: PHP ${p.price_php} / PHP ${p.sub_price_php}/mo
Best for: ${p.best_for}

Return JSON with EXACTLY:
{
  "seo_title": "60 chars max, include Kape Ko",
  "meta_description": "155 chars max, include price",
  "product_description": "3 paragraphs: farmer, growing, cup",
  "marketing_hook": "1 bold sentence, no banned words",
  "feature_bullets": ["5 specific verifiable claims"],
  "pairing_suggestion": "1 Filipino food or morning ritual"
}`;
}

module.exports = { enrichProduct };
