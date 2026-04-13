"""
Servicio de chat con dataset usando Gemini
Permite hacer preguntas en lenguaje natural sobre los datos
"""

import os
import json
import pandas as pd
import google.generativeai as genai
from typing import Dict, Any, List

def chat_with_dataset(question: str, dataset_summary: Dict[str, Any], sample_data: List[Dict] = None) -> str:
    """
    Responde preguntas sobre el dataset usando Gemini y contexto de los datos
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return "🔑 Servicio de chat no disponible. Configure GEMINI_API_KEY."
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-flash-latest')
    
    # Preparar contexto del dataset
    summary = dataset_summary.get('summary', {})
    column_types = dataset_summary.get('column_types', {})
    stats = dataset_summary.get('descriptive_statistics', {})
    
    # Contexto compacto
    context = f"""
DATASET CONTEXT:
- Filas: {summary.get('total_rows', 0)}
- Columnas: {list(column_types.keys())}
- Tipos: {column_types}
- Calidad: {summary.get('data_quality_score', 0)}%
"""
    
    # Agregar muestra de datos si existe
    if sample_data and len(sample_data) > 0:
        context += f"\nSAMPLE DATA (primeras 5 filas):\n"
        for i, row in enumerate(sample_data[:5], 1):
            context += f"{i}. {json.dumps(row, default=str)[:100]}\n"
    
    # Agregar estadísticas clave
    if stats:
        context += "\nKEY STATISTICS:\n"
        for col, col_stats in list(stats.items())[:3]:
            if isinstance(col_stats, dict):
                key_metrics = {k: v for k, v in col_stats.items() if k in ['mean', 'std', 'min', 'max']}
                context += f"- {col}: {key_metrics}\n"
    
    prompt = f"""{context}

USER QUESTION: "{question}"

Eres un Data Scientist experto. Responde la pregunta del usuario basándote EXCLUSIVAMENTE en los datos proporcionados arriba.

REGLAS:
- Si la pregunta NO puede responderse con los datos disponibles, indica qué información falta
- Si es numérica, muestra el cálculo o razonamiento
- Sé conciso: máximo 3-4 líneas
- Usa español claro y profesional
- NO inventes datos que no estén en el contexto

RESPUESTA:"""
    
    try:
        response = model.generate_content(prompt)
        answer = response.text.strip()
        return answer if answer else "No pude generar una respuesta. Intenta reformular tu pregunta."
    except Exception as e:
        return f"⚠️ Error en el chat: {str(e)[:100]}"

def generate_sample_questions(dataset_summary: Dict[str, Any]) -> List[str]:
    """
    Genera preguntas de ejemplo basadas en el dataset
    """
    column_types = dataset_summary.get('column_types', {})
    numeric_cols = [k for k, v in column_types.items() if v == 'numeric']
    categorical_cols = [k for k, v in column_types.items() if v != 'numeric']
    
    questions = [
        "¿Cuál es el promedio de las variables numéricas?",
        "¿Hay alguna correlación importante entre variables?",
        "¿Qué columnas tienen valores faltantes?",
    ]
    
    if numeric_cols:
        questions.append(f"¿Cuál es el rango típico de {numeric_cols[0]}?")
        if len(numeric_cols) > 1:
            questions.append(f"¿Existe relación entre {numeric_cols[0]} y {numeric_cols[1]}?")
    
    if categorical_cols:
        questions.append(f"¿Cuáles son las categorías más comunes en {categorical_cols[0]}?")
    
    return questions[:5]
