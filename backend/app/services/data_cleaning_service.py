"""
Data Cleaning Service - Professional-grade data cleaning with pandas.
Implements industry-standard data quality checks and cleaning operations.
"""
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class DataCleaningService:
    """
    Senior Data Analyst-level data cleaning service.
    Handles duplicates, missing values, outliers, and data type corrections.
    """
    
    def __init__(self):
        self.quality_metrics = {}
        self.cleaning_report = {}
        
    def clean_dataset(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Perform comprehensive data cleaning and return cleaned dataset + report.
        
        Args:
            df: Raw pandas DataFrame
            
        Returns:
            Tuple of (cleaned_df, cleaning_report_dict)
        """
        logger.info(f"[CLEANING] Starting data cleaning: {len(df)} rows, {len(df.columns)} columns")
        
        # Store original for comparison
        original_df = df.copy()
        original_rows = len(df)
        
        # Initialize report
        report = {
            "original_rows": original_rows,
            "original_columns": len(df.columns),
            "quality_before": self._calculate_quality_score(df),
            "cleaning_steps": [],
            "issues_found": [],
            "changes_made": []
        }
        
        # Step 1: Analyze data quality (BEFORE)
        quality_before = self._analyze_data_quality(df)
        report["quality_before_details"] = quality_before
        
        # Step 2: Remove exact duplicates
        df, duplicate_report = self._remove_duplicates(df)
        if duplicate_report["duplicates_removed"] > 0:
            report["cleaning_steps"].append(duplicate_report)
            report["changes_made"].append(f"Removed {duplicate_report['duplicates_removed']} duplicate rows")
        
        # Step 3: Handle missing values intelligently
        df, missing_report = self._handle_missing_values(df)
        if missing_report["total_missing"] > 0:
            report["cleaning_steps"].append(missing_report)
            report["changes_made"].append(f"Fixed {missing_report['total_missing']} missing values")
        
        # Step 4: Detect and handle outliers
        df, outlier_report = self._handle_outliers(df)
        if outlier_report["outliers_found"] > 0:
            report["cleaning_steps"].append(outlier_report)
            report["changes_made"].append(f"Handled {outlier_report['outliers_found']} outliers")
        
        # Step 5: Standardize text data
        df, text_report = self._standardize_text(df)
        if text_report["columns_standardized"] > 0:
            report["cleaning_steps"].append(text_report)
            report["changes_made"].append(f"Standardized text values in {text_report['columns_standardized']} columns")
        
        # Step 6: Correct data types
        df, type_report = self._correct_data_types(df)
        if type_report["conversions"] > 0:
            report["cleaning_steps"].append(type_report)
            report["changes_made"].append(f"Corrected {type_report['conversions']} data type issues")
        
        # Calculate final metrics
        report["final_rows"] = len(df)
        report["final_columns"] = len(df.columns)
        report["rows_removed"] = original_rows - len(df)
        report["quality_after"] = self._calculate_quality_score(df)
        report["improvement"] = report["quality_after"] - report["quality_before"]
        
        # Generate previews
        raw_preview = original_df.head(10).to_dict(orient='records')
        clean_preview = df.head(10).to_dict(orient='records')
        
        # Clean NaN/Inf for JSON
        raw_preview = self._clean_for_json(raw_preview)
        clean_preview = self._clean_for_json(clean_preview)
        
        report["raw_preview"] = raw_preview
        report["clean_preview"] = clean_preview
        
        logger.info(f"[CLEANING] Complete: {report['rows_removed']} rows removed, "
                   f"quality {report['quality_before']:.1f}% to {report['quality_after']:.1f}%")
        
        return df, report
    
    def _analyze_data_quality(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze data quality metrics."""
        total_cells = df.shape[0] * df.shape[1]
        
        # Missing values
        missing_counts = df.isnull().sum()
        total_missing = missing_counts.sum()
        missing_pct = (total_missing / total_cells) * 100 if total_cells > 0 else 0
        
        # Duplicates
        duplicate_rows = df.duplicated().sum()
        
        # Outliers (IQR method for numeric columns)
        outlier_count = 0
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            if not df[col].isnull().all():
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                outliers = df[(df[col] < (Q1 - 1.5 * IQR)) | (df[col] > (Q3 + 1.5 * IQR))]
                outlier_count += len(outliers)
        
        return {
            "total_cells": int(total_cells),
            "missing_values": int(total_missing),
            "missing_percentage": round(missing_pct, 2),
            "duplicate_rows": int(duplicate_rows),
            "outliers_detected": int(outlier_count),
            "numeric_columns": len(numeric_cols),
            "categorical_columns": len(df.select_dtypes(include=['object']).columns)
        }
    
    def _calculate_quality_score(self, df: pd.DataFrame) -> float:
        """Calculate overall data quality score (0-100)."""
        if len(df) == 0:
            return 0.0
        
        total_cells = df.shape[0] * df.shape[1]
        if total_cells == 0:
            return 0.0
        
        # Missing value penalty
        missing_cells = df.isnull().sum().sum()
        missing_score = max(0, 40 - (missing_cells / total_cells * 100))
        
        # Duplicate penalty
        duplicate_pct = df.duplicated().sum() / len(df) * 100
        duplicate_score = max(0, 30 - duplicate_pct)
        
        # Completeness bonus
        completeness_score = 30 if missing_cells == 0 else max(0, 30 - (missing_cells / total_cells * 30))
        
        total_score = missing_score + duplicate_score + completeness_score
        return round(min(100, total_score), 1)
    
    def _remove_duplicates(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Remove exact duplicate rows."""
        original_count = len(df)
        df_cleaned = df.drop_duplicates()
        removed = original_count - len(df_cleaned)
        
        return df_cleaned, {
            "step": "duplicate_removal",
            "duplicates_removed": removed,
            "duplicates_percentage": round(removed / original_count * 100, 2) if original_count > 0 else 0
        }
    
    def _handle_missing_values(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Handle missing values with intelligent imputation."""
        missing_before = df.isnull().sum().sum()
        df_cleaned = df.copy()
        
        strategies_used = []
        
        for col in df_cleaned.columns:
            missing_count = df_cleaned[col].isnull().sum()
            if missing_count == 0:
                continue
            
            missing_pct = missing_count / len(df_cleaned) * 100
            
            # If >50% missing, drop column
            if missing_pct > 50:
                df_cleaned = df_cleaned.drop(columns=[col])
                strategies_used.append(f"Dropped column '{col}' ({missing_pct:.1f}% missing)")
                continue
            
            # Numeric: impute with median
            if df_cleaned[col].dtype in ['int64', 'float64']:
                median_val = df_cleaned[col].median()
                df_cleaned[col] = df_cleaned[col].fillna(median_val)
                strategies_used.append(f"'{col}': filled {missing_count} NaN with median ({median_val})")
            
            # Categorical: impute with mode
            elif df_cleaned[col].dtype == 'object':
                mode_val = df_cleaned[col].mode()
                if len(mode_val) > 0:
                    df_cleaned[col] = df_cleaned[col].fillna(mode_val[0])
                    strategies_used.append(f"'{col}': filled {missing_count} missing with mode ('{mode_val[0]}')")
                else:
                    df_cleaned[col] = df_cleaned[col].fillna("Unknown")
                    strategies_used.append(f"'{col}': filled {missing_count} missing with 'Unknown'")
        
        missing_after = df_cleaned.isnull().sum().sum()
        fixed = missing_before - missing_after
        
        return df_cleaned, {
            "step": "missing_value_imputation",
            "total_missing": int(missing_before),
            "fixed": int(fixed),
            "remaining": int(missing_after),
            "strategies": strategies_used
        }
    
    def _handle_outliers(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Detect and cap outliers using IQR method."""
        df_cleaned = df.copy()
        numeric_cols = df_cleaned.select_dtypes(include=[np.number]).columns
        
        outliers_found = 0
        outlier_details = []
        
        for col in numeric_cols:
            if df_cleaned[col].isnull().all():
                continue
            
            Q1 = df_cleaned[col].quantile(0.25)
            Q3 = df_cleaned[col].quantile(0.75)
            IQR = Q3 - Q1
            
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outliers = df_cleaned[(df_cleaned[col] < lower_bound) | (df_cleaned[col] > upper_bound)]
            count = len(outliers)
            
            if count > 0:
                outliers_found += count
                # Cap outliers instead of removing
                df_cleaned[col] = df_cleaned[col].clip(lower=lower_bound, upper=upper_bound)
                outlier_details.append(f"'{col}': capped {count} outliers to [{lower_bound:.2f}, {upper_bound:.2f}]")
        
        return df_cleaned, {
            "step": "outlier_capping",
            "outliers_found": outliers_found,
            "columns_affected": len(outlier_details),
            "details": outlier_details
        }
    
    def _standardize_text(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Standardize text columns (trim, lowercase, consistent formatting)."""
        df_cleaned = df.copy()
        text_cols = df_cleaned.select_dtypes(include=['object']).columns
        
        standardized = 0
        changes = []
        
        for col in text_cols:
            original = df_cleaned[col].copy()
            
            # Trim whitespace
            df_cleaned[col] = df_cleaned[col].str.strip()
            
            # Standardize case for short text (likely categories)
            if df_cleaned[col].str.len().mean() < 50:
                df_cleaned[col] = df_cleaned[col].str.title()
            
            # Check if changes were made
            changed = (original != df_cleaned[col]).sum()
            if changed > 0:
                standardized += 1
                changes.append(f"'{col}': standardized {changed} values")
        
        return df_cleaned, {
            "step": "text_standardization",
            "columns_standardized": standardized,
            "changes": changes
        }
    
    def _correct_data_types(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Attempt to correct data types (e.g., numeric stored as string)."""
        df_cleaned = df.copy()
        conversions = 0
        conversion_details = []
        
        for col in df_cleaned.columns:
            if df_cleaned[col].dtype == 'object':
                # Try converting to numeric
                try:
                    # Check if most values can be numeric
                    numeric_attempt = pd.to_numeric(df_cleaned[col], errors='coerce')
                    non_null_ratio = numeric_attempt.notna().sum() / df_cleaned[col].notna().sum()
                    
                    # If >80% can be numeric, convert
                    if non_null_ratio > 0.8:
                        df_cleaned[col] = numeric_attempt
                        conversions += 1
                        conversion_details.append(f"'{col}': converted to numeric ({non_null_ratio*100:.1f}% success)")
                except:
                    pass
                
                # Try converting to datetime
                try:
                    datetime_attempt = pd.to_datetime(df_cleaned[col], errors='coerce', infer_datetime_format=True)
                    non_null_ratio = datetime_attempt.notna().sum() / df_cleaned[col].notna().sum()
                    
                    # If >50% can be datetime, convert
                    if non_null_ratio > 0.5:
                        df_cleaned[col] = datetime_attempt
                        conversions += 1
                        conversion_details.append(f"'{col}': converted to datetime ({non_null_ratio*100:.1f}% success)")
                except:
                    pass
        
        return df_cleaned, {
            "step": "data_type_correction",
            "conversions": conversions,
            "conversion_details": conversion_details
        }
    
    def _clean_for_json(self, obj):
        """Clean NaN/Inf values for JSON serialization."""
        import math
        if isinstance(obj, dict):
            return {k: self._clean_for_json(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._clean_for_json(v) for v in obj]
        elif isinstance(obj, float):
            if math.isnan(obj) or math.isinf(obj):
                return None
            return obj
        return obj


# Singleton instance
_data_cleaning_service = None

def get_data_cleaning_service() -> DataCleaningService:
    """Get or create DataCleaningService instance."""
    global _data_cleaning_service
    if _data_cleaning_service is None:
        _data_cleaning_service = DataCleaningService()
    return _data_cleaning_service
