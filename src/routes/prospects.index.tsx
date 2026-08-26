import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageShell } from "@/components/brand";
import { PriorityTag } from "@/components/tags";
import {
  PIPELINE_STAGES,
  fetchProspects,
  setArchived,
  setPipelineStage,
  type PipelineStage,
} from "@/lib/prospects";
import { isDevFallbackEnabled } from "@/lib/research";
import { PRIORITIES } from "@/lib/scoring";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/prospects/")({
  head: () => ({
    meta: [
      { title: "Prospects — Digital Prime Research" },
      {
        name: "description",
        content:
          "Every researched prospect in one place: opportunity score, priority, strongest opportunity, contact route and pipeline stage.",
      },
      { property: "og:title", content: "Prospects — Digital Prime Research" },
      { property: "og:description", content: "Filter, search and move prospects through the Digital Prime pipeline." },
    ],
  }),
  component: ProspectsPage,
});

const controlClass =
  "border-0 border-b border-input bg-transparent px-0 py-2 text-[14px] text-foreground focus:border-primary focus-visible:outline-none";

function ProspectsPage() {
  const queryClient = useQueryClient();
  const devFallback = isDevFallbackEnabled();
  const prospectsQuery = useQuery({
    queryKey: ["prospects", devFallback],
    queryFn: () => fetchProspects({ includeDevData: devFallback }),
  });

  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");
  const [priority, setPriority] = useState("All");
  const [stage, setStage] = useState("All");
  const [location, setLocation] = useState("All");
  const [minScore, setMinScore] = useState(0);
  const [showArchived, setShowArchived] = useState(false);

  const stageMutation = useMutation({
    mutationFn: ({ id, next }: { id: string; next: PipelineStage }) => setPipelineStage(id, next),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["prospects"] });
      toast.success(`Marked ${variables.next.toLowerCase()}`);
    },
    onError: () => toast.error("Could not update the pipeline stage"),
  });

  const archiveMutation = useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) => setArchived(id, archived),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["prospects"] });
      toast.success(variables.archived ? "Prospect archived" : "Prospect restored");
    },
    onError: () => toast.error("Could not update the prospect"),
  });

  const all = prospectsQuery.data ?? [];
  const industries = useMemo(() => ["All", ...new Set(all.map((item) => item.industry))], [all]);
  const locations = useMemo(() => ["All", ...new Set(all.map((item) => item.location))], [all]);

  const rows = useMemo(
    () =>
      all.filter((prospect) => {
        if (prospect.archived !== showArchived) return false;
        if (search && !prospect.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (industry !== "All" && prospect.industry !== industry) return false;
        if (priority !== "All" && prospect.priority !== priority) return false;
        if (stage !== "All" && prospect.pipeline_status !== stage) return false;
        if (location !== "All" && prospect.location !== location) return false;
        if (prospect.score_total < minScore) return false;
        return true;
      }),
    [all, search, industry, priority, stage, location, minScore, showArchived],
  );

  return (
    <PageShell>
      <section className="py-14">
        <p className="eyebrow">Prospects</p>
        <h1 className="mt-5 font-display text-4xl sm:text-5xl">The pipeline</h1>
        <p className="mt-5 max-w-2xl text-[17px] text-muted-foreground">
          Every researched business, scored and tracked from first look to signed work.
        </p>

        <ol className="glass mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
          {PIPELINE_STAGES.map((item) => {
            const count = all.filter((prospect) => prospect.pipeline_status === item && !prospect.archived).length;
            return (
              <li
                key={item}
                className={cn(
                  "border-b border-border p-4 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0",
                  count > 0 && "cobalt-rule pl-4",
                )}
              >
                <p className="text-[11px] font-semibold tracking-[0.09em] text-muted-foreground uppercase">{item}</p>
                <p className="mt-1.5 font-display text-2xl tabular-nums">{count}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="flex flex-wrap items-end gap-x-6 gap-y-4 border-y border-border py-5">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            aria-label="Search businesses by name"
            className={cn(controlClass, "w-52 pl-6")}
            placeholder="Search businesses"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <select aria-label="Industry" className={controlClass} value={industry} onChange={(e) => setIndustry(e.target.value)}>
          {industries.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <select aria-label="Priority" className={controlClass} value={priority} onChange={(e) => setPriority(e.target.value)}>
          {["All", ...PRIORITIES].map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <select aria-label="Pipeline stage" className={controlClass} value={stage} onChange={(e) => setStage(e.target.value)}>
          {["All", ...PIPELINE_STAGES].map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <select aria-label="Location" className={controlClass} value={location} onChange={(e) => setLocation(e.target.value)}>
          {locations.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-[14px] text-muted-foreground">
          Min score
          <input
            type="number"
            min={0}
            max={100}
            value={minScore}
            onChange={(event) => setMinScore(Number(event.target.value))}
            className={cn(controlClass, "w-16 tabular-nums")}
          />
        </label>
        <button
          type="button"
          onClick={() => setShowArchived((value) => !value)}
          className={cn(
            "pb-2 text-[14px] transition-colors",
            showArchived ? "text-primary" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {showArchived ? "Viewing archive" : "View archive"}
        </button>
        <span className="ml-auto pb-2 text-[13px] text-muted-foreground tabular-nums">{rows.length} shown</span>
      </div>

      {prospectsQuery.isLoading ? (
        <div className="space-y-4 pt-8">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="h-14 animate-pulse bg-muted" />
          ))}
        </div>
      ) : prospectsQuery.isError ? (
        <div role="alert" className="mt-8 border-l-2 border-destructive pl-5 text-[15px]">
          Could not load the prospect database.
        </div>
      ) : rows.length === 0 ? (
        <div className="py-20 text-center">
          <h2 className="font-display text-3xl">
            {all.length === 0 ? "Your research desk is empty." : "Nothing matches these filters."}
          </h2>
          <p className="mt-3 text-[16px] text-muted-foreground">
            {all.length === 0
              ? "Start a research run to discover potential Digital Prime clients."
              : "Clear a filter, or start a new research run."}
          </p>
          <Link
            to="/"
            className="mt-7 inline-flex bg-primary px-6 py-3 text-[13px] font-semibold tracking-[0.12em] text-primary-foreground uppercase hover:opacity-90"
          >
            Go to research
          </Link>
        </div>
      ) : (
        <div className="mt-2">
          {rows.map((prospect) => (
            <article key={prospect.id} className="border-b border-border py-6">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-10">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                    <Link
                      to="/prospects/$id"
                      params={{ id: prospect.id }}
                      className="font-display text-2xl text-foreground hover:text-primary"
                    >
                      {prospect.name}
                    </Link>
                    <PriorityTag priority={prospect.priority} />
                  </div>
                  <p className="mt-1.5 text-[14px] text-muted-foreground">
                    {prospect.industry} · {prospect.location} · Researched{" "}
                    {new Date(prospect.last_researched_at).toLocaleDateString()}
                  </p>
                  <p className="mt-3 max-w-2xl text-[15px]">
                    {prospect.strongest_opportunity ?? "Not verified"}
                    <span className="text-muted-foreground">
                      {" "}
                      · Contact via {prospect.best_contact_channel ?? "Not verified"}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                  <p className="font-display text-4xl leading-none tabular-nums">{prospect.score_total}</p>
                  <select
                    aria-label={`Pipeline stage for ${prospect.name}`}
                    className={controlClass}
                    value={prospect.pipeline_status}
                    onChange={(event) =>
                      stageMutation.mutate({ id: prospect.id, next: event.target.value as PipelineStage })
                    }
                  >
                    {PIPELINE_STAGES.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => archiveMutation.mutate({ id: prospect.id, archived: !prospect.archived })}
                    className="pb-2 text-[14px] text-muted-foreground hover:text-foreground"
                  >
                    {prospect.archived ? "Restore" : "Archive"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageShell>
  );
}
