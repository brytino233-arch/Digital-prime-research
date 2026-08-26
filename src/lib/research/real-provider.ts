import { runRealResearch } from "@/lib/research.functions";
import { RESEARCH_STAGES, type ResearchProvider } from "./types";

/**
 * REAL RESEARCH PROVIDER — the production research interface.
 * All work happens server-side so API keys never reach the client.
 * If no provider is configured it fails loudly rather than returning fake data.
 */
export const realResearchProvider: ResearchProvider = {
  id: "web-research",
  label: "Web research provider",
  producesDemoData: false,
  async run(query, hooks) {
    hooks?.onStage?.(RESEARCH_STAGES[0], "Researching");
    try {
      const results = await runRealResearch({ data: query });
      for (const stage of RESEARCH_STAGES) hooks?.onStage?.(stage, "Complete");
      return results;
    } catch (error) {
      hooks?.onStage?.(RESEARCH_STAGES[0], "Failed");
      throw error instanceof Error ? error : new Error("Research provider request failed.");
    }
  },
};
