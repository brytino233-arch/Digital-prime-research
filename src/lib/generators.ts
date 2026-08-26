import { supabase } from "@/integrations/supabase/client";
import type { ProspectDetail } from "@/lib/prospects";

export type ProofPackPage = {
  page: number;
  title: string;
  heading: string;
  copy: string;
  evidence: string;
  visual: string;
  keyMessage: string;
};

const NOT_VERIFIED = "Not verified";

function evidenceLine(detail: ProspectDetail, classification?: string) {
  const pool = classification
    ? detail.evidence.filter((item) => item.classification === classification)
    : detail.evidence;
  const item = pool[0] ?? detail.evidence[0];
  if (!item) return NOT_VERIFIED;
  return `${item.claim} (${item.classification} — ${item.source_name}, checked ${item.date_checked})`;
}

/** Builds a six-page proof-pack brief strictly from stored research records. */
export function buildProofPack(detail: ProspectDetail): ProofPackPage[] {
  const { prospect, report } = detail;
  const topBottleneck = report?.bottlenecks?.[0];
  const topOpportunity = detail.opportunities[0];
  const offer = report?.recommended_offer;

  return [
    {
      page: 1,
      title: "Cover",
      heading: `${prospect.name} — Digital Experience Audit`,
      copy: `Prepared by Digital Prime, Accra. Digital Prime Opportunity Score: ${prospect.score_total}/100 (${prospect.priority}). Internal research document.`,
      evidence: prospect.is_demo ? "Demo record — not live research." : evidenceLine(detail),
      visual: "Full-bleed black cover, business name in large serif, small gold Digital Prime mark.",
      keyMessage: "A considered look at how customers currently experience this business online.",
    },
    {
      page: 2,
      title: "What the business already does well",
      heading: "Strengths worth protecting",
      copy: `${prospect.why_it_matters ?? NOT_VERIFIED} Existing brand quality scored ${prospect.scoreBreakdown.brandQuality}/10 and observed activity scored ${prospect.scoreBreakdown.activityGrowth}/10 in our internal assessment.`,
      evidence: evidenceLine(detail, "OBSERVATION"),
      visual: "Grid of their existing brand or social imagery, unaltered.",
      keyMessage: "Start from respect: the brand is already working in several ways.",
    },
    {
      page: 3,
      title: "Current digital friction",
      heading: topBottleneck?.problem ?? "Where the journey slows down",
      copy: topBottleneck
        ? `${topBottleneck.impact} Classification: ${topBottleneck.classification}. Confidence: ${topBottleneck.confidence}.`
        : "No bottleneck has been recorded for this prospect yet.",
      evidence: topBottleneck?.evidence ?? NOT_VERIFIED,
      visual: "Annotated screenshot of the current booking or enquiry step.",
      keyMessage: "One clear point of friction, described without exaggeration.",
    },
    {
      page: 4,
      title: "Proposed digital experience",
      heading: topOpportunity?.title ?? offer?.name ?? "Proposed experience",
      copy: `${topOpportunity?.solution ?? offer?.build ?? NOT_VERIFIED} ${topOpportunity?.why_it_fits ?? offer?.whyItFits ?? ""}`.trim(),
      evidence: evidenceLine(detail, "OBSERVATION"),
      visual: "Mobile mockup of the proposed flow, three screens.",
      keyMessage: "A concrete, buildable improvement — not a rebrand.",
    },
    {
      page: 5,
      title: "Before vs After",
      heading: "The same customer, two journeys",
      copy: (report?.customer_journey ?? [])
        .map((stage) => `${stage.stage}: now — ${stage.current} (friction: ${stage.friction})`)
        .join("\n"),
      evidence: report ? "Derived from the recorded customer journey audit." : NOT_VERIFIED,
      visual: "Two vertical journey columns side by side, gold highlight on changed steps.",
      keyMessage: "The change is felt at the decision and booking steps.",
    },
    {
      page: 6,
      title: "Opportunity + recommended solution",
      heading: offer?.name ?? prospect.recommended_offer ?? "Recommended engagement",
      copy: `${offer?.build ?? NOT_VERIFIED} Suggested project range: ${offer?.priceRange ?? prospect.price_range ?? NOT_VERIFIED}. Proof concept to create: ${offer?.proofConcept ?? NOT_VERIFIED}.`,
      evidence: evidenceLine(detail),
      visual: "Single page: offer name, scope list, price range, next step.",
      keyMessage: "A low-risk first project with a clear outcome.",
    },
  ];
}

export type OutreachDraft = {
  target: string;
  channel: string;
  opening: string;
  problem: string;
  value: string;
  cta: string;
  follow_up: string;
};

/** Generates respectful, evidence-bounded outreach copy. No pressure language, no invented loss claims. */
export function buildOutreach(detail: ProspectDetail): OutreachDraft {
  const { prospect, report } = detail;
  const contact = detail.decisionMakers[0];
  const channel = prospect.best_contact_channel ?? "Instagram";
  const verified = detail.evidence.find((item) => item.classification === "VERIFIED FACT");
  const observed = detail.evidence.find((item) => item.classification === "OBSERVATION");
  const grounded = verified ?? observed;
  const opportunity = detail.opportunities[0]?.title ?? report?.recommended_offer?.name ?? "the booking journey";
  const contactName = contact?.name && !contact.name.startsWith("Demo") ? contact.name.split(" ")[0] : "there";

  return {
    target: contact ? `${contact.name}${contact.role ? ` — ${contact.role}` : ""} (confidence: ${contact.confidence})` : NOT_VERIFIED,
    channel,
    opening: `Hi ${contactName}, I'm from Digital Prime, a design studio in Accra. I came across ${prospect.name.replace(" (demo)", "")} and genuinely liked how the work is presented.`,
    problem: grounded
      ? `One thing I noticed: ${grounded.claim.replace(/\.$/, "")} — I may be missing context, so happy to be corrected.`
      : "I haven't verified anything specific about your setup yet, so I'd rather ask than assume.",
    value: `If it's useful, ${opportunity.toLowerCase()} is usually where a small change makes the customer's experience smoother — fewer questions before they book, clearer information up front.`,
    cta: "Would it be alright if I sent over a short one-page look at how the current journey reads? No cost, and no obligation either way.",
    follow_up: `Following up gently on my last message — if now isn't the right time, that's completely fine. Happy to leave the one-pager with you whenever it's useful.`,
  };
}

export async function saveProofPack(prospectId: string, pages: ProofPackPage[]) {
  const { error } = await supabase.from("proof_packs").insert({ prospect_id: prospectId, pages });
  if (error) throw error;
}

export async function saveOutreach(prospectId: string, draft: OutreachDraft) {
  const { error } = await supabase.from("outreach_messages").insert({ prospect_id: prospectId, ...draft });
  if (error) throw error;
}
