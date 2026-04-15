import os
import logging
from typing import Dict, Any

from groq import Groq

logger = logging.getLogger(__name__)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_insights(data: Dict[str, Any]) -> str:
    if not os.getenv("GROQ_API_KEY"):
        return "Error: GROQ_API_KEY no configurada."

    try:
        summary = data.get("summary", {})
        advanced = data.get("advanced_analytics", {})
        anomalies = data.get("anomaly_detection", {})

        prompt = f"""
Eres un Director de Analytics Senior de McKinsey/BCG. Tu análisis debe ser tan bueno que el CEO pueda tomarlo y actuar inmediatamente.

Dataset:
- {summary.get('total_rows', 0)} registros
- Calidad: {summary.get('data_quality_score', 0)}%
- Anomalías: {anomalies.get('detected_rows', 0)} ({anomalies.get('ratio', 0)*100:.1f}%)

Análisis avanzado:
{advanced}

Reglas obligatorias:
- Sé extremadamente crítico y estratégico.
- Siempre cuantifica el impacto en dinero, revenue, margen o riesgo cuando sea posible.
- Prioriza sin piedad: solo los insights que realmente mueven la aguja del negocio.
- Máximo 5 insights.
- Recomendaciones deben ser concretas, con prioridad y próximo paso claro.

Formato exacto:

### 🚀 Insight Principal
[Una sola frase potente que resume el hallazgo más importante y su impacto en el negocio]

### 🧠 Resumen Ejecutivo
[2-3 líneas con la visión clara del estado actual del negocio]

### 🔍 Insights Clave
1. **Título**: Qué pasa + Por qué pasa + Impacto económico/estratégico
2. ...

### ⚠️ Riesgos Críticos
- Riesgo 1 (severidad + posible pérdida)
- Riesgo 2

### 💡 Recomendaciones Accionables
- 1. [Acción concreta] → Impacto esperado + próximo paso
- 2. ...
"""

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Eres un analista senior extremadamente estratégico y crítico. Nunca des respuestas genéricas."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=1300,
            top_p=0.95
        )

        return completion.choices[0].message.content.strip()

    except Exception as e:
        logger.error(f"Error Groq: {e}")
        return f"Error al generar insights: {str(e)[:200]}"