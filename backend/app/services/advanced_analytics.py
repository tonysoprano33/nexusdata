import logging
import traceback
from typing import Dict, Any

import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)


def _make_serializable(obj: Any) -> Any:
    """Convierte numpy/pandas a tipos nativos de Python."""
    if isinstance(obj, dict):
        return {str(k): _make_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [_make_serializable(i) for i in obj]
    elif isinstance(obj, (np.integer, np.int64, np.int32)):
        return int(obj)
    elif isinstance(obj, (np.floating, np.float64, np.float32)):
        return None if (np.isnan(obj) or np.isinf(obj)) else float(obj)
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    return obj


def detect_churn_indicators(df: pd.DataFrame, column_types: Dict[str, str]) -> Dict[str, Any]:
    """Detecta riesgo de churn / pérdida con interpretación de negocio."""
    if not isinstance(df, pd.DataFrame):
        return {"detected": False, "insights": ["Datos inválidos para análisis de churn"]}

    result = {
        "detected": False,
        "churn_column": None,
        "churn_rate": None,
        "risk_level": "low",
        "insights": [],
        "business_impact": ""
    }

    churn_keywords = ['churn', 'cancel', 'lost', 'inactive', 'unsub', 'left', 'status']
    
    for col in df.columns:
        col_lower = col.lower()
        if any(k in col_lower for k in churn_keywords):
            result["detected"] = True
            result["churn_column"] = col

            if df[col].nunique() <= 6:
                value_counts = df[col].value_counts()
                total = len(df)
                churn_count = sum(value_counts.get(v, 0) for v in value_counts.index 
                                if str(v).lower() in ['yes', '1', 'true', 'cancelled', 'churned', 'inactive'])
                
                if churn_count > 0:
                    rate = round((churn_count / total) * 100, 1)
                    result["churn_rate"] = rate
                    result["risk_level"] = "high" if rate > 25 else "medium" if rate > 10 else "low"
                    result["insights"] = [
                        f"Se detectó una tasa de churn del {rate}%",
                        f"{churn_count} registros muestran pérdida o inactividad"
                    ]
                    result["business_impact"] = f"Impacto estimado: pérdida de {rate}% de la base analizada."
            break

    return result


def rfm_segmentation(df: pd.DataFrame, column_types: Dict[str, str]) -> Dict[str, Any]:
    """RFM con interpretación real de valor de cliente."""
    result = {"applicable": False, "segments": [], "insights": [], "business_value": ""}

    cols_lower = [c.lower() for c in df.columns]
    has_customer = any(k in cols_lower for k in ['customer', 'client', 'user_id', 'id'])
    has_monetary = any(k in cols_lower for k in ['amount', 'revenue', 'value', 'total', 'monetary'])

    if not (has_customer and has_monetary):
        result["reason"] = "No se detectaron columnas suficientes para segmentación RFM (falta cliente o valor monetario)"
        return result

    monetary_col = next((col for col in df.columns if any(k in col.lower() for k in ['amount', 'revenue', 'value', 'total'])), None)
    if not monetary_col:
        return result

    try:
        df_rfm = df.copy()
        values = pd.to_numeric(df_rfm[monetary_col], errors='coerce').fillna(0)

        q25, q50, q75 = values.quantile([0.25, 0.5, 0.75])

        def segment(value):
            if value >= q75: return "High Value"
            elif value >= q50: return "Medium Value"
            elif value >= q25: return "Low-Medium Value"
            else: return "Low Value"

        segments = values.apply(segment).value_counts()

        result["applicable"] = True
        result["segments"] = [
            {"name": name, "count": int(count), "percentage": round(int(count)/len(df)*100, 1)}
            for name, count in segments.items()
        ]

        total_revenue = float(values.sum())
        high_value_revenue = float(values[values >= q75].sum())

        result["insights"] = [
            f"El {round(segments.get('High Value', 0)/len(df)*100, 1)}% de los registros (High Value) concentran {round(high_value_revenue/total_revenue*100, 1)}% del valor total",
            f"Valor promedio por registro: ${values.mean():.2f}"
        ]
        result["business_value"] = f"Concentración de valor: Top 25% genera {round(high_value_revenue/total_revenue*100, 1)}% del revenue"

    except Exception as e:
        logger.warning(f"RFM falló: {e}")

    return result


def simple_predictions(df: pd.DataFrame, column_types: Dict[str, str]) -> Dict[str, Any]:
    """Predicción con interpretación clara de negocio."""
    result = {
        "applicable": False,
        "target": None,
        "r2_score": None,
        "interpretation": "",
        "insights": [],
        "recommendation": ""
    }

    numeric_cols = [col for col, t in column_types.items() if t == "numeric"]
    if len(numeric_cols) < 2:
        return result

    # Elegir target más relevante (mayor varianza)
    target = max(numeric_cols, key=lambda col: df[col].var() if pd.api.types.is_numeric_dtype(df[col]) else 0)

    feature_cols = [c for c in numeric_cols if c != target][:3]

    try:
        df_model = df[feature_cols + [target]].dropna()
        if len(df_model) < 30:
            return result

        X = df_model[feature_cols]
        y = df_model[target]

        model = LinearRegression()
        model.fit(X, y)
        r2 = model.score(X, y)

        if r2 < 0.25:
            result["interpretation"] = f"El modelo tiene baja predictibilidad (R² = {r2:.2f})"
            return result

        result["applicable"] = True
        result["target"] = target
        result["r2_score"] = round(r2, 3)

        result["insights"] = [
            f"Se puede predecir '{target}' con una precisión de {round(r2*100, 1)}% usando {len(feature_cols)} variables",
        ]

        if r2 > 0.65:
            result["interpretation"] = "Modelo fuerte - útil para planificación y forecasting"
            result["recommendation"] = "Recomendado usar este modelo para estimaciones presupuestarias"
        elif r2 > 0.45:
            result["interpretation"] = "Modelo moderado - orientativo"
            result["recommendation"] = "Útil como referencia, pero combinar con juicio experto"
        else:
            result["interpretation"] = "Modelo débil - correlaciones bajas"

    except Exception as e:
        logger.warning(f"Predicción falló: {e}")

    return result


def kmeans_clustering(df: pd.DataFrame, column_types: Dict[str, str], n_clusters: int = 4) -> Dict[str, Any]:
    """Clustering con nombres y significado de negocio."""
    result = {
        "applicable": False,
        "clusters": [],
        "insights": [],
        "segment_names": []
    }

    numeric_cols = [col for col, t in column_types.items() if t == "numeric"]
    if len(numeric_cols) < 2:
        return result

    try:
        data = df[numeric_cols].fillna(df[numeric_cols].median())
        scaler = StandardScaler()
        scaled = scaler.fit_transform(data)

        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        labels = kmeans.fit_predict(scaled)

        df_cluster = data.copy()
        df_cluster['cluster'] = labels

        cluster_summary = []
        for i in range(n_clusters):
            cluster_data = df_cluster[df_cluster['cluster'] == i][numeric_cols]
            size = len(cluster_data)
            percentage = round(size / len(df) * 100, 1)
            centroid = cluster_data.mean().round(2).to_dict()

            # Nombre inteligente según tamaño y características
            if percentage > 40:
                name = "Segmento Principal"
            elif percentage < 10:
                name = "Segmento Niche / Outlier"
            else:
                name = f"Segmento {i+1}"

            cluster_summary.append({
                "id": i,
                "name": name,
                "size": size,
                "percentage": percentage,
                "centroid": centroid
            })

        result["applicable"] = True
        result["clusters"] = cluster_summary
        result["insights"] = [
            f"Se identificaron {n_clusters} segmentos de comportamiento distintos",
            f"El segmento más grande representa el {max(c['percentage'] for c in cluster_summary)}% de los registros"
        ]

    except Exception as e:
        logger.warning(f"Clustering falló: {e}")

    return result


def run_all_advanced_analytics(df: pd.DataFrame, column_types: Dict[str, str]) -> Dict[str, Any]:
    """Versión de alto nivel - pensada para executives."""
    if not isinstance(df, pd.DataFrame):
        logger.error("run_all_advanced_analytics recibió datos inválidos")
        return {"error": "Invalid data type"}

    try:
        result = {
            "churn_analysis": detect_churn_indicators(df, column_types),
            "rfm_segmentation": rfm_segmentation(df, column_types),
            "predictions": simple_predictions(df, column_types),
            "clustering": kmeans_clustering(df, column_types),
            "generated_at": pd.Timestamp.now().isoformat(),
            "summary": "Análisis avanzado completado con enfoque en valor de negocio"
        }

        return _make_serializable(result)

    except Exception as e:
        logger.error(f"Error en advanced analytics: {e}\n{traceback.format_exc()}")
        return {"error": str(e)}