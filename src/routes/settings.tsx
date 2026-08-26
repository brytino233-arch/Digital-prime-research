import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Conclusion, PageShell } from "@/components/brand";
import { Tag } from "@/components/tags";
import { getResearchProviderStatus } from "@/lib/research.functions";
import { SCORE_CATEGORIES } from "@/lib/scoring";
import {
  DEFAULT_PROVIDER_ID,
  devFallbackAvailable,
  isDevFallbackEnabled,
  listResearchProviders,
  setDevFallbackEnabled,
} from "@/lib/research";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Digital Prime Research" },
      {
        name: "description",
        content:
          "Research provider configuration, the Digital Prime Opportunity Score model and the evidence policy behind every claim.",
      },
      { property: "og:title", content: "Settings — Digital Prime Research" },
      { property: "og:description", content: "Provider status, scoring model and evidence policy." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const providers = listResearchProviders();
  const statusQuery = useQuery({ queryKey: ["research-provider-status"], queryFn: () => getResearchProviderStatus() });
  const [devFallback, setDevFallback] = useState(isDevFallbackEnabled());

  const configured = statusQuery.data?.configured ?? false;

  return (
    <PageShell>
      <section className="py-14">
        <p className="eyebrow">Settings</p>
        <h1 className="mt-5 font-display text-4xl sm:text-5xl">Configuration</h1>
        <p className="mt-5 max-w-2xl text-[17px] text-muted-foreground">
          Research provider, scoring model and evidence policy. API keys live only on the server and are never exposed
          to the browser.
        </p>
      </section>

      <section className="border-t border-border py-12">
        <h2 className="eyebrow">Research provider</h2>

        <div className="glass mt-6 flex flex-wrap items-center justify-between gap-4 p-6">
          <div>
            <p className="font-display text-2xl">{statusQuery.data?.providerName ?? "Web research provider"}</p>
            <p className="mt-1 text-[14px] text-muted-foreground">Production research interface · id: {DEFAULT_PROVIDER_ID}</p>
          </div>
          {statusQuery.isLoading ? (
            <Tag>Checking…</Tag>
          ) : configured ? (
            <Tag tone="verified">Connected</Tag>
          ) : (
            <Tag tone="observation">Not configured</Tag>
          )}
        </div>

        {!statusQuery.isLoading && !configured ? (
          <Conclusion label="Status" className="mt-6">
            <p className="text-[16px]">Research provider not configured.</p>
            <p className="mt-2 max-w-2xl text-[14px] text-muted-foreground">
              Until a provider is connected, research runs stop with this message. The application never substitutes
              simulated results for live research.
            </p>
          </Conclusion>
        ) : null}

        <div className="mt-8 grid gap-x-12 sm:grid-cols-2">
          {providers.map((provider) => (
            <div key={provider.id} className="border-t border-border py-4">
              <p className="text-[15px]">{provider.label}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                {provider.producesDemoData
                  ? "Development and testing only — never used automatically."
                  : "Production provider — server-side keys, cited evidence only."}
              </p>
            </div>
          ))}
        </div>

        {devFallbackAvailable() ? (
          <label className="mt-8 flex items-start gap-3 border-t border-border pt-6 text-[15px]">
            <input
              type="checkbox"
              checked={devFallback}
              onChange={(event) => {
                setDevFallback(event.target.checked);
                setDevFallbackEnabled(event.target.checked);
              }}
              className="mt-1 h-4 w-4 accent-[var(--primary)]"
            />
            <span>
              Use the development fallback provider
              <span className="mt-1 block text-[13px] text-muted-foreground">
                Development builds only. Results are simulated for testing the workflow, are stored separately and are
                always labelled as fallback data — never presented as research.
              </span>
            </span>
          </label>
        ) : null}
      </section>

      <section className="border-t border-border py-12">
        <h2 className="eyebrow">Digital Prime Opportunity Score</h2>
        <p className="mt-4 max-w-2xl text-[15px] text-muted-foreground">
          A transparent internal prioritization judgement across seven dimensions. It is not a probability of winning
          the client.
        </p>
        <ul className="mt-8 max-w-2xl">
          {SCORE_CATEGORIES.map((category) => (
            <li key={category.key} className="flex items-baseline justify-between gap-6 border-t border-border py-3.5">
              <span className="text-[16px]">{category.label}</span>
              <span className="text-[15px] tabular-nums text-muted-foreground">{category.max}</span>
            </li>
          ))}
          <li className="flex items-baseline justify-between gap-6 border-t border-border py-3.5">
            <span className="text-[16px] font-semibold">Total</span>
            <span className="text-[15px] font-semibold tabular-nums">100</span>
          </li>
        </ul>
      </section>

      <section className="border-t border-border py-12">
        <h2 className="eyebrow">Evidence policy</h2>
        <ul className="mt-6 max-w-2xl space-y-3.5 text-[16px] text-muted-foreground">
          <li>Every claim carries a classification: Verified fact, Observation or Inference.</li>
          <li>Unconfirmed details display “Not verified” instead of a guess.</li>
          <li>Sources are never invented; they come from the provider that produced the claim.</li>
          <li>Live research is never claimed when it was not performed.</li>
          <li>Outreach copy avoids loss claims, pressure language and criticism of the business.</li>
        </ul>
      </section>
    </PageShell>
  );
}
