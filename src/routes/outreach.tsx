import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "@/components/coming-soon";

export const Route = createFileRoute("/outreach")({
  head: () => ({
    meta: [
      { title: "Outreach — Digital Prime Research AI" },
      {
        name: "description",
        content:
          "Respectful, evidence-bounded outreach drafts for researched Accra prospects — target, channel, opening, value and a low-pressure next step.",
      },
      { property: "og:title", content: "Outreach — Digital Prime Research AI" },
      { property: "og:description", content: "Conversation-starting outreach drafts, never spam." },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Outreach"
      title="Outreach workspace"
      description="V1 generates outreach drafts inside each prospect's research record, ready to copy. V2 adds sequencing and reply tracking — sending always stays manual and human."
      bullets={[
        "Queue of drafted messages grouped by channel and pipeline stage.",
        "Reply and meeting tracking wired to the pipeline.",
        "Tone review so nothing reads like a template blast.",
      ]}
    />
  ),
});
