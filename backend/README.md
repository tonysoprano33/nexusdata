# NexusData Backend

Backend API para analisis de datasets usando IA (Gemini y Groq) con persistencia en Supabase.

## Estructura

```
backend/
├── app/
│   ├── api/routes.py          # Endpoints de la API
│   ├── core/config.py          # Configuracion de la app
│   ├── db/supabase.py          # Cliente y operaciones de Supabase
│   ├── models/schemas.py         # Pydantic models
│   └── services/
│       ├── analysis_service.py # Orquestador de analisis
│       ├── gemini_service.py  # Integracion con Gemini
│       └── groq_service.py    # Integracion con Groq
├── main.py                    # Entry point FastAPI
├── requirements.txt           # Dependencias Python
└── .env.example              # Variables de entorno de ejemplo
```

## Setup

1. Instalar dependencias:
```bash
cd backend
pip install -r requirements.txt
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

3. Ejecutar localmente:
```bash
python main.py
```

## Variables de Entorno Requeridas

- `SUPABASE_URL` - URL de tu proyecto Supabase
- `SUPABASE_KEY` - Service role key de Supabase
- `GEMINI_API_KEY` - API key de Google Gemini
- `GROQ_API_KEY` - API key de Groq

## Endpoints

- `GET /` - Informacion de la API
- `GET /api/v1/health` - Health check
- `GET /api/v1/providers` - Proveedores de IA disponibles
- `POST /api/v1/analyze` - Subir y analizar dataset
- `GET /api/v1/analysis/{id}` - Obtener resultado de analisis
- `GET /api/v1/analyses` - Listar todos los analisis

## Despliegue en Render

El archivo `render.yaml` en la raiz del proyecto contiene la configuracion para desplegar en Render.
