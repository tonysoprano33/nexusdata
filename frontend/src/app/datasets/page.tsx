"use client";
import { useState, useEffect } from "react";
import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { AnalysisHistory } from "@/components/landing/AnalysisHistory";
import {
  Database,
  Plus,
  LayoutGrid,
  List,
  Sparkles,
  BarChart3,
  FileSearch,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ─── View toggle ───────────────────────────────────────────────────────────────
type ViewMode = "grid" | "list";

function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800/70 gap-0.5">
      {(["grid", "list"] as ViewMode[]).map((mode) => {
        const Icon = mode === "grid" ? LayoutGrid : List;
        const active = value === mode;
        return (
          <button
            key={mode}
            onClick={() => onChange(mode)}
            aria-label={`${mode} view`}
            className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200",
              active
                ? "bg-neutral-700 text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-300"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        );
      })}
    </div>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────────
// Displays real summary numbers — not marketing copy
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: "blue" | "indigo" | "emerald";
}) {
  const palette = {
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/20 hover:border-blue-500/40",
      icon: "text-blue-400",
      glow: "group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]",
    },
    indigo: {
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20 hover:border-indigo-500/40",
      icon: "text-indigo-400",
      glow: "group-hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20 hover:border-emerald-500/40",
      icon: "text-emerald-400",
      glow: "group-hover:shadow-[0_0_30px_-5px_rgba(52,211,153,0.3)]",
    },
  }[color];

  return (
    <div
      className={cn(
        "group relative p-6 rounded-2xl bg-neutral-900/50 border transition-all duration-300",
        palette.border,
        palette.glow
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "p-2.5 rounded-xl border border-white/5",
            palette.bg
          )}
        >
          <Icon className={cn("w-5 h-5", palette.icon)} />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
        <p className="text-sm text-neutral-500 mt-1 font-medium">{label}</p>
      </div>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────
function EmptyDatasets({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800">
        <FileSearch className="w-10 h-10 text-neutral-600" />
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-white font-semibold text-lg">No datasets yet</h3>
        <p className="text-neutral-500 text-sm max-w-xs">
          Upload your first CSV to start analyzing data with AI.
        </p>
      </div>
      <button
        onClick={onUpload}
        className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-neutral-200 active:scale-95 transition-all"
      >
        <Plus className="w-4 h-4 stroke-[2.5]" />
        Upload your first dataset
      </button>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function DatasetsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(true);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-[#060606] text-white selection:bg-blue-500/30">
      {/* Subtle background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Sidebar */}
      {!isMobile && (
        <EnterpriseSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      <TopNavbar
        sidebarCollapsed={sidebarCollapsed}
        datasetName="Datasets"
        onUploadClick={() => router.push("/")}
      />

      <main
        className={cn(
          "pt-[72px] min-h-screen transition-all duration-300 ease-in-out",
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
        <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-[1600px] mx-auto w-full">

          {/* ── Page header ─────────────────────────────────────── */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Dataset Inventory
                </h1>
                <p className="text-neutral-500 text-sm mt-0.5">
                  Manage and explore your analyzed data sources
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full xl:w-auto">
              <ViewToggle value={viewMode} onChange={setViewMode} />

              <button
                onClick={() => router.push("/")}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-neutral-200 active:scale-95 transition-all shadow-lg shadow-white/5 ml-auto xl:ml-0"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Upload Data
              </button>
            </div>
          </div>

          {/* ── Stats row ────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              icon={Database}
              label="Total datasets"
              value="—"
              color="blue"
            />
            <StatCard
              icon={BarChart3}
              label="Analyses run"
              value="—"
              color="indigo"
            />
            <StatCard
              icon={Sparkles}
              label="Insights generated"
              value="—"
              color="emerald"
            />
          </div>

          {/* ── Dataset list ─────────────────────────────────────── */}
          <div className="relative rounded-2xl border border-neutral-800/60 bg-neutral-900/30 overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

            <AnalysisHistory
              hideHeader
              viewMode={viewMode}
              emptyState={<EmptyDatasets onUpload={() => router.push("/")} />}
            />
          </div>

        </div>
      </main>
    </div>
  );
}