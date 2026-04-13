# 🚀 Guía Rápida - NexusData AI

## Inicio en 3 Pasos

### 1. Iniciar Backend
```powershell
cd e:/pipelines/backend
.\venv\Scripts\activate.ps1
python main.py
```
✅ Backend disponible en: http://localhost:8000

### 2. Iniciar Frontend (nueva terminal)
```powershell
cd e:/pipelines/frontend
npm run dev
```
✅ Frontend disponible en: http://localhost:3000

### 3. Abrir en Navegador
- Ve a: http://localhost:3000
- Sube tu archivo CSV, Excel o JSON
- ¡Listo! El análisis se genera automáticamente

---

## 🎯 Cómo Usar

### Subir Archivo
1. Arrastra tu archivo al área indicada
2. O haz clic para seleccionar
3. Formatos soportados: CSV, XLSX, XLS, JSON

### Esperar Análisis
- El procesamiento toma ~5-10 segundos
- Gemini analiza automáticamente los patrones
- No necesitas configurar nada

### Explorar Dashboard
- **Resumen**: Filas, columnas, calidad de datos
- **Insights**: Hallazgos clave generados por IA
- **Gráficos**: Visualizaciones automáticas optimizadas
- **Chat**: Pregúntale cualquier cosa a tus datos
- **Análisis Avanzados**: Churn, RFM, Predicciones

### Exportar Resultados
- Botón **PDF**: Reporte completo descargable
- Botón **PPT**: Presentación lista para mostrar

---

## 💬 Ejemplos de Preguntas al Chat

Puedes preguntar cosas como:
- "¿Cuál es el promedio de ventas?"
- "¿Qué producto tiene más ingresos?"
- "¿Hay correlación entre precio y cantidad?"
- "¿Cuántos valores faltantes hay?"
- "¿Cuál es la tendencia temporal?"

---

## 📊 Tipos de Gráficos Automáticos

El sistema elige automáticamente entre:
- **Bar**: Comparación de categorías
- **Line**: Tendencias temporales  
- **Scatter**: Relaciones numéricas
- **Pie**: Distribuciones proporcionales
- **Histogram**: Distribución de frecuencias
- **Boxplot**: Análisis de quartiles
- **Heatmap**: Correlaciones entre variables

---

## 🔧 Troubleshooting

### Error: "GEMINI_API_KEY no configurada"
```powershell
# Crear archivo .env en backend/
echo "GEMINI_API_KEY=tu_api_key" > .env
```

### Error: "Module not found"
```powershell
# Reinstalar dependencias frontend
cd frontend
npm install

# Reinstalar dependencias backend
cd backend
pip install -r requirements.txt
```

### Puerto ocupado (3000 o 8000)
```powershell
# Matar procesos en Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# O usar otros puertos
npm run dev -- --port 3001  # frontend
python main.py --port 8001   # backend (editar en main.py)
```

---

## 🧪 Testing

### Test completo del sistema:
```powershell
cd e:/pipelines
.\backend\venv\Scripts\activate.ps1
python -c "import requests; print(requests.get('http://localhost:8000/api/datasets/?limit=3').json())"
```

### Ver análisis reciente:
```powershell
python -c "import requests; print(requests.get('http://localhost:8000/api/datasets/?limit=1').json())"
```

---

## 📁 Estructura de Archivos Importantes

```
pipelines/
├── backend/
│   ├── main.py              # Servidor FastAPI
│   ├── app/
│   │   ├── api/datasets.py  # Endpoints API
│   │   └── services/        # Lógica de IA
│   └── .env                 # API Key Gemini
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx     # Landing page
│   │   │   └── dashboard/   # Dashboard
│   │   └── components/      # Componentes React
│   └── package.json
├── test_prueba_llm.csv      # Archivo de prueba
└── README.md                # Documentación completa
```

---

## 🎨 Personalización

### Cambiar colores del tema
Editar `frontend/tailwind.config.js`:
```javascript
colors: {
  indigo: {
    400: "#818cf8",  // Cambiar a tu color
    500: "#6366f1",
    600: "#4f46e5",
  }
}
```

### Modificar prompts de IA
Editar `backend/app/services/agent_reasoning.py`:
- Ajustar el prompt en la función `generate_business_insights()`

### Agregar nuevos tipos de gráficos
Editar `backend/app/services/chart_recommender.py`:
- Agregar nuevo tipo en el prompt de Gemini
- Implementar renderizado en `frontend/src/components/ChartRenderer.tsx`

---

## 🚀 Deployment

### Build para producción:
```powershell
# Frontend
cd frontend
npm run build

# Backend (usar Gunicorn/Uvicorn)
cd backend
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Variables de entorno para producción:
```bash
GEMINI_API_KEY=xxx
JWT_SECRET_KEY=xxx  # Si usas auth
DATABASE_URL=sqlite:///./production.db
```

---

## 📞 Soporte

Si encuentras problemas:
1. Revisar logs del backend
2. Verificar consola del navegador (F12)
3. Consultar `API_DOCUMENTATION.md`
4. Revisar `STATUS_FINAL.txt`

---

## 🎉 Tips

- **Atajos**: Usa Ctrl+R para recargar, Ctrl+C para detener servidores
- **Datos de prueba**: Usa `example_dataset.csv` incluido
- **API directa**: Todos los endpoints están documentados en `API_DOCUMENTATION.md`
- **Gratis**: Todo es gratuito, sin límites, sin registro

---

**¡Listo para analizar datos!** 🎊
