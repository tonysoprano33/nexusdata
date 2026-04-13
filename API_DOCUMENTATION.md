# 📚 NexusData AI - API Documentation

## Base URL
```
http://localhost:8000
```

## Endpoints

### 1. Health Check
```
GET /
```
Verifica que la API está funcionando.

**Response:**
```json
{
  "status": "ok",
  "message": "Data SaaS API is running."
}
```

---

### 2. Listar Análisis
```
GET /api/datasets/
```
Obtiene lista de análisis previos.

**Query Parameters:**
- `limit` (int): Número máximo de resultados (default: 50)
- `status` (string): Filtrar por estado (`processing`, `completed`, `failed`)

**Response:**
```json
[
  {
    "id": "uuid",
    "filename": "datos.csv",
    "status": "completed",
    "created_at": "2024-01-15T10:30:00",
    "error": null
  }
]
```

---

### 3. Subir Archivo
```
POST /api/datasets/upload
```
Sube un archivo CSV, Excel o JSON para análisis.

**Content-Type:** `multipart/form-data`

**Body:**
- `file`: Archivo (CSV, XLSX, XLS, JSON)

**Response:**
```json
{
  "id": "uuid",
  "filename": "ventas.csv",
  "status": "processing",
  "message": "Archivo recibido. Procesando en segundo plano."
}
```

---

### 4. Obtener Análisis
```
GET /api/datasets/{id}
```
Obtiene el resultado completo de un análisis.

**Response (Completed):**
```json
{
  "id": "uuid",
  "filename": "datos.csv",
  "status": "completed",
  "result": {
    "summary": {
      "total_rows": 1000,
      "total_columns": 8,
      "data_quality_score": 98.5
    },
    "column_types": {
      "ventas": "numeric",
      "fecha": "datetime",
      "producto": "categorical"
    },
    "descriptive_statistics": { ... },
    "correlation_matrix": { ... },
    "anomaly_detection": {
      "detected_rows": 12,
      "ratio": 0.012
    },
    "business_insights": "📊 Punto Clave 1...",
    "chart_recommendations": [
      {
        "type": "bar",
        "x_column": "producto",
        "y_column": "ventas",
        "title": "Ventas por Producto",
        "insight": "Top 3 productos generan 60% de ingresos"
      }
    ],
    "charts_data": [ ... ],
    "advanced_analytics": {
      "churn_analysis": { ... },
      "rfm_segmentation": { ... },
      "predictions": { ... },
      "clustering": { ... }
    }
  }
}
```

---

### 5. Exportar PDF
```
GET /api/datasets/{id}/export/pdf
```
Genera y descarga reporte en PDF.

**Response:** Archivo PDF (Content-Type: `application/pdf`)

---

### 6. Exportar PowerPoint
```
GET /api/datasets/{id}/export/pptx
```
Genera y descarga presentación en PowerPoint.

**Response:** Archivo PPTX (Content-Type: `application/vnd.openxmlformats-officedocument.presentationml.presentation`)

---

### 7. Chat con Dataset
```
POST /api/datasets/{id}/chat?question={pregunta}
```
Realiza preguntas en lenguaje natural sobre los datos.

**Query Parameters:**
- `question` (string, required): Pregunta sobre el dataset

**Response:**
```json
{
  "question": "¿Cuál es el promedio de ventas?",
  "answer": "El promedio de ventas es $15,430 basado en los datos analizados.",
  "dataset_id": "uuid"
}
```

---

### 8. Preguntas Sugeridas
```
GET /api/datasets/{id}/chat/questions
```
Obtiene preguntas de ejemplo para el dataset.

**Response:**
```json
{
  "questions": [
    "¿Cuál es el promedio de las variables numéricas?",
    "¿Hay alguna correlación importante entre variables?",
    "¿Qué columnas tienen valores faltantes?"
  ],
  "dataset_id": "uuid"
}
```

---

## Formatos de Archivo Soportados

| Formato | Extensión | MIME Type |
|---------|-----------|-----------|
| CSV | .csv | text/csv |
| Excel | .xlsx, .xls | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet |
| JSON | .json | application/json |

---

## Tipos de Gráficos

El sistema genera automáticamente los siguientes tipos según los datos:

- `bar` - Comparación de categorías
- `line` - Tendencias temporales
- `scatter` - Relaciones entre variables numéricas
- `pie` - Distribución proporcional
- `area` - Tendencias acumulativas
- `histogram` - Distribución de frecuencias
- `box` / `boxplot` - Diagrama de caja (quartiles)
- `heatmap` - Matriz de correlaciones

---

## Análisis Avanzados Automáticos

### Detección de Churn
Busca columnas como: `churn`, `cancelled`, `active`, `status`, `recency`

### Segmentación RFM
Requiere columnas de: `recency`, `frequency`, `monetary`, `value`, `revenue`

### Predicciones ML
Regresión lineal automática sobre variables numéricas con R² score.

### Clustering
K-means con k=4 grupos automáticos sobre variables numéricas.

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Bad Request - Parámetros inválidos |
| 404 | Dataset no encontrado |
| 422 | Archivo no procesable |
| 500 | Error interno del servidor |

---

## Ejemplo de Uso (Python)

```python
import requests

# Subir archivo
with open('datos.csv', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/api/datasets/upload',
        files={'file': f}
    )
    dataset_id = response.json()['id']

# Esperar procesamiento
import time
time.sleep(10)

# Obtener análisis
response = requests.get(f'http://localhost:8000/api/datasets/{dataset_id}')
data = response.json()

# Chat
response = requests.post(
    f'http://localhost:8000/api/datasets/{dataset_id}/chat',
    params={'question': '¿Cuál es el promedio?'}
)
print(response.json()['answer'])

# Descargar PDF
response = requests.get(f'http://localhost:8000/api/datasets/{dataset_id}/export/pdf')
with open('reporte.pdf', 'wb') as f:
    f.write(response.content)
```

---

## Variables de Entorno Requeridas

```bash
GEMINI_API_KEY=your_api_key_here
JWT_SECRET_KEY=your_secret_for_auth  # Opcional, para autenticación
```

---

## Limitaciones

- Tamaño máximo de archivo: ~100MB (recomendado)
- Muestreo automático para datasets >100k filas
- Timeout de procesamiento: ~60 segundos
- Rate limiting: 100 requests/minuto por IP

---

## Autenticación (Opcional)

Si está habilitada, incluir header:
```
Authorization: Bearer {token}
```

Obtener token vía:
```
POST /api/auth/login
POST /api/auth/register
```
