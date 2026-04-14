import os
import json
import logging
from typing import Dict, Any

import google.generativeai as genai
import pandas as pd

logger = logging.getLogger(__name__)


def generate_insights(data: Dict[str, Any]) -> str:
    """
    Genera insights de negocio potentes y accionables usando Gemini.
    Versión optimizada para entregar valor real al CEO.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return "❌ Error: GEMINI_API_KEY no configurada en el entorno."

    # Extraer toda la información rica del pipeline
    summary = data.get("summary", {})
    column_types = data.get("column_types", {})
    descriptive_stats = data.get("descriptive_statistics", {})
    correlations = data.get("correlation_matrix", {})
    anomalies = data.get("anomaly_detection", {})
    advanced = data.get("advanced_analytics", {})
    charts = data.get("charts_data", [])
    sample_data = data.get("sample_data", [])

    total_rows = summary.get("total_rows", 0)
    data_quality = summary.get("data_quality_score", 0)
    missing_cells = summary.get("missing_cells", 0)

    # Preparar información clave para el prompt
    numeric_cols = [col for col, t in column_types.items() if t == "numeric"]
    categorical_cols = [col for col, t in column_types.items() if t != "numeric"]

    churn_info = advanced.get("churn_analysis", {})
    rfm_info = advanced.get("rfm_segmentation", {})
    predictions = advanced.get("predictions", {})
    clustering = advanced.get("clustering", {})

    prompt = f"""
Eres un **Data Analyst Senior** con más de 10 años de experiencia, especializado en generar insights accionables para CEOs y gerentes.

Analiza este dataset y genera un análisis de alto nivel estratégico. 

### Información del Dataset:
- Filas totales: {total_rows}
- Calidad de datos: {data_quality}%
- Celdas faltantes: {missing_cells}
- Columnas numéricas: {numeric_cols[:8]}
- Columnas categóricas: {categorical_cols[:6]}

### Análisis Avanzado Disponible:
- Detección de Churn: {json.dumps(churn_info, indent=2) if churn_info else "No detectado"}
- Segmentación RFM: {json.dumps(rfm_info, indent=2) if rfm_info.get("applicable") else "No aplica"}
- Predicciones: {json.dumps(predictions, indent=2) if predictions.get("applicable") else "No aplicable"}
- Clustering: {json.dumps(clustering, indent=2) if clustering.get("applicable") else "No aplicable"}
- Anomalías detectadas: {anomalies.get("detected_rows", 0)} filas ({anomalies.get("ratio", 0)*100:.1f}%)

### Reglas estrictas:
- Máximo 5 insights principales.
- **Nunca** describas solo estadísticas. Siempre explica el **impacto en el negocio**.
- Sé directo, crítico y estratégico.
- Usa lenguaje de negocio (revenue, rentabilidad, riesgo, oportunidad, retención, etc.).
- Si no hay suficiente información para un insight sólido, dilo claramente.
- Prioriza: concentración de revenue, riesgos, oportunidades de crecimiento, segmentación de clientes.

Devuelve el análisis **exactamente** en este formato:

### 🚀 Insight Principal
[Una frase impactante que resuma el hallazgo más importante]

### 🧠 Resumen Ejecutivo
[2-3 líneas con la visión general del dataset desde perspectiva de negocio]

### 🔍 Insights Clave
1. **Título del insight**: Qué pasa + Por qué pasa + Impacto en el negocio
2. **Título del insight**: ...
( máximo 5 )

### ⚠️ Riesgos Identificados
- Riesgo 1
- Riesgo 2

### 💡 Recomendaciones Accionables
- Recomendación 1 (con prioridad)
- Recomendación 2
- Recomendación 3

Piensa como si estuvieras presentando esto directamente al CEO en una reunión ejecutiva.
"""

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")   # Modelo más estable y rápido

        response = model.generate_content(prompt)
        insights_text = response.text.strip()

        logger.info("Insights generados exitosamente con Gemini")
        return insights_text

    except Exception as e:
        logger.error(f"Error generando insights con Gemini: {e}")
        return f"❌ Error al generar insights: {str(e)}\n\nPor favor verifica que la API key de Gemini esté correcta y tenga saldo."