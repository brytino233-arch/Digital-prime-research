import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/scoring";

export function Tag({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "cobalt" | "gold" | "verified" | "observation" | "inference" | "success" | "warning" | "danger" | "info";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "border-border text-muted-foreground",
    cobalt: "border-primary/30 bg-primary-soft text-primary",
    gold: "border-primary/30 bg-primary-soft text-primary",
    verified: "border-verified/40 text-verified",
    success: "border-verified/40 text-verified",
    observation: "border-observation/40 text-observation",
    warning: "border-observation/40 text-observation",
    inference: "border-inference/40 text-inference",
    info: "border-inference/40 text-inference",
    danger: "border-destructive/40 text-destructive",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 text-[11px] font-semibold tracking-[0.07em] whitespace-nowrap uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PriorityTag({ priority }: { priority: Priority }) {
  const tone =
    priority === "EXCEPTIONAL"
      ? "cobalt"
      : priority === "HIGH PRIORITY"
        ? "verified"
        : priority === "PROMISING"
          ? "inference"
          : priority === "LOW PRIORITY"
            ? "observation"
            : "danger";
  return <Tag tone={tone as never}>{priority}</Tag>;
}

export function ClassificationTag({ value }: { value: string }) {
  const tone = value === "VERIFIED FACT" ? "verified" : value === "OBSERVATION" ? "observation" : "inference";
  return <Tag tone={tone as never}>{value}</Tag>;
}

export function FrictionTag({ value }: { value: string }) {
  const tone =
    value === "High" ? "danger" : value === "Medium" ? "observation" : value === "Low" ? "verified" : "neutral";
  return <Tag tone={tone as never}>{value === "Not verified" ? "Not verified" : `${value} friction`}</Tag>;
}

/** Development-only marker. Never rendered for production research records. */
export function DevDataTag() {
  return <Tag tone="observation">Development fallback</Tag>;
}

export function Field({
  label,
  value,
  href,
}: {
  label: string;
  value?: string | null | undefined;
  href?: string | null | undefined;
}) {
  const display = value && value.trim().length > 0 ? value : "Not verified";
  const missing = display === "Not verified";
  return (
    <div className="border-t border-border py-3.5">
      <dt className="eyebrow">{label}</dt>
      <dd className={cn("mt-1 break-words", missing ? "text-muted-foreground italic" : "text-foreground")}>
        {href && !missing ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
          >
            {display}
          </a>
        ) : (
          display
        )}
      </dd>
    </div>
  );
}
