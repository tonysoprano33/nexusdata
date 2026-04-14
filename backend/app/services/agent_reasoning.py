import os
import json
import numpy as np
import pandas as pd
from groq import Groq

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.metrics import accuracy_score, r2_score
from sklearn.preprocessing import LabelEncoder


# =========================================
# 🧠 DETECCIÓN DE TARGET INTELIGENTE
# =========================================

def detect_target(df: pd.DataFrame):
    for col in df.columns:
        if col.lower() in ["churn", "target", "label", "outcome"]:
            return col
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
        if y.nunique() <= 10:
            model = LogisticRegression(max_iter=1000)
            model.fit(X_train, y_train)
            preds = model.predict(X_test)
            return {"type": "classification", "score": round(accuracy_score(y_test, preds), 3)}
        else:
            model = LinearRegression()
            model.fit(X_train, y_train)
            preds = model.predict(X_test)
            return {"type": "regression", "score": round(r2_score(y_test, preds), 3)}
    except Exception:
        return None


# =========================================
# 🧠 GENERADOR DE INSIGHTS (GROQ VERSION)
# =========================================

def generate_insights(data) -> str:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return "Missing GROQ_API_KEY"

    client = Groq(api_key=api_key)

    if isinstance(data, dict):
        summary = data.get("summary", {})
        total_rows = summary.get("total_rows", 0)
        missing = summary.get("missing_cells", 0)
        column_types = data.get("column_types", {})
        numeric_cols = [c for c, t in column_types.items() if t == "numeric"]
        categorical_cols = [c for c, t in column_types.items() if t != "numeric"]
        correlations = data.get("correlation_matrix", {})
        ml_result = "Basado en el análisis estadístico del dataset"
        target = "Análisis Global"
    else:
        df = data
        total_rows = len(df)
        missing = int(df.isna().sum().sum())
        numeric_cols = df.select_dtypes(include=np.number).columns.tolist()
        categorical_cols = df.select_dtypes(exclude=np.number).columns.tolist()
        target = detect_target(df)
        correlations = get_top_correlations(df)
        ml_result = run_ml(df, target) if target else None

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
- Enfoque: {target}
- Correlaciones/Patrones: {correlations}
- ML Result: {ml_result}

====================
🚨 REGLAS
====================
- Máx 5 insights accionables
- Nada genérico
- Nada inventado
- Si no hay contexto suficiente → dilo

====================
📊 OUTPUT FORMAT (Markdown)
====================
### 🚀 Insight Principal
### 🧠 Resumen Ejecutivo
### 🔍 Insights Clave
### ⚠️ Riesgos
### 💡 Recomendaciones
"""

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Eres un analista de datos experto que genera insights de negocio."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=1024,
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error generando insights con Groq: {str(e)}"
