import os
import logging
import traceback
from typing import Dict, Any

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

from app.services.chart_recommender import generate_chart_recommendations, prepare_chart_data
from app.services.advanced_analytics import run_all_advanced_analytics

logger = logging.getLogger(__name__)


def read_data_file(file_path: str) -> pd.DataFrame:
    """
    Lee archivos CSV, Excel o JSON de forma segura y robusta.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Archivo no encontrado: {file_path}")

    ext = os.path.splitext(file_path)[1].lower()

    try:
        if ext in ['.xlsx', '.xls']:
            # Intentar con engine más moderno primero
            try:
                return pd.read_excel(file_path, engine='openpyxl')
            except Exception:
                return pd.read_excel(file_path)
        elif ext == '.csv':
            # Intentar detectar separador automáticamente
            return pd.read_csv(file_path, low_memory=False)
        elif ext == '.json':
            return pd.read_json(file_path)
        else:
            raise ValueError(f"Formato no soportado: {ext}. Soporta: .csv, .xlsx, .xls, .json")
    except Exception as e:
        logger.error(f"Error al leer archivo {file_path}: {e}")
        raise


def process_dataset(file_path: str) -> Dict[str, Any]:
    """
    Pipeline profesional de procesamiento de datasets.
    - Lee el archivo
    - Limpia datos de forma inteligente
    - Genera estadísticas, detección de anomalías y recomendaciones
    - Totalmente resistente a errores
    """
    try:
        logger.info(f"Iniciando procesamiento de dataset: {file_path}")

        # ====================== 1. LECTURA ======================
        df = read_data_file(file_path)

        if not isinstance(df, pd.DataFrame):
            raise TypeError(f"Se esperaba pd.DataFrame, se obtuvo {type(df)}")

        total_rows = len(df)
        logger.info(f"Dataset cargado: {total_rows:,} filas x {len(df.columns)} columnas")

        # Muestreo inteligente para datasets muy grandes
        if total_rows > 100_000:
            df = df.sample(n=100_000, random_state=42)
            logger.info(f"Dataset muestreado a 100.000 filas para optimizar rendimiento")

        columns = df.columns.tolist()

        # ====================== 2. ANÁLISIS BÁSICO ======================
        missing_data = df.isnull().sum().to_dict()
        missing_cells = int(df.isnull().sum().sum())
        total_cells = max(len(df) * len(columns), 1)
        data_quality_score = round(max(0.0, 1 - (missing_cells / total_cells)) * 100, 2)

        # ====================== 3. INFERENCIA DE TIPOS ======================
        column_types: Dict[str, str] = {}
        for col in columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                column_types[col] = "numeric"
            elif pd.api.types.is_datetime64_any_dtype(df[col]) or "date" in col.lower():
                column_types[col] = "datetime"
            else:
                column_types[col] = "categorical"

        # ====================== 4. LIMPIEZA PROFESIONAL ======================
        df_clean = df.copy()

        # Limpieza numérica (mediana es más robusta que mean)
        numeric_cols = [col for col, t in column_types.items() if t == "numeric"]
        for col in numeric_cols:
            if df_clean[col].isnull().any():
                median_val = df_clean[col].median()
                df_clean[col] = df_clean[col].fillna(median_val)

        # Limpieza categórica/datetime
        for col in [c for c in columns if c not in numeric_cols]:
            if df_clean[col].isnull().any():
                mode_series = df_clean[col].mode()
                mode_value = mode_series.iloc[0] if not mode_series.empty else "Unknown"
                df_clean[col] = df_clean[col].fillna(mode_value)

        # ====================== 5. ESTADÍSTICAS DESCRIPTIVAS ======================
        stats_numeric = df_clean[numeric_cols].describe().to_dict() if numeric_cols else {}

        # Matriz de correlación (solo numéricas)
        correlation_matrix = {}
        if len(numeric_cols) > 1:
            corr = df_clean[numeric_cols].corr().fillna(0)
            correlation_matrix = corr.to_dict()

        # ====================== 6. DETECCIÓN DE ANOMALÍAS ======================
        anomaly_summary = {"detected_rows": 0, "ratio": 0.0}
        if len(numeric_cols) >= 2 and len(df_clean) >= 20:
            try:
                numeric_frame = df_clean[numeric_cols].fillna(0)  # IsolationForest no acepta NaN
                forest = IsolationForest(contamination="auto", random_state=42, n_jobs=-1)
                predictions = forest.fit_predict(numeric_frame)
                anomaly_count = int((predictions == -1).sum())
                anomaly_summary = {
                    "detected_rows": anomaly_count,
                    "ratio": round(anomaly_count / len(df_clean), 4),
                }
            except Exception as e:
                logger.warning(f"Error en detección de anomalías: {e}")

        # Sample data para frontend y chat
        sample_data = df_clean.head(10).to_dict('records')

        # ====================== RESULTADO BASE ======================
        result: Dict[str, Any] = {
            "summary": {
                "total_rows": total_rows,
                "sampled_rows": len(df_clean),
                "total_columns": len(columns),
                "missing_data": missing_data,
                "data_quality_score": data_quality_score,
                "missing_cells": missing_cells,
            },
            "column_types": column_types,
            "descriptive_statistics": stats_numeric,
            "correlation_matrix": correlation_matrix,
            "anomaly_detection": anomaly_summary,
            "sample_data": sample_data,
        }

        # ====================== 7. RECOMENDACIONES DE GRÁFICOS ======================
        try:
            chart_recommendations = generate_chart_recommendations(result, {})
            result["chart_recommendations"] = chart_recommendations

            charts_data = []
            for rec in chart_recommendations:
                chart_data = prepare_chart_data(df_clean, rec)
                if chart_data:
                    chart_data.setdefault('insight', rec.get('insight', ''))
                    charts_data.append(chart_data)

            result["charts_data"] = charts_data
            logger.info(f"Generadas {len(charts_data)} recomendaciones de gráficos")
        except Exception as e:
            logger.error(f"Error en recomendaciones de gráficos: {e}")
            result["chart_recommendations"] = []
            result["charts_data"] = []

        # ====================== 8. ANÁLISIS AVANZADOS ======================
        try:
            advanced_analytics = run_all_advanced_analytics(df_clean, column_types)
            result["advanced_analytics"] = advanced_analytics or {}
        except Exception as e:
            logger.error(f"Error en análisis avanzados: {e}\n{traceback.format_exc()}")
            result["advanced_analytics"] = {}

        logger.info(f"Procesamiento completado exitosamente para {file_path}")
        return result

    except Exception as e:
        logger.error(f"Pipeline falló para {file_path}: {e}\n{traceback.format_exc()}")
        raise  # Re-lanzamos para que el background task lo capture