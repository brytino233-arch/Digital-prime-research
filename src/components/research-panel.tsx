import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { RESEARCH_GOALS, type ResearchGoal, type ResearchQuery } from "@/lib/research";
import { cn } from "@/lib/utils";

const GOAL_LABELS: Record<ResearchGoal, string> = {
  "Find most likely to buy": "Most likely to buy",
  "Find highest-value prospects": "Highest-value opportunities",
  "Find easiest quick wins": "Easiest quick wins",
  "Find businesses with obvious digital bottlenecks": "Strongest digital bottlenecks",
  Custom: "Custom",
};

const fieldClass =
  "w-full border-0 border-b border-input bg-transparent px-0 py-2.5 text-[17px] text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus-visible:outline-none";

export function ResearchPanel({
  running,
  onStart,
  notice,
}: {
  running: boolean;
  onStart: (query: ResearchQuery) => void;
  notice?: React.ReactNode;
}) {
  const [location, setLocation] = useState("Accra, Ghana");
  const [businessType, setBusinessType] = useState("");
  const [count, setCount] = useState(10);
  const [goal, setGoal] = useState<ResearchGoal>("Find most likely to buy");
  const [customGoal, setCustomGoal] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [requireWebsite, setRequireWebsite] = useState(false);
  const [requireSocial, setRequireSocial] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (businessType.trim().length < 2) {
      setError("Enter a business type to research.");
      return;
    }
    if (goal === "Custom" && customGoal.trim().length < 3) {
      setError("Describe your custom research objective.");
      return;
    }
    setError(null);
    onStart({
      location: location.trim() || "Accra, Ghana",
      businessType: businessType.trim(),
      count: Math.max(1, Math.min(25, count || 10)),
      goal,
      customGoal: goal === "Custom" ? customGoal.trim() : undefined,
      minScore,
      requireWebsite,
      requireSocial,
    });
  }

  return (
    <form onSubmit={submit} className="glass p-6 sm:p-9">
      <div className="grid gap-x-10 gap-y-7 md:grid-cols-2">
        <div>
          <label htmlFor="location" className="eyebrow">
            Location
          </label>
          <input
            id="location"
            className={cn(fieldClass, "mt-1.5")}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="businessType" className="eyebrow">
            Business type
          </label>
          <input
            id="businessType"
            className={cn(fieldClass, "mt-1.5")}
            placeholder="Beauty salons, restaurants, gyms..."
            value={businessType}
            onChange={(event) => setBusinessType(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="count" className="eyebrow">
            Number of prospects
          </label>
          <input
            id="count"
            type="number"
            min={1}
            max={25}
            className={cn(fieldClass, "mt-1.5 tabular-nums")}
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          />
        </div>

        <div>
          <label htmlFor="goal" className="eyebrow">
            Research objective
          </label>
          <select
            id="goal"
            className={cn(fieldClass, "mt-1.5")}
            value={goal}
            onChange={(event) => setGoal(event.target.value as ResearchGoal)}
          >
            {RESEARCH_GOALS.map((option) => (
              <option key={option} value={option}>
                {GOAL_LABELS[option]}
              </option>
            ))}
          </select>
        </div>

        {goal === "Custom" ? (
          <div className="md:col-span-2">
            <label htmlFor="customGoal" className="eyebrow">
              Describe the objective
            </label>
            <input
              id="customGoal"
              className={cn(fieldClass, "mt-1.5")}
              placeholder="e.g. businesses opening a second location"
              value={customGoal}
              onChange={(event) => setCustomGoal(event.target.value)}
            />
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => setAdvanced((value) => !value)}
        className="mt-7 inline-flex items-center gap-1.5 text-[14px] text-muted-foreground transition-colors hover:text-primary"
        aria-expanded={advanced}
      >
        Refine
        <ChevronDown className={cn("h-4 w-4 transition-transform", advanced && "rotate-180")} />
      </button>

      {advanced ? (
        <div className="mt-5 grid gap-6 border-t border-border pt-6 sm:grid-cols-3">
          <div>
            <label htmlFor="minScore" className="eyebrow">
              Minimum score to keep
            </label>
            <input
              id="minScore"
              type="range"
              min={0}
              max={90}
              step={5}
              value={minScore}
              onChange={(event) => setMinScore(Number(event.target.value))}
              className="mt-3 w-full accent-[var(--primary)]"
            />
            <p className="mt-1 text-sm tabular-nums text-primary">{minScore}+</p>
          </div>
          <label className="flex items-center gap-3 text-[15px]">
            <input
              type="checkbox"
              checked={requireWebsite}
              onChange={(event) => setRequireWebsite(event.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Must have a website
          </label>
          <label className="flex items-center gap-3 text-[15px]">
            <input
              type="checkbox"
              checked={requireSocial}
              onChange={(event) => setRequireSocial(event.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            Must have social presence
          </label>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-6 border-l-2 border-destructive pl-4 text-[15px] text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-4 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md text-[13px] text-muted-foreground">{notice}</div>
        <button
          type="submit"
          disabled={running}
          className="inline-flex items-center justify-center bg-primary px-8 py-3.5 text-[13px] font-semibold tracking-[0.12em] text-primary-foreground uppercase transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {running ? "Researching…" : "Begin research"}
        </button>
      </div>
    </form>
  );
}
