import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageShell } from "@/components/brand";
import { ProspectRanking } from "@/components/prospect-row";
import { ResearchPanel } from "@/components/research-panel";
import { ResearchProgress } from "@/components/research-progress";
import { buildOutreach, buildProofPack, saveOutreach, saveProofPack } from "@/lib/generators";
import { fetchProspectDetail, fetchProspects, saveResearchResults, type Prospect } from "@/lib/prospects";
import {
  RESEARCH_STAGES,
  activeProviderId,
  devFallbackAvailable,
  getResearchProvider,
  isDevFallbackEnabled,
  type ResearchQuery,
  type StageName,
  type StageState,
} from "@/lib/research";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Research Desk — Digital Prime Research" },
      {
        name: "description",
        content:
          "Research businesses, uncover digital opportunities and focus on the prospects most worth pursuing — evidence-labelled and transparently scored.",
      },
      { property: "og:title", content: "Research Desk — Digital Prime Research" },
      {
        property: "og:description",
        content: "Who should Digital Prime talk to next? Research, qualify and decide.",
      },
    ],
  }),
  component: ResearchDashboard,
});

const initialStages = () =>
  Object.fromEntries(RESEARCH_STAGES.map((stage) => [stage, "Pending"])) as Record<StageName, StageState>;

function ResearchDashboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [stages, setStages] = useState<Record<StageName, StageState>>(initialStages);
  const [running, setRunning] = useState(false);
  const [runIds, setRunIds] = useState<string[] | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const devFallback = isDevFallbackEnabled();

  const prospectsQuery = useQuery({
    queryKey: ["prospects", devFallback],
    queryFn: () => fetchProspects({ includeDevData: devFallback }),
  });

  const research = useMutation({
    mutationFn: async (query: ResearchQuery) => {
      const provider = getResearchProvider(activeProviderId());
      const results = await provider.run(query, {
        onStage: (stage, state) => setStages((current) => ({ ...current, [stage]: state })),
      });
      const kept = results.filter((result) => {
        const total = Object.values(result.scoreBreakdown).reduce((sum, value) => sum + value, 0);
        return total >= (query.minScore ?? 0);
      });
      if (kept.length === 0) throw new Error("No prospects met your filters. Try loosening them.");
      return saveResearchResults(kept, {
        goal: query.goal === "Custom" ? `Custom: ${query.customGoal}` : query.goal,
        provider: provider.id,
      });
    },
    onMutate: () => {
      setRunError(null);
      setRunIds(null);
      setRunning(true);
      setStages(initialStages());
    },
    onSuccess: async (ids) => {
      setRunIds(ids);
      await queryClient.invalidateQueries({ queryKey: ["prospects"] });
      toast.success(`${ids.length} prospects researched`);
    },
    onError: (error: Error) => {
      setRunError(error.message);
      setStages((current) => {
        const next = { ...current };
        for (const stage of RESEARCH_STAGES) if (next[stage] === "Researching") next[stage] = "Failed";
        return next;
      });
      toast.error(error.message);
    },
    onSettled: () => setRunning(false),
  });

  const displayed: Prospect[] = useMemo(() => {
    const all = (prospectsQuery.data ?? []).filter((prospect) => !prospect.archived);
    if (runIds) return all.filter((prospect) => runIds.includes(prospect.id));
    return all.slice(0, 8);
  }, [prospectsQuery.data, runIds]);

  const generate = useCallback(
    async (prospectId: string, kind: "proof" | "outreach") => {
      try {
        const detail = await fetchProspectDetail(prospectId);
        if (kind === "proof") {
          await saveProofPack(prospectId, buildProofPack(detail));
          toast.success("Proof pack built from this prospect's research");
        } else {
          await saveOutreach(prospectId, buildOutreach(detail));
          toast.success("Outreach drafted from this prospect's research");
        }
        navigate({
          to: "/prospects/$id",
          params: { id: prospectId },
          hash: kind === "proof" ? "proof-pack" : "outreach",
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong");
      }
    },
    [navigate],
  );

  const anyStageActive = running || Object.values(stages).some((state) => state !== "Pending");
  const hasResults = displayed.length > 0;

  return (
    <PageShell>
      <section className="grid gap-12 py-16 lg:grid-cols-[1fr_minmax(0,1.15fr)] lg:items-start lg:gap-16 lg:py-24">
        <div className="lg:sticky lg:top-28">
          <p className="eyebrow">Research desk</p>
          <h1 className="mt-6 max-w-xl font-display text-[2.6rem] leading-[1.05] sm:text-6xl">
            Who should Digital&nbsp;Prime talk to next?
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-muted-foreground">
            Research businesses, uncover digital opportunities, and focus your time on the prospects most worth
            pursuing.
          </p>
          <ol className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-[12px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            {["Research", "Understand", "Qualify", "Decide", "Act"].map((step, index) => (
              <li key={step} className="flex items-center gap-4">
                {step}
                {index < 4 ? <span className="text-border-strong">/</span> : null}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <ResearchPanel
            running={running}
            onStart={(query) => research.mutate(query)}
            notice={
              devFallback
                ? "Development fallback provider is active. Results are simulated for testing only and are not research."
                : "Research runs against the configured provider. Nothing is fabricated — unverified details read “Not verified.”"
            }
          />
          {anyStageActive ? (
            <div className="mt-6">
              <ResearchProgress stages={stages} />
            </div>
          ) : null}
          {runError ? (
            <div role="alert" className="mt-6 border-l-2 border-destructive pl-5">
              <p className="text-[12px] font-semibold tracking-[0.1em] text-destructive uppercase">Research stopped</p>
              <p className="mt-2 text-[15px]">{runError}</p>
              {devFallbackAvailable() ? (
                <p className="mt-2 text-[13px] text-muted-foreground">
                  Configure a research provider in Settings, or enable the development fallback there for testing.
                </p>
              ) : (
                <p className="mt-2 text-[13px] text-muted-foreground">Configure a research provider in Settings.</p>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <section className="pt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-5">
          <h2 className="font-display text-3xl">{runIds ? "This research run" : "Research desk"}</h2>
          <p className="text-[13px] text-muted-foreground">
            Digital Prime Opportunity Score — an internal prioritization judgement, not a probability.
          </p>
        </div>

        {prospectsQuery.isLoading ? (
          <div className="space-y-6 pt-10">
            {[0, 1, 2].map((key) => (
              <div key={key} className="h-28 animate-pulse bg-muted" />
            ))}
          </div>
        ) : prospectsQuery.isError ? (
          <div role="alert" className="mt-10 border-l-2 border-destructive pl-5 text-[15px]">
            Could not load prospects. Check your connection and try again.
          </div>
        ) : !hasResults ? (
          <div className="py-20 text-center">
            <h3 className="font-display text-4xl">Your research desk is empty.</h3>
            <p className="mx-auto mt-4 max-w-md text-[17px] text-muted-foreground">
              Start a research run to discover potential Digital Prime clients.
            </p>
          </div>
        ) : (
          <div className="pt-4">
            {displayed.map((prospect, index) => (
              <ProspectRanking
                key={prospect.id}
                prospect={prospect}
                rank={index + 1}
                onProofPack={() => generate(prospect.id, "proof")}
                onOutreach={() => generate(prospect.id, "outreach")}
              />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
