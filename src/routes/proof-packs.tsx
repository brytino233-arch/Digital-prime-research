import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/proof-packs")({
  head: () => ({
    meta: [
      { title: "Proof Packs — Digital Prime Research AI" },
      {
        name: "description",
        content:
          "A library of Digital Prime proof-pack briefs: six-page audit narratives built from recorded prospect research.",
      },
      { property: "og:title", content: "Proof Packs — Digital Prime Research AI" },
      { property: "og:description", content: "Six-page audit briefs generated from evidence-labelled research." },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Proof Packs"
      title="Proof pack library"
      description="V1 generates the six-page proof-pack brief inside each prospect's research record. V2 turns that library into a shared, designed deliverable."
      bullets={[
        "Central library of every generated proof pack, searchable by business and industry.",
        "Designed PDF export using the Digital Prime layout system.",
        "Reusable before/after templates per industry archetype.",
      ]}
    />
  ),
});
