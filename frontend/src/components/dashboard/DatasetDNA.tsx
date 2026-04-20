"use client";
import { motion } from "framer-motion";
import { Rows, Columns, Hash, Tag, Calendar, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatasetDNAData {
  total_rows: number;
  total_columns: number;
  numeric_columns: number;
  categorical_columns: number;
  datetime_columns: number;
  missing_pct: number;
  duplicates_removed: number;
  columns_list?: string[];
}

interface DatasetDNAProps {
  dna: DatasetDNAData;
}

interface DNACard {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

export function DatasetDNA({ dna }: DatasetDNAProps) {
  if (!dna) return null;

  const missingPct = dna.missing_pct ?? 0;
  const missingAccent =
    missingPct > 20 ? "rose" : missingPct > 5 ? "amber" : "emerald";

  const cards: DNACard[] = [
    {
      icon: Rows,
      label: "Rows",
      value: dna.total_rows?.toLocaleString() ?? "—",
      sub: dna.duplicates_removed > 0
        ? `${dna.duplicates_removed} duplicates removed`
        : "No duplicates found",
      accent: "blue",
    },
    {
      icon: Columns,
      label: "Columns",
      value: dna.total_columns?.toString() ?? "—",
      accent: "indigo",
    },
    {
      icon: Hash,
      label: "Numeric",
      value: dna.numeric_columns?.toString() ?? "0",
      sub: `${Math.round((dna.numeric_columns / Math.max(dna.total_columns, 1)) * 100)}% of columns`,
      accent: "violet",
    },
    {
      icon: Tag,
      label: "Categorical",
      value: dna.categorical_columns?.toString() ?? "0",
      sub: `${Math.round((dna.categorical_columns / Math.max(dna.total_columns, 1)) * 100)}% of columns`,
      accent: "purple",
    },
    {
      icon: Calendar,
      label: "Date Columns",
      value: dna.datetime_columns?.toString() ?? "0",
      accent: "sky",
    },
    {
      icon: AlertTriangle,
      label: "Missing Cells",
      value: `${missingPct}%`,
      sub: missingPct === 0 ? "No missing data" : `After cleaning`,
      accent: missingAccent,
    },
  ];

  const accentClasses: Record<string, string> = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map(({ icon: Icon, label, value, sub, accent = "blue" }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl border border-white/[0.07] bg-zinc-950/60 p-4 space-y-3"
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg border flex items-center justify-center",
                accentClasses[accent]
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-2xl font-black text-white tracking-tight">{value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mt-0.5">
                {label}
              </p>
              {sub && (
                <p className="text-[9px] text-zinc-700 font-medium mt-1">{sub}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Column list */}
      {dna.columns_list && dna.columns_list.length > 0 && (
        <div className="rounded-xl border border-white/[0.07] bg-zinc-950/40 px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-3">
            Column Index
          </p>
          <div className="flex flex-wrap gap-2">
            {dna.columns_list.map((col) => (
              <span
                key={col}
                className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors cursor-default"
              >
                {col}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
