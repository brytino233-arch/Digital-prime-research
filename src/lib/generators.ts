import { supabase } from "@/integrations/supabase/client";
import type { ProspectDetail } from "@/lib/prospects";

export type ProofPackPage = {
  page: number;
  title: string;
  heading: string;
  copy: string;
  evidence: {
    claim: string;
    source: string;
    date: string;
  }[];
  visual: string;
  keyMessage: string;
};

const NOT_VERIFIED = "Not verified";

function formatEvidence(evidence: ProspectDetail["evidence"]) {
  return evidence.map((e) => ({
    claim: e.claim,
    source: `${e.source_name} (${e.source_type})`,
    date: e.date_checked,
  }));
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
      title: "Executive Summary",
      heading: `${prospect.name.replace(" (demo)", "")}: Digital Experience Audit`,
      copy: `Prepared for ${prospect.name.replace(" (demo)", "")}.\n\nThis audit examines current digital friction points that may be impacting conversion and customer acquisition.\n\nOur analysis identified key areas for improvement that align with current customer behavior, aimed at increasing booking completions and overall engagement.`,
      evidence: [],
      visual: "Professional cover slide: Digital Prime audit framework.",
      keyMessage: "A data-informed approach to digital growth.",
    },
    {
      page: 2,
      title: "Analysis: Friction Points",
      heading: topBottleneck?.problem ?? "Areas for experience optimization",
      copy: topBottleneck
        ? `Finding: ${topBottleneck.problem}\n\nImpact: ${topBottleneck.impact}`
        : "No significant friction points recorded.",
      evidence: topBottleneck ? formatEvidence(detail.evidence.filter(e => e.claim.includes(topBottleneck.problem.substring(0, 10)))) : [],
      visual: "Current experience analysis visualization.",
      keyMessage: "Identified friction points impeding customer conversion.",
    },
    {
      page: 3,
      title: "Strategic Recommendations",
      heading: topOpportunity?.title ?? "Proposed optimization",
      copy: `Recommendation: ${topOpportunity?.solution ?? offer?.build ?? "Implementation of optimized journey flow"}\n\nWhy it fits: ${topOpportunity?.why_it_fits ?? offer?.whyItFits ?? "Directly addresses identified friction and enhances user experience."}`.trim(),
      evidence: topOpportunity ? formatEvidence(detail.evidence.filter(e => e.claim.includes(topOpportunity.title.substring(0, 10)))) : [],
      visual: "Optimized experience wireframe preview.",
      keyMessage: "Targeted, low-friction improvements for immediate impact.",
    },
    {
      page: 4,
      title: "Journey Audit",
      heading: "Optimizing the customer experience",
      copy: (report?.customer_journey ?? [])
        .map((s) => `${s.stage}: ${s.current}\n[Friction: ${s.friction}]`)
        .join("\n\n"),
      evidence: [],
      visual: "Before vs. After experience comparison.",
      keyMessage: "Ensuring clarity at each step of the customer journey.",
    },
    {
      page: 5,
      title: "Implementation Plan",
      heading: "Our delivery approach",
      copy: `We prioritize lean, high-impact implementation:\n\n1. Project: ${offer?.name ?? "Custom digital experience improvement"}\n2. Focus: ${offer?.proofConcept ?? "Proof of concept implementation"}\n3. Timeline: 2-4 weeks.\n\nThis approach ensures rapid deployment with measurable outcomes.`,
      evidence: [],
      visual: "High-level project implementation roadmap.",
      keyMessage: "A low-risk, result-oriented engagement model.",
    },
    {
      page: 6,
      title: "Next Steps",
      heading: "Discussion and path forward",
      copy: `Investment estimate: ${prospect.price_range ?? "Based on final scope"}.\n\nNext step: A brief conversation to review these findings and discuss how to align this with your growth goals.`,
      evidence: [],
      visual: "Digital Prime contact and consultation CTA.",
      keyMessage: "Building a foundation for sustainable digital growth.",
    },
  ];
}

export type OutreachDraft = {
  target: string;
  channel: string;
  variation: "direct" | "curious";
  opening: string;
  problem: string;
  value: string;
  cta: string;
  follow_up: string;
};

/** Generates respectful, evidence-bounded outreach copy. */
export function buildOutreach(detail: ProspectDetail, variation: "direct" | "curious" = "direct"): OutreachDraft {
  const { prospect, report } = detail;
  const contact = detail.decisionMakers[0];
  const channel = prospect.best_contact_channel ?? "Instagram";
  const contactName = contact?.name && !contact.name.startsWith("Demo") ? contact.name.split(" ")[0] : "there";
  
  const bottleneck = report?.bottlenecks?.[0];
  const problemStatement = bottleneck 
    ? `I noticed that ${bottleneck.problem.toLowerCase()}`
    : `I've been looking into ${prospect.name.replace(" (demo)", "")}'s digital presence`;

  if (variation === "curious") {
    return {
      target: contact?.name ?? NOT_VERIFIED,
      channel,
      variation,
      opening: `Hi ${contactName}, I’m [Your Name] from Digital Prime.`,
      problem: `I was analyzing ${prospect.name.replace(" (demo)", "")}'s customer experience, and I had a question about your booking process.`,
      value: `We've found that ${bottleneck?.problem.toLowerCase() ?? "small adjustments to the journey"} often change how many customers complete the booking.`,
      cta: `Would you be open to a quick look at a brief audit I put together? It's just a few notes on how other businesses in your space approach this.`,
      follow_up: `I know things get busy, just circling back in case this is worth a quick discussion.`,
    };
  }

  return {
    target: contact?.name ?? NOT_VERIFIED,
    channel,
    variation,
    opening: `Hi ${contactName}, I’m [Your Name] from Digital Prime.`,
    problem: `${problemStatement}.`,
    value: `We specialize in streamlining these digital journeys to increase completions. I've put together a one-page audit of how this could work specifically for ${prospect.name.replace(" (demo)", "")}.`,
    cta: `Would you like me to send that over?`,
    follow_up: `Just following up gently—if this isn't a priority right now, I completely understand.`,
  };
}

export async function saveProofPack(prospectId: string, pages: ProofPackPage[]) {
  const { error } = await supabase.from("proof_packs").insert({ prospect_id: prospectId, pages });
  if (error) throw error;
}

export async function saveOutreach(prospectId: string, draft: OutreachDraft) {
  const { variation, ...rest } = draft;
  const { error } = await supabase.from("outreach_messages").insert({ prospect_id: prospectId, ...rest });
  if (error) throw error;
}
