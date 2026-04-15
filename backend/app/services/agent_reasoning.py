import os
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


def generate_insights(data: Dict[str, Any]) -> str:
    """
    Genera insights de negocio usando Groq (Llama 3.3 70B).
    Importamos Groq dentro de la función para mayor robustez.
    """
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return "Error: GROQ_API_KEY no está configurada en Render."

    try:
        # Importamos Groq aquí dentro para evitar errores de importación al iniciar
        from groq import Groq
        client = Groq(api_key=api_key)

        summary = data.get("summary", {})
        advanced = data.get("advanced_analytics", {})
        anomalies = data.get("anomaly_detection", {})

        numeric_cols = [col for col, t in data.get("column_types", {}).items() if t == "numeric"]
        categorical_cols = [col for col, t in data.get("column_types", {}).items() if t != "numeric"]

        prompt = f"""
Eres un Director de Analytics senior con experiencia en McKinsey/BCG. 
Tu trabajo es entregar insights claros, críticos y accionables para un CEO.

### Información del Dataset:
- Registros totales: {summary.get('total_rows', 0)}
- Calidad de datos: {summary.get('data_quality_score', 0)}%
- Columnas numéricas: {numeric_cols[:8]}
- Columnas categóricas: {categorical_cols[:6]}
- Anomalías detectadas: {anomalies.get('detected_rows', 0)} ({anomalies.get('ratio', 0)*100:.1f}%)

### Análisis Avanzado Disponible:
{advanced}

Reglas estrictas:
- Sé directo, crítico y estratégico. No seas genérico.
- Siempre explica el **impacto en el negocio** (revenue, riesgo, oportunidad, retención, etc.).
- Máximo 5 insights potentes.
- Usa lenguaje ejecutivo.

Devuelve el análisis **exactamente** en este formato Markdown:

### 🚀 Insight Principal
[Una frase impactante que resuma lo más importante del dataset]

### 🧠 Resumen Ejecutivo
[2-3 líneas con la visión general del negocio]

### 🔍 Insights Clave
1. **Título del insight**: Qué pasa + Por qué pasa + Impacto en el negocio
2. ...

### ⚠️ Riesgos Identificados
- Riesgo 1
- Riesgo 2

### 💡 Recomendaciones Accionables
- Recomendación 1 (alta prioridad)
- Recomendación 2
- Recomendación 3

Piensa como si el CEO fuera a tomar decisiones basadas en tu reporte.
"""

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Eres un analista senior de negocio extremadamente directo y estratégico."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1100,
            top_p=0.95
        )

        insights_text = completion.choices[0].message.content.strip()
        logger.info("✅ Insights generados correctamente con Groq")
        return insights_text

    except ImportError:
        return "Error: Paquete 'groq' no instalado. Verifica requirements.txt y redeploy."
    except Exception as e:
        logger.error(f"Error con Groq: {str(e)}")
        return f"Error al generar insights con Groq: {str(e)[:250]}"


# Funciones auxiliares (mantener si las usás en otro lado)
def detect_target(df):
    for col in df.columns:
        if col.lower() in ["churn", "target", "label", "outcome"]:
            return col
    for col in df.columns:
        if df[col].nunique() == 2:
            return col
    return None