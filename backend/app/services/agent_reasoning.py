import os
import logging
from typing import Dict, Any
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

def get_client():
    api_key = os.getenv("GROQ_API_KEY")
    return Groq(api_key=api_key) if api_key else None

def generate_insights(data: Dict[str, Any]) -> str:
    client = get_client()
    if not client: return "Error: API Key missing."
    
    summary = data.get("summary", {})
    dna = data.get("dataset_dna", {})

    prompt = f"""
Eres un Analista de Estrategia de Datos Senior. Tu objetivo es dar valor inmediato al CEO.
Basado en este dataset con {dna.get('total_rows')} filas y {dna.get('total_columns')} columnas:

INSTRUCCIONES:
Genera un reporte minimalista con EXACTAMENTE:
### 1. Hallazgo de Integridad
(Que cambio importante se hizo en la limpieza)

### 2. Tres Recomendaciones Estrategicas
- [Rec 1]: Recomendacion accionable basada en la data.
- [Rec 2]: Recomendacion de optimizacion.
- [Rec 3]: Recomendacion de expansion o riesgo.

Usa un tono serio, directo y profesional. Sin introducciones innecesarias.
"""
    try:
        res = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.2
        )
        return res.choices[0].message.content
    except:
        return "Análisis no disponible en este momento."