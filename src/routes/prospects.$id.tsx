import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { PageShell } from "@/components/brand";
import { CopyButton } from "@/components/copy-button";
import { ScoreBreakdownTable, ScoreDial } from "@/components/score";
import { ClassificationTag, DevDataTag, Field, FrictionTag, PriorityTag, Tag } from "@/components/tags";
import {
  buildOutreach,
  buildProofPack,
  saveOutreach,
  saveProofPack,
  type ProofPackPage,
} from "@/lib/generators";
import { PIPELINE_STAGES, fetchProspectDetail, setPipelineStage, type PipelineStage } from "@/lib/prospects";

export const Route = createFileRoute("/prospects/$id")({
  head: () => ({
    meta: [
      { title: "Prospect Research — Digital Prime Research AI" },
      {
        name: "description",
        content:
          "Full research record: business profile, decision maker, digital presence audit, customer journey, bottlenecks, opportunities and recommended offer.",
      },
      { property: "og:title", content: "Prospect Research — Digital Prime Research AI" },
      { property: "og:description", content: "Evidence-labelled research record for a single prospect." },
    ],
  }),
  component: ProspectDetailPage,
});

function Section({ title, children, id }: { title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="border-t border-border py-10 scroll-mt-20">
      <h2 className="eyebrow">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function ProspectDetailPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const detailQuery = useQuery({ queryKey: ["prospect", id], queryFn: () => fetchProspectDetail(id) });

  const stageMutation = useMutation({
    mutationFn: (next: PipelineStage) => setPipelineStage(id, next),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["prospect", id] }),
        queryClient.invalidateQueries({ queryKey: ["prospects"] }),
      ]);
      toast.success("Pipeline updated");
    },
    onError: () => toast.error("Could not update the pipeline stage"),
  });

  const proofMutation = useMutation({
    mutationFn: async () => {
      if (!detailQuery.data) throw new Error("Research not loaded yet");
      await saveProofPack(id, buildProofPack(detailQuery.data));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["prospect", id] });
      toast.success("Proof pack brief generated");
    },
    onError: () => toast.error("Could not generate the proof pack"),
  });

  const outreachMutation = useMutation({
    mutationFn: async () => {
      if (!detailQuery.data) throw new Error("Research not loaded yet");
      await saveOutreach(id, buildOutreach(detailQuery.data));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["prospect", id] });
      toast.success("Outreach draft generated");
    },
    onError: () => toast.error("Could not generate the outreach draft"),
  });

  if (detailQuery.isLoading) {
    return (
      <PageShell>
        <div className="space-y-4 py-16">
          <div className="h-24 animate-pulse bg-surface" />
          <div className="h-64 animate-pulse bg-surface" />
        </div>
      </PageShell>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <PageShell>
        <div role="alert" className="mt-16 border border-destructive/50 bg-destructive/10 p-8">
          <h1 className="font-display text-2xl">This research record could not be loaded</h1>
          <p className="mt-2 text-sm text-muted-foreground">It may have been removed.</p>
          <Link to="/prospects" className="mt-6 inline-flex border border-border px-4 py-2 font-mono text-[10px] tracking-[0.16em] uppercase">
            Back to prospects
          </Link>
        </div>
      </PageShell>
    );
  }

  const { prospect, report, evidence, decisionMakers, opportunities, competitors, outreach, proofPacks, events } =
    detailQuery.data;
  const latestPack = (proofPacks[0]?.pages as ProofPackPage[] | undefined) ?? null;
  const latestOutreach = outreach[0] ?? null;

  return (
    <PageShell>
      <div className="pt-8">
        <Link
          to="/prospects"
          className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground hover:text-gold"
        >
          <ArrowLeft className="h-3 w-3" /> All prospects
        </Link>
      </div>

      <header className="flex flex-col gap-6 border-b border-border py-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <PriorityTag priority={prospect.priority} />
            {prospect.is_demo ? <DevDataTag /> : null}
            <Tag>{prospect.pipeline_status}</Tag>
          </div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">{prospect.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {prospect.industry} · {prospect.location} · Researched{" "}
            {new Date(prospect.last_researched_at).toLocaleDateString()} · Provider: {report?.provider ?? "Not verified"}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="eyebrow">Digital Prime Opportunity Score</p>
            <p className="mt-1 text-xs text-muted-foreground">Internal prioritization heuristic, not a probability.</p>
          </div>
          <ScoreDial score={prospect.score_total} size="lg" />
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 border-b border-border py-5">
        <select
          aria-label="Pipeline stage"
          className="border border-input bg-background px-3 py-2 text-xs focus-visible:border-gold/70 focus-visible:outline-none"
          value={prospect.pipeline_status}
          onChange={(event) => stageMutation.mutate(event.target.value as PipelineStage)}
        >
          {PIPELINE_STAGES.map((option) => (
            <option key={option}>Mark {option.toLowerCase()}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => proofMutation.mutate()}
          disabled={proofMutation.isPending}
          className="border border-gold/60 px-3 py-2 font-mono text-[10px] tracking-[0.16em] uppercase text-gold transition-colors hover:bg-gold hover:text-primary-foreground disabled:opacity-50"
        >
          Build proof pack
        </button>
        <button
          type="button"
          onClick={() => outreachMutation.mutate()}
          disabled={outreachMutation.isPending}
          className="border border-border px-3 py-2 font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          Generate outreach
        </button>
      </div>

      <Section title="Opportunity score breakdown">
        <ScoreBreakdownTable breakdown={prospect.scoreBreakdown} />
      </Section>

      <Section title="Business profile">
        <dl className="grid gap-x-10 sm:grid-cols-2">
          <Field label="Name" value={prospect.name} />
          <Field label="Industry" value={prospect.industry} />
          <Field label="Location" value={prospect.location} />
          <Field label="Website" value={prospect.website} href={prospect.website} />
          <Field label="Instagram" value={prospect.instagram} />
          <Field label="Facebook" value={prospect.facebook} />
          <Field label="TikTok" value={prospect.tiktok} />
          <Field label="Phone" value={prospect.phone} />
          <Field label="Email" value={prospect.email} />
          <Field label="Operating status" value={prospect.operating_status} />
        </dl>
      </Section>

      <Section title="Decision maker">
        {decisionMakers.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Not verified</p>
        ) : (
          decisionMakers.map((person) => (
            <dl key={person.id} className="grid gap-x-10 sm:grid-cols-2">
              <Field label="Name" value={person.name} />
              <Field label="Role" value={person.role} />
              <Field label="Public profile" value={person.public_profile} />
              <Field label="Contact route" value={person.contact_route} />
              <Field label="Confidence" value={person.confidence} />
            </dl>
          ))
        )}
      </Section>

      <Section title="Digital presence">
        <div className="grid gap-px bg-border sm:grid-cols-2">
          {(report?.digital_presence ?? []).map((item) => (
            <div key={item.label} className="bg-surface p-4">
              <p className="eyebrow">{item.label}</p>
              <p className="mt-1 text-sm">{item.status}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
            </div>
          ))}
          {(report?.digital_presence ?? []).length === 0 ? (
            <p className="bg-surface p-4 text-sm text-muted-foreground italic">Not verified</p>
          ) : null}
        </div>
      </Section>

      <Section title="Customer journey">
        <ol className="space-y-px">
          {(report?.customer_journey ?? []).map((stage, index) => (
            <li key={stage.stage} className="bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-[11px] tracking-[0.18em] text-gold uppercase">
                  {String(index + 1).padStart(2, "0")} — {stage.stage}
                </p>
                <FrictionTag value={stage.friction} />
              </div>
              <p className="mt-3 text-sm">{stage.current}</p>
              <p className="mt-1 text-xs text-muted-foreground">Evidence: {stage.evidence}</p>
            </li>
          ))}
          {(report?.customer_journey ?? []).length === 0 ? (
            <li className="bg-surface p-5 text-sm text-muted-foreground italic">Not verified</li>
          ) : null}
        </ol>
      </Section>

      <Section title="Digital bottlenecks">
        <div className="space-y-px">
          {(report?.bottlenecks ?? []).map((item) => (
            <article key={item.rank} className="bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-xl">
                  {String(item.rank).padStart(2, "0")} — {item.problem}
                </h3>
                <div className="flex items-center gap-2">
                  <ClassificationTag value={item.classification} />
                  <Tag>Confidence: {item.confidence}</Tag>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{item.impact}</p>
              <p className="mt-1 text-xs text-muted-foreground">Evidence: {item.evidence}</p>
            </article>
          ))}
          {(report?.bottlenecks ?? []).length === 0 ? (
            <p className="bg-surface p-5 text-sm text-muted-foreground italic">Not verified</p>
          ) : null}
        </div>
      </Section>

      <Section title="Opportunities">
        <div className="grid gap-px bg-border md:grid-cols-2">
          {opportunities.map((item) => (
            <article key={item.id} className="bg-surface p-5">
              <h3 className="font-display text-xl">{item.title}</h3>
              <div className="mt-3 flex gap-2">
                <Tag tone="info">Impact: {item.impact}</Tag>
                <Tag>Difficulty: {item.difficulty}</Tag>
              </div>
              <p className="mt-3 text-sm">{item.solution ?? "Not verified"}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.why_it_fits ?? "Not verified"}</p>
            </article>
          ))}
          {opportunities.length === 0 ? (
            <p className="bg-surface p-5 text-sm text-muted-foreground italic">Not verified</p>
          ) : null}
        </div>
      </Section>

      <Section title="Competitor benchmark">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Competitor", "Website", "Booking", "Pricing", "UX", "Search presence"].map((heading) => (
                  <th key={heading} className="eyebrow px-3 py-3 text-left font-normal">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {competitors.map((item) => (
                <tr key={item.id} className="border-b border-border">
                  <td className="px-3 py-3">{item.name}</td>
                  <td className="px-3 py-3 text-muted-foreground">{item.websiteNote}</td>
                  <td className="px-3 py-3 text-muted-foreground">{item.bookingNote}</td>
                  <td className="px-3 py-3 text-muted-foreground">{item.pricingNote}</td>
                  <td className="px-3 py-3 text-muted-foreground">{item.uxNote}</td>
                  <td className="px-3 py-3 text-muted-foreground">{item.searchNote}</td>
                </tr>
              ))}
              {competitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-sm text-muted-foreground italic">
                    Not verified
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Evidence">
        <p className="mb-5 max-w-2xl text-xs text-muted-foreground">
          Every claim carries a classification. Anything unconfirmed reads “Not verified” rather than being guessed.
        </p>
        <div className="space-y-px">
          {evidence.map((item) => (
            <article key={item.id} className="bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <ClassificationTag value={item.classification} />
                <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                  {item.source_type} · Confidence {item.confidence} · Checked {item.date_checked}
                </span>
              </div>
              <p className="mt-3 text-sm">{item.claim}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Source: {item.source_name}
                {item.source_url ? (
                  <>
                    {" — "}
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="underline decoration-gold/50 underline-offset-4 hover:text-gold"
                    >
                      {item.source_url}
                    </a>
                  </>
                ) : (
                  " — no public source link recorded"
                )}
              </p>
            </article>
          ))}
          {evidence.length === 0 ? (
            <p className="bg-surface p-5 text-sm text-muted-foreground italic">No findings recorded.</p>
          ) : null}
        </div>
      </Section>

      <Section title="Recommended offer">
        <dl className="grid gap-x-10 sm:grid-cols-2">
          <Field label="Offer name" value={report?.recommended_offer?.name ?? prospect.recommended_offer} />
          <Field label="Suggested price range" value={report?.recommended_offer?.priceRange ?? prospect.price_range} />
          <Field label="What Digital Prime would build" value={report?.recommended_offer?.build} />
          <Field label="Why this offer fits" value={report?.recommended_offer?.whyItFits} />
          <Field label="Proof concept to create" value={report?.recommended_offer?.proofConcept} />
          <Field label="Recommended outreach angle" value={report?.recommended_offer?.outreachAngle} />
        </dl>
      </Section>

      <Section title="Proof pack brief" id="proof-pack">
        {!latestPack ? (
          <div className="border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No proof pack yet. Generate a six-page brief from this research.</p>
            <button
              type="button"
              onClick={() => proofMutation.mutate()}
              className="mt-5 border border-gold/60 px-4 py-2 font-mono text-[10px] tracking-[0.16em] uppercase text-gold hover:bg-gold hover:text-primary-foreground"
            >
              Build proof pack
            </button>
          </div>
        ) : (
          <div className="space-y-px">
            {latestPack.map((page) => (
              <article key={page.page} className="bg-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-mono text-[11px] tracking-[0.18em] text-gold uppercase">
                    Page {page.page} — {page.title}
                  </p>
                  <CopyButton
                    text={`PAGE ${page.page} — ${page.title}\nHeading: ${page.heading}\nCopy: ${page.copy}\nEvidence: ${page.evidence}\nSuggested visual: ${page.visual}\nKey message: ${page.keyMessage}`}
                    label="Copy section"
                  />
                </div>
                <h3 className="mt-3 font-display text-2xl">{page.heading}</h3>
                <p className="mt-2 text-sm whitespace-pre-line">{page.copy}</p>
                <dl className="mt-4 grid gap-x-8 text-xs text-muted-foreground sm:grid-cols-3">
                  <div>
                    <dt className="eyebrow">Evidence</dt>
                    <dd className="mt-1">{page.evidence}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Suggested visual</dt>
                    <dd className="mt-1">{page.visual}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow">Key message</dt>
                    <dd className="mt-1">{page.keyMessage}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </Section>

      <Section title="Outreach draft" id="outreach">
        {!latestOutreach ? (
          <div className="border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No outreach draft yet. Drafts stay respectful — no pressure language, no invented claims.
            </p>
            <button
              type="button"
              onClick={() => outreachMutation.mutate()}
              className="mt-5 border border-gold/60 px-4 py-2 font-mono text-[10px] tracking-[0.16em] uppercase text-gold hover:bg-gold hover:text-primary-foreground"
            >
              Generate outreach
            </button>
          </div>
        ) : (
          <div className="space-y-px">
            {(
              [
                ["Target", latestOutreach.target],
                ["Channel", latestOutreach.channel],
                ["Opening", latestOutreach.opening],
                ["Problem", latestOutreach.problem],
                ["Value", latestOutreach.value],
                ["CTA", latestOutreach.cta],
                ["Follow-up", latestOutreach.follow_up],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="bg-surface p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="eyebrow">{label}</p>
                  <CopyButton text={value ?? ""} />
                </div>
                <p className="mt-2 text-sm">{value ?? "Not verified"}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Pipeline history">
        <ul className="space-y-px">
          {events.map((event) => (
            <li key={event.id} className="flex flex-wrap items-center justify-between gap-3 bg-surface px-5 py-3">
              <span className="font-mono text-[11px] tracking-[0.16em] uppercase">{event.status}</span>
              <span className="text-xs text-muted-foreground">{event.note ?? ""}</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {new Date(event.created_at).toLocaleString()}
              </span>
            </li>
          ))}
          {events.length === 0 ? <li className="bg-surface p-5 text-sm text-muted-foreground">No history yet.</li> : null}
        </ul>
      </Section>
    </PageShell>
  );
}
