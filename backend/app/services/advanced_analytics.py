"""
Análisis avanzados automatizados:
- Detección de churn
- Segmentación RFM
- Predicciones con regresión
- Clustering K-means
"""

import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any, List

def detect_churn_indicators(df: pd.DataFrame, column_types: Dict[str, str]) -> Dict[str, Any]:
    """
    Detecta indicadores de churn/cancelación automáticamente
    Busca columnas típicas: 'churn', 'cancelled', 'active', 'status', etc.
    """
    result = {
        "detected": False,
        "churn_column": None,
        "churn_rate": None,
        "insights": []
    }
    
    # Buscar columnas relacionadas con churn
    churn_keywords = ['churn', 'cancel', 'active', 'status', 'retained', 'unsub']
    numeric_cols = [col for col, t in column_types.items() if t == 'numeric']
    
    for col in df.columns:
        col_lower = col.lower()
        if any(keyword in col_lower for keyword in churn_keywords):
            result["detected"] = True
            result["churn_column"] = col
            
            # Si es binaria o categórica
            if df[col].dtype == 'object' or df[col].nunique() <= 5:
                value_counts = df[col].value_counts()
                total = len(df)
                
                # Intentar identificar valor de churn
                churn_values = ['yes', 'true', '1', 'cancelled', 'churned', 'inactive', 'false']
                churn_count = 0
                
                for val in value_counts.index:
                    if str(val).lower() in churn_values:
                        churn_count = value_counts[val]
                
                if churn_count > 0:
                    result["churn_rate"] = round(churn_count / total * 100, 2)
                    result["insights"].append(f"Tasa de churn: {result['churn_rate']}%")
                    result["insights"].append(f"Total clientes perdidos: {churn_count}")
            
            break
    
    # Si no hay columna de churn explícita, buscar patrones
    if not result["detected"] and len(numeric_cols) >= 2:
        # Analizar última compra/recencia como proxy de churn
        recency_keywords = ['recency', 'last_purchase', 'days_since']
        for col in df.columns:
            if any(k in col.lower() for k in recency_keywords):
                if col in numeric_cols:
                    high_recency = df[col] > df[col].quantile(0.8)
                    if high_recency.sum() > 0:
                        result["detected"] = True
                        result["churn_column"] = col
                        result["churn_rate"] = round(high_recency.sum() / len(df) * 100, 2)
                        result["insights"].append(f"{result['churn_rate']}% de clientes sin actividad reciente (alto riesgo)")
                        break
    
    return result

def rfm_segmentation(df: pd.DataFrame, column_types: Dict[str, str]) -> Dict[str, Any]:
    """
    Segmentación RFM (Recency, Frequency, Monetary) automática
    Identifica columnas apropiadas o usa proxies
    """
    result = {
        "applicable": False,
        "segments": [],
        "insights": []
    }
    
    numeric_cols = [col for col, t in column_types.items() if t == 'numeric']
    
    # Buscar columnas RFM
    recency_col = None
    frequency_col = None
    monetary_col = None
    
    for col in df.columns:
        col_lower = col.lower()
        if any(k in col_lower for k in ['recency', 'last', 'recent', 'days']):
            recency_col = col
        elif any(k in col_lower for k in ['frequency', 'count', 'orders', 'purchases']):
            frequency_col = col
        elif any(k in col_lower for k in ['monetary', 'value', 'revenue', 'amount', 'total']):
            monetary_col = col
    
    # Si tenemos al menos una columna de valor, hacer segmentación simple
    if monetary_col and monetary_col in numeric_cols:
        result["applicable"] = True
        
        # Calcular percentiles para segmentación
        df_rfm = df.copy()
        
        # Usar valor monetario para segmentación básica
        monetary_values = df_rfm[monetary_col].fillna(0)
        
        # Crear 4 segmentos basados en valor
        q25 = monetary_values.quantile(0.25)
        q50 = monetary_values.quantile(0.50)
        q75 = monetary_values.quantile(0.75)
        
        def segment_customer(value):
            if value >= q75:
                return "VIP (Top 25%)"
            elif value >= q50:
                return "Valioso (50-75%)"
            elif value >= q25:
                return "Regular (25-50%)"
            else:
                return "Bajo valor (Bottom 25%)"
        
        segments = monetary_values.apply(segment_customer).value_counts().to_dict()
        
        result["segments"] = [
            {"name": name, "count": count, "percentage": round(count/len(df)*100, 1)}
            for name, count in segments.items()
        ]
        
        result["insights"] = [
            f"Clientes VIP: {segments.get('VIP (Top 25%)', 0)} ({round(segments.get('VIP (Top 25%)', 0)/len(df)*100, 1)}%)",
            f"Valor promedio: ${monetary_values.mean():.2f}",
            f"Valor mediana: ${monetary_values.median():.2f}",
        ]
        
        if recency_col and recency_col in numeric_cols:
            avg_recency = df_rfm[recency_col].mean()
            result["insights"].append(f"Recencia promedio: {avg_recency:.0f} días")
    
    return result

def simple_predictions(df: pd.DataFrame, column_types: Dict[str, str]) -> Dict[str, Any]:
    """
    Predicciones básicas usando regresión lineal
    Predice la variable objetivo numérica más importante
    """
    result = {
        "applicable": False,
        "target_column": None,
        "predictions": [],
        "insights": []
    }
    
    numeric_cols = [col for col, t in column_types.items() if t == 'numeric']
    
    if len(numeric_cols) < 2:
        return result
    
    # Elegir la columna con mayor varianza como target
    variances = {col: df[col].var() for col in numeric_cols if df[col].var() > 0}
    if not variances:
        return result
    
    target_col = max(variances, key=variances.get)
    feature_cols = [c for c in numeric_cols if c != target_col][:3]  # Usar hasta 3 features
    
    if len(feature_cols) < 1:
        return result
    
    try:
        # Preparar datos
        df_model = df[feature_cols + [target_col]].dropna()
        
        if len(df_model) < 10:
            return result
        
        X = df_model[feature_cols]
        y = df_model[target_col]
        
        # Entrenar modelo simple
        model = LinearRegression()
        model.fit(X, y)
        
        # Score R²
        r2_score = model.score(X, y)
        
        result["applicable"] = True
        result["target_column"] = target_col
        result["r2_score"] = round(r2_score, 3)
        
        # Predicciones para próximos 3 valores
        last_values = X.tail(3).values
        predictions = model.predict(last_values)
        
        result["predictions"] = [
            {
                "scenario": f"Escenario {i+1}",
                "features": dict(zip(feature_cols, vals)),
                "predicted": round(pred, 2)
            }
            for i, (vals, pred) in enumerate(zip(last_values, predictions))
        ]
        
        result["insights"] = [
            f"Modelo de regresión para '{target_col}'",
            f"Precisión (R²): {round(r2_score * 100, 1)}%",
            f"Variables usadas: {', '.join(feature_cols)}",
        ]
        
        if r2_score > 0.7:
            result["insights"].append("✅ Alta correlación - predicciones confiables")
        elif r2_score > 0.4:
            result["insights"].append("⚠️ Correlación moderada - usar con precaución")
        else:
            result["insights"].append("❌ Baja correlación - predicciones poco confiables")
            
    except Exception as e:
        result["insights"].append(f"Error en predicción: {str(e)[:50]}")
    
    return result

def kmeans_clustering(df: pd.DataFrame, column_types: Dict[str, str], n_clusters: int = 4) -> Dict[str, Any]:
    """
    Clustering automático con K-means sobre variables numéricas
    """
    result = {
        "applicable": False,
        "clusters": [],
        "insights": []
    }
    
    numeric_cols = [col for col, t in column_types.items() if t == 'numeric']
    
    if len(numeric_cols) < 2:
        return result
    
    try:
        # Preparar datos
        df_cluster = df[numeric_cols].fillna(df[numeric_cols].median())
        
        if len(df_cluster) < n_clusters * 5:  # Mínimo 5 puntos por cluster
            return result
        
        # Escalar datos
        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(df_cluster)
        
        # Aplicar K-means
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(scaled_data)
        
        # Analizar clusters
        df_cluster['cluster'] = clusters
        cluster_counts = pd.Series(clusters).value_counts().sort_index()
        
        result["applicable"] = True
        
        for i in range(n_clusters):
            count = cluster_counts.get(i, 0)
            cluster_data = df_cluster[df_cluster['cluster'] == i][numeric_cols]
            
            centroid = cluster_data.mean().to_dict()
            
            result["clusters"].append({
                "id": i,
                "name": f"Grupo {i + 1}",
                "count": int(count),
                "percentage": round(count/len(df)*100, 1),
                "centroid": {k: round(v, 2) for k, v in centroid.items()}
            })
        
        # Encontrar características distintivas
        cluster_means = df_cluster.groupby('cluster')[numeric_cols].mean()
        overall_means = df_cluster[numeric_cols].mean()
        
        result["insights"] = [
            f"Clientes segmentados en {n_clusters} grupos automáticamente",
            f"Grupo más grande: Grupo {cluster_counts.idxmax() + 1} ({cluster_counts.max()} clientes)",
        ]
        
    except Exception as e:
        result["insights"].append(f"Error en clustering: {str(e)[:50]}")
    
    return result

def run_all_advanced_analytics(df: pd.DataFrame, column_types: Dict[str, str]) -> Dict[str, Any]:
    """
    Ejecuta todos los análisis avanzados y retorna resultados consolidados
    """
    return {
        "churn_analysis": detect_churn_indicators(df, column_types),
        "rfm_segmentation": rfm_segmentation(df, column_types),
        "predictions": simple_predictions(df, column_types),
        "clustering": kmeans_clustering(df, column_types),
        "generated_at": pd.Timestamp.now().isoformat()
    }
