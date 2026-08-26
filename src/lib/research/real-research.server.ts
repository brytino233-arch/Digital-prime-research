import type { ResearchQuery, ResearchResult } from "./types";
import { searchWeb, type WebSource } from "./tavily.server";
import { analyzeResearch } from "./gemini.server";

export const RESEARCH_PROVIDER_ENV_KEYS = ["TAVILY_API_KEY"] as const;

export type ProviderStatus = {
  configured: boolean;
  providerName: string;
  missingKeys: string[];
};

export function readProviderStatus(): ProviderStatus {
  const missingKeys = RESEARCH_PROVIDER_ENV_KEYS.filter((key) => {
    const value = process.env[key];
    return !value || value.trim().length === 0;
  });

  return {
    configured: missingKeys.length === 0,
    providerName: process.env["RESEARCH_PROVIDER_NAME"] || "Tavily web research",
    missingKeys: [...missingKeys],
  };
}

export const NOT_CONFIGURED_MESSAGE = "Research provider not configured.";

function buildResult(
  source: WebSource,
  query: ResearchQuery,
  index: number,
): ResearchResult {
  const today = new Date().toISOString().slice(0, 10);

  return {
    name: source.title,
    industry: query.businessType,
    location: query.location,

    website: source.url,
    instagram: null,
    facebook: null,
    tiktok: null,
    phone: null,
    email: null,

    operatingStatus: "Not verified",
    services: [],

    confidence: "Low",

    scoreBreakdown: {
      digitalNeed: 0,
      abilityToPay: 0,
      decisionMakerAccess: 0,
      easeOfProof: 0,
      activityGrowth: 0,
      brandQuality: 0,
      offerFit: 0,
    },

    strongestOpportunity: "Not verified",
    bestContactChannel: "Not verified",

    whyItMatters:
      "Real web search result found. Further verification and analysis are required before treating this as a qualified prospect.",

    isDemo: false,

    decisionMaker: {
      name: "Not verified",
      role: "Not verified",
      publicProfile: "Not verified",
      contactRoute: "Not verified",
      confidence: "Low",
    },

    evidence: [
      {
        sourceName: source.title,
        sourceUrl: source.url,
        sourceType: "Web search result",
        claim: source.content,
        classification: "OBSERVATION",
        confidence: "Low",
        dateChecked: today,
      },
    ],

    digitalPresence: [
      {
        label: "Website",
        status: "Found",
        note: source.url,
      },
      {
        label: "Mobile experience",
        status: "Not verified",
        note: "Requires direct website audit.",
      },
      {
        label: "Social presence",
        status: "Not verified",
        note: "Requires separate social search.",
      },
      {
        label: "Booking",
        status: "Not verified",
        note: "Requires direct business research.",
      },
      {
        label: "Service menu",
        status: "Not verified",
        note: "Requires direct website audit.",
      },
      {
        label: "Pricing visibility",
        status: "Not verified",
        note: "Requires direct research.",
      },
      {
        label: "Contact flow",
        status: "Not verified",
        note: "Requires direct website audit.",
      },
      {
        label: "Search visibility",
        status: "Found",
        note: "This business/page appeared in the web search.",
      },
    ],

    customerJourney: [
      {
        stage: "DISCOVERY",
        current: "Business/page appeared in web search.",
        evidence: source.url,
        friction: "Not verified",
      },
      {
        stage: "INFORMATION",
        current: "Not verified",
        evidence: "Not verified",
        friction: "Not verified",
      },
      {
        stage: "DECISION",
        current: "Not verified",
        evidence: "Not verified",
        friction: "Not verified",
      },
      {
        stage: "BOOKING",
        current: "Not verified",
        evidence: "Not verified",
        friction: "Not verified",
      },
      {
        stage: "CONFIRMATION",
        current: "Not verified",
        evidence: "Not verified",
        friction: "Not verified",
      },
    ],

    bottlenecks: [],

    opportunities: [],

    competitors: [],

    recommendedOffer: {
      name: "Not verified",
      build: "Requires further research.",
      whyItFits: "Not enough evidence yet.",
      priceRange: "Not applicable",
      proofConcept: "Not verified",
      outreachAngle: "Not verified",
    },
  };
}

export async function performRealResearch(
  query: ResearchQuery,
): Promise<ResearchResult[]> {
  const status = readProviderStatus();

  if (!status.configured) {
    throw new Error(
      `${NOT_CONFIGURED_MESSAGE} Missing: ${status.missingKeys.join(", ")}`,
    );
  }

  const sources = await searchWeb(query);

  if (sources.length === 0) {
    return [];
  }

  const results = await analyzeResearch(query, sources);

  return results.slice(0, query.count);
}
