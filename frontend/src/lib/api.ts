const LOCAL_API = "http://127.0.0.1:8000";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  const fromEnv =
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL;

  if (fromEnv) {
    return trimTrailingSlash(fromEnv);
  }

  if (typeof window === "undefined") {
    return LOCAL_API;
  }

  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return LOCAL_API;
  }

  return "";
}

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}

export type PortfolioMetrics = {
  analyses_total: number;
  analyses_completed: number;
  analyses_failed: number;
  rows_processed: number;
  columns_profiled: number;
  charts_generated: number;
  avg_quality_score: number;
  advanced_signals: {
    churn: number;
    rfm: number;
    predictions: number;
    clustering: number;
  };
  capabilities: string[];
};
