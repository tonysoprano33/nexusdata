import os
import logging
from typing import Dict, Any

from groq import Groq

logger = logging.getLogger(__name__)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_insights(data: Dict[str, Any]) -> str:
    """
    Prompt de nivel ejecutivo (McKinsey/BCG). Versión 10/10.
    """
    if not os.getenv("GROQ_API_KEY"):
        return "Error: GROQ_API_KEY no está configurada."

    try:
        summary = data.get("summary", {})
        advanced = data.get("advanced_analytics", {})
        anomalies = data.get("anomaly_detection", {})

        numeric_cols = [col for col, t in data.get("column_types", {}).items() if t == "numeric"]
        categorical_cols = [col for col, t in data.get("column_types", {}).items() if t != "numeric"]

        prompt = f"""
Eres un **Director de Analytics Senior** con +15 años de experiencia en McKinsey y BCG. 
Tu trabajo es entregar análisis estratégicos de alto impacto que un CEO pueda usar directamente para tomar decisiones.

### Datos del Dataset:
- Registros: {summary.get('total_rows', 0)}
- Calidad de datos: {summary.get('data_quality_score', 0)}%
- Columnas numéricas: {numeric_cols[:10]}
- Columnas categóricas: {categorical_cols[:6]}
- Anomalías: {anomalies.get('detected_rows', 0)} ({anomalies.get('ratio', 0)*100:.1f}%)

### Análisis Avanzado Disponible:
{advanced}

### Instrucciones estrictas (no negociables):
- Sé extremadamente crítico, estratégico y directo.
- Nunca des respuestas genéricas ni descriptivas.
- Siempre traduce los hallazgos a **impacto de negocio** (revenue, margen, retención, riesgo financiero, oportunidad de crecimiento, concentración de valor, etc.).
- Cuando sea posible, incluye estimaciones cuantitativas de impacto.
- Prioriza los insights por orden de importancia para el negocio.
- Máximo 5 insights clave.

Devuelve el análisis **exactamente** en este formato:

### 🚀 Insight Principal
[Una sola frase poderosa, clara y con impacto que capture el hallazgo más relevante]

### 🧠 Resumen Ejecutivo
[2-3 líneas con la visión estratégica del negocio]

### 🔍 Insights Clave
1. **Título del insight**: Qué pasa + Por qué pasa + Impacto en el negocio (con número si es posible)
2. ...

### ⚠️ Riesgos Críticos
- Riesgo 1 (con nivel de severidad y posible impacto)
- Riesgo 2

### 💡 Recomendaciones Accionables
- Recomendación 1 (prioridad alta) - impacto esperado + siguiente paso concreto
- Recomendación 2
- Recomendación 3

Piensa como si estuvieras presentando esto en una reunión de directorio con el CEO y el board. Sé conciso, profundo y accionable.
"""

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Eres un analista senior extremadamente estratégico, crítico y orientado a impacto de negocio. Siempre priorizas acción y claridad."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.65,
            max_tokens=1300,
            top_p=0.95
        )

        insights_text = completion.choices[0].message.content.strip()
        logger.info("✅ Insights de alto nivel generados con Groq")
        return insights_text

    except Exception as e:
        logger.error(f"Error con Groq: {e}")
        return f"Error al generar insights con Groq: {str(e)[:300]}"