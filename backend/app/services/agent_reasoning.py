import os
import json
import numpy as np
import pandas as pd
import google.generativeai as genai

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.metrics import accuracy_score, r2_score
from sklearn.preprocessing import LabelEncoder


# =========================================
# 🧠 DETECCIÓN DE TARGET INTELIGENTE
# =========================================

def detect_target(df: pd.DataFrame):
    # Prioridad: columnas tipo churn / target / label
    for col in df.columns:
        if col.lower() in ["churn", "target", "label", "outcome"]:
            return col

    # Si hay booleanos/binarios
    for col in df.columns:
        if df[col].nunique() == 2:
            return col

    return None


# =========================================
# 🧠 PREPROCESAMIENTO
# =========================================

def encode_dataframe(df: pd.DataFrame):
    df_encoded = df.copy()
    encoders = {}

    for col in df_encoded.select_dtypes(include=['object']).columns:
        le = LabelEncoder()
        df_encoded[col] = le.fit_transform(df_encoded[col].astype(str))
        encoders[col] = le

    return df_encoded, encoders


def get_top_correlations(df: pd.DataFrame, top_n=3):
    corr = df.corr(numeric_only=True)
    pairs = []

    for col1 in corr.columns:
        for col2 in corr.columns:
            if col1 != col2:
                pairs.append((col1, col2, corr.loc[col1, col2]))

    pairs = sorted(pairs, key=lambda x: abs(x[2]), reverse=True)

    seen = set()
    result = []
    for a, b, v in pairs:
        key = tuple(sorted([a, b]))
        if key not in seen:
            seen.add(key)
            result.append((a, b, round(v, 3)))
        if len(result) >= top_n:
            break

    return result


# =========================================
# 🤖 ML AUTOMÁTICO
# =========================================

def run_ml(df: pd.DataFrame, target_col: str):
    try:
        df_encoded, _ = encode_dataframe(df)

        X = df_encoded.drop(columns=[target_col])
        y = df_encoded[target_col]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

        # Clasificación
        if y.nunique() <= 10:
            model = LogisticRegression(max_iter=1000)
            model.fit(X_train, y_train)
            preds = model.predict(X_test)

            return {
                "type": "classification",
                "score": round(accuracy_score(y_test, preds), 3)
            }

        # Regresión
        else:
            model = LinearRegression()
            model.fit(X_train, y_train)
            preds = model.predict(X_test)

            return {
                "type": "regression",
                "score": round(r2_score(y_test, preds), 3)
            }

    except Exception:
        return None


# =========================================
# 🧠 GENERADOR DE INSIGHTS (CORE)
# =========================================

def generate_insights(data) -> str:
    """
    Acepta un pd.DataFrame o un dict (resultado de process_dataset)
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return "Missing GEMINI_API_KEY"

    # Si es un dict, extraemos métricas básicas del dict
    if isinstance(data, dict):
        summary = data.get("summary", {})
        total_rows = summary.get("total_rows", 0)
        missing = summary.get("missing_cells", 0)
        column_types = data.get("column_types", {})
        numeric_cols = [c for c, t in column_types.items() if t == "numeric"]
        categorical_cols = [c for c, t in column_types.items() if t != "numeric"]
        
        # Para correlaciones y ML, intentamos reconstruir un sample si hay data
        # o simplemente reportamos lo que tenemos. 
        # Idealmente, process_dataset debería pasar el DF, pero si no, usamos el dict.
        correlations = data.get("correlation_matrix", {})
        ml_result = "Información limitada para ML en modo dict"
        target = "No detectado (modo dict)"
    else:
        df = data
        total_rows = len(df)
        missing = df.isna().sum().sum()
        numeric_cols = df.select_dtypes(include=np.number).columns.tolist()
        categorical_cols = df.select_dtypes(exclude=np.number).columns.tolist()
        target = detect_target(df)
        correlations = get_top_correlations(df)
        ml_result = run_ml(df, target) if target else None

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash") # Actualizado a un modelo existente

    # =========================
    # 🧠 PROMPT FINAL PRO
    # =========================

    prompt = f"""
Actúa como un Data Analyst senior orientado a negocio.

NO describas datos. Genera decisiones.

====================
📊 DATASET
====================
- Filas: {total_rows}
- Missing: {missing}
- Numéricas: {numeric_cols[:6]}
- Categóricas: {categorical_cols[:6]}
- Target detectado: {target}

- Correlaciones clave: {correlations}

- ML:
{ml_result}

====================
🚨 REGLAS
====================
- Máx 5 insights
- Nada genérico
- Nada inventado
- Si no hay contexto suficiente → dilo

====================
📊 OUTPUT
====================

### 🚀 Insight Principal

### 🧠 Resumen Ejecutivo

### 🔍 Insights Clave
- Qué pasa
- Por qué pasa
- Impacto

### ⚠️ Riesgos

### 💡 Recomendaciones

====================

Pensá como si esto fuera para un CEO.
"""

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generando insights con IA: {str(e)}"
