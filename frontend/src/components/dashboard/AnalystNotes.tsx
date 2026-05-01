"use client";

import { BookOpenCheck, Info } from "lucide-react";

import { buildAnalystNotes } from "@/lib/business-intelligence";

type AnalystNotesProps = {
  result: Record<string, any>;
};

export function AnalystNotes({ result }: AnalystNotesProps) {
  const notes = buildAnalystNotes(result);

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-zinc-950/60 p-6 sm:p-8">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-3">
        <BookOpenCheck className="w-4 h-4 text-indigo-400" />
        Analyst Notes
      </div>
      <h3 className="text-xl font-black text-white mb-5">Trust, assumptions and limitations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {notes.map((note) => (
          <div key={note} className="flex items-start gap-3 rounded-sm border border-zinc-900 bg-black/40 p-4">
            <Info className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
            <p className="text-sm text-zinc-400 leading-relaxed">{note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

