import type { ScoreBreakdown } from "@/lib/scoring";
import {
  NOT_VERIFIED,
  RESEARCH_STAGES,
  type ResearchProvider,
  type ResearchQuery,
  type ResearchResult,
} from "./types";

/**
 * MOCK RESEARCH PROVIDER
 * ----------------------
 * Generates plausible-looking but SIMULATED prospects so the full workflow can be
 * demonstrated before a real research backend exists. Everything it returns is
 * flagged `isDemo: true` and every claim is classified OBSERVATION or INFERENCE —
 * it never emits "VERIFIED FACT". Replace this module with a real provider
 * (web search / Maps / social / AI) without touching any UI code.
 */

type Archetype = {
  industry: string;
  keywords: string[];
  names: string[];
  strongestOpportunity: string;
  channel: string;
  offer: string;
  priceRange: string;
  base: ScoreBreakdown;
  journeyBooking: string;
  opportunities: { title: string; impact: "High" | "Medium"; difficulty: "High" | "Medium" | "Low"; solution: string }[];
};

const ARCHETYPES: Archetype[] = [
  {
    industry: "Beauty & Wellness",
    keywords: ["salon", "beauty", "spa", "hair", "nail", "barber", "wellness", "skin"],
    names: ["Atelier Bloom", "Luxe Hair Studio", "Serene Skin Room", "Nala Beauty Bar", "Studio Aurelle"],
    strongestOpportunity: "Online booking + service discovery",
    channel: "Instagram",
    offer: "High-Conversion Booking Experience",
    priceRange: "GHS 2,500-4,000",
    base: {
      digitalNeed: 17,
      abilityToPay: 15,
      decisionMakerAccess: 13,
      easeOfProof: 13,
      activityGrowth: 8,
      brandQuality: 8,
      offerFit: 9,
    },
    journeyBooking: "Appointments appear to be arranged through direct messages.",
    opportunities: [
      {
        title: "Self-serve appointment booking",
        impact: "High",
        difficulty: "Medium",
        solution: "Booking experience with service menu, durations and deposits",
      },
      {
        title: "Service and price discovery",
        impact: "Medium",
        difficulty: "Low",
        solution: "Structured service menu page",
      },
      {
        title: "Returning-client reminders",
        impact: "Medium",
        difficulty: "Medium",
        solution: "Automated appointment reminders",
      },
    ],
  },
  {
    industry: "Restaurants & Hospitality",
    keywords: ["restaurant", "food", "kitchen", "cafe", "coffee", "bar", "grill", "catering"],
    names: ["Kpakpo Kitchen", "The Osu Table", "Cardamom & Coal", "Labone Supper Club", "Jollof House"],
    strongestOpportunity: "Digital menu + reservation flow",
    channel: "WhatsApp",
    offer: "Menu & Reservation Microsite",
    priceRange: "GHS 2,000-3,500",
    base: {
      digitalNeed: 16,
      abilityToPay: 14,
      decisionMakerAccess: 12,
      easeOfProof: 13,
      activityGrowth: 8,
      brandQuality: 7,
      offerFit: 9,
    },
    journeyBooking: "Reservations appear to be handled by phone or messaging.",
    opportunities: [
      {
        title: "Browsable digital menu",
        impact: "High",
        difficulty: "Low",
        solution: "Fast menu microsite with categories and photography",
      },
      {
        title: "Table reservation route",
        impact: "Medium",
        difficulty: "Medium",
        solution: "Reservation form connected to WhatsApp",
      },
      {
        title: "Location and hours clarity",
        impact: "Medium",
        difficulty: "Low",
        solution: "Directions, hours and parking block",
      },
    ],
  },
  {
    industry: "Fitness & Wellness",
    keywords: ["gym", "fitness", "yoga", "pilates", "training", "crossfit", "studio"],
    names: ["Ridge Strength Collective", "Pulse Lab Accra", "Ember Yoga House", "Iron & Ivory", "Movement Co."],
    strongestOpportunity: "Membership pricing clarity + trial signup",
    channel: "Instagram",
    offer: "Membership Conversion Page",
    priceRange: "GHS 1,800-3,000",
    base: {
      digitalNeed: 15,
      abilityToPay: 13,
      decisionMakerAccess: 11,
      easeOfProof: 12,
      activityGrowth: 8,
      brandQuality: 8,
      offerFit: 8,
    },
    journeyBooking: "Trials and memberships appear to be arranged in person or by message.",
    opportunities: [
      {
        title: "Published membership tiers",
        impact: "High",
        difficulty: "Low",
        solution: "Membership page with tiers and trial signup",
      },
      {
        title: "Trial class signup",
        impact: "Medium",
        difficulty: "Medium",
        solution: "Trial signup flow with reminders",
      },
      {
        title: "Class timetable",
        impact: "Medium",
        difficulty: "Low",
        solution: "Live timetable page",
      },
    ],
  },
  {
    industry: "Fashion & Retail",
    keywords: ["fashion", "clothing", "tailor", "boutique", "retail", "thread", "wear", "shop", "store"],
    names: ["Adinkra Thread Studio", "House of Nsuo", "Kente Modern", "Sartoria Accra", "Weave & Warp"],
    strongestOpportunity: "Made-to-measure order flow",
    channel: "Instagram",
    offer: "Bespoke Order Experience",
    priceRange: "GHS 2,200-3,800",
    base: {
      digitalNeed: 15,
      abilityToPay: 12,
      decisionMakerAccess: 11,
      easeOfProof: 11,
      activityGrowth: 8,
      brandQuality: 9,
      offerFit: 8,
    },
    journeyBooking: "Orders appear to be requested through comments and direct messages.",
    opportunities: [
      {
        title: "Guided bespoke order flow",
        impact: "High",
        difficulty: "Medium",
        solution: "Order experience capturing style, measurements and timeline",
      },
      {
        title: "Lookbook with pricing bands",
        impact: "Medium",
        difficulty: "Low",
        solution: "Lookbook pages with indicative pricing",
      },
      {
        title: "Sizing and delivery clarity",
        impact: "Medium",
        difficulty: "Low",
        solution: "Sizing guide and delivery expectations",
      },
    ],
  },
  {
    industry: "Real Estate",
    keywords: ["real estate", "property", "properties", "realty", "estate", "homes", "rentals", "land"],
    names: [
      "Cantonments Property Partners",
      "Airport Residential Group",
      "Terra Accra Realty",
      "Northline Properties",
      "Prime Plot Ghana",
    ],
    strongestOpportunity: "Listing search + viewing requests",
    channel: "Email",
    offer: "Listing Discovery Platform",
    priceRange: "GHS 4,000-7,500",
    base: {
      digitalNeed: 14,
      abilityToPay: 16,
      decisionMakerAccess: 9,
      easeOfProof: 10,
      activityGrowth: 7,
      brandQuality: 6,
      offerFit: 7,
    },
    journeyBooking: "Viewings appear to be arranged through phone calls.",
    opportunities: [
      {
        title: "Searchable listing experience",
        impact: "High",
        difficulty: "High",
        solution: "Listing platform with filters and viewing requests",
      },
      {
        title: "Viewing request flow",
        impact: "Medium",
        difficulty: "Medium",
        solution: "Viewing request form with qualification questions",
      },
      {
        title: "Neighbourhood guides",
        impact: "Medium",
        difficulty: "Low",
        solution: "Area guide pages for search visibility",
      },
    ],
  },
  {
    industry: "Professional Services",
    keywords: ["clinic", "dental", "law", "legal", "consult", "accounting", "agency", "school", "academy"],
    names: ["Ridgeway Consult", "Osu Legal Practice", "Clearview Clinic", "Meridian Advisory", "Foundry Academy"],
    strongestOpportunity: "Enquiry flow + credibility content",
    channel: "Email",
    offer: "Credibility & Enquiry Site",
    priceRange: "GHS 3,000-5,500",
    base: {
      digitalNeed: 14,
      abilityToPay: 15,
      decisionMakerAccess: 10,
      easeOfProof: 11,
      activityGrowth: 7,
      brandQuality: 7,
      offerFit: 8,
    },
    journeyBooking: "Enquiries appear to be handled by phone or email.",
    opportunities: [
      {
        title: "Structured enquiry flow",
        impact: "High",
        difficulty: "Medium",
        solution: "Qualified enquiry form with routing",
      },
      {
        title: "Service clarity pages",
        impact: "Medium",
        difficulty: "Low",
        solution: "Clear service and process pages",
      },
      {
        title: "Proof and credentials",
        impact: "Medium",
        difficulty: "Low",
        solution: "Case study and credentials section",
      },
    ],
  },
];

function pickArchetypes(businessType: string): Archetype[] {
  const query = businessType.toLowerCase();
  const matched = ARCHETYPES.filter((archetype) => archetype.keywords.some((keyword) => query.includes(keyword)));
  return matched.length > 0 ? matched : ARCHETYPES;
}

function goalWeights(query: ResearchQuery): Partial<Record<keyof ScoreBreakdown, number>> {
  switch (query.goal) {
    case "Find highest-value prospects":
      return { abilityToPay: 3, offerFit: 1 };
    case "Find easiest quick wins":
      return { easeOfProof: 3, decisionMakerAccess: 2 };
    case "Find businesses with obvious digital bottlenecks":
      return { digitalNeed: 3 };
    default:
      return { digitalNeed: 1, easeOfProof: 1 };
  }
}

function clampBreakdown(base: ScoreBreakdown, deltas: Partial<Record<keyof ScoreBreakdown, number>>, jitter: number) {
  const caps: ScoreBreakdown = {
    digitalNeed: 20,
    abilityToPay: 20,
    decisionMakerAccess: 15,
    easeOfProof: 15,
    activityGrowth: 10,
    brandQuality: 10,
    offerFit: 10,
  };
  const out = { ...base };
  for (const key of Object.keys(out) as (keyof ScoreBreakdown)[]) {
    const value = out[key] + (deltas[key] ?? 0) + jitter;
    out[key] = Math.max(0, Math.min(caps[key], Math.round(value)));
  }
  return out;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function buildResult(archetype: Archetype, index: number, query: ResearchQuery): ResearchResult {
  const name = `${archetype.names[index % archetype.names.length] ?? "Demo Business"}${index >= archetype.names.length ? ` ${Math.floor(index / archetype.names.length) + 1}` : ""} (demo)`;
  const slug = name
    .toLowerCase()
    .replace(/\(demo\)/g, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const jitter = ([1, -1, 0, 2, -2] as const)[index % 5] ?? 0;
  const breakdown = clampBreakdown(archetype.base, goalWeights(query), jitter);
  const today = new Date().toISOString().slice(0, 10);
  const city = query.location.split(",")[0]?.trim() || "Accra";

  return {
    name,
    industry: archetype.industry,
    location: query.location,
    website: index % 3 === 0 ? null : `https://example.com/${slug}`,
    instagram: `@${slug.replace(/-/g, ".")}.demo`,
    facebook: index % 2 === 0 ? `facebook.com/${slug}.demo` : null,
    tiktok: index % 4 === 0 ? `@${slug.replace(/-/g, "")}demo` : null,
    phone: `+233 20 000 ${String(1000 + index).slice(-4)}`,
    email: index % 3 === 1 ? `hello@${slug}.demo` : null,
    operatingStatus: NOT_VERIFIED,
    services: archetype.opportunities.map((item) => item.title),
    confidence: "Low",
    scoreBreakdown: breakdown,
    strongestOpportunity: archetype.strongestOpportunity,
    bestContactChannel: archetype.channel,
    whyItMatters: `Demo record: a ${archetype.industry.toLowerCase()} business in ${city} with visible demand signals and a manual conversion step.`,
    isDemo: true,
    decisionMaker: {
      name: "Demo contact — not verified",
      role: "Owner / Founder",
      publicProfile: NOT_VERIFIED,
      contactRoute: `${archetype.channel} (unconfirmed)`,
      confidence: "Low",
    },
    evidence: [
      {
        sourceName: "Mock research provider",
        sourceUrl: null,
        sourceType: "Simulated dataset",
        claim: `Business is presented as operating in ${city} within ${archetype.industry.toLowerCase()}.`,
        classification: "OBSERVATION",
        confidence: "Medium",
        dateChecked: today,
      },
      {
        sourceName: "Mock research provider",
        sourceUrl: null,
        sourceType: "Simulated dataset",
        claim: archetype.journeyBooking,
        classification: "OBSERVATION",
        confidence: "Medium",
        dateChecked: today,
      },
      {
        sourceName: "Mock research provider",
        sourceUrl: null,
        sourceType: "Simulated dataset",
        claim: "A structured digital step could reduce manual back-and-forth in the customer journey.",
        classification: "INFERENCE",
        confidence: "Low",
        dateChecked: today,
      },
    ],
    digitalPresence: [
      {
        label: "Website",
        status: index % 3 === 0 ? "None found (demo)" : "Present (demo record)",
        note: "Simulated result — requires live audit.",
      },
      { label: "Mobile experience", status: NOT_VERIFIED, note: "Requires live audit." },
      { label: "Social presence", status: "Active (demo record)", note: "Regular posting in simulated dataset." },
      { label: "Booking", status: "Manual (demo record)", note: archetype.journeyBooking },
      { label: "Service menu", status: "Partial", note: "Published informally in simulated dataset." },
      { label: "Pricing visibility", status: "Not published", note: "No public pricing in simulated dataset." },
      { label: "Contact flow", status: "Single channel", note: `Primary route is ${archetype.channel}.` },
      { label: "Search visibility", status: NOT_VERIFIED, note: "Requires live search audit." },
    ],
    customerJourney: [
      {
        stage: "DISCOVERY",
        current: "Customers find the business through social media and word of mouth.",
        evidence: "Simulated observation",
        friction: "Low",
      },
      {
        stage: "INFORMATION",
        current: "Service and pricing details are spread across posts.",
        evidence: "Simulated observation",
        friction: "Medium",
      },
      {
        stage: "DECISION",
        current: "Customers ask questions before they can decide.",
        evidence: "Simulated observation",
        friction: "Medium",
      },
      { stage: "BOOKING", current: archetype.journeyBooking, evidence: "Simulated observation", friction: "High" },
      {
        stage: "CONFIRMATION",
        current: "Confirmation appears manual and unstructured.",
        evidence: NOT_VERIFIED,
        friction: NOT_VERIFIED,
      },
    ],
    bottlenecks: [
      {
        rank: 1,
        problem: "No structured booking or ordering route",
        evidence: "Simulated observation",
        classification: "OBSERVATION",
        impact: "Enquiries require manual handling before they convert.",
        confidence: "Medium",
      },
      {
        rank: 2,
        problem: "Pricing and service information not consolidated",
        evidence: "Simulated observation",
        classification: "OBSERVATION",
        impact: "Customers need extra steps to understand the offer.",
        confidence: "Medium",
      },
      {
        rank: 3,
        problem: "Search visibility unconfirmed",
        evidence: NOT_VERIFIED,
        classification: "INFERENCE",
        impact: "Possible discovery gap outside social platforms.",
        confidence: "Low",
      },
    ],
    opportunities: archetype.opportunities.map((opportunity, rank) => ({
      title: opportunity.title,
      impact: opportunity.impact,
      difficulty: opportunity.difficulty,
      solution: opportunity.solution,
      whyItFits: `Aligns with the ${archetype.industry.toLowerCase()} journey observed in the simulated dataset.`,
      rank: rank + 1,
    })),
    competitors: [
      {
        name: "Demo competitor A",
        websiteNote: "Dedicated site",
        bookingNote: "Online booking available",
        pricingNote: "Prices published",
        uxNote: "Mobile-friendly",
        searchNote: "Appears in local search",
      },
      {
        name: "Demo competitor B",
        websiteNote: "Social only",
        bookingNote: "Direct messages only",
        pricingNote: "Not published",
        uxNote: NOT_VERIFIED,
        searchNote: "Limited",
      },
    ],
    recommendedOffer: {
      name: archetype.offer,
      build:
        "A focused digital experience covering discovery, information and the booking or enquiry step, built mobile-first.",
      whyItFits: "The simulated record shows demand signals with a manual conversion step.",
      priceRange: archetype.priceRange,
      proofConcept: "A single-screen redesign of the current conversion step.",
      outreachAngle:
        "Open with genuine appreciation for their work, then offer a short look at the booking journey — no pressure.",
    },
  };
}

export const mockResearchProvider: ResearchProvider = {
  id: "mock",
  label: "Mock research provider (demo data)",
  producesDemoData: true,
  async run(query, hooks) {
    const archetypes = pickArchetypes(query.businessType);
    const count = Math.max(1, Math.min(25, query.count));

    for (const stage of RESEARCH_STAGES) {
      if (hooks?.signal?.aborted) throw new Error("Research cancelled");
      hooks?.onStage?.(stage, "Researching");
      await sleep(520 + Math.random() * 380);
      hooks?.onStage?.(stage, "Complete");
    }

    let results = Array.from({ length: count }, (_, index) =>
      buildResult(archetypes[index % archetypes.length]!, index, query),
    );

    if (query.requireWebsite) results = results.filter((result) => result.website !== null);
    if (query.requireSocial) results = results.filter((result) => result.instagram !== null);

    return results;
  },
};
