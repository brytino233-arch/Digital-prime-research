/**
 * Digital Prime Opportunity Score — a transparent, internal 100-point heuristic.
 * It is NOT a probability and must never be presented as one.
 */

export type ScoreBreakdown = {
  digitalNeed: number;
  abilityToPay: number;
  decisionMakerAccess: number;
  easeOfProof: number;
  activityGrowth: number;
  brandQuality: number;
  offerFit: number;
};

export const SCORE_CATEGORIES: {
  key: keyof ScoreBreakdown;
  label: string;
  max: number;
  help: string;
}[] = [
  { key: "digitalNeed", label: "Digital Need", max: 20, help: "How much of the customer journey is still manual." },
  { key: "abilityToPay", label: "Ability to Pay", max: 20, help: "Signals that the business can fund a project." },
  {
    key: "decisionMakerAccess",
    label: "Decision-Maker Accessibility",
    max: 15,
    help: "How reachable the person who decides appears to be.",
  },
  {
    key: "easeOfProof",
    label: "Ease of Demonstrating Value",
    max: 15,
    help: "How quickly Digital Prime could show a tangible improvement.",
  },
  { key: "activityGrowth", label: "Business Activity / Growth", max: 10, help: "Observed activity and momentum." },
  { key: "brandQuality", label: "Existing Brand Quality", max: 10, help: "Current visual and brand maturity." },
  { key: "offerFit", label: "Digital Prime Offer Fit", max: 10, help: "Fit with what Digital Prime actually builds." },
];

export const EMPTY_BREAKDOWN: ScoreBreakdown = {
  digitalNeed: 0,
  abilityToPay: 0,
  decisionMakerAccess: 0,
  easeOfProof: 0,
  activityGrowth: 0,
  brandQuality: 0,
  offerFit: 0,
};

export function totalScore(breakdown: ScoreBreakdown): number {
  return SCORE_CATEGORIES.reduce((sum, category) => {
    const raw = Number(breakdown[category.key] ?? 0);
    return sum + Math.max(0, Math.min(category.max, raw));
  }, 0);
}

export type Priority = "EXCEPTIONAL" | "HIGH PRIORITY" | "PROMISING" | "LOW PRIORITY" | "DO NOT PRIORITIZE";

export function priorityFor(score: number): Priority {
  if (score >= 90) return "EXCEPTIONAL";
  if (score >= 80) return "HIGH PRIORITY";
  if (score >= 70) return "PROMISING";
  if (score >= 60) return "LOW PRIORITY";
  return "DO NOT PRIORITIZE";
}

export const PRIORITIES: Priority[] = [
  "EXCEPTIONAL",
  "HIGH PRIORITY",
  "PROMISING",
  "LOW PRIORITY",
  "DO NOT PRIORITIZE",
];

export function normalizeBreakdown(value: unknown): ScoreBreakdown {
  const source = (value ?? {}) as Record<string, unknown>;
  const result = { ...EMPTY_BREAKDOWN };
  for (const category of SCORE_CATEGORIES) {
    const raw = Number(source[category.key]);
    result[category.key] = Number.isFinite(raw) ? Math.max(0, Math.min(category.max, raw)) : 0;
  }
  return result;
}
