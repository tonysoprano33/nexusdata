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
    """Convierte recursivamente tipos numpy/pandas a tipos Python nativos para JSON."""
    if isinstance(obj, dict):
        return {str(k): _make_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [_make_serializable(i) for i in obj]
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return None if (np.isnan(obj) or np.isinf(obj)) else float(obj)
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, np.ndarray):
        return [_make_serializable(i) for i in obj.tolist()]
    elif isinstance(obj, pd.Timestamp):
        return obj.isoformat()
    return obj


def detect_churn_indicators(df: pd.DataFrame, column_types: Dict[str, str]) -> Dict[str, Any]:
    """Detecta indicadores de churn de forma inteligente y segura."""
    if not isinstance(df, pd.DataFrame):
        logger.warning("detect_churn_indicators recibió algo que no es DataFrame")
        return {"detected": False, "churn_column": None, "churn_rate": None, "insights": ["Error: datos inválidos"]}

    result = {
        "detected": False,
        "churn_column": None,
        "churn_rate": None,
        "insights": []
    }

    churn_keywords = ['churn', 'cancel', 'active', 'status', 'retained', 'unsub', 'lost', 'left']
    numeric_cols = [col for col, t in column_types.items() if t == 'numeric']

    # Buscar columna de churn explícita
    for col in df.columns:
        col_lower = col.lower()
        if any(keyword in col_lower for keyword in churn_keywords):
            result["detected"] = True
            result["churn_column"] = col

            # Si es categórica o binaria
            if df[col].dtype == 'object' or df[col].nunique() <= 6:
                value_counts = df[col].value_counts(dropna=True)
                total = len(df)
                churn_values = {'yes', 'true', '1', 'cancelled', 'churned', 'inactive', 'false', 'no', '0'}
                churn_count = sum(int(value_counts.get(val, 0)) for val in value_counts.index 
                                if str(val).lower().strip() in churn_values)

                if churn_count > 0:
                    churn_rate = round((churn_count / total) * 100, 2)
                    result["churn_rate"] = churn_rate
                    result["insights"].extend([
                        f"Tasa de churn detectada: {churn_rate}%",
                        f"Clientes perdidos: {churn_count} de {total}"
                    ])
            break

    # Fallback: alto recency como posible churn
    if not result["detected"] and numeric_cols:
        recency_keywords = ['recency', 'last_purchase', 'days_since', 'last_active']
        for col in df.columns:
            if any(k in col.lower() for k in recency_keywords) and col in numeric_cols:
                try:
                    high_recency = df[col] > df[col].quantile(0.8)
                    churn_rate = round((high_recency.sum() / len(df)) * 100, 2)
                    if churn_rate > 5:
                        result["detected"] = True
                        result["churn_column"] = col
                        result["churn_rate"] = churn_rate
                        result["insights"].append(f"{churn_rate}% de clientes con alta recencia (riesgo de churn)")
                except Exception:
                    pass
                break

    return result


def rfm_segmentation(df: pd.DataFrame, column_types: Dict[str, str]) -> Dict[str, Any]:
    """RFM Segmentation solo si existen customer_id y fechas. Totalmente seguro."""
    if not isinstance(df, pd.DataFrame):
        return {"applicable": False, "reason": "Datos inválidos", "segments": [], "insights": []}

    result = {"applicable": False, "segments": [], "insights": [], "reason": ""}

    col_names_lower = [c.lower() for c in df.columns]
    has_customer = any(k in col_names_lower for k in ['customer_id', 'client_id', 'user_id', 'cust_id', 'customer'])
    has_date = any(t == 'datetime' for t in column_types.values())

    if not has_customer or not has_date:
        result["reason"] = "RFM requiere columna de cliente (customer_id) y fechas reales"
        return result

    numeric_cols = [col for col, t in column_types.items() if t == 'numeric']

    monetary_col = None
    for col in df.columns:
        col_lower = col.lower()
        if any(k in col_lower for k in ['monetary', 'revenue', 'amount', 'total', 'value', 'spend']):
            monetary_col = col
            break

    if not monetary_col or monetary_col not in numeric_cols:
        result["reason"] = "No se encontró columna monetaria adecuada"
        return result

    try:
        df_rfm = df.copy()
        monetary_values = df_rfm[monetary_col].fillna(0)

        q25 = float(monetary_values.quantile(0.25))
        q50 = float(monetary_values.quantile(0.50))
        q75 = float(monetary_values.quantile(0.75))

        def segment_customer(value: float) -> str:
            if value >= q75:
                return "VIP (Top 25%)"
            elif value >= q50:
                return "Valioso (50-75%)"
            elif value >= q25:
                return "Regular (25-50%)"
            else:
                return "Bajo valor"

        segments_series = monetary_values.apply(segment_customer)
        segments = segments_series.value_counts().to_dict()

        result["applicable"] = True
        result["segments"] = [
            {
                "name": name,
                "count": int(count),
                "percentage": round((int(count) / len(df)) * 100, 1)
            }
            for name, count in segments.items()
        ]

        mean_value = float(monetary_values.mean())
        result["insights"] = [
            f"Clientes VIP: {segments.get('VIP (Top 25%)', 0)} ({round(segments.get('VIP (Top 25%)', 0)/len(df)*100, 1)}%)",
            f"Valor promedio por cliente: ${mean_value:.2f}",
            f"Valor mediana: ${float(monetary_values.median()):.2f}"
        ]

    except Exception as e:
        logger.warning(f"Error en RFM: {e}")
        result["reason"] = f"Error procesando RFM: {str(e)[:80]}"

    return result


def simple_predictions(df: pd.DataFrame, column_types: Dict[str, str]) -> Dict[str, Any]:
    """Predicciones simples con regresión lineal. Solo si R² > 0.3."""
    if not isinstance(df, pd.DataFrame):
        return {"applicable": False, "reason": "Datos inválidos"}

    result = {
        "applicable": False,
        "target_column": None,
        "r2_score": None,
        "predictions": [],
        "insights": [],
        "model_info": None,
        "reason": ""
    }

    numeric_cols = [col for col, t in column_types.items() if t == 'numeric']
    if len(numeric_cols) < 2:
        result["reason"] = "Se necesitan al menos 2 columnas numéricas"
        return result

    # Elegir target con mayor varianza
    variances = {col: float(df[col].var()) for col in numeric_cols if float(df[col].var()) > 1e-6}
    if not variances:
        result["reason"] = "No hay varianza suficiente en las columnas numéricas"
        return result

    target_col = max(variances, key=variances.get)
    feature_cols = [c for c in numeric_cols if c != target_col][:3]

    if len(feature_cols) < 1:
        return result

    try:
        df_model = df[feature_cols + [target_col]].dropna()
        if len(df_model) < 20:   # mínimo razonable
            result["reason"] = "Insuficientes filas después de eliminar nulos"
            return result

        X = df_model[feature_cols]
        y = df_model[target_col]

        model = LinearRegression()
        model.fit(X, y)
        r2_score = float(model.score(X, y))

        if r2_score < 0.3:
            result["reason"] = f"R² = {round(r2_score, 2)} → correlación demasiado baja"
            return result

        result["applicable"] = True
        result["target_column"] = target_col
        result["r2_score"] = round(r2_score, 3)

        result["model_info"] = {
            "type": "Regresión Lineal",
            "target": target_col,
            "features": feature_cols,
            "r2_score": round(r2_score, 3),
            "r2_percent": round(r2_score * 100, 1),
            "reliable": r2_score > 0.7
        }

        # Predicciones de ejemplo con las últimas filas
        last_values = X.tail(3).values
        predictions = model.predict(last_values)

        result["predictions"] = [
            {
                "scenario": f"Escenario {i+1}",
                "features": {k: round(float(v), 2) for k, v in zip(feature_cols, vals)},
                "predicted": round(float(pred), 2)
            }
            for i, (vals, pred) in enumerate(zip(last_values, predictions))
        ]

        result["insights"] = [
            f"Predicción de '{target_col}' basada en {', '.join(feature_cols)}",
            f"Precisión del modelo (R²): {round(r2_score * 100, 1)}%"
        ]
        if r2_score > 0.7:
            result["insights"].append("✅ Modelo confiable")
        elif r2_score > 0.5:
            result["insights"].append("⚠️ Correlación moderada")

    except Exception as e:
        logger.warning(f"Error en predicciones: {e}")
        result["reason"] = f"Error en modelo: {str(e)[:80]}"

    return result


def kmeans_clustering(df: pd.DataFrame, column_types: Dict[str, str], n_clusters: int = 4) -> Dict[str, Any]:
    """Clustering K-Means robusto y seguro."""
    if not isinstance(df, pd.DataFrame):
        return {"applicable": False, "reason": "Datos inválidos", "clusters": [], "insights": []}

    result = {"applicable": False, "clusters": [], "insights": [], "reason": ""}

    numeric_cols = [col for col, t in column_types.items() if t == 'numeric']
    if len(numeric_cols) < 2:
        result["reason"] = "Se necesitan al menos 2 columnas numéricas para clustering"
        return result

    try:
        df_cluster = df[numeric_cols].copy()
        # Rellenar nulos con mediana (más robusto)
        df_cluster = df_cluster.fillna(df_cluster.median(numeric_only=True))

        if len(df_cluster) < n_clusters * 5:
            result["reason"] = "Dataset demasiado pequeño para clustering confiable"
            return result

        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(df_cluster)

        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(scaled_data)

        cluster_counts = pd.Series(clusters).value_counts().sort_index()

        result["applicable"] = True
        result["clusters"] = []

        for i in range(n_clusters):
            count = int(cluster_counts.get(i, 0))
            mask = clusters == i
            if mask.sum() == 0:
                continue
            centroid = {k: round(float(v), 2) for k, v in df_cluster[mask][numeric_cols].mean().items()}

            result["clusters"].append({
                "id": i,
                "name": f"Segmento {i + 1}",
                "count": count,
                "percentage": round((count / len(df)) * 100, 1),
                "centroid": centroid
            })

        result["insights"] = [
            f"Dataset segmentado en {n_clusters} grupos usando K-Means",
            f"Segmento más grande: {int(cluster_counts.idxmax()) + 1} con {int(cluster_counts.max())} registros"
        ]

    except Exception as e:
        logger.warning(f"Error en KMeans clustering: {e}")
        result["reason"] = f"Error técnico en clustering: {str(e)[:80]}"

    return result


def run_all_advanced_analytics(df: pd.DataFrame, column_types: Dict[str, str]) -> Dict[str, Any]:
    """
    Ejecuta todos los análisis avanzados de forma segura.
    Retorna siempre un diccionario serializable.
    """
    if not isinstance(df, pd.DataFrame):
        logger.error("run_all_advanced_analytics recibió algo que no es DataFrame")
        return {"error": "Invalid data type received", "churn_analysis": {}, "rfm_segmentation": {}, 
                "predictions": {}, "clustering": {}}

    try:
        result = {
            "churn_analysis": detect_churn_indicators(df, column_types),
            "rfm_segmentation": rfm_segmentation(df, column_types),
            "predictions": simple_predictions(df, column_types),
            "clustering": kmeans_clustering(df, column_types),
            "generated_at": pd.Timestamp.now().isoformat()
        }

        return _make_serializable(result)

    except Exception as e:
        logger.error(f"Error crítico en run_all_advanced_analytics: {e}\n{traceback.format_exc()}")
        return {
            "error": str(e),
            "churn_analysis": {},
            "rfm_segmentation": {},
            "predictions": {},
            "clustering": {}
        }