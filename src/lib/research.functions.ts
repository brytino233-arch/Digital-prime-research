import { createServerFn } from "@tanstack/react-start";

import {
  performRealResearch,
  readProviderStatus,
} from "@/lib/research/real-research.server";
import type { ResearchQuery } from "@/lib/research/types";

export const getResearchProviderStatus = createServerFn({ method: "GET" })
  .handler(async () => readProviderStatus());

export const runRealResearch = createServerFn({ method: "POST" })
  .validator((data: ResearchQuery) => data)
  .handler(async ({ data }) => performRealResearch(data));
