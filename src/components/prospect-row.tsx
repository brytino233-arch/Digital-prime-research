import { Link } from "@tanstack/react-router";

import { PriorityTag } from "@/components/tags";
import type { Prospect } from "@/lib/prospects";

/**
 * Editorial ranking entry — typography, thin rules and asymmetry rather than a card.
 */
export function ProspectRanking({
  prospect,
  rank,
  onProofPack,
  onOutreach,
}: {
  prospect: Prospect;
  rank: number;
  onProofPack?: () => void;
  onOutreach?: () => void;
}) {
  return (
    <article className="group border-t border-border py-9 transition-colors first:border-t-0 hover:bg-glass">
      <div className="grid gap-6 md:grid-cols-[64px_minmax(0,1fr)_auto] md:gap-10">
        <p className="font-display text-3xl leading-none text-muted-foreground/70 tabular-nums md:pt-2">
          {String(rank).padStart(2, "0")}
        </p>

        <div className="min-w-0">
          <h3 className="font-display text-3xl leading-tight break-words sm:text-4xl">{prospect.name}</h3>
          <p className="mt-2 text-[15px] text-muted-foreground">
            {prospect.industry} · {prospect.location}
          </p>

          <div className="mt-6 cobalt-rule">
            <p className="text-[11px] font-semibold tracking-[0.09em] text-primary uppercase">Opportunity</p>
            <p className="mt-1.5 text-[17px]">{prospect.strongest_opportunity ?? "Not verified"}</p>
            <p className="mt-1 text-[14px] text-muted-foreground">{prospect.why_it_matters ?? "Not verified"}</p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              to="/prospects/$id"
              params={{ id: prospect.id }}
              className="text-[13px] font-semibold tracking-[0.12em] text-primary uppercase underline decoration-primary/30 underline-offset-[6px] hover:decoration-primary"
            >
              View research
            </Link>
            {onProofPack ? (
              <button
                type="button"
                onClick={onProofPack}
                className="text-[14px] text-muted-foreground transition-colors hover:text-foreground"
              >
                Build proof pack
              </button>
            ) : null}
            {onOutreach ? (
              <button
                type="button"
                onClick={onOutreach}
                className="text-[14px] text-muted-foreground transition-colors hover:text-foreground"
              >
                Draft outreach
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex items-start gap-5 md:flex-col md:items-end md:text-right">
          <p className="font-display text-6xl leading-none tabular-nums">{prospect.score_total}</p>
          <div className="md:mt-3">
            <p className="text-[11px] font-semibold tracking-[0.09em] text-muted-foreground uppercase md:mb-2">
              Opportunity score
            </p>
            <PriorityTag priority={prospect.priority} />
          </div>
        </div>
      </div>
    </article>
  );
}
