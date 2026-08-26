import { Check, Loader2, X } from "lucide-react";

import { RESEARCH_STAGES, type StageName, type StageState } from "@/lib/research";
import { cn } from "@/lib/utils";

export function ResearchProgress({ stages }: { stages: Record<StageName, StageState> }) {
  return (
    <section className="glass p-6 sm:p-8" aria-live="polite">
      <h2 className="eyebrow">Research in progress</h2>
      <ol className="mt-5">
        {RESEARCH_STAGES.map((stage, index) => {
          const state = stages[stage] ?? "Pending";
          return (
            <li key={stage} className="flex items-center gap-4 border-t border-border py-3.5 first:border-t-0">
              <span className={cn("text-[13px] tabular-nums", state === "Complete" ? "text-primary" : "text-muted-foreground")}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={cn("flex-1 text-[15px]", state === "Pending" ? "text-muted-foreground" : "text-foreground")}>
                {stage}
              </span>
              <span className="flex items-center gap-2 text-[13px]">
                {state === "Researching" ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span className="text-primary">Working</span>
                  </>
                ) : state === "Complete" ? (
                  <Check className="h-4 w-4 text-verified" />
                ) : state === "Failed" ? (
                  <X className="h-4 w-4 text-destructive" />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
