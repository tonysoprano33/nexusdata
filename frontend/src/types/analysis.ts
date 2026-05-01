export type AnalysisStatus = 'processing' | 'completed' | 'failed';

export interface AnalysisHistory {
  id: string;
  filename: string;
  status: AnalysisStatus;
  created_at: string | null;
  data_quality_score: number | null;
  summary?: {
    total_rows: number;
    total_columns: number;
  };
  error?: string;
}

export interface ChartData {
  type: string;
  title: string;
  insight?: string;
  x?: string[];
  y?: number[];
  x_label?: string;
  y_label?: string;
  labels?: string[];
  values?: number[];
  data?: number[][];
  categories?: string[];
}

// Cleaning report types

export interface CleaningAction {
  icon: string;
  text: string;
  impact: 'high' | 'medium' | 'low';
}

export interface CleaningReport {
  actions: CleaningAction[];
  total_fixes: number;
  quality_score_before: number;
  quality_score_after: number;
  quality_improvement: number;
  rows_before: number;
  rows_after: number;
  duplicates_removed: number;
}

// Dataset DNA type

export interface DatasetDNA {
  total_rows: number;
  sampled_rows: number;
  total_columns: number;
  numeric_columns: number;
  categorical_columns: number;
  datetime_columns: number;
  missing_pct: number;
  duplicates_removed: number;
  columns_list: string[];
}

// Diff preview

export interface DiffChange {
  before: unknown;
  after: unknown;
}

export interface DiffRow {
  row: number;
  changes: Record<string, DiffChange>;
  raw: Record<string, unknown>;
  clean: Record<string, unknown>;
}

// Full analysis response

export interface AnalysisResponse {
  id?: string;
  filename?: string;
  status: AnalysisStatus;
  error?: string;
  result?: {
    // Preview and cleaning fields
    raw_preview?: Record<string, unknown>[];
    clean_preview?: Record<string, unknown>[];
    diff_preview?: DiffRow[];
    cleaning_report?: CleaningReport;
    dataset_dna?: DatasetDNA;

    // Core analysis fields
    summary: {
      total_rows: number;
      sampled_rows: number;
      total_columns: number;
      data_quality_score?: number;
      data_quality_score_raw?: number;
      missing_cells?: number;
      missing_cells_raw?: number;
    };
    column_types: Record<string, string>;
    descriptive_statistics: Record<string, unknown>;
    correlation_matrix?: Record<string, Record<string, number>>;
    anomaly_detection?: {
      detected_rows: number;
      ratio: number;
    };
    business_insights?: string;
    sample_data?: Record<string, unknown>[];
    charts_data?: ChartData[];
    chart_recommendations?: Array<{
      type: string;
      x_column: string;
      y_column: string;
      title: string;
      insight: string;
    }>;
    advanced_analytics?: {
      churn_analysis?: {
        detected: boolean;
        churn_rate?: number;
        insights: string[];
        risk_level?: string;
        business_impact?: string;
      };
      rfm_segmentation?: {
        applicable: boolean;
        segments?: Array<{ name: string; count: number; percentage: number }>;
        insights: string[];
        business_value?: string;
      };
      predictions?: {
        applicable: boolean;
        r2_score?: number;
        target?: string;
        insights: string[];
        interpretation?: string;
        recommendation?: string;
      };
      clustering?: {
        applicable: boolean;
        clusters?: Array<{ id: number; name: string; size: number; percentage: number }>;
        insights: string[];
      };
    };
  };
}
