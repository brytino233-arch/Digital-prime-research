import { Link, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const NAV = [
  { label: "Research", to: "/" },
  { label: "Prospects", to: "/prospects" },
  { label: "Proof Packs", to: "/proof-packs" },
  { label: "Outreach", to: "/outreach" },
  { label: "Settings", to: "/settings" },
] as const;

export function TopNav() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <header className="glass sticky top-0 z-40 border-x-0 border-t-0">
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between gap-6 px-5 sm:px-8">
        <Link to="/" className="flex items-baseline gap-2" aria-label="Digital Prime home">
          <span className="font-display text-[21px] leading-none">Digital Prime</span>
          <span className="hidden text-[11px] font-semibold tracking-[0.09em] text-muted-foreground uppercase sm:inline">
            Research
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative py-1 text-[15px] transition-colors",
                isActive(item.to) ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
              {isActive(item.to) ? (
                <span className="absolute inset-x-0 -bottom-1 h-[2px] bg-primary" aria-hidden="true" />
              ) : null}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center border border-border text-muted-foreground transition-colors hover:text-foreground md:hidden"
          aria-expanded={open}
          aria-label="Toggle navigation"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {open ? (
        <nav className="border-t border-border bg-surface px-5 py-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn("block py-3 text-[15px]", isActive(item.to) ? "text-primary" : "text-muted-foreground")}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1320px] px-5 pb-28 sm:px-8">{children}</div>;
}

/** Signature element: a thin cobalt line beside an important conclusion. */
export function Conclusion({
  label,
  children,
  className,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("cobalt-rule", className)}>
      {label ? <p className="text-[11px] font-semibold tracking-[0.09em] text-primary uppercase">{label}</p> : null}
      <div className={label ? "mt-2" : undefined}>{children}</div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-2 px-5 py-9 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-[13px] text-muted-foreground">Digital Prime — internal research instrument</p>
        <p className="max-w-md text-[13px] text-muted-foreground">
          Claims are labelled Verified fact, Observation or Inference. Anything unconfirmed reads “Not verified.”
        </p>
      </div>
    </footer>
  );
}
