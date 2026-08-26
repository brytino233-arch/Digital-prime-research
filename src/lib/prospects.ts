import { supabase } from "@/integrations/supabase/client";
import { normalizeBreakdown, priorityFor, totalScore, type ScoreBreakdown } from "@/lib/scoring";
import type {
  Bottleneck,
  CompetitorItem,
  JourneyStage,
  PresenceItem,
  RecommendedOffer,
  ResearchResult,
} from "@/lib/research/types";

export const PIPELINE_STAGES = [
  "RESEARCHED",
  "CONTACTED",
  "REPLIED",
  "MEETING",
  "PROPOSAL",
  "WON",
  "LOST",
] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export type ProspectRow = {
  id: string;
  name: string;
  industry: string;
  location: string;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  phone: string | null;
  email: string | null;
  operating_status: string;
  score_total: number;
  score_breakdown: unknown;
  strongest_opportunity: string | null;
  best_contact_channel: string | null;
  why_it_matters: string | null;
  recommended_offer: string | null;
  price_range: string | null;
  research_status: string;
  pipeline_status: string;
  is_demo: boolean;
  archived: boolean;
  last_researched_at: string;
  created_at: string;
};

export type Prospect = Omit<ProspectRow, "score_breakdown"> & {
  scoreBreakdown: ScoreBreakdown;
  priority: ReturnType<typeof priorityFor>;
};

function hydrate(row: ProspectRow): Prospect {
  const scoreBreakdown = normalizeBreakdown(row.score_breakdown);
  const score = row.score_total || totalScore(scoreBreakdown);
  return { ...row, score_total: score, scoreBreakdown, priority: priorityFor(score) };
}

/**
 * Loads prospects. Development fallback records (is_demo) are EXCLUDED unless a
 * developer explicitly opts in, so simulated businesses never appear as research.
 */
export async function fetchProspects(options?: { includeDevData?: boolean }): Promise<Prospect[]> {
  let query = supabase.from("prospects").select("*").order("score_total", { ascending: false });
  if (!options?.includeDevData) query = query.eq("is_demo", false);
  const { data, error } = await query;
  if (error) throw error;
  return (data as ProspectRow[]).map(hydrate);
}

export type ProspectDetail = {
  prospect: Prospect;
  report: {
    research_goal: string;
    provider: string;
    digital_presence: PresenceItem[];
    customer_journey: JourneyStage[];
    bottlenecks: Bottleneck[];
    recommended_offer: RecommendedOffer;
  } | null;
  evidence: {
    id: string;
    source_name: string;
    source_url: string | null;
    source_type: string;
    claim: string;
    classification: string;
    confidence: string;
    date_checked: string;
  }[];
  decisionMakers: {
    id: string;
    name: string;
    role: string | null;
    public_profile: string | null;
    contact_route: string | null;
    confidence: string;
  }[];
  opportunities: {
    id: string;
    title: string;
    impact: string;
    difficulty: string;
    solution: string | null;
    why_it_fits: string | null;
    rank: number;
  }[];
  competitors: (CompetitorItem & { id: string })[];
  outreach: {
    id: string;
    target: string | null;
    channel: string | null;
    opening: string | null;
    problem: string | null;
    value: string | null;
    cta: string | null;
    follow_up: string | null;
    created_at: string;
  }[];
  proofPacks: { id: string; pages: unknown; created_at: string }[];
  events: { id: string; status: string; note: string | null; created_at: string }[];
};

export async function fetchProspectDetail(id: string): Promise<ProspectDetail> {
  const [prospect, reports, evidence, decisionMakers, opportunities, competitors, outreach, proofPacks, events] =
    await Promise.all([
      supabase.from("prospects").select("*").eq("id", id).maybeSingle(),
      supabase.from("research_reports").select("*").eq("prospect_id", id).order("created_at", { ascending: false }),
      supabase.from("evidence").select("*").eq("prospect_id", id).order("created_at"),
      supabase.from("decision_makers").select("*").eq("prospect_id", id).order("created_at"),
      supabase.from("opportunities").select("*").eq("prospect_id", id).order("rank"),
      supabase.from("competitors").select("*").eq("prospect_id", id).order("created_at"),
      supabase.from("outreach_messages").select("*").eq("prospect_id", id).order("created_at", { ascending: false }),
      supabase.from("proof_packs").select("*").eq("prospect_id", id).order("created_at", { ascending: false }),
      supabase.from("pipeline_events").select("*").eq("prospect_id", id).order("created_at", { ascending: false }),
    ]);

  if (prospect.error) throw prospect.error;
  if (!prospect.data) throw new Error("Prospect not found");

  const report = (reports.data ?? [])[0] as
    | {
        research_goal: string;
        provider: string;
        digital_presence: unknown;
        customer_journey: unknown;
        bottlenecks: unknown;
        recommended_offer: unknown;
      }
    | undefined;

  return {
    prospect: hydrate(prospect.data as ProspectRow),
    report: report
      ? {
          research_goal: report.research_goal,
          provider: report.provider,
          digital_presence: (report.digital_presence as PresenceItem[]) ?? [],
          customer_journey: (report.customer_journey as JourneyStage[]) ?? [],
          bottlenecks: (report.bottlenecks as Bottleneck[]) ?? [],
          recommended_offer: (report.recommended_offer as RecommendedOffer) ?? ({} as RecommendedOffer),
        }
      : null,
    evidence: (evidence.data ?? []) as ProspectDetail["evidence"],
    decisionMakers: (decisionMakers.data ?? []) as ProspectDetail["decisionMakers"],
    opportunities: (opportunities.data ?? []) as ProspectDetail["opportunities"],
    competitors: ((competitors.data ?? []) as Record<string, string>[]).map((row) => ({
      id: row["id"] as string,
      name: row["name"] as string,
      websiteNote: row["website_note"] ?? "Not verified",
      bookingNote: row["booking_note"] ?? "Not verified",
      pricingNote: row["pricing_note"] ?? "Not verified",
      uxNote: row["ux_note"] ?? "Not verified",
      searchNote: row["search_note"] ?? "Not verified",
    })),
    outreach: (outreach.data ?? []) as ProspectDetail["outreach"],
    proofPacks: (proofPacks.data ?? []) as ProspectDetail["proofPacks"],
    events: (events.data ?? []) as ProspectDetail["events"],
  };
}

/** Persists a provider result set as prospects + related research records. */
export async function saveResearchResults(
  results: ResearchResult[],
  meta: { goal: string; provider: string },
): Promise<string[]> {
  const ids: string[] = [];

  for (const result of results) {
    const score = totalScore(result.scoreBreakdown);
    const { data, error } = await supabase
      .from("prospects")
      .insert({
        name: result.name,
        industry: result.industry,
        location: result.location,
        website: result.website,
        instagram: result.instagram,
        facebook: result.facebook,
        tiktok: result.tiktok,
        phone: result.phone,
        email: result.email,
        operating_status: result.operatingStatus,
        score_total: score,
        score_breakdown: result.scoreBreakdown,
        strongest_opportunity: result.strongestOpportunity,
        best_contact_channel: result.bestContactChannel,
        why_it_matters: result.whyItMatters,
        recommended_offer: result.recommendedOffer.name,
        price_range: result.recommendedOffer.priceRange,
        research_status: "RESEARCHED",
        pipeline_status: "RESEARCHED",
        is_demo: result.isDemo,
      })
      .select("id")
      .single();

    if (error) throw error;
    const prospectId = (data as { id: string }).id;
    ids.push(prospectId);

    await Promise.all([
      supabase.from("research_reports").insert({
        prospect_id: prospectId,
        research_goal: meta.goal,
        provider: meta.provider,
        digital_presence: result.digitalPresence,
        customer_journey: result.customerJourney,
        bottlenecks: result.bottlenecks,
        recommended_offer: result.recommendedOffer,
      }),
      supabase.from("evidence").insert(
        result.evidence.map((item) => ({
          prospect_id: prospectId,
          source_name: item.sourceName,
          source_url: item.sourceUrl,
          source_type: item.sourceType,
          claim: item.claim,
          classification: item.classification,
          confidence: item.confidence,
          date_checked: item.dateChecked,
        })),
      ),
      supabase.from("decision_makers").insert({
        prospect_id: prospectId,
        name: result.decisionMaker.name,
        role: result.decisionMaker.role,
        public_profile: result.decisionMaker.publicProfile,
        contact_route: result.decisionMaker.contactRoute,
        confidence: result.decisionMaker.confidence,
      }),
      supabase.from("opportunities").insert(
        result.opportunities.map((item) => ({
          prospect_id: prospectId,
          title: item.title,
          impact: item.impact,
          difficulty: item.difficulty,
          solution: item.solution,
          why_it_fits: item.whyItFits,
          rank: item.rank,
        })),
      ),
      supabase.from("competitors").insert(
        result.competitors.map((item) => ({
          prospect_id: prospectId,
          name: item.name,
          website_note: item.websiteNote,
          booking_note: item.bookingNote,
          pricing_note: item.pricingNote,
          ux_note: item.uxNote,
          search_note: item.searchNote,
        })),
      ),
      supabase.from("pipeline_events").insert({
        prospect_id: prospectId,
        status: "RESEARCHED",
        note: `Created by ${meta.provider} provider — goal: ${meta.goal}`,
      }),
    ]);
  }

  return ids;
}

export async function setPipelineStage(prospectId: string, stage: PipelineStage, note?: string) {
  const { error } = await supabase.from("prospects").update({ pipeline_status: stage }).eq("id", prospectId);
  if (error) throw error;
  await supabase.from("pipeline_events").insert({ prospect_id: prospectId, status: stage, note: note ?? null });
}

export async function setArchived(prospectId: string, archived: boolean) {
  const { error } = await supabase.from("prospects").update({ archived }).eq("id", prospectId);
  if (error) throw error;
}
