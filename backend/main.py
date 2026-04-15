import os
import sys
import logging
from pathlib import Path

# Configurar logging basico para ver que pasa en Render
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("🚀 Iniciando NexusData API...")

# Forzar el path para encontrar la carpeta 'app'
current_dir = Path(__file__).parent.absolute()
if str(current_dir) not in sys.path:
    sys.path.append(str(current_dir))
    logger.info(f"📍 Path agregado: {current_dir}")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from app.api import datasets, auth
    from app.db.database import init_db
    logger.info("✅ Modulos internos cargados correctamente")
except Exception as e:
    logger.error(f"❌ Error cargando modulos internos: {e}")
    raise

app = FastAPI(title="NexusData AI API", version="1.1.3")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(datasets.router, prefix="/api/datasets", tags=["Datasets"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

@app.on_event("startup")
async def on_startup():
    logger.info("📡 Ejecutando tareas de startup...")
    try:
        init_db()
        logger.info("✅ Base de datos inicializada")
    except Exception as e:
        logger.error(f"❌ Error en init_db: {e}")

@app.get("/")
async def root():
    return {"status": "ok", "service": "NexusData AI", "engine": "Groq Llama 3.3"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
