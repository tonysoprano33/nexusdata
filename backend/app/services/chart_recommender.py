import json
import os
import logging
from typing import Dict, List, Any

import google.generativeai as genai
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)


def _fallback_chart_recommendations(data_stats: dict) -> List[Dict[str, Any]]:
    """Fallback inteligente cuando Gemini falla o no está disponible."""
    column_types = data_stats.get("column_types", {})
    numeric_cols = [col for col, t in column_types.items() if t == "numeric"]
    categorical_cols = [col for col, t in column_types.items() if t == "categorical"]

    recommendations = []

    if categorical_cols and numeric_cols:
        recommendations.append({
            "type": "bar",
            "x_column": categorical_cols[0],
            "y_column": numeric_cols[0],
            "title": f"{numeric_cols[0]} por {categorical_cols[0]}",
            "insight": f"Identifica qué categorías generan más valor en {numeric_cols[0]}",
            "priority": 1
        })

    if numeric_cols:
        recommendations.append({
            "type": "histogram",
            "x_column": "",
            "y_column": numeric_cols[0],
            "title": f"Distribución de {numeric_cols[0]}",
            "insight": f"Entiende la concentración y valores atípicos de la métrica principal",
            "priority": 2
        })

    if len(numeric_cols) >= 2:
        recommendations.append({
            "type": "scatter",
            "x_column": numeric_cols[0],
            "y_column": numeric_cols[1],
            "title": f"Relación entre {numeric_cols[0]} y {numeric_cols[1]}",
            "insight": f"Analiza si existe correlación o trade-off entre estas métricas",
            "priority": 3
        })

    return recommendations[:4]


def generate_chart_recommendations(data_stats: dict, sample_data: dict = None) -> List[Dict[str, Any]]:
    """Genera recomendaciones de gráficos usando Gemini (con fallback seguro)."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logger.warning("No GEMINI_API_KEY encontrada - usando fallback")
        return _fallback_chart_recommendations(data_stats)

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.0-flash")   # Modelo correcto para 2026

        numeric_cols = [col for col, t in data_stats.get("column_types", {}).items() if t == "numeric"]
        categorical_cols = [col for col, t in data_stats.get("column_types", {}).items() if t != "numeric"]

        prompt = f"""
Eres un experto en visualización de datos para negocio.

Dataset:
- Numéricas: {numeric_cols}
- Categóricas: {categorical_cols}

Genera entre 2 y 4 recomendaciones de gráficos útiles para un ejecutivo.
Devuelve SOLO un JSON válido con esta estructura:

[
  {{
    "type": "bar|line|scatter|histogram|box|pie",
    "x_column": "nombre_columna_x",
    "y_column": "nombre_columna_y",
    "title": "Título claro y profesional (máx 8 palabras)",
    "insight": "Breve insight de negocio (máx 15 palabras)",
    "priority": 1
  }}
]

Usa solo columnas que existan. Prioriza valor de negocio.
"""

        response = model.generate_content(prompt)
        text = response.text.strip()

        # Limpiar bloques de código
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        recommendations = json.loads(text)

        # Validación básica
        valid_recs = []
        allowed_types = {'bar', 'line', 'scatter', 'histogram', 'box', 'pie'}

        for rec in recommendations:
            if isinstance(rec, dict) and rec.get('type') in allowed_types:
                valid_recs.append(rec)

        valid_recs.sort(key=lambda x: x.get('priority', 999))
        return valid_recs[:5]

    except Exception as e:
        logger.error(f"Error generando recomendaciones con Gemini: {e}")
        return _fallback_chart_recommendations(data_stats)


# ====================== FUNCIONES DE PREPARACIÓN ======================

def _safe_convert_to_list(values) -> list:
    """Convierte valores a lista nativa de forma segura."""
    if values is None:
        return []
    
    if not pd.api.types.is_numeric_dtype(values):
        values = pd.to_numeric(values, errors='coerce')
    
    clean_values = pd.Series(values).dropna()
    
    result = []
    for v in clean_values:
        if pd.isna(v):
            continue
        elif isinstance(v, (np.integer, np.int64, np.int32)):
            result.append(int(v))
        elif isinstance(v, (np.floating, np.float64, np.float32)):
            result.append(float(v) if not (np.isnan(v) or np.isinf(v)) else None)
        else:
            result.append(str(v))
    return result


def prepare_chart_data(df: pd.DataFrame, recommendation: Dict[str, Any]) -> Dict[str, Any] | None:
    """
    Versión limpia y robusta - evita errores de tipo DType.
    """
    try:
        chart_type = str(recommendation.get('type', 'bar')).lower().strip()
        x_col = recommendation.get('x_column')
        y_col = recommendation.get('y_column')

        if chart_type == 'heatmap':
            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()[:10]
            if len(numeric_cols) < 2:
                return None
            corr_matrix = df[numeric_cols].corr().fillna(0)
            return {
                'type': 'heatmap',
                'labels': corr_matrix.columns.tolist(),
                'data': corr_matrix.values.tolist(),
                'title': recommendation.get('title', 'Matriz de Correlación')
            }

        if chart_type == 'histogram':
            target_col = y_col or x_col
            if not target_col or target_col not in df.columns:
                return None
            values = pd.to_numeric(df[target_col], errors='coerce').dropna()
            return {
                'type': 'histogram',
                'values': _safe_convert_to_list(values),
                'title': recommendation.get('title', f'Distribución de {target_col}'),
                'x_label': target_col
            }

        if chart_type == 'scatter':
            if not (x_col and y_col and x_col in df.columns and y_col in df.columns):
                return None
            df_scatter = df[[x_col, y_col]].apply(pd.to_numeric, errors='coerce').dropna()
            if df_scatter.empty:
                return None
            sample = df_scatter.sample(min(600, len(df_scatter)), random_state=42)
            return {
                'type': 'scatter',
                'data': sample.values.tolist(),
                'title': recommendation.get('title', f'{y_col} vs {x_col}'),
                'x_label': x_col,
                'y_label': y_col
            }

        if chart_type == 'pie':
            if not (x_col and y_col and x_col in df.columns and y_col in df.columns):
                return None
            grouped = df.groupby(x_col)[y_col].sum().sort_values(ascending=False).head(8)
            return {
                'type': 'pie',
                'labels': [str(label) for label in grouped.index],
                'values': _safe_convert_to_list(grouped.values),
                'title': recommendation.get('title', 'Distribución por categoría')
            }

        if chart_type in ['bar', 'line', 'area']:
            if not (x_col and y_col and x_col in df.columns and y_col in df.columns):
                return None

            df_clean = df[[x_col, y_col]].copy()

            if pd.api.types.is_object_dtype(df_clean[x_col]) or pd.api.types.is_categorical_dtype(df_clean[x_col]) or pd.api.types.is_datetime64_any_dtype(df_clean[x_col]):
                grouped = df_clean.groupby(x_col)[y_col].mean().sort_values(ascending=False).head(12)
                labels = [str(x) for x in grouped.index]
                values = _safe_convert_to_list(grouped.values)
            else:
                df_clean['bin'] = pd.cut(pd.to_numeric(df_clean[x_col], errors='coerce'), bins=10)
                grouped = df_clean.groupby('bin')[y_col].mean()
                labels = [f"{interval.left:.1f}–{interval.right:.1f}" for interval in grouped.index]
                values = _safe_convert_to_list(grouped.values)

            return {
                'type': chart_type,
                'x': labels,
                'y': values,
                'title': recommendation.get('title', f'{y_col} por {x_col}'),
                'x_label': x_col,
                'y_label': y_col
            }

        if chart_type == 'box':
            if not (x_col and y_col and x_col in df.columns and y_col in df.columns):
                return None

            df_clean = df[[x_col, y_col]].copy()

            if pd.api.types.is_object_dtype(df_clean[x_col]) or pd.api.types.is_string_dtype(df_clean[x_col]):
                categories = df_clean[x_col].dropna().unique()[:8]
                data_by_cat = {}
                for cat in categories:
                    cat_data = pd.to_numeric(df_clean[df_clean[x_col] == cat][y_col], errors='coerce').dropna()
                    data_by_cat[str(cat)] = _safe_convert_to_list(cat_data)
                return {
                    'type': 'box',
                    'categories': list(data_by_cat.keys()),
                    'data': list(data_by_cat.values()),
                    'title': recommendation.get('title', f'{y_col} por {x_col}'),
                    'x_label': x_col,
                    'y_label': y_col
                }
            else:
                values = pd.to_numeric(df_clean[y_col], errors='coerce').dropna()
                return {
                    'type': 'box',
                    'categories': [y_col],
                    'data': [_safe_convert_to_list(values)],
                    'title': recommendation.get('title', f'Distribución de {y_col}')
                }

        return None

    except Exception as e:
        logger.error(f"Error en prepare_chart_data para tipo '{chart_type}': {e}")
        return None