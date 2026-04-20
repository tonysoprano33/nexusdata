import os
from dotenv import load_dotenv
load_dotenv()  # Cargar .env antes de los imports de la app
import os
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("🚀 Iniciando NexusData API...")

# Importamos los routers y base de datos
try:
    from app.api import datasets, auth
    from app.db.database import init_db
    logger.info("✅ Módulos internos cargados correctamente")
except Exception as e:
    logger.error(f"❌ Error cargando módulos internos: {e}")
    raise

app = FastAPI(
    title="NexusData AI API",
    version="1.1.3",
    description="API para análisis inteligente de datasets con Groq + Llama 3.3"
)

# CORS (permitir frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # Cambia esto a tu dominio cuando esté en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(datasets.router, prefix="/api/datasets", tags=["Datasets"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

# Evento de startup
@app.on_event("startup")
async def on_startup():
    logger.info("📡 Ejecutando tareas de startup...")
    try:
        init_db()
        logger.info("✅ Base de datos inicializada correctamente")
    except Exception as e:
        logger.error(f"❌ Error al inicializar la base de datos: {e}")

# Endpoints básicos
@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "NexusData AI",
        "engine": "Groq + Llama 3.3",
        "message": "API funcionando correctamente"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "1.1.3"
    }

# Para ejecución local (opcional)
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
