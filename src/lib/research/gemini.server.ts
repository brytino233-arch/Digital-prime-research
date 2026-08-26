import type { ResearchQuery, ResearchResult } from "./types";

type GeminiScoreBreakdown = {
  digitalNeed?: unknown;
  abilityToPay?: unknown;
  decisionMakerAccess?: unknown;
  easeOfProof?: unknown;
  activityGrowth?: unknown;
  brandQuality?: unknown;
  offerFit?: unknown;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

const GEMINI_MODEL = "gemini-3.6-flash";
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function analyzeResearch(
  query: ResearchQuery,
  sources: Array<{
    title: string;
    url: string;
    content: string;
  }>,
): Promise<ResearchResult[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const prompt = `
You are the research analyst for Digital Prime.

Your job is to identify REAL businesses and evaluate their potential as prospects for Digital Prime.

RESEARCH REQUEST

Location: ${query.location}
Business type: ${query.businessType}
Goal: ${query.goal}
Requested count: ${query.count}

STRICT EVIDENCE RULES

1. Use ONLY the supplied web sources.
2. Never invent a business.
3. Never invent contact information.
4. Never invent phone numbers, emails, websites, social accounts, owners, managers, prices, services, locations, or business facts.
5. Do not claim an owner or decision maker unless the supplied sources support it.
6. Do not treat a listicle or directory page as the business's own website.
7. A business must be reasonably identifiable from the supplied evidence.
8. If something cannot be verified, use null, an empty array, or "Not verified".
9. Confidence must reflect the quality of the evidence.
10. Be conservative when evidence is weak.
11. The opportunity score is an INTERNAL HEURISTIC, not a probability.
12. Do not describe the score as a probability, likelihood percentage, or guarantee.
13. Every factual claim should be traceable to one of the supplied sources.
14. Prefer businesses with evidence of an actual digital opportunity rather than simply famous or attractive businesses.

DIGITAL PRIME OPPORTUNITY SCORE

Score every business using these exact maximums:

digitalNeed: 0-20
abilityToPay: 0-20
decisionMakerAccess: 0-15
easeOfProof: 0-15
activityGrowth: 0-10
brandQuality: 0-10
offerFit: 0-10

TOTAL POSSIBLE SCORE: 100

SCORING GUIDANCE

digitalNeed:
How obvious are the business's digital/customer-journey problems?

Examples of evidence that can increase this score:
- manual booking
- phone-only booking
- WhatsApp-only booking
- poor website experience
- missing website
- unclear service information
- fragmented customer journey
- difficult discovery-to-booking flow
- missing online ordering
- missing customer portal
- weak information architecture

Do NOT give a high score merely because a business does not have a website.
There must be a meaningful digital opportunity.

abilityToPay:
Use evidence such as:
- business scale
- premium positioning
- multiple locations
- large facilities
- established operations
- premium pricing
- visible investment
- high-end location
- substantial customer base
- strong commercial positioning

Do not assume financial information that is not supported.

decisionMakerAccess:
Give higher scores only when there is evidence of:
- reachable owner
- founder
- manager
- official contact route
- named decision maker
- clearly accessible business contact

If there is no evidence of access to a decision maker, keep this score conservative.

easeOfProof:
How easily can Digital Prime demonstrate tangible value?

Examples:
- booking flow can be improved
- website conversion can be demonstrated
- digital menu can be demonstrated
- customer journey can be redesigned
- online ordering can be demonstrated
- automated inquiry flow can be demonstrated

activityGrowth:
Use observable evidence of:
- active business operations
- recent activity
- expansion
- multiple locations
- events
- active social presence
- new services
- growth signals

brandQuality:
Evaluate the existing brand maturity based only on observable evidence.

offerFit:
How strongly does the actual problem match Digital Prime's capabilities?

IMPORTANT:
Do not inflate every category.
A business can be premium but still have a low digitalNeed.
A business can have a strong digitalNeed but low decisionMakerAccess.
A business can have strong brandQuality but poor offerFit.

Return JSON ONLY.

Use this exact structure:

{
  "results": [
    {
      "name": "string",
      "industry": "string",
      "location": "string",
      "website": "string or null",
      "instagram": "string or null",
      "facebook": "string or null",
      "tiktok": "string or null",
      "phone": "string or null",
      "email": "string or null",
      "operatingStatus": "string",
      "services": [],
      "confidence": "High | Medium | Low",

      "scoreBreakdown": {
        "digitalNeed": 0,
        "abilityToPay": 0,
        "decisionMakerAccess": 0,
        "easeOfProof": 0,
        "activityGrowth": 0,
        "brandQuality": 0,
        "offerFit": 0
      },

      "strongestOpportunity": "string",
      "bestContactChannel": "string",
      "whyItMatters": "string",

      "decisionMaker": {
        "name": "string",
        "role": "string",
        "publicProfile": "string",
        "contactRoute": "string",
        "confidence": "High | Medium | Low"
      },

      "evidence": [
        {
          "sourceName": "string",
          "sourceUrl": "string",
          "sourceType": "string",
          "claim": "string",
          "classification": "VERIFIED FACT | OBSERVATION | INFERENCE",
          "confidence": "High | Medium | Low",
          "dateChecked": "YYYY-MM-DD"
        }
      ],

      "digitalPresence": [
        {
          "label": "string",
          "status": "string",
          "note": "string"
        }
      ],

      "customerJourney": [
        {
          "stage": "DISCOVERY | INFORMATION | DECISION | BOOKING | CONFIRMATION",
          "current": "string",
          "evidence": "string",
          "friction": "Low | Medium | High | Not verified"
        }
      ],

      "bottlenecks": [
        {
          "rank": 1,
          "problem": "string",
          "evidence": "string",
          "classification": "VERIFIED FACT | OBSERVATION | INFERENCE",
          "impact": "string",
          "confidence": "High | Medium | Low"
        }
      ],

      "opportunities": [
        {
          "title": "string",
          "impact": "High | Medium | Low",
          "difficulty": "High | Medium | Low",
          "solution": "string",
          "whyItFits": "string",
          "rank": 1
        }
      ],

      "competitors": [
        {
          "name": "string",
          "websiteNote": "string",
          "bookingNote": "string",
          "pricingNote": "string",
          "uxNote": "string",
          "searchNote": "string"
        }
      ],

      "recommendedOffer": {
        "name": "string",
        "build": "string",
        "whyItFits": "string",
        "priceRange": "string",
        "proofConcept": "string",
        "outreachAngle": "string"
      }
    }
  ]
}

WEB SOURCES

${sources
  .map(
    (source, index) => `
SOURCE ${index + 1}
TITLE: ${source.title}
URL: ${source.url}

CONTENT:
${source.content}
`,
  )
  .join("\n")}
`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  };

  let response: Response | undefined;

  // Gemini can temporarily return 503 when the model is under heavy load.
  // Retry only temporary 503 errors.
  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      break;
    }

    if (response.status !== 503 || attempt === maxRetries) {
      break;
    }

    const delayMs = 2000 * 2 ** attempt;

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  if (!response) {
    throw new Error("Gemini request failed before receiving a response.");
  }

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Gemini analysis failed (${response.status}): ${errorText}`,
    );
  }

  const data = (await response.json()) as GeminiResponse;

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini returned an empty research response.");
  }

  try {
    const parsed = JSON.parse(text) as {
      results?: Array<Record<string, unknown>>;
    };

    return (parsed.results ?? [])
      .map((item) => normalizeResult(item, query))
      .filter((result) => result.name !== "Not verified");
  } catch {
    throw new Error("Gemini returned invalid research JSON.");
  }
}

function normalizeScoreBreakdown(
  value: unknown,
): ResearchResult["scoreBreakdown"] {
  const source =
    value && typeof value === "object"
      ? (value as GeminiScoreBreakdown)
      : {};

  const clamp = (value: unknown, max: number) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return 0;
    }

    return Math.max(0, Math.min(max, Math.round(number)));
  };

  return {
    digitalNeed: clamp(source.digitalNeed, 20),
    abilityToPay: clamp(source.abilityToPay, 20),
    decisionMakerAccess: clamp(source.decisionMakerAccess, 15),
    easeOfProof: clamp(source.easeOfProof, 15),
    activityGrowth: clamp(source.activityGrowth, 10),
    brandQuality: clamp(source.brandQuality, 10),
    offerFit: clamp(source.offerFit, 10),
  };
}

function normalizeResult(
  item: Record<string, unknown>,
  query: ResearchQuery,
): ResearchResult {
  const stringOrNull = (value: unknown) =>
    typeof value === "string" && value.trim() ? value.trim() : null;

  const confidence =
    item.confidence === "High" ||
    item.confidence === "Medium" ||
    item.confidence === "Low"
      ? item.confidence
      : "Low";

  const decisionMaker =
    item.decisionMaker && typeof item.decisionMaker === "object"
      ? (item.decisionMaker as Record<string, unknown>)
      : {};

  const evidence = Array.isArray(item.evidence)
    ? item.evidence.map((value) => {
        const source =
          value && typeof value === "object"
            ? (value as Record<string, unknown>)
            : {};

        const classification =
          source.classification === "VERIFIED FACT" ||
          source.classification === "OBSERVATION" ||
          source.classification === "INFERENCE"
            ? source.classification
            : "OBSERVATION";

        const evidenceConfidence =
          source.confidence === "High" ||
          source.confidence === "Medium" ||
          source.confidence === "Low"
            ? source.confidence
            : "Low";

        return {
          sourceName: stringOrNull(source.sourceName) ?? "Not verified",
          sourceUrl: stringOrNull(source.sourceUrl),
          sourceType: stringOrNull(source.sourceType) ?? "Web source",
          claim: stringOrNull(source.claim) ?? "Not verified",
          classification,
          confidence: evidenceConfidence,
          dateChecked:
            stringOrNull(source.dateChecked) ??
            new Date().toISOString().slice(0, 10),
        };
      })
    : [];

  const digitalPresence = Array.isArray(item.digitalPresence)
    ? item.digitalPresence.map((value) => {
        const source =
          value && typeof value === "object"
            ? (value as Record<string, unknown>)
            : {};

        return {
          label: stringOrNull(source.label) ?? "Not verified",
          status: stringOrNull(source.status) ?? "Not verified",
          note: stringOrNull(source.note) ?? "Not verified",
        };
      })
    : [];

  const customerJourney = Array.isArray(item.customerJourney)
    ? item.customerJourney.map((value) => {
        const source =
          value && typeof value === "object"
            ? (value as Record<string, unknown>)
            : {};

        const stage =
          source.stage === "DISCOVERY" ||
          source.stage === "INFORMATION" ||
          source.stage === "DECISION" ||
          source.stage === "BOOKING" ||
          source.stage === "CONFIRMATION"
            ? source.stage
            : "DISCOVERY";

        const friction =
          source.friction === "Low" ||
          source.friction === "Medium" ||
          source.friction === "High" ||
          source.friction === "Not verified"
            ? source.friction
            : "Not verified";

        return {
          stage,
          current: stringOrNull(source.current) ?? "Not verified",
          evidence: stringOrNull(source.evidence) ?? "Not verified",
          friction,
        };
      })
    : [];

  const bottlenecks = Array.isArray(item.bottlenecks)
    ? item.bottlenecks.map((value, index) => {
        const source =
          value && typeof value === "object"
            ? (value as Record<string, unknown>)
            : {};

        const classification =
          source.classification === "VERIFIED FACT" ||
          source.classification === "OBSERVATION" ||
          source.classification === "INFERENCE"
            ? source.classification
            : "OBSERVATION";

        const bottleneckConfidence =
          source.confidence === "High" ||
          source.confidence === "Medium" ||
          source.confidence === "Low"
            ? source.confidence
            : "Low";

        return {
          rank:
            typeof source.rank === "number"
              ? Math.max(1, Math.round(source.rank))
              : index + 1,
          problem: stringOrNull(source.problem) ?? "Not verified",
          evidence: stringOrNull(source.evidence) ?? "Not verified",
          classification,
          impact: stringOrNull(source.impact) ?? "Not verified",
          confidence: bottleneckConfidence,
        };
      })
    : [];

  const opportunities = Array.isArray(item.opportunities)
    ? item.opportunities.map((value, index) => {
        const source =
          value && typeof value === "object"
            ? (value as Record<string, unknown>)
            : {};

        const impact =
          source.impact === "High" ||
          source.impact === "Medium" ||
          source.impact === "Low"
            ? source.impact
            : "Medium";

        const difficulty =
          source.difficulty === "High" ||
          source.difficulty === "Medium" ||
          source.difficulty === "Low"
            ? source.difficulty
            : "Medium";

        return {
          title: stringOrNull(source.title) ?? "Not verified",
          impact,
          difficulty,
          solution: stringOrNull(source.solution) ?? "Not verified",
          whyItFits: stringOrNull(source.whyItFits) ?? "Not verified",
          rank:
            typeof source.rank === "number"
              ? Math.max(1, Math.round(source.rank))
              : index + 1,
        };
      })
    : [];

  const competitors = Array.isArray(item.competitors)
    ? item.competitors.map((value) => {
        const source =
          value && typeof value === "object"
            ? (value as Record<string, unknown>)
            : {};

        return {
          name: stringOrNull(source.name) ?? "Not verified",
          websiteNote:
            stringOrNull(source.websiteNote) ?? "Not verified",
          bookingNote:
            stringOrNull(source.bookingNote) ?? "Not verified",
          pricingNote:
            stringOrNull(source.pricingNote) ?? "Not verified",
          uxNote: stringOrNull(source.uxNote) ?? "Not verified",
          searchNote: stringOrNull(source.searchNote) ?? "Not verified",
        };
      })
    : [];

  const recommendedOffer =
    item.recommendedOffer && typeof item.recommendedOffer === "object"
      ? (item.recommendedOffer as Record<string, unknown>)
      : {};

  return {
    name: stringOrNull(item.name) ?? "Not verified",
    industry: stringOrNull(item.industry) ?? query.businessType,
    location: stringOrNull(item.location) ?? query.location,

    website: stringOrNull(item.website),
    instagram: stringOrNull(item.instagram),
    facebook: stringOrNull(item.facebook),
    tiktok: stringOrNull(item.tiktok),
    phone: stringOrNull(item.phone),
    email: stringOrNull(item.email),

    operatingStatus:
      stringOrNull(item.operatingStatus) ?? "Not verified",

    services: Array.isArray(item.services)
      ? item.services.filter(
          (value): value is string =>
            typeof value === "string" && value.trim().length > 0,
        )
      : [],

    confidence,

    scoreBreakdown: normalizeScoreBreakdown(item.scoreBreakdown),

    strongestOpportunity:
      stringOrNull(item.strongestOpportunity) ?? "Not verified",

    bestContactChannel:
      stringOrNull(item.bestContactChannel) ?? "Not verified",

    whyItMatters:
      stringOrNull(item.whyItMatters) ??
      "Further research is required.",

    isDemo: false,

    decisionMaker: {
      name: stringOrNull(decisionMaker.name) ?? "Not verified",
      role: stringOrNull(decisionMaker.role) ?? "Not verified",
      publicProfile:
        stringOrNull(decisionMaker.publicProfile) ?? "Not verified",
      contactRoute:
        stringOrNull(decisionMaker.contactRoute) ?? "Not verified",
      confidence:
        decisionMaker.confidence === "High" ||
        decisionMaker.confidence === "Medium" ||
        decisionMaker.confidence === "Low"
          ? decisionMaker.confidence
          : "Low",
    },

    evidence,

    digitalPresence,

    customerJourney,

    bottlenecks,

    opportunities,

    competitors,

    recommendedOffer: {
      name: stringOrNull(recommendedOffer.name) ?? "Not verified",
      build:
        stringOrNull(recommendedOffer.build) ??
        "Further research required.",
      whyItFits:
        stringOrNull(recommendedOffer.whyItFits) ??
        "Not enough verified evidence.",
      priceRange:
        stringOrNull(recommendedOffer.priceRange) ?? "Not verified",
      proofConcept:
        stringOrNull(recommendedOffer.proofConcept) ?? "Not verified",
      outreachAngle:
        stringOrNull(recommendedOffer.outreachAngle) ?? "Not verified",
    },
  };
}
