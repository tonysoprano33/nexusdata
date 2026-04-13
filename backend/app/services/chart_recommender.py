import json
import os
import google.generativeai as genai
import numpy as np
import pandas as pd
from typing import Dict, List, Any


def _fallback_chart_recommendations(data_stats: dict) -> List[Dict[str, Any]]:
    column_types = data_stats.get("column_types", {})
    numeric_cols = [col for col, col_type in column_types.items() if col_type == "numeric"]
    categorical_cols = [col for col, col_type in column_types.items() if col_type == "categorical"]
    datetime_cols = [col for col, col_type in column_types.items() if col_type == "datetime"]

    recommendations: List[Dict[str, Any]] = []
    seen_keys = set()

    def add_chart(chart_type: str, x_column: str, y_column: str, title: str, insight: str):
        chart_key = (chart_type, x_column, y_column)
        if chart_key in seen_keys:
            return
        seen_keys.add(chart_key)
        recommendations.append({
            "type": chart_type,
            "x_column": x_column,
            "y_column": y_column,
            "title": title,
            "insight": insight,
            "priority": len(recommendations) + 1,
        })

    if datetime_cols and numeric_cols:
        add_chart("line", datetime_cols[0], numeric_cols[0],
                  f"{numeric_cols[0]} over time",
                  "Shows how the main metric changes across time periods.")

    if categorical_cols and numeric_cols:
        add_chart("bar", categorical_cols[0], numeric_cols[0],
                  f"{numeric_cols[0]} by segment",
                  "Highlights which business segment concentrates the highest value.")
        add_chart("box", categorical_cols[0], numeric_cols[0],
                  "Spread by segment",
                  "Reveals dispersion and outliers inside each main segment.")

    if numeric_cols:
        add_chart("histogram", "", numeric_cols[0],
                  f"{numeric_cols[0]} distribution",
                  "Summarizes skew, spread, and concentration of the key metric.")

    if len(numeric_cols) >= 2:
        add_chart("scatter", numeric_cols[0], numeric_cols[1],
                  "Numeric relationship",
                  "Tests whether two metrics move together or diverge.")
        add_chart("heatmap", numeric_cols[0], numeric_cols[1],
                  "Correlation overview",
                  "Prevents isolated reading by summarizing metric relationships.")

    return recommendations[:5]


def generate_chart_recommendations(data_stats: dict, sample_data: dict) -> List[Dict[str, Any]]:
    """
    Usa Gemini para recomendar visualizaciones óptimas basadas en los datos.
    Retorna una lista de configuraciones de gráficos recomendados.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return _fallback_chart_recommendations(data_stats)

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-flash-latest')

    num_numeric = len([t for t in data_stats.get('column_types', {}).values() if t == 'numeric'])
    num_categorical = len([t for t in data_stats.get('column_types', {}).values() if t != 'numeric'])
    correlation_matrix = data_stats.get('correlation_matrix', {})
    has_correlations = len(correlation_matrix) > 1

    if num_numeric >= 5 and has_correlations:
        target_charts = "4-5"
    elif num_numeric >= 3:
        target_charts = "3-4"
    else:
        target_charts = "2-3"

    prompt = f"""
    Eres un experto en visualización de datos. DECIDE AUTOMÁTICAMENTE cuáles y cuántos gráficos (entre {target_charts}) son óptimos para estos datos.

    DATOS:
    - Columnas numéricas ({num_numeric}): {[k for k,v in data_stats.get('column_types',{}).items() if v=='numeric']}
    - Columnas categóricas ({num_categorical}): {[k for k,v in data_stats.get('column_types',{}).items() if v!='numeric']}
    - Correlaciones fuertes: {has_correlations}
    - Stats: {json.dumps(data_stats.get('descriptive_statistics', {}), indent=2)[:600]}

    DECIDE EL MEJOR TIPO según la relación:
    - Comparar categorías vs valores → "bar"
    - Distribución de una variable → "histogram" o "box"
    - Tendencia temporal → "line" o "area"
    - Proporción/porcentajes → "pie" (solo si suman 100%)
    - Relación entre 2 numéricas → "scatter"
    - Correlaciones múltiples → "heatmap"

    RESPUESTA JSON OBLIGATORIA:
    [
      {{
        "type": "bar|line|scatter|pie|histogram|box|heatmap",
        "x_column": "columna_x",
        "y_column": "columna_y",
        "title": "Título corto y descriptivo (máx 5 palabras)",
        "insight": "Qué revela este gráfico en 15 palabras máximo",
        "priority": 1
      }}
    ]

    REGLAS:
    - Genera entre {target_charts} gráficos según la riqueza de los datos
    - Ordena por priority (1=esencial, 5=complementario)
    - Cada gráfico debe revelar algo DISTINTO (no repetir insights)
    - Si hay correlaciones fuertes, incluir heatmap
    - Si hay categorías con valores, siempre incluir bar chart top
    - Títulos máximo 5 palabras, insights máximo 15 palabras
    - Usa SOLO columnas que existan en los datos
    """

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        recommendations = json.loads(text)

        valid_recs = []
        column_types = data_stats.get('column_types', {})
        numeric_cols = [col for col, t in column_types.items() if t == 'numeric']
        all_cols = list(column_types.keys())
        allowed_types = {'bar', 'line', 'area', 'scatter', 'pie', 'histogram', 'box', 'heatmap'}

        for rec in recommendations:
            y_col = rec.get('y_column')
            x_col = rec.get('x_column')
            chart_type = rec.get('type', '').lower()

            if chart_type not in allowed_types:
                continue
            if chart_type == 'heatmap':
                valid_recs.append(rec)
                continue
            if chart_type == 'histogram':
                target_col = y_col or x_col
                if target_col in numeric_cols:
                    valid_recs.append(rec)
                continue
            if chart_type == 'scatter':
                if x_col in numeric_cols and y_col in numeric_cols:
                    valid_recs.append(rec)
                continue
            if x_col not in all_cols or y_col not in numeric_cols:
                continue
            if chart_type == 'pie' and x_col not in column_types:
                continue
            valid_recs.append(rec)

        valid_recs.sort(key=lambda x: x.get('priority', 99))

        if len(valid_recs) > 5:
            valid_recs = valid_recs[:5]
        elif len(valid_recs) < 2:
            for col in numeric_cols[:2]:
                if len(valid_recs) >= 2:
                    break
                valid_recs.append({
                    'type': 'histogram',
                    'x_column': '',
                    'y_column': col,
                    'title': f'Distribución de {col}',
                    'insight': f'Muestra la distribución de valores en {col}',
                    'priority': len(valid_recs) + 1
                })

        return valid_recs

    except Exception as e:
        print(f"⚠️ Error generando recomendaciones: {e}")
        numeric_cols = [col for col, t in data_stats.get('column_types', {}).items() if t == 'numeric']
        fallback_recs = []
        for i, col in enumerate(numeric_cols[:3]):
            fallback_recs.append({
                'type': 'histogram',
                'x_column': '',
                'y_column': col,
                'title': f'Distribución {col}',
                'insight': f'Valores típicos de {col}',
                'priority': i + 1
            })
        return fallback_recs


def _safe_tolist(values) -> list:
    """Convierte valores pandas/numpy a lista de tipos Python nativos."""
    if hasattr(values, 'tolist'):
        result = values.tolist()
    else:
        result = list(values)
    # Asegurar que cada elemento sea tipo Python nativo
    clean = []
    for v in result:
        if isinstance(v, (np.integer,)):
            clean.append(int(v))
        elif isinstance(v, (np.floating,)):
            clean.append(None if (np.isnan(v) or np.isinf(v)) else float(v))
        elif isinstance(v, np.bool_):
            clean.append(bool(v))
        else:
            clean.append(v)
    return clean


def prepare_chart_data(df: pd.DataFrame, recommendation: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepara los datos para un gráfico específico basado en la recomendación de IA.
    Todos los valores de salida son tipos Python nativos (no numpy).
    """
    try:
        chart_type = recommendation.get('type', 'bar')
        x_col = recommendation.get('x_column')
        y_col = recommendation.get('y_column')

        if chart_type == 'heatmap':
            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()[:8]
            if len(numeric_cols) < 2:
                return None
            corr_data = df[numeric_cols].dropna().corr().fillna(0)
            return {
                'type': 'heatmap',
                'labels': corr_data.columns.tolist(),
                'data': [_safe_tolist(row) for row in corr_data.values],
                'title': recommendation.get('title', 'Matriz de Correlación')
            }

        if chart_type == 'histogram':
            target_col = y_col or x_col
            if target_col not in df.columns:
                return None
            values = _safe_tolist(pd.to_numeric(df[target_col], errors='coerce').dropna())
            if not values:
                return None
            return {
                'type': 'histogram',
                'values': values,
                'title': recommendation.get('title', f'Distribución de {target_col}'),
                'x_label': target_col
            }

        if chart_type == 'scatter':
            if x_col not in df.columns or y_col not in df.columns:
                return None
            df_scatter = df[[x_col, y_col]].apply(pd.to_numeric, errors='coerce').dropna()
            if df_scatter.empty:
                return None
            sample = df_scatter.sample(min(500, len(df_scatter)), random_state=42)
            return {
                'type': 'scatter',
                'data': [_safe_tolist(row) for row in sample[[x_col, y_col]].values],
                'title': recommendation.get('title', f'{y_col} vs {x_col}'),
                'x_label': x_col,
                'y_label': y_col
            }

        if x_col not in df.columns or y_col not in df.columns:
            return None

        df_clean = df[[x_col, y_col]].dropna().copy()

        if chart_type == 'pie':
            grouped = df_clean.groupby(x_col)[y_col].sum().sort_values(ascending=False).head(10)
            return {
                'type': 'pie',
                'labels': [str(l) for l in grouped.index.tolist()],
                'values': _safe_tolist(grouped.values),
                'title': recommendation.get('title', 'Distribución')
            }

        elif chart_type in ['bar', 'line', 'area']:
            if (
                df_clean[x_col].dtype == 'object'
                or df_clean[x_col].dtype.name == 'category'
                or pd.api.types.is_string_dtype(df_clean[x_col])
                or pd.api.types.is_datetime64_any_dtype(df_clean[x_col])
            ):
                grouped = df_clean.groupby(x_col)[y_col].agg(['mean', 'count']).reset_index()
                grouped = grouped.sort_values('mean', ascending=False).head(15)
                labels = [str(l) for l in grouped[x_col].tolist()]
                values = _safe_tolist(grouped['mean'].values)
            else:
                df_clean['bin'] = pd.cut(df_clean[x_col], bins=10)
                grouped = df_clean.groupby('bin')[y_col].mean()
                labels = [f"{interval.left:.1f}-{interval.right:.1f}" for interval in grouped.index]
                values = _safe_tolist(grouped.values)

            return {
                'type': chart_type,
                'x': labels,
                'y': values,
                'title': recommendation.get('title', f'{y_col} por {x_col}'),
                'x_label': x_col,
                'y_label': y_col
            }

        elif chart_type == 'box':
            if df_clean[x_col].dtype == 'object' or pd.api.types.is_string_dtype(df_clean[x_col]):
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
        print(f"Error preparando datos del gráfico: {e}")
        return None