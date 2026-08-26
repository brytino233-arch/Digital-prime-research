import type { ScoreBreakdown } from "@/lib/scoring";

export type Classification = "VERIFIED FACT" | "OBSERVATION" | "INFERENCE";

export const NOT_VERIFIED = "Not verified";

export type EvidenceItem = {
  sourceName: string;
  sourceUrl: string | null;
  sourceType: string;
  claim: string;
  classification: Classification;
  confidence: "High" | "Medium" | "Low";
  dateChecked: string;
};

export type PresenceItem = { label: string; status: string; note: string };

export type JourneyStage = {
  stage: "DISCOVERY" | "INFORMATION" | "DECISION" | "BOOKING" | "CONFIRMATION";
  current: string;
  evidence: string;
  friction: "Low" | "Medium" | "High" | typeof NOT_VERIFIED;
};

export type Bottleneck = {
  rank: number;
  problem: string;
  evidence: string;
  classification: Classification;
  impact: string;
  confidence: "High" | "Medium" | "Low";
};

export type OpportunityItem = {
  title: string;
  impact: "High" | "Medium" | "Low";
  difficulty: "High" | "Medium" | "Low";
  solution: string;
  whyItFits: string;
  rank: number;
};

export type CompetitorItem = {
  name: string;
  websiteNote: string;
  bookingNote: string;
  pricingNote: string;
  uxNote: string;
  searchNote: string;
};

export type RecommendedOffer = {
  name: string;
  build: string;
  whyItFits: string;
  priceRange: string;
  proofConcept: string;
  outreachAngle: string;
};

export type DecisionMakerDraft = {
  name: string;
  role: string;
  publicProfile: string;
  contactRoute: string;
  confidence: "High" | "Medium" | "Low";
};

/**
 * THE RESEARCH DATA CONTRACT.
 * Every provider returns this shape, and every feature — prospects, scoring,
 * proof packs, outreach, pipeline — consumes it. There is no second system.
 */
export type ResearchResult = {
  name: string;
  industry: string;
  location: string;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  phone: string | null;
  email: string | null;
  operatingStatus: string;
  /** Services the business appears to offer. Empty when unverified. */
  services: string[];
  /** Overall confidence in this record as a whole. */
  confidence: "High" | "Medium" | "Low";
  scoreBreakdown: ScoreBreakdown;
  strongestOpportunity: string;
  bestContactChannel: string;
  whyItMatters: string;
  /** True only for development fallback data. Never true for production research. */
  isDemo: boolean;
  decisionMaker: DecisionMakerDraft;
  evidence: EvidenceItem[];
  digitalPresence: PresenceItem[];
  customerJourney: JourneyStage[];
  bottlenecks: Bottleneck[];
  opportunities: OpportunityItem[];
  competitors: CompetitorItem[];
  recommendedOffer: RecommendedOffer;
};

/** Grouped view of the same contract, for readers that prefer nested access. */
export function toDataContract(result: ResearchResult) {
  return {
    business: result.name,
    industry: result.industry,
    location: result.location,
    website: result.website,
    socialProfiles: { instagram: result.instagram, facebook: result.facebook, tiktok: result.tiktok },
    contactInformation: { phone: result.phone, email: result.email, bestChannel: result.bestContactChannel },
    decisionMaker: result.decisionMaker,
    services: result.services,
    digitalPresence: result.digitalPresence,
    customerJourney: result.customerJourney,
    bottlenecks: result.bottlenecks,
    opportunities: result.opportunities,
    competitors: result.competitors,
    evidence: result.evidence,
    confidence: result.confidence,
    opportunityScore: result.scoreBreakdown,
  };
}

export const RESEARCH_GOALS = [
  "Find most likely to buy",
  "Find highest-value prospects",
  "Find easiest quick wins",
  "Find businesses with obvious digital bottlenecks",
  "Custom",
] as const;

export type ResearchGoal = (typeof RESEARCH_GOALS)[number];

export type ResearchQuery = {
  location: string;
  businessType: string;
  count: number;
  goal: ResearchGoal;
  customGoal?: string | undefined;
  minScore?: number | undefined;
  requireWebsite?: boolean | undefined;
  requireSocial?: boolean | undefined;
};

export const RESEARCH_STAGES = [
  "Discovering businesses",
  "Verifying businesses",
  "Auditing digital presence",
  "Identifying bottlenecks",
  "Evaluating buying potential",
  "Ranking prospects",
  "Preparing recommendations",
] as const;

export type StageName = (typeof RESEARCH_STAGES)[number];
export type StageState = "Pending" | "Researching" | "Complete" | "Failed";

/**
 * The single seam between the UI and any research backend.
 * Swap the implementation (web search API, Maps data, AI models) without touching the UI.
 */
export type ResearchProvider = {
  /** Machine id, e.g. "mock" | "web-search". */
  id: string;
  /** Human label shown in the UI. */
  label: string;
  /** True when results are simulated and must be labelled as demo data. */
  producesDemoData: boolean;
  run(
    query: ResearchQuery,
    hooks?: { onStage?: (stage: StageName, state: StageState) => void; signal?: AbortSignal | undefined } | undefined,
  ): Promise<ResearchResult[]>;
};
