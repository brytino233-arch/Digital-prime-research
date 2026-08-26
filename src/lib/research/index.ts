import { mockResearchProvider } from "./mock-provider";
import { realResearchProvider } from "./real-provider";
import type { ResearchProvider } from "./types";

/**
 * Provider registry — the only place that decides which research backend runs.
 *
 * PRODUCTION uses `realResearchProvider`. The mock provider exists strictly for
 * local development/testing and is never selected automatically.
 */
const providers: Record<string, ResearchProvider> = {
  [realResearchProvider.id]: realResearchProvider,
  [mockResearchProvider.id]: mockResearchProvider,
};

export const DEFAULT_PROVIDER_ID = realResearchProvider.id;
export const DEV_PROVIDER_ID = mockResearchProvider.id;

export function getResearchProvider(id: string = DEFAULT_PROVIDER_ID): ResearchProvider {
  return providers[id] ?? realResearchProvider;
}

export function listResearchProviders(): ResearchProvider[] {
  return [realResearchProvider, mockResearchProvider];
}

/**
 * Development fallback switch. Only honoured in a dev build, stored locally,
 * and always surfaced in the UI so fallback data is never mistaken for research.
 */
const DEV_FALLBACK_KEY = "dp.devFallbackProvider";

export function devFallbackAvailable(): boolean {
  return Boolean(import.meta.env.DEV);
}

export function isDevFallbackEnabled(): boolean {
  if (!devFallbackAvailable() || typeof window === "undefined") return false;
  return window.localStorage.getItem(DEV_FALLBACK_KEY) === "1";
}

export function setDevFallbackEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  if (enabled) window.localStorage.setItem(DEV_FALLBACK_KEY, "1");
  else window.localStorage.removeItem(DEV_FALLBACK_KEY);
}

export function activeProviderId(): string {
  return isDevFallbackEnabled() ? DEV_PROVIDER_ID : DEFAULT_PROVIDER_ID;
}

export * from "./types";
