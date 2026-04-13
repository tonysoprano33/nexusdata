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

export interface AnalysisResponse {
  status: AnalysisStatus;
  error?: string;
  result?: {
    summary: {
      total_rows: number;
      sampled_rows: number;
      total_columns: number;
      data_quality_score?: number;
      missing_cells?: number;
    };
    column_types: Record<string, string>;
    descriptive_statistics: Record<string, any>;
    anomaly_detection?: {
      detected_rows: number;
      ratio: number;
    };
    business_insights?: string;
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
      };
      rfm_segmentation?: {
        applicable: boolean;
        segments?: Array<{name: string; count: number; percentage: number}>;
        insights: string[];
      };
      predictions?: {
        applicable: boolean;
        r2_score?: number;
        target_column?: string;
        insights: string[];
      };
      clustering?: {
        applicable: boolean;
        clusters?: Array<{id: number; name: string; count: number; percentage: number}>;
        insights: string[];
      };
    };
  };
}
