import { Link } from "@tanstack/react-router";

import { PageShell } from "@/components/brand";
import { Tag } from "@/components/tags";

export function ComingSoon({
  eyebrow,
  title,
  description,
  bullets,
}: {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <PageShell>
      <section className="border-b border-border py-14">
        <p className="eyebrow">{eyebrow}</p>
        <div className="mt-5 flex flex-wrap items-baseline gap-5">
          <h1 className="font-display text-4xl sm:text-5xl">{title}</h1>
          <Tag tone="cobalt">Coming in V2</Tag>
        </div>
        <p className="mt-5 max-w-2xl text-[17px] text-muted-foreground">{description}</p>
      </section>

      <div className="grid gap-x-12 md:grid-cols-3">
        {bullets.map((bullet, index) => (
          <div key={bullet} className="border-b border-border py-8">
            <p className="text-[13px] tabular-nums text-primary">{String(index + 1).padStart(2, "0")}</p>
            <p className="mt-3 text-[15px]">{bullet}</p>
          </div>
        ))}
      </div>

      <div className="py-12">
        <p className="text-[15px] text-muted-foreground">
          In V1, this work happens inside each prospect's research dossier.
        </p>
        <Link
          to="/prospects"
          className="mt-6 inline-flex bg-primary px-6 py-3 text-[13px] font-semibold tracking-[0.12em] text-primary-foreground uppercase hover:opacity-90"
        >
          Open prospects
        </Link>
      </div>
    </PageShell>
  );
}
