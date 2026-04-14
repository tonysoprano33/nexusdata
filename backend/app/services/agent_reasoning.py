import os
import logging
from typing import Dict, Any

import google.generativeai as genai

logger = logging.getLogger(__name__)

def generate_insights(data: Dict[str, Any]) -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return "Error: GEMINI_API_KEY no configurada en el entorno."

    summary = data.get("summary", {})
    column_types = data.get("column_types", {})
    advanced = data.get("advanced_analytics", {})
    anomalies = data.get("anomaly_detection", {})
    
    numeric_cols = [col for col, t in column_types.items() if t == "numeric"]
    categorical_cols = [col for col, t in column_types.items() if t != "numeric"]

    prompt = f"""
Eres un **Director de Analytics** con 15 años de experiencia en consultoría estratégica (McKinsey / BCG level). 

Tu trabajo es entregar análisis que justifiquen tu sueldo frente a un CEO exigente.

Dataset analizado:
- {summary.get('total_rows', 0)} registros
- Calidad de datos: {summary.get('data_quality_score', 0)}%
- Columnas numéricas: {numeric_cols}
- Columnas categóricas: {categorical_cols}
- Anomalías detectadas: {anomalies.get('detected_rows', 0)} ({anomalies.get('ratio', 0)*100:.1f}%)

Análisis avanzado disponible:
{advanced}

REGLAS OBLIGATORIAS:
- No describas estadísticas. Interpreta su significado de negocio.
- Sé crítico, directo y estratégico.
- Usa lenguaje ejecutivo: revenue, rentabilidad, riesgo, oportunidad, retención, concentración, etc.
- Máximo 5 insights potentes.
- Siempre incluye impacto económico o operativo cuando sea posible.

Estructura exacta requerida:

### 🚀 Insight Principal
(Una sola frase impactante que capture el hallazgo más importante)

### 🧠 Resumen Ejecutivo
(2-3 líneas con la visión de negocio del dataset)

### 🔍 Insights Clave
1. **Título claro**: Qué pasa + Por qué pasa + Impacto en el negocio
2. ...
(máximo 5)

### ⚠️ Riesgos Críticos
- Riesgo 1
- Riesgo 2

### 💡 Recomendaciones Estratégicas
- Acción 1 (prioridad alta)
- Acción 2
- Acción 3

Sé conciso pero profundo. Piensa como si el CEO fuera a tomar decisiones basadas en tu análisis.
"""

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")

        response = model.generate_content(prompt)
        text = response.text.strip()

        logger.info("Insights generados correctamente")
        return text

    except Exception as e:
        logger.error(f"Error Gemini: {e}")
        return f"Error al generar insights: {str(e)}"