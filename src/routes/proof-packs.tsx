import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/brand";
import { useState } from "react";
import { exportToPDF } from "@/lib/pdf-export";
import { type ProofPackPage } from "@/lib/generators";

export const Route = createFileRoute("/proof-packs")({
  component: ProofPackLibraryPage,
});

async function fetchLibrary() {
  const { data, error } = await supabase
    .from("proof_packs")
    .select("*, prospects(name, industry)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

function ProofPackLibraryPage() {
  const libraryQuery = useQuery({ queryKey: ["proof-packs"], queryFn: fetchLibrary });
  const [filter, setFilter] = useState("");
  const [previewPack, setPreviewPack] = useState<any | null>(null);

  const packs = libraryQuery.data?.filter(p => 
    (p.prospects as any)?.name?.toLowerCase().includes(filter.toLowerCase()) ||
    (p.prospects as any)?.industry?.toLowerCase().includes(filter.toLowerCase())
  ) ?? [];

  return (
    <PageShell>
      <header className="py-8 border-b border-border">
        <h1 className="font-display text-4xl">Proof Pack Library</h1>
        <input 
          type="text" 
          placeholder="Search by business name..." 
          className="mt-4 border border-input bg-background px-3 py-2 text-sm w-full max-w-md"
          onChange={(e) => setFilter(e.target.value)}
        />
      </header>

      <div className="grid gap-px bg-border mt-5">
        {packs.map((pack) => (
          <div key={pack.id} className="bg-surface p-5 flex justify-between items-center">
            <div>
              <p className="font-semibold">{(pack.prospects as any)?.name}</p>
              <p className="text-xs text-muted-foreground">{(pack.prospects as any)?.industry} · {new Date(pack.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPreviewPack(pack)} className="text-xs border px-2 py-1 hover:bg-gold/10">Preview</button>
              <button onClick={() => exportToPDF(pack.pages as ProofPackPage[], (pack.prospects as any)?.name)} className="text-xs border px-2 py-1 bg-gold text-primary-foreground">Export PDF</button>
              <Link
                to="/prospects/$id"
                params={{ id: pack.prospect_id }}
                className="text-xs text-muted-foreground hover:text-gold"
              >
                View Prospect
              </Link>
            </div>
          </div>
        ))}
      </div>

      {previewPack && (
        <div className="fixed inset-0 bg-background/90 p-10 overflow-auto" onClick={() => setPreviewPack(null)}>
          <div className="max-w-2xl mx-auto bg-surface p-10 border border-border" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-5">{(previewPack.prospects as any)?.name} - Preview</h2>
            {(previewPack.pages as ProofPackPage[]).map((page, i) => (
              <div key={i} className="mb-8 border-b pb-4">
                <p className="font-mono text-gold text-[10px] uppercase">Page {page.page} - {page.title}</p>
                <h3 className="text-xl font-bold">{page.heading}</h3>
                <p className="text-sm mt-2">{page.copy}</p>
              </div>
            ))}
            <button onClick={() => setPreviewPack(null)} className="mt-5 border px-4 py-2 text-sm">Close</button>
          </div>
        </div>
      )}
    </PageShell>
  );
}

