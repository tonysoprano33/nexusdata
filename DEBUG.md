# Guía de Debug - NexusData Backend

## Paso 1: Deploy en Render

1. Ir a https://dashboard.render.com
2. Seleccionar servicio `nexusdata-api`
3. Click en **Manual Deploy** → **Deploy latest commit**
4. Esperar a que termine el build (2-3 minutos)

## Paso 2: Verificar Logs en Render

Después del deploy, ir a la pestaña **Logs** en Render.

Buscar estas líneas:
```
=== UPLOAD START ===
Step 1: Reading file...
Step 1 complete: X bytes read
Step 2: Parsing DataFrame...
Step 2 complete: X rows, Y columns
Step 3: Checking providers...
Available providers: {'gemini': True/False, 'groq': True/False}
Step 4: Starting analysis with gemini...
[ANALYSIS] Starting upload_and_analyze...
```

## Paso 3: Test Local (Opcional)

```bash
# Terminal 1 - Iniciar backend
cd backend
pip install -r requirements.txt
python main.py

# Terminal 2 - Testear
python test_backend.py
```

## Paso 4: Verificar Variables de Entorno en Render

Ir a **Environment** en el dashboard de Render, verificar:
- `GEMINI_API_KEY` - Seteada y válida
- `GROQ_API_KEY` - Seteada y válida
- `SUPABASE_URL` - Seteada
- `SUPABASE_KEY` - Seteada (service_role key)

## Errores Comunes

### 500 Error - Sin logs detallados
El error ocurre antes de llegar al endpoint. Posibles causas:
- Error de import (circular import, módulo no encontrado)
- Error en inicialización de servicios
- Error en middleware

**Solución**: Revisar los logs de build de Render (pestaña **Build & Deploy**)

### "Provider not available"
Las API keys no están configuradas o son inválidas.

**Solución**: Verificar que las variables `GEMINI_API_KEY` y `GROQ_API_KEY` estén seteadas correctamente.

### CORS Error
El frontend no puede comunicarse con el backend.

**Solución**: Ya está fixeado en main.py con `allow_origins=["*"]`.

## Endpoints de Test

- `GET https://nexusdata-api.onrender.com/` - Info del API
- `GET https://nexusdata-api.onrender.com/api/health` - Estado de servicios
- `POST https://nexusdata-api.onrender.com/api/datasets/upload` - Upload CSV

## Si Nada Funciona

1. Ir a Render → **Settings** → **Delete Service**
2. Crear nuevo Web Service desde cero
3. Conectar repo de GitHub
4. Setear variables de entorno de nuevo
5. Deploy

---

**Última actualización**: Logging detallado agregado en commit 2119c1d
