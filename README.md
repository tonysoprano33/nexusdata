# 🚀 NexusData AI

**Análisis de datos inteligente, 100% gratuito, impulsado por IA**

Transforma cualquier CSV, Excel o JSON en insights accionables, visualizaciones automáticas y predicciones con Machine Learning - todo en menos de 10 segundos.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-00a393.svg)
![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)

## ✨ Características Principales

### 🤖 Inteligencia Artificial Integrada
- **Insights automáticos** - Gemini Flash analiza tus datos y genera hallazgos ejecutivos
- **Chat con tu dataset** - Pregunta cualquier cosa en lenguaje natural
- **Recomendación inteligente de gráficos** - La IA elige automáticamente las mejores visualizaciones

### 📊 Visualizaciones Avanzadas
- 8 tipos de gráficos: Bar, Line, Scatter, Pie, Area, Histogram, Boxplot, Heatmap
- Renderizado SVG custom para boxplots y heatmaps
- Gráficos interactivos con Recharts
- Insights de IA en cada visualización

### 🔮 Análisis Predictivo Automático
- **Detección de Churn** - Identifica clientes en riesgo automáticamente
- **Segmentación RFM** - Segmenta por valor (Recency, Frequency, Monetary)
- **Predicciones ML** - Regresión lineal con score R²
- **Clustering K-means** - 4 grupos automáticos

### 📁 Múltiples Formatos
- CSV (.csv)
- Excel (.xlsx, .xls)
- JSON (.json)
- Detección automática de formato

### 📑 Exportación Profesional
- **PDF** - Reporte completo con insights y estadísticas
- **PowerPoint** - 6 slides listos para presentar al jefe
- Descarga directa desde el dashboard

### ⚡ Performance
- Dashboard listo en <10 segundos
- Procesamiento asíncrono en background
- Muestreo inteligente para datasets grandes (>100k filas)
- Sin bloqueos de UI

## 🎯 100% Gratis - Sin Límites

- ✅ Sin suscripciones
- ✅ Sin registro obligatorio
- ✅ Sin límites de uso
- ✅ Sin watermark
- ✅ Código abierto

## 🚀 Inicio Rápido

### Requisitos
- Python 3.10+
- Node.js 18+
- API Key de Gemini (gratis en [Google AI Studio](https://aistudio.google.com/app/apikey))

### 1. Clonar y Configurar

```bash
git clone <repo-url>
cd pipelines
```

### 2. Backend (FastAPI)

```powershell
cd backend

# Crear virtual environment
python -m venv venv
.\venv\Scripts\activate.ps1  # Windows
source venv/bin/activate      # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Configurar API Key
echo "GEMINI_API_KEY=tu_api_key_aqui" > .env

# Iniciar servidor
python main.py
```

Backend disponible en: http://localhost:8000

### 3. Frontend (Next.js)

```powershell
cd frontend

# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev
```

Frontend disponible en: http://localhost:3000

## 📖 Uso

### Subir un Archivo

1. Arrastra tu CSV, Excel o JSON al área de drop
2. Haz clic en "Generar Análisis con IA"
3. Espera <10 segundos
4. ¡Explora tu dashboard!

### Dashboard

El dashboard incluye:
- **Resumen ejecutivo** - Filas, columnas, calidad de datos
- **Insights de IA** - Hallazgos clave en formato ejecutivo
- **Visualizaciones** - Gráficos recomendados automáticamente
- **Chat** - Pregúntale cualquier cosa a tus datos
- **Análisis avanzados** - Churn, RFM, Predicciones, Clustering
- **Exportar** - PDF o PowerPoint listo para presentar

### Chat con Dataset

Escribe preguntas como:
- "¿Cuál es el promedio de ventas?"
- "¿Qué producto tiene más ingresos?"
- "¿Hay correlación entre precio y cantidad vendida?"
- "¿Cuántos valores faltantes hay?"

## 📚 API Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api/datasets/` | GET | Listar análisis |
| `/api/datasets/upload` | POST | Subir archivo |
| `/api/datasets/{id}` | GET | Obtener análisis |
| `/api/datasets/{id}/export/pdf` | GET | Exportar PDF |
| `/api/datasets/{id}/export/pptx` | GET | Exportar PowerPoint |
| `/api/datasets/{id}/chat` | POST | Chat con dataset |
| `/api/datasets/{id}/chat/questions` | GET | Preguntas sugeridas |

Ver [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) para más detalles.

## 🏗️ Arquitectura

### Backend (Python)
- **FastAPI** - Framework web de alto rendimiento
- **Pandas** - Manipulación de datos
- **Scikit-learn** - ML (anomalías, clustering, regresión)
- **Gemini API** - Insights y chat con IA
- **SQLite** - Almacenamiento local
- **ReportLab** - Generación PDF
- **Python-pptx** - Generación PowerPoint

### Frontend (Next.js + React)
- **Next.js 14** - Framework React
- **Tailwind CSS** - Estilos utility-first
- **Framer Motion** - Animaciones
- **Recharts** - Visualizaciones
- **React Markdown** - Renderizado de insights

## 🎨 Capturas de Pantalla

*Próximamente*

## 🤝 Contribuir

Las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea tu branch (`git checkout -b feature/nueva-feature`)
3. Commit tus cambios (`git commit -m 'Add: nueva feature'`)
4. Push a la branch (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

## 📝 Roadmap

- [x] Soporte CSV, Excel, JSON
- [x] Insights con Gemini
- [x] Visualizaciones automáticas (8 tipos)
- [x] Chat con dataset
- [x] Exportar PDF/PowerPoint
- [x] Análisis avanzados (Churn, RFM, ML, Clustering)
- [x] Dashboard premium con animaciones
- [ ] Autenticación JWT completa
- [ ] Soporte múltiples datasets comparativos
- [ ] API pública con rate limiting
- [ ] Webhook notifications

## 📄 Licencia

MIT License - ver [LICENSE](./LICENSE) para más detalles.

## 🙏 Agradecimientos

- Google Gemini por la API de IA
- FastAPI por el framework backend
- Vercel por Next.js
- Comunidad open source

---

**Hecho con ❤️ y ☕ por un solo desarrollador trabajando toda la noche**

*¿Preguntas? Abre un issue o conecta conmigo.*
