import os
import pandas as pd
from sklearn.ensemble import IsolationForest
from app.services.chart_recommender import generate_chart_recommendations, prepare_chart_data
from app.services.advanced_analytics import run_all_advanced_analytics

def read_data_file(file_path: str) -> pd.DataFrame:
    """
    Lee CSV o Excel automÃ¡ticamente segÃºn la extensiÃ³n
    """
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext in ['.xlsx', '.xls']:
        # Leer Excel - intentar con diferentes engines
        try:
            return pd.read_excel(file_path, engine='openpyxl')
        except:
            return pd.read_excel(file_path)
    elif ext == '.csv':
        return pd.read_csv(file_path)
    elif ext == '.json':
        return pd.read_json(file_path)
    else:
        raise ValueError(f"Formato no soportado: {ext}. Use CSV, Excel (.xlsx) o JSON.")

def process_dataset(file_path: str):
    """
    Lee CSV/Excel/JSON, limpia datos y genera recuentos estadÃ­sticos.
    Optimizado para <10 segundos de procesamiento.
    """
    # 1. Leer archivo automÃ¡ticamente segÃºn extensiÃ³n
    df = read_data_file(file_path)
    
    # Si el df es muy grande, tomamos una muestra para el inferir de forma rapida y segura.
    total_rows = len(df)
    if total_rows > 100000:
        df = df.sample(100000, random_state=42)

    # 2. AnÃ¡lisis BÃ¡sico
    columns = df.columns.tolist()
    missing_data = df.isnull().sum().to_dict()
    
    # 3. Inferencia Inteligente de Tipos de Columnas
    column_types = {}
    for col in columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            column_types[col] = "numeric"
        elif pd.api.types.is_datetime64_any_dtype(df[col]) or (df[col].dtype == 'object' and "date" in col.lower()):
            column_types[col] = "datetime"
        else:
            column_types[col] = "categorical"
            
    # 4. Limpieza AutomÃ¡tica (Para el analisis, rellenamos nulos)
    df_clean = df.copy()
    for col in columns:
        if column_types[col] == "numeric":
            df_clean[col] = df_clean[col].fillna(df_clean[col].median())
        else:
            mode_value = (
                df_clean[col].mode()[0] if not df_clean[col].mode().empty else "Unknown"
            )
            df_clean[col] = df_clean[col].fillna(mode_value)

    # 5. Calidad de datos para dashboard y priorizaciÃ³n
    total_cells = max(len(df) * max(len(columns), 1), 1)
    missing_cells = int(df.isnull().sum().sum())
    completeness_ratio = 1 - (missing_cells / total_cells)
    data_quality_score = round(max(0.0, completeness_ratio) * 100, 2)

    # 6. EstadÃ­sticas Descriptivas (Solo lo importante)
    numeric_cols = [col for col, t in column_types.items() if t == "numeric"]
    stats_numeric = df_clean[numeric_cols].describe().to_dict() if numeric_cols else {}

    # Matriz de CorrelaciÃ³n
    correlation_matrix = {}
    if len(numeric_cols) > 1:
        corr = df_clean[numeric_cols].corr().fillna(0)
        correlation_matrix = corr.to_dict()

    # 7. DetecciÃ³n rÃ¡pida de anomalÃ­as en columnas numÃ©ricas
    anomaly_summary = {"detected_rows": 0, "ratio": 0.0}
    if len(numeric_cols) >= 2 and len(df_clean) >= 20:
        numeric_frame = df_clean[numeric_cols]
        forest = IsolationForest(contamination="auto", random_state=42)
        predictions = forest.fit_predict(numeric_frame)
        anomaly_count = int((predictions == -1).sum())
        anomaly_summary = {
            "detected_rows": anomaly_count,
            "ratio": round(anomaly_count / len(df_clean), 4),
        }

    # Sample data para chat (primeras 10 filas)
    sample_data = df_clean.head(10).to_dict('records')
    
    # Preparar el JSON result
    result = {
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
    
    # Generar recomendaciones de grÃ¡ficos con IA
    try:
        chart_recommendations = generate_chart_recommendations(result, {})
        result["chart_recommendations"] = chart_recommendations
        
        # Preparar datos para cada grÃ¡fico recomendado
        charts_data = []
        for rec in chart_recommendations:
            chart_data = prepare_chart_data(df_clean, rec)
            if chart_data:
                chart_data['insight'] = rec.get('insight', '')
                charts_data.append(chart_data)
        
        result["charts_data"] = charts_data
    except Exception as e:
        print(f"Error generando grÃ¡ficos: {e}")
        result["chart_recommendations"] = []
        result["charts_data"] = []
    
    # AnÃ¡lisis avanzados automÃ¡ticos
    try:
        advanced_analytics = run_all_advanced_analytics(df_clean, column_types)
        result["advanced_analytics"] = advanced_analytics
    except Exception as e:
        print(f"Error en anÃ¡lisis avanzados: {e}")
        result["advanced_analytics"] = {}
    
    
        return result



