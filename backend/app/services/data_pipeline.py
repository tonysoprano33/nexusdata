import os
import logging
from typing import Dict, Any, List
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

def _quality_score(df: pd.DataFrame) -> float:
    total_cells = max(len(df) * len(df.columns), 1)
    missing_cells = int(df.isnull().sum().sum())
    return round(max(0.0, 1 - (missing_cells / total_cells)) * 100, 1)

def process_dataset(file_path: str) -> Dict[str, Any]:
    df_raw = pd.read_csv(file_path) if file_path.endswith('.csv') else pd.read_excel(file_path)
    df = df_raw.copy()
    
    changes_log = []
    
    # 1. Limpieza de Duplicados
    dups = df.duplicated().sum()
    df = df.drop_duplicates()
    if dups > 0: changes_log.append(f"Eliminadas {dups} filas duplicadas.")

    # 2. Normalización de Texto (Mayúsculas Iniciales)
    for col in df.select_dtypes(include=['object']).columns:
        original_sample = df[col].astype(str).head(1).values[0]
        df[col] = df[col].astype(str).str.strip().str.title()
        new_sample = df[col].head(1).values[0]
        if original_sample != new_sample:
            changes_log.append(f"Normalización en '{col}': Texto capitalizado y sin espacios.")

    # 3. Limpieza de Números (Manejo de formatos como '2 millones')
    def clean_currency(x):
        if isinstance(x, str):
            x = x.lower().replace(' millones', '000000').replace('k', '000').replace('$', '').replace(',', '')
            try: return float(x)
            except: return x
        return x

    for col in df.columns:
        if df[col].dtype == 'object':
            try:
                df[col] = df[col].apply(clean_currency)
                if pd.api.types.is_numeric_dtype(df[col]):
                    changes_log.append(f"Conversión en '{col}': Datos detectados como numéricos.")
            except: pass

    # 4. Imputación de Nulos
    for col in df.columns:
        null_count = df[col].isnull().sum()
        if null_count > 0:
            if pd.api.types.is_numeric_dtype(df[col]):
                df[col] = df[col].fillna(df[col].median())
            else:
                df[col] = df[col].fillna("Unknown")
            changes_log.append(f"Rellenados {null_count} valores faltantes en '{col}'.")

    # Score de Limpieza
    total_cells = df.size
    changed_cells_est = len(changes_log) * 10 # Estimación simple para el reporte
    cleanup_pct = min(100, round((changed_cells_est / total_cells) * 100, 1)) if total_cells > 0 else 0

    return {
        "raw_preview": df_raw.head(20).to_dict('records'),
        "clean_preview": df.head(20).to_dict('records'),
        "cleaning_report": {
            "score_before": _quality_score(df_raw),
            "score_after": _quality_score(df),
            "cleanup_percentage": cleanup_pct,
            "actions": changes_log
        },
        "dataset_dna": {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "columns_list": df.columns.tolist()
        }
    }