import json
import os
import logging
from typing import Dict, List, Any

import google.generativeai as genai
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)


def _fallback_chart_recommendations(data_stats: dict) -> List[Dict[str, Any]]:
    """Fallback inteligente cuando Gemini no está disponible."""
    column_types = data_stats.get("column_types", {})
    numeric_cols = [col for col, t in column_types.items() if t == "numeric"]
    categorical_cols = [col for col, t in column_types.items() if t == "categorical"]
    datetime_cols = [col for col, t in column_types.items() if t == "datetime"]

    recommendations: List[Dict[str, Any]] = []
    seen = set()

    def add_chart(chart_type: str, x: str, y: str, title: str, insight: str, priority: int):
        key = (chart_type, x, y)
        if key in seen:
            return
        seen.add(key)
        recommendations.append({
            "type": chart_type,
            "x_column": x,
            "y_column": y,
            "title": title,
            "insight": insight,
            "priority": priority,
        })

    # Recomendaciones de alto valor de negocio
    if datetime_cols and numeric_cols:
        add_chart(
            "line", datetime_cols[0], numeric_cols[0],
            f"Evolución de {numeric_cols[0]}",
            f"Tendencia temporal clave para entender crecimiento o caída del negocio",
            1
        )

    if categorical_cols and numeric_cols:
        add_chart(
            "bar", categorical_cols[0], numeric_cols[0],
            f"{numeric_cols[0]} por {categorical_cols[0]}",
            f"Identifica qué segmentos generan más valor o representan mayor riesgo",
            2
        )
        add_chart(
            "box", categorical_cols[0], numeric_cols[0],
            f"Distribución de {numeric_cols[0]} por segmento",
            f"Revela variabilidad y posibles outliers por grupo de clientes/productos",
            3
        )

    if numeric_cols:
        add_chart(
            "histogram", "", numeric_cols[0],
            f"Distribución de {numeric_cols[0]}",
            f"Entiende el comportamiento típico y los valores extremos del negocio",
            4
        )

    if len(numeric_cols) >= 2:
        add_chart(
            "scatter", numeric_cols[0], numeric_cols[1],
            f"Relación {numeric_cols[0]} vs {numeric_cols[1]}",
            f"¿Existe correlación o trade-off entre estas dos métricas clave?",
            5
        )

    return recommendations[:5]


def generate_chart_recommendations(data_stats: dict, sample_data: dict = None) -> List[Dict[str, Any]]:
    """
    Genera recomendaciones de gráficos **orientadas a negocio** usando Gemini.
    Prioriza insights accionables para toma de decisiones.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY no encontrada. Usando fallback.")
        return _fallback_chart_recommendations(data_stats)

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')

        column_types = data_stats.get('column_types', {})
        numeric_cols = [col for col, t in column_types.items() if t == 'numeric']
        categorical_cols = [col for col, t in column_types.items() if t == 'categorical']
        datetime_cols = [col for col, t in column_types.items() if t == 'datetime']

        num_numeric = len(numeric_cols)
        num_categorical = len(categorical_cols)
        has_strong_correlation = bool(data_stats.get('correlation_matrix'))

        target_count = 4 if (num_numeric >= 4 and has_strong_correlation) else \
                       3 if num_numeric >= 3 else 2

        prompt = f"""
Eres un Data Analyst Senior con enfoque en negocio que reporta directamente a CEO y gerentes.

Analiza el siguiente dataset y recomienda **solo** los gráficos que generen **insights accionables** de valor real para el negocio.

### Información del Dataset:
- Columnas numéricas ({num_numeric}): {numeric_cols}
- Columnas categóricas ({num_categorical}): {categorical_cols}
- Columnas temporales: {datetime_cols}
- ¿Existen correlaciones fuertes? {has_strong_correlation}

### Instrucciones:
- Recomienda entre {target_count} gráficos como máximo.
- Prioriza gráficos que respondan preguntas de negocio reales (revenue, churn, segmentación, tendencias, riesgos).
- Evita gráficos genéricos o que no aporten decisión.
- Cada gráfico debe tener un insight claro y útil (máximo 15 palabras).
- Títulos cortos y profesionales (máximo 6 palabras).

Devuelve **únicamente** un array JSON válido con esta estructura:

[
  {{
    "type": "bar|line|scatter|pie|histogram|box|heatmap",
    "x_column": "nombre_columna_x",
    "y_column": "nombre_columna_y",
    "title": "Título corto y profesional",
    "insight": "Insight de negocio accionable (máx 15 palabras)",
    "priority": 1
  }}
]

Ejemplos de buenos insights:
- "El 68% del revenue viene de solo 3 segmentos"
- "La retención cae fuertemente después del mes 3"
- "Los clientes de alto valor muestran 40% más variabilidad"

Genera las recomendaciones ahora:
"""

        response = model.generate_content(prompt)
        text = response.text.strip()

        # Limpiar bloques de código si existen
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        recommendations = json.loads(text)

        # Validación estricta
        valid_recs = []
        all_cols = list(column_types.keys())
        allowed_types = {'bar', 'line', 'scatter', 'pie', 'histogram', 'box', 'heatmap'}

        for rec in recommendations:
            if not isinstance(rec, dict):
                continue

            chart_type = str(rec.get('type', '')).lower().strip()
            x_col = rec.get('x_column')
            y_col = rec.get('y_column')

            if chart_type not in allowed_types:
                continue

            if chart_type == 'heatmap':
                valid_recs.append(rec)
                continue
            if chart_type == 'histogram':
                target = y_col or x_col
                if target in numeric_cols:
                    valid_recs.append(rec)
                continue
            if chart_type == 'scatter':
                if x_col in numeric_cols and y_col in numeric_cols:
                    valid_recs.append(rec)
                continue

            if x_col not in all_cols or (y_col and y_col not in numeric_cols):
                continue

            valid_recs.append(rec)

        valid_recs.sort(key=lambda x: x.get('priority', 999))
        return valid_recs[:5]

    except Exception as e:
        logger.error(f"Error generando recomendaciones con Gemini: {e}")
        return _fallback_chart_recommendations(data_stats)


def _safe_tolist(values) -> list:
    """Convierte valores pandas/numpy a lista de tipos Python nativos."""
    if hasattr(values, 'tolist'):
        result = values.tolist()
    else:
        result = list(values)

    clean = []
    for v in result:
        if isinstance(v, (np.integer, np.int64, np.int32)):
            clean.append(int(v))
        elif isinstance(v, (np.floating, np.float64, np.float32)):
            clean.append(None if (np.isnan(v) or np.isinf(v)) else float(v))
        elif isinstance(v, np.bool_):
            clean.append(bool(v))
        else:
            clean.append(v)
    return clean


def prepare_chart_data(df: pd.DataFrame, recommendation: Dict[str, Any]) -> Dict[str, Any] | None:
    """
    Prepara los datos para el gráfico de forma segura y eficiente.
    """
    try:
        chart_type = recommendation.get('type', 'bar').lower()
        x_col = recommendation.get('x_column')
        y_col = recommendation.get('y_column')

        # Heatmap de correlación
        if chart_type == 'heatmap':
            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()[:10]
            if len(numeric_cols) < 2:
                return None
            corr = df[numeric_cols].corr().fillna(0)
            return {
                'type': 'heatmap',
                'labels': corr.columns.tolist(),
                'data': [_safe_tolist(row) for row in corr.values],
                'title': recommendation.get('title', 'Matriz de Correlación')
            }

        # Histograma
        if chart_type == 'histogram':
            target_col = y_col or x_col
            if target_col not in df.columns:
                return None
            values = pd.to_numeric(df[target_col], errors='coerce').dropna()
            return {
                'type': 'histogram',
                'values': _safe_tolist(values),
                'title': recommendation.get('title', f'Distribución de {target_col}'),
                'x_label': target_col
            }

        # Scatter
        if chart_type == 'scatter':
            if not (x_col and y_col and x_col in df.columns and y_col in df.columns):
                return None
            df_scatter = df[[x_col, y_col]].apply(pd.to_numeric, errors='coerce').dropna()
            if df_scatter.empty:
                return None
            sample = df_scatter.sample(min(600, len(df_scatter)), random_state=42)
            return {
                'type': 'scatter',
                'data': sample[[x_col, y_col]].values.tolist(),
                'title': recommendation.get('title', f'{y_col} vs {x_col}'),
                'x_label': x_col,
                'y_label': y_col
            }

        if not (x_col and y_col and x_col in df.columns and y_col in df.columns):
            return None

        df_clean = df[[x_col, y_col]].dropna().copy()

        # Pie Chart
        if chart_type == 'pie':
            grouped = df_clean.groupby(x_col)[y_col].sum().sort_values(ascending=False).head(8)
            return {
                'type': 'pie',
                'labels': [str(x) for x in grouped.index],
                'values': _safe_tolist(grouped.values),
                'title': recommendation.get('title', 'Distribución por categoría')
            }

        # Bar / Line / Area
        if chart_type in ['bar', 'line', 'area']:
            if pd.api.types.is_object_dtype(df_clean[x_col]) or \
               pd.api.types.is_categorical_dtype(df_clean[x_col]) or \
               pd.api.types.is_datetime64_any_dtype(df_clean[x_col]):
                grouped = df_clean.groupby(x_col)[y_col].mean().sort_values(ascending=False).head(12)
                labels = [str(x) for x in grouped.index]
                values = _safe_tolist(grouped.values)
            else:
                df_clean['bin'] = pd.cut(df_clean[x_col], bins=10)
                grouped = df_clean.groupby('bin')[y_col].mean()
                labels = [f"{interval.left:.1f} - {interval.right:.1f}" for interval in grouped.index]
                values = _safe_tolist(grouped.values)

            return {
                'type': chart_type,
                'x': labels,
                'y': values,
                'title': recommendation.get('title', f'{y_col} por {x_col}'),
                'x_label': x_col,
                'y_label': y_col
            }

        # Box Plot
        if chart_type == 'box':
            if pd.api.types.is_object_dtype(df_clean[x_col]) or pd.api.types.is_string_dtype(df_clean[x_col]):
                categories = df_clean[x_col].unique()[:8]
                data_by_cat = {}
                for cat in categories:
                    data_by_cat[str(cat)] = _safe_tolist(
                        df_clean[df_clean[x_col] == cat][y_col].dropna().values
                    )
                return {
                    'type': 'box',
                    'categories': list(data_by_cat.keys()),
                    'data': list(data_by_cat.values()),
                    'title': recommendation.get('title', f'{y_col} por {x_col}'),
                    'x_label': x_col,
                    'y_label': y_col
                }
            else:
                return {
                    'type': 'box',
                    'categories': [y_col],
                    'data': [_safe_tolist(df_clean[y_col].dropna().values)],
                    'title': recommendation.get('title', f'Distribución de {y_col}')
                }

        return None

    except Exception as e:
        logger.error(f"Error en prepare_chart_data: {e}")
        return None