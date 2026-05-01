import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Database,
  FileDown,
  GitBranch,
  Layers3,
  SearchCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { DemoDatasetButton } from "@/components/landing/DemoDatasetButton";

const workflow = [
  {
    title: "Ingest",
    text: "Upload CSV, Excel or JSON data and normalize it into a consistent analysis payload.",
    icon: Database,
  },
  {
    title: "Clean",
    text: "Detect missing values, duplicates, text inconsistencies, type issues and possible outliers.",
    icon: ShieldCheck,
  },
  {
    title: "Analyze",
    text: "Generate summaries, charts, correlations, quality scoring and dataset-specific explanations.",
    icon: BarChart3,
  },
  {
    title: "Recommend",
    text: "Translate technical findings into practical business actions with confidence and caveats.",
    icon: Brain,
  },
  {
    title: "Export",
    text: "Package the result as a report so the analysis can move outside the dashboard.",
    icon: FileDown,
  },
];

const reviewerSignals = [
  "Analyst thinking: data quality, assumptions, limitations and decision-oriented recommendations.",
  "Automation skill: one upload triggers cleaning, profiling, AI insights, charts and exports.",
  "Builder skill: Next.js interface, FastAPI backend, production deploy and portfolio documentation.",
  "Product judgment: no signup wall, instant demo path and clear storytelling for non-technical users.",
];

const stack = [
  "Next.js App Router",
  "FastAPI",
  "Pandas",
  "Scikit-learn signals",
  "Gemini/Groq fallback",
  "Vercel deployment",
];

export default function CaseStudyPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-white/10">
      <nav className="sticky top-0 z-50 border-b border-zinc-900 bg-black/85 px-6 py-4 backdrop-blur-md lg:px-10">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-white text-black">
              <Database className="h-4 w-4 fill-current" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em]">NexusData</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">Portfolio case study</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 transition-colors hover:text-white sm:block"
            >
              Upload
            </Link>
            <DemoDatasetButton compact label="Run demo" className="h-9 px-4" />
          </div>
        </div>
      </nav>

      <section className="border-b border-zinc-900 px-6 py-20 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-sm border border-zinc-800 bg-zinc-950 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                Analyst automation project
              </span>
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.92] tracking-tighter text-white sm:text-6xl lg:text-7xl">
                From messy spreadsheet to decision-ready analysis.
              </h1>
              <p className="max-w-2xl text-base font-medium leading-8 text-zinc-400 sm:text-lg">
                NexusData is a portfolio demo built to show how I combine data analysis, automation and product execution:
                cleaning raw files, explaining what changed, surfacing patterns and turning them into business next steps.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <DemoDatasetButton label="Open live demo" />
              <Link
                href="/datasets"
                className="inline-flex h-11 items-center justify-center rounded-sm border border-zinc-800 px-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
              >
                View analyses
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="rounded-sm border border-zinc-900 bg-zinc-950/60 p-6 shadow-2xl shadow-blue-950/10">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Role signal", "Analyst + automation builder"],
                ["Demo friction", "No signup required"],
                ["Core flow", "Upload / clean / analyze / recommend"],
                ["Production", "Live Vercel deployment"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-sm border border-zinc-900 bg-black p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600">{label}</p>
                  <p className="mt-3 text-sm font-bold text-zinc-100">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Workflow</p>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-tighter text-white">What the demo proves</h2>
            </div>
            <GitBranch className="hidden h-8 w-8 text-zinc-800 sm:block" />
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            {workflow.map((item) => (
              <div key={item.title} className="rounded-sm border border-zinc-900 bg-zinc-950/50 p-5">
                <item.icon className="mb-5 h-5 w-5 text-zinc-500" />
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-6 text-zinc-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-900 bg-zinc-950/40 px-6 py-16 lg:px-10">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">For reviewers</p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-tighter text-white">Why it belongs on the CV</h2>
            <p className="mt-5 text-sm leading-7 text-zinc-500">
              The goal is not to sell a subscription app. The goal is to show a complete, usable workflow that maps
              directly to business analyst, automation and junior product-builder responsibilities.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {reviewerSignals.map((signal) => (
              <div key={signal} className="rounded-sm border border-zinc-900 bg-black p-5">
                <SearchCheck className="mb-4 h-5 w-5 text-emerald-400" />
                <p className="text-sm leading-7 text-zinc-300">{signal}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-10">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-sm border border-zinc-900 bg-zinc-950/50 p-8">
            <Layers3 className="mb-6 h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-black uppercase tracking-tighter">Technical stack</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              {stack.map((item) => (
                <span
                  key={item}
                  className="rounded-sm border border-zinc-800 bg-black px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-sm border border-zinc-900 bg-zinc-950/50 p-8">
            <ShieldCheck className="mb-6 h-6 w-6 text-amber-300" />
            <h2 className="text-2xl font-black uppercase tracking-tighter">Intentional scope</h2>
            <p className="mt-5 text-sm leading-7 text-zinc-400">
              Authentication, billing and team management are intentionally excluded from this demo. The portfolio value
              is the analysis pipeline, decision layer, production deployment and the clarity of the user experience.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
