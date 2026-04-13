# Tutorial: Obtener e Implementar API Key de Gemini (Google AI)

## ¿Qué es Gemini 1.5 Flash?

Gemini 1.5 Flash es el modelo de IA de Google que usamos para:
- Generar insights de negocio desde tus datos CSV
- Recomendar qué gráficos mostrar
- Interpretar estadísticas en lenguaje humano

**Es GRATIS** con estos límites:
- 1,500 requests por minuto
- 1 millón de tokens por minuto
- Millones de tokens gratis por día

---

## Paso 1: Crear tu cuenta de Google AI Studio

1. **Abre tu navegador** y ve a:
   ```
   https://ai.google.dev/
   ```

2. **Haz clic en el botón grande** que dice:
   > "Get API key in Google AI Studio"
   
   O ve directamente a:
   ```
   https://aistudio.google.com/app/apikey
   ```

3. **Inicia sesión** con tu cuenta de Google (Gmail)

---

## Paso 2: Crear tu API Key

1. Una vez dentro de Google AI Studio, busca en el menú lateral:
   > **"Get API key"** (Obtener clave de API)

2. Haz clic en el botón:
   > **"Create API key"** (Crear clave de API)

3. Selecciona o crea un proyecto de Google Cloud (puedes usar el predeterminado)

4. **Copia la API key** que aparece - se ve así:
   ```
   AIzaSyCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

⚠️ **IMPORTANTE**: Guarda esta key en un lugar seguro. Google solo te la muestra una vez.

---

## Paso 3: Configurar la API Key en el Proyecto

### Opción A: Variable de Entorno (Recomendado)

1. Crea un archivo llamado `.env` en la carpeta `backend/`:
   ```bash
   cd e:/pipelines/backend
   echo GEMINI_API_KEY=TU_API_KEY_AQUI > .env
   ```

2. Reemplaza `TU_API_KEY_AQUI` con tu key real:
   ```
   GEMINI_API_KEY=AIzaSyCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. El backend ya está configurado para leer esta variable automáticamente.

### Opción B: Configuración directa (Para pruebas rápidas)

Si quieres probar rápidamente, edita el archivo:
```
e:/pipelines/backend/app/services/agent_reasoning.py
```

Cambia la línea 10:
```python
api_key = os.environ.get("GEMINI_API_KEY")
```

Por:
```python
api_key = "AIzaSyCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # Tu key aquí
```

⚠️ **No recomendado para producción** - expone tu key en el código.

---

## Paso 4: Verificar que funciona

### 1. Reiniciar el backend:

```powershell
# Mata el proceso de Python si está corriendo
taskkill /F /IM python.exe

# Activa el entorno virtual y ejecuta
cd e:/pipelines/backend
.\venv\Scripts\activate.ps1
python main.py
```

Deberías ver en la consola:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2. Probar con un CSV:

1. Abre la app en `http://localhost:3000`
2. Sube un archivo CSV
3. Ve al dashboard del análisis
4. Deberías ver:
   - ✅ Insights de negocio generados por IA
   - ✅ Gráficos recomendados automáticamente
   - ✅ Título del insight explicando cada gráfico

### 3. Si NO funciona:

Si ves el mensaje:
> "Sin API key configurada para el motor cognitivo"

Verifica:
```powershell
# Ver que la variable está seteada
$env:GEMINI_API_KEY
```

Si no muestra nada, configúrala manualmente:
```powershell
$env:GEMINI_API_KEY = "AIzaSyCxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
python main.py
```

---

## Paso 5: Solución de Problemas Comunes

### Error: "API key not valid"

- Asegúrate de copiar la key completa (empieza con `AIza`)
- No hay espacios al inicio o final
- La key debe estar activa en Google AI Studio

### Error: "Quota exceeded"

- El plan gratis tiene límites generosos
- Si llegas al límite, espera 1 minuto y reintenta
- O crea una nueva cuenta de Google

### Error: "Model not found"

- Verifica que tu cuenta tenga acceso a Gemini 1.5 Flash
- Algunas regiones tienen restricciones

---

## Estructura del Proyecto con API Key

```
pipelines/
├── backend/
│   ├── .env                    ← Tu API key va aquí
│   ├── app/
│   │   └── services/
│   │       ├── agent_reasoning.py      ← Usa GEMINI_API_KEY
│   │       └── chart_recommender.py    ← Usa GEMINI_API_KEY
│   └── main.py
├── frontend/
│   └── src/
│       └── app/
│           └── dashboard/
│               └── [datasetId]/
│                   └── page.tsx        ← Muestra gráficos
└── TUTORIAL_GEMINI_API.md      ← Este archivo
```

---

## Resumen Rápido (TL;DR)

1. Ve a https://aistudio.google.com/app/apikey
2. Clic en "Create API key"
3. Copia la key
4. Crea archivo `backend/.env` con:
   ```
   GEMINI_API_KEY=tu_key_aqui
   ```
5. Reinicia el backend
6. ¡Listo! La IA generará insights y gráficos automáticamente

---

## ¿Qué obtienes con la API activada?

| Sin API Key | Con API Key |
|-------------|-------------|
| Solo estadísticas crudas | Insights de negocio escritos por IA |
| Sin gráficos | Gráficos recomendados por IA |
| Sin interpretación | Análisis cognitivo de correlaciones |
| Sin recomendaciones | Sugerencias de qué visualizar |

---

## Links Útiles

- **Google AI Studio**: https://aistudio.google.com/
- **Documentación Gemini**: https://ai.google.dev/gemini-api/docs
- **Precios y Límites**: https://ai.google.dev/pricing

---

¿Necesitas ayuda? Revisa que:
1. La key empiece con `AIza`
2. El archivo `.env` esté en `backend/.env`
3. Reiniciaste el backend después de agregar la key
