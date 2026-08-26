import { SCORE_CATEGORIES, type ScoreBreakdown } from "@/lib/scoring";
import { cn } from "@/lib/utils";

/** Large editorial score numeral — one of the strongest visual elements in the product. */
export function ScoreMark({
  score,
  size = "md",
  align = "right",
}: {
  score: number;
  size?: "sm" | "md" | "lg";
  align?: "left" | "right";
}) {
  const type = { sm: "text-3xl", md: "text-5xl", lg: "text-7xl" }[size];
  return (
    <div className={cn("shrink-0", align === "right" ? "text-right" : "text-left")}>
      <p className={cn("font-display leading-none tabular-nums text-foreground", type)}>{score}</p>
      <p className="mt-1.5 text-[11px] font-semibold tracking-[0.09em] text-muted-foreground uppercase">
        {size === "sm" ? "Score" : "Opportunity score"}
      </p>
    </div>
  );
}

export function ScoreDial({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const dimensions = { sm: 56, md: 84, lg: 116 }[size];
  const stroke = { sm: 2, md: 3, lg: 3 }[size];
  const radius = (dimensions - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score)) / 100;

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: dimensions, height: dimensions }}
    >
      <svg width={dimensions} height={dimensions} className="-rotate-90" aria-hidden="true">
        <circle cx={dimensions / 2} cy={dimensions / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-border" />
        <circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          className="stroke-primary transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            "font-display leading-none tabular-nums",
            size === "lg" ? "text-4xl" : size === "md" ? "text-2xl" : "text-lg",
          )}
        >
          {score}
        </span>
      </div>
    </div>
  );
}

export function ScoreBreakdownTable({ breakdown }: { breakdown: ScoreBreakdown }) {
  return (
    <dl className="grid gap-y-6 gap-x-12 sm:grid-cols-2">
      {SCORE_CATEGORIES.map((category) => {
        const value = breakdown[category.key];
        const pct = Math.round((value / category.max) * 100);
        return (
          <div key={category.key} className="border-t border-border pt-3.5">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[15px] text-foreground">{category.label}</dt>
              <dd className="text-sm tabular-nums text-foreground">
                <span className="font-semibold">{value}</span>
                <span className="text-muted-foreground"> / {category.max}</span>
              </dd>
            </div>
            <div className="mt-2.5 h-[2px] w-full bg-border" role="presentation">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-[13px] text-muted-foreground">{category.help}</p>
          </div>
        );
      })}
    </dl>
  );
}
