import os
import logging
from typing import Dict, Any

from groq import Groq

logger = logging.getLogger(__name__)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_insights(data: Dict[str, Any]) -> str:
    """
    Genera insights de negocio de alto valor usando Groq (Llama 3.3 70B).
    Versión optimizada para nivel ejecutivo.
    """
    if not os.getenv("GROQ_API_KEY"):
        return "Error: GROQ_API_KEY no está configurada en Render."

    try:
        summary = data.get("summary", {})
        advanced = data.get("advanced_analytics", {})
        anomalies = data.get("anomaly_detection", {})
        charts = data.get("charts_data", [])

        numeric_cols = [col for col, t in data.get("column_types", {}).items() if t == "numeric"]
        categorical_cols = [col for col, t in data.get("column_types", {}).items() if t != "numeric"]

        prompt = f"""
Eres un **Director de Analytics Senior** con experiencia en McKinsey y BCG. 
Tu objetivo es entregar un análisis **crítico, estratégico y accionable** que un CEO pueda usar directamente para tomar decisiones.

### Información del Dataset:
- Registros totales: {summary.get('total_rows', 0)}
- Calidad de datos: {summary.get('data_quality_score', 0)}%
- Columnas numéricas: {numeric_cols[:10]}
- Columnas categóricas: {categorical_cols[:6]}
- Anomalías detectadas: {anomalies.get('detected_rows', 0)} ({anomalies.get('ratio', 0)*100:.1f}% del dataset)

### Análisis Avanzado Disponible:
{advanced}

### Instrucciones estrictas:
- Sé **directo, crítico y estratégico**. Evita lenguaje genérico y descriptivo.
- Siempre traduce los hallazgos a **impacto de negocio** (revenue, rentabilidad, riesgo, retención, concentración de valor, oportunidad de crecimiento, etc.).
- Prioriza insights que tengan mayor impacto potencial.
- Máximo 5 insights clave.
- Incluye estimaciones cuantitativas cuando sea posible.

Devuelve el análisis **exactamente** en este formato:

### 🚀 Insight Principal
[Una sola frase poderosa y clara que capture el hallazgo más importante del dataset]

### 🧠 Resumen Ejecutivo
[2-3 líneas con la visión estratégica general del negocio]

### 🔍 Insights Clave
1. **Título del insight**: Qué pasa + Por qué pasa + Impacto cuantitativo o cualitativo en el negocio
2. ...

### ⚠️ Riesgos Críticos
- Riesgo 1 (con nivel de severidad)
- Riesgo 2

### 💡 Recomendaciones Accionables
- Recomendación 1 (prioridad alta) - impacto esperado
- Recomendación 2
- Recomendación 3

Piensa como si estuvieras presentando esto en una reunión de directorio con el CEO. Sé conciso pero profundo.
"""

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Eres un analista senior extremadamente estratégico, crítico y orientado a impacto de negocio. Siempre priorizas acción y claridad."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.65,
            max_tokens=1200,
            top_p=0.95
        )

        insights_text = completion.choices[0].message.content.strip()

        logger.info("✅ Insights de alto nivel generados correctamente con Groq")
        return insights_text

    except Exception as e:
        logger.error(f"Error con Groq en generate_insights: {e}")
        return f"Error al generar insights con Groq: {str(e)[:300]}"


# Funciones auxiliares (mantener por compatibilidad)
def detect_target(df):
    for col in df.columns:
        if col.lower() in ["churn", "target", "label", "outcome"]:
            return col
    for col in df.columns:
        if df[col].nunique() == 2:
            return col
    return None