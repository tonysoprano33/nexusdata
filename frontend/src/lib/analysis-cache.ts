export interface CachedAnalysisRecord {
  id: string;
  filename?: string;
  status?: string;
  created_at?: string | null;
  updated_at?: string | null;
  result?: Record<string, unknown>;
  fallback_used?: boolean;
  provider_used?: string;
}

const STORAGE_KEY = "nexusdata.cached-analyses";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readCachedAnalyses(): CachedAnalysisRecord[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCachedAnalyses(records: CachedAnalysisRecord[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, 50)));
}

export function upsertCachedAnalysis(record: CachedAnalysisRecord) {
  const records = readCachedAnalyses().filter((item) => item.id !== record.id);
  const timestamp = new Date().toISOString();
  records.unshift({
    created_at: record.created_at ?? timestamp,
    updated_at: timestamp,
    ...record,
  });
  writeCachedAnalyses(records);
}

export function getCachedAnalysis(id: string) {
  return readCachedAnalyses().find((item) => item.id === id) ?? null;
}

export function removeCachedAnalysis(id: string) {
  writeCachedAnalyses(readCachedAnalyses().filter((item) => item.id !== id));
}

export function clearCachedAnalyses() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}
