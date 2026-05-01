import type { ChartData } from "@/types/analysis";

type AnyRecord = Record<string, any>;

export type ConfidenceLevel = "High" | "Medium" | "Low";

export type BusinessRecommendation = {
  finding: string;
  whyItMatters: string;
  suggestedAction: string;
  confidence: ConfidenceLevel;
  warning?: string;
};

export type QualityFactor = {
  label: string;
  status: "good" | "watch" | "risk";
  value: string;
  explanation: string;
};

export type ExecutiveOverview = {
  datasetName: string;
  rows: number;
  columns: number;
  qualityScore: number;
  issuesDetected: number;
  fixesApplied: number;
  datasetDescription: string;
  executiveSummary: string;
};

const SMALL_DATASET_ROWS = 50;

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function listColumns(result: AnyRecord) {
  return (
    result?.dataset_dna?.columns_list ??
    result?.statistics?.clean?.column_names ??
    result?.statistics?.raw?.column_names ??
    []
  ) as string[];
}

function formatColumnName(value?: string) {
  if (!value) return "the selected metric";
  return value.replace(/_/g, " ");
}

export function getCleaningSteps(report: AnyRecord = {}) {
  const steps = Array.isArray(report.steps) ? report.steps : [];
  const messages = new Set<string>();

  for (const item of report.changes_made ?? []) {
    if (typeof item === "string" && item.trim()) messages.add(item.trim());
  }

  for (const step of steps) {
    if (step.step === "duplicate_removal" && step.duplicates_removed > 0) {
      messages.add(`Removed ${step.duplicates_removed} duplicate rows.`);
    }
    if (step.step === "missing_value_imputation" && step.total_missing > 0) {
      messages.add(`Filled or handled ${step.fixed ?? step.total_missing} missing values.`);
      for (const strategy of step.strategies ?? []) messages.add(strategy);
    }
    if (step.step === "outlier_capping" && step.outliers_found > 0) {
      messages.add(`Detected and capped ${step.outliers_found} possible outliers.`);
      for (const detail of step.details ?? []) messages.add(detail);
    }
    if (step.step === "text_standardization" && step.columns_standardized > 0) {
      messages.add(`Standardized text values in ${step.columns_standardized} columns.`);
      for (const change of step.changes ?? []) messages.add(change);
    }
    if (step.step === "data_type_correction" && step.conversions > 0) {
      messages.add(`Converted ${step.conversions} columns to better data types.`);
      for (const detail of step.conversion_details ?? []) messages.add(detail);
    }
  }

  if (messages.size === 0) {
    messages.add("No destructive cleaning was needed in the previewed records.");
  }

  return Array.from(messages);
}

export function getIssueCount(result: AnyRecord) {
  const report = result?.cleaning_report ?? {};
  const rawStats = result?.statistics?.raw ?? {};
  const rawMissing = asNumber(rawStats?.missing_values?.total);
  const duplicates = asNumber(result?.dataset_dna?.duplicates_removed, asNumber(report.rows_removed));
  const anomalies = asNumber(result?.anomaly_detection?.detected_rows);
  const typeIssues = (report.steps ?? []).reduce(
    (total: number, step: AnyRecord) => total + asNumber(step.conversions) + asNumber(step.columns_standardized),
    0
  );

  return rawMissing + duplicates + anomalies + typeIssues;
}

export function getFixCount(result: AnyRecord) {
  const report = result?.cleaning_report ?? {};
  const steps = report.steps ?? [];

  const fixedFromSteps = steps.reduce((total: number, step: AnyRecord) => {
    return (
      total +
      asNumber(step.duplicates_removed) +
      asNumber(step.fixed) +
      asNumber(step.outliers_found) +
      asNumber(step.columns_standardized) +
      asNumber(step.conversions)
    );
  }, 0);

  return fixedFromSteps || getCleaningSteps(report).length;
}

export function getStrongestCorrelation(result: AnyRecord) {
  const matrix = result?.correlation_matrix ?? result?.statistics?.clean?.correlation_matrix ?? {};
  let best: { left: string; right: string; value: number } | null = null;

  for (const [left, row] of Object.entries(matrix)) {
    for (const [right, rawValue] of Object.entries(row as AnyRecord)) {
      if (left === right) continue;
      const value = Number(rawValue);
      if (!Number.isFinite(value)) continue;
      const pairKey = [left, right].sort().join("|");
      const bestKey = best ? [best.left, best.right].sort().join("|") : "";
      if (pairKey === bestKey) continue;
      if (!best || Math.abs(value) > Math.abs(best.value)) {
        best = { left, right, value };
      }
    }
  }

  return best;
}

export function inferDatasetDescription(result: AnyRecord, filename?: string) {
  const columns = listColumns(result);
  const normalized = columns.map((column) => column.toLowerCase());
  const has = (tokens: string[]) => normalized.some((column) => tokens.some((token) => column.includes(token)));

  const restaurantSignals = normalized.filter((column) =>
    ["tip", "bill", "smoker"].some((token) => column.includes(token))
  ).length;
  const customerSignals = normalized.filter((column) =>
    ["customer", "client", "churn", "retention", "recency", "frequency", "monetary", "satisfaction"].some((token) =>
      column.includes(token)
    )
  ).length;
  const commercialSignals = normalized.filter((column) =>
    ["order", "sales", "revenue", "amount", "price", "product"].some((token) => column.includes(token))
  ).length;

  if (customerSignals >= 2 && commercialSignals >= 1) {
    return "This dataset appears to describe customer revenue, order activity, satisfaction, churn risk and recency signals.";
  }
  if (restaurantSignals >= 2) {
    return "This dataset appears to describe restaurant checks, bill amounts, tips and dining context.";
  }
  if (customerSignals >= 1) {
    return "This dataset appears to describe customer behavior, value, retention or segmentation signals.";
  }
  if (commercialSignals >= 1) {
    return "This dataset appears to describe commercial transactions, orders, products or revenue performance.";
  }
  if (has(["date", "month", "year", "time"])) {
    return "This dataset appears to contain time-based operational or business performance records.";
  }

  const numeric = asNumber(result?.dataset_dna?.numeric_columns);
  const categorical = asNumber(result?.dataset_dna?.categorical_columns);
  const source = filename ? ` in ${filename}` : "";
  return `This dataset${source} appears to combine ${numeric} numeric fields and ${categorical} categorical fields for exploratory business analysis.`;
}

export function buildExecutiveOverview(result: AnyRecord, filename = "Dataset"): ExecutiveOverview {
  const rows = asNumber(result?.summary?.total_rows, asNumber(result?.dataset_dna?.total_rows));
  const columns = asNumber(result?.summary?.total_columns, asNumber(result?.dataset_dna?.total_columns));
  const qualityScore = asNumber(result?.summary?.data_quality_score, asNumber(result?.cleaning_report?.score_after));
  const description = inferDatasetDescription(result, filename);
  const correlation = getStrongestCorrelation(result);
  const anomalies = result?.anomaly_detection ?? {};
  const missingRaw = asNumber(result?.summary?.missing_cells_raw);

  const signalSentence = correlation
    ? `The strongest numeric signal is between ${formatColumnName(correlation.left)} and ${formatColumnName(correlation.right)} with a correlation of ${correlation.value.toFixed(2)}.`
    : "No strong numeric relationship was detected yet, so the safest next step is to compare categorical groups and improve data completeness.";

  const qualitySentence =
    missingRaw > 0
      ? `The dataset needed quality work before analysis because ${missingRaw.toLocaleString()} missing cells were detected in the raw file.`
      : "The dataset is relatively clean from a missing-value perspective, so interpretation can focus more on patterns than repair.";

  const anomalySentence =
    anomalies.detected_rows > 0
      ? `The pipeline also flagged ${anomalies.detected_rows} possible outlier rows that should be reviewed before making high-stakes decisions.`
      : "No major outlier pressure was detected by the automated checks.";

  return {
    datasetName: filename,
    rows,
    columns,
    qualityScore,
    issuesDetected: getIssueCount(result),
    fixesApplied: getFixCount(result),
    datasetDescription: description,
    executiveSummary: `${description} ${signalSentence} ${qualitySentence} ${anomalySentence}`,
  };
}

function confidenceForRows(rows: number, preferred: ConfidenceLevel = "Medium"): ConfidenceLevel {
  if (rows < SMALL_DATASET_ROWS) return "Low";
  return preferred;
}

export function buildBusinessRecommendations(result: AnyRecord): BusinessRecommendation[] {
  const rows = asNumber(result?.summary?.total_rows);
  const recommendations: BusinessRecommendation[] = [];
  const correlation = getStrongestCorrelation(result);
  const rawMissing = asNumber(result?.summary?.missing_cells_raw);
  const anomalies = result?.anomaly_detection ?? {};
  const quality = asNumber(result?.summary?.data_quality_score);
  const categoricalSummary = result?.statistics?.clean?.categorical_summary ?? {};
  const prediction = result?.advanced_analytics?.predictions ?? {};
  const rfm = result?.advanced_analytics?.rfm_segmentation ?? {};

  if (correlation) {
    const strength = Math.abs(correlation.value);
    recommendations.push({
      finding: `${formatColumnName(correlation.left)} and ${formatColumnName(correlation.right)} move together (${correlation.value.toFixed(2)} correlation).`,
      whyItMatters: "A measurable relationship can help teams prioritize which metric to monitor as a possible driver or proxy.",
      suggestedAction: `Track both metrics together in reporting and validate whether ${formatColumnName(correlation.left)} is controllable, causal or simply correlated.`,
      confidence: confidenceForRows(rows, strength >= 0.7 ? "High" : strength >= 0.35 ? "Medium" : "Low"),
      warning: strength < 0.35 ? "The pattern is weak, so avoid turning it into a business rule without more evidence." : undefined,
    });
  }

  if (rawMissing > 0) {
    recommendations.push({
      finding: `${rawMissing.toLocaleString()} missing values were present before cleaning.`,
      whyItMatters: "Missing data can bias averages, hide low-performing segments and make dashboards look more certain than they are.",
      suggestedAction: "Add required fields or validation rules at the data collection point, then monitor missing-value rates by column over time.",
      confidence: "High",
      warning: "Imputation is useful for exploration, but the original collection process should still be fixed.",
    });
  }

  if (anomalies.detected_rows > 0) {
    recommendations.push({
      finding: `${anomalies.detected_rows} records behave like possible outliers.`,
      whyItMatters: "Outliers may be data errors, fraud/risk cases, premium customers or exceptional operational events.",
      suggestedAction: "Review outlier rows manually before removing them, and tag confirmed business exceptions for future monitoring.",
      confidence: confidenceForRows(rows, anomalies.ratio >= 5 ? "High" : "Medium"),
      warning: rows < SMALL_DATASET_ROWS ? "Small samples can make normal variation look unusual." : undefined,
    });
  }

  const firstCategorical = Object.entries(categoricalSummary)[0] as [string, Array<{ value: string; count: number }>] | undefined;
  if (firstCategorical?.[1]?.length) {
    const [column, values] = firstCategorical;
    const total = values.reduce((sum, item) => sum + item.count, 0);
    const top = values[0];
    const share = total ? Math.round((top.count / total) * 100) : 0;
    recommendations.push({
      finding: `${formatColumnName(column)} is led by "${top.value}" in the available sample (${share}% of top tracked values).`,
      whyItMatters: "Dominant categories can hide meaningful differences in smaller segments.",
      suggestedAction: `Break performance metrics down by ${formatColumnName(column)} before making a single blended decision.`,
      confidence: confidenceForRows(rows, share >= 60 ? "High" : "Medium"),
      warning: share >= 70 ? "The sample is concentrated, so minority categories may be under-represented." : undefined,
    });
  }

  if (prediction.applicable) {
    recommendations.push({
      finding: `A lightweight prediction model was possible for ${formatColumnName(prediction.target)}.`,
      whyItMatters: "Predictable metrics can become planning KPIs, but exploratory models need validation before operations use them.",
      suggestedAction: "Use the model output as a hypothesis generator, then validate it with holdout data and domain review.",
      confidence: confidenceForRows(rows, prediction.r2_score >= 0.5 ? "Medium" : "Low"),
      warning: "Correlation and model fit do not prove causation.",
    });
  } else if (rfm.applicable) {
    recommendations.push({
      finding: "The dataset supports value-based segmentation.",
      whyItMatters: "Segments help teams avoid one-size-fits-all actions across customers or orders.",
      suggestedAction: "Prioritize high-value segments separately from low-frequency or at-risk cohorts.",
      confidence: confidenceForRows(rows, "Medium"),
    });
  }

  if (quality < 85) {
    recommendations.push({
      finding: `Final data quality is ${quality}%, leaving room for governance improvement.`,
      whyItMatters: "Lower quality scores reduce trust in dashboards and increase manual review time.",
      suggestedAction: "Create a recurring data quality check before teams rely on this dataset for weekly reporting.",
      confidence: "High",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      finding: "The dataset is analysis-ready but does not expose a strong automated business signal yet.",
      whyItMatters: "A clean dataset is valuable, but decisions need context, goals and target metrics.",
      suggestedAction: "Add outcome columns such as revenue, churn, conversion, satisfaction or time-to-resolution to unlock stronger recommendations.",
      confidence: confidenceForRows(rows, "Medium"),
    });
  }

  return recommendations.slice(0, 5);
}

export function buildQualityFactors(result: AnyRecord): QualityFactor[] {
  const rawStats = result?.statistics?.raw ?? {};
  const cleanStats = result?.statistics?.clean ?? {};
  const report = result?.cleaning_report ?? {};
  const totalRawCells = asNumber(rawStats.total_rows) * Math.max(asNumber(rawStats.total_columns), 1);
  const missingRaw = asNumber(rawStats?.missing_values?.total);
  const missingPct = totalRawCells ? Math.round((missingRaw / totalRawCells) * 1000) / 10 : 0;
  const duplicates = asNumber(result?.dataset_dna?.duplicates_removed, asNumber(report.rows_removed));
  const anomalies = result?.anomaly_detection ?? {};
  const steps = report.steps ?? [];
  const conversions = steps.reduce((total: number, step: AnyRecord) => total + asNumber(step.conversions), 0);
  const textStandardized = steps.reduce((total: number, step: AnyRecord) => total + asNumber(step.columns_standardized), 0);
  const rawColumns = rawStats?.missing_values?.columns ?? {};
  const emptyColumns = Object.values(rawColumns).filter((payload: any) => payload?.pct >= 100).length;
  const categoricalColumns = Object.keys(cleanStats?.categorical_summary ?? {}).length;

  return [
    {
      label: "Missing values",
      status: missingRaw === 0 ? "good" : missingPct > 15 ? "risk" : "watch",
      value: `${missingRaw.toLocaleString()} cells (${missingPct}%)`,
      explanation: "Missing values reduce confidence because averages and segment counts may not represent the full population.",
    },
    {
      label: "Duplicate rows",
      status: duplicates === 0 ? "good" : duplicates > 10 ? "risk" : "watch",
      value: `${duplicates.toLocaleString()} rows`,
      explanation: "Duplicate records can inflate totals, counts and apparent demand.",
    },
    {
      label: "Outliers",
      status: anomalies.detected_rows ? "watch" : "good",
      value: `${asNumber(anomalies.detected_rows).toLocaleString()} flagged`,
      explanation: "Outliers are not automatically bad; they should be reviewed because they may be rare but important business cases.",
    },
    {
      label: "Invalid data types",
      status: conversions ? "watch" : "good",
      value: `${conversions} conversions`,
      explanation: "Columns stored as the wrong type can break aggregations, filtering and time-series analysis.",
    },
    {
      label: "Column consistency",
      status: textStandardized ? "watch" : "good",
      value: `${textStandardized} standardized`,
      explanation: "Consistent text categories prevent the same segment from being counted multiple ways.",
    },
    {
      label: "Empty columns",
      status: emptyColumns ? "risk" : "good",
      value: `${emptyColumns}`,
      explanation: "Columns with no usable values add noise and should usually be removed or fixed upstream.",
    },
    {
      label: "Cardinality",
      status: categoricalColumns ? "good" : "watch",
      value: `${categoricalColumns} categorical profiles`,
      explanation: "Categorical profiles reveal segment concentration and whether groups are balanced enough to compare.",
    },
  ];
}

export function buildAnalystNotes(result: AnyRecord) {
  const rows = asNumber(result?.summary?.total_rows);
  const notes = [
    "Automated recommendations are meant to guide analysis, not replace domain review.",
    "Correlation does not imply causation; operational changes should be validated with experiments or historical context.",
  ];

  if (rows < SMALL_DATASET_ROWS) {
    notes.unshift(`The dataset has only ${rows} rows, so patterns may be unstable and should be treated as directional.`);
  }
  if (asNumber(result?.anomaly_detection?.detected_rows) > 0) {
    notes.push("Outliers may represent data errors or important business exceptions; inspect them before removing them from decisions.");
  }
  if (asNumber(result?.summary?.missing_cells_raw) > 0) {
    notes.push("Missing-value handling improves usability, but upstream collection gaps can still bias conclusions.");
  }
  if (!getStrongestCorrelation(result)) {
    notes.push("Add clearer outcome metrics such as revenue, conversion, churn, cost or satisfaction to produce stronger decision recommendations.");
  }

  return notes;
}

export function buildChartStory(chart: ChartData) {
  const title = chart.title || "Chart";
  const type = chart.type;
  const values = chart.values ?? chart.y ?? [];
  const labels = chart.labels ?? chart.x ?? [];
  const maxValue = values.length ? Math.max(...values.map(Number)) : 0;
  const minValue = values.length ? Math.min(...values.map(Number)) : 0;
  const maxIndex = values.findIndex((value) => Number(value) === maxValue);
  const spread = maxValue - minValue;

  if (title.toLowerCase().includes("missing")) {
    const leader = labels[maxIndex] ?? "one column";
    return `This chart shows where raw data quality needed the most attention. ${formatColumnName(String(leader))} has the highest missing-value pressure, so collection or validation should be reviewed there first.`;
  }

  if (type === "histogram") {
    return spread > 0
      ? "This distribution shows where most records concentrate and whether a small number of high or low values may be pulling averages away from the typical case."
      : "This distribution is tightly grouped, so the metric appears stable in the sampled records.";
  }

  if (type === "scatter") {
    return "This chart compares two numeric fields. Pay attention to whether points form a clear upward/downward pattern or separate clusters.";
  }

  if (type === "heatmap") {
    return "This heatmap highlights relationships between numeric variables. Strong positive or negative cells deserve follow-up before becoming business assumptions.";
  }

  if (type === "boxplot") {
    return "This chart compares spread and outlier behavior across numeric fields. Wider boxes or long whiskers indicate less predictable values.";
  }

  if (type === "pie") {
    const leader = labels[maxIndex] ?? "the largest segment";
    return `${formatColumnName(String(leader))} is the largest share in this mix. Watch for over-concentration before assuming every segment behaves the same way.`;
  }

  if (values.length > 0) {
    const leader = labels[maxIndex] ?? "the top category";
    return `${formatColumnName(String(leader))} contributes the highest value in this view. Use this as a starting point for segmentation, not as a final conclusion.`;
  }

  return chart.insight || "This visualization highlights a pattern worth validating against business context and sample size.";
}

export function buildMarkdownReport(result: AnyRecord, filename = "analysis") {
  const overview = buildExecutiveOverview(result, filename);
  const recommendations = buildBusinessRecommendations(result);
  const cleaningLog = getCleaningSteps(result?.cleaning_report);
  const chartStories: Array<{ title: string; story: string }> = (result?.charts_data ?? []).slice(0, 8).map((chart: ChartData) => ({
    title: chart.title,
    story: buildChartStory(chart),
  }));
  const notes = buildAnalystNotes(result);

  return [
    `# Analysis Report: ${overview.datasetName}`,
    "",
    "## Dataset Summary",
    `- Rows: ${overview.rows.toLocaleString()}`,
    `- Columns: ${overview.columns.toLocaleString()}`,
    `- Data quality score: ${overview.qualityScore}%`,
    `- Issues detected: ${overview.issuesDetected.toLocaleString()}`,
    `- Fixes applied: ${overview.fixesApplied.toLocaleString()}`,
    "",
    "## Executive Summary",
    overview.executiveSummary,
    "",
    "## Cleaning Log",
    ...cleaningLog.map((item) => `- ${item}`),
    "",
    "## Business Recommendations",
    ...recommendations.map(
      (item, index) =>
        `${index + 1}. ${item.finding}\n   - Why it matters: ${item.whyItMatters}\n   - Suggested action: ${item.suggestedAction}\n   - Confidence: ${item.confidence}${item.warning ? `\n   - Warning: ${item.warning}` : ""}`
    ),
    "",
    "## Chart Summaries",
    ...(chartStories.length
      ? chartStories.map((item) => `- ${item.title}: ${item.story}`)
      : ["- No chart summaries were available."]),
    "",
    "## Analyst Notes",
    ...notes.map((item) => `- ${item}`),
    "",
  ].join("\n");
}
