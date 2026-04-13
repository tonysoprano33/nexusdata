import os
import json
import google.generativeai as genai

def generate_business_insights(data_stats: dict) -> str:
    """
    Genera insights de negocio precisos y concisos usando Gemini.
    Máximo impacto con mínimo texto.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return "Insight Engine Disabled. Please set GEMINI_API_KEY to activate."
        
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-flash-latest')
    
    # Extraer datos clave para análisis
    numeric_cols = [k for k, v in data_stats.get('column_types', {}).items() if v == 'numeric']
    categorical_cols = [k for k, v in data_stats.get('column_types', {}).items() if v == 'categorical']
    quality_score = data_stats.get('summary', {}).get('data_quality_score', 0)
    total_rows = data_stats.get('summary', {}).get('total_rows', 0)
    
    prompt = f"""
    Actúa como Data Scientist Senior. Analiza estos datos y responde EXACTAMENTE con este formato:

    📊 **Punto Clave 1**: [Insight principal en 10 palabras máximo]
    💡 **Acción**: [Recomendación específica en 1 línea]
    
    📊 **Punto Clave 2**: [Segundo insight si aplica]
    💡 **Acción**: [Recomendación específica]
    
    ⚠️ **Alerta**: [Solo si hay problema crítico, si no omitir]

    REGLAS ESTRICTAS:
    - Máximo 3 puntos clave
    - Cada punto: 10 palabras máximo
    - Sin introducción ni conclusión
    - Lenguaje ejecutivo: directo, sin relleno
    - Enfocado en: {', '.join(numeric_cols[:3])} y {', '.join(categorical_cols[:2])}
    - Contexto: {total_rows} filas, calidad {quality_score}%

    Datos: {json.dumps(data_stats, indent=2)[:800]}
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Limpiar respuesta si es muy larga
        if len(text) > 800:
            lines = text.split('\n')
            short_lines = []
            total_len = 0
            for line in lines:
                if total_len + len(line) < 700:
                    short_lines.append(line)
                    total_len += len(line)
                else:
                    break
            text = '\n'.join(short_lines) + '\n\n*[Resumen ejecutivo]*'
        
        return text if text else "Análisis completado. Datos listos para visualización."
        
    except Exception as e:
        return f"⚠️ Error en análisis IA: {str(e)[:100]}"

