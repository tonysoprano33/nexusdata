from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import datasets, auth
from app.db.database import init_db
import uvicorn
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="NexusData AI API", version="1.1.1")

# CORS mas permisivo para evitar bloqueos en Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En produccion Senior se restringe, pero para debugging usaremos "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Render a veces espera las rutas sin el prefijo /api si Vercel ya lo gestiona
# Pero mantendremos /api/datasets para consistencia, el frontend ya fue corregido
app.include_router(datasets.router, prefix="/api/datasets", tags=["Datasets"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

@app.on_event("startup")
def on_startup():
    try:
        init_db()
    except Exception as e:
        print(f"Database init error: {e}")

@app.get("/")
def root():
    return {"status": "ok", "service": "NexusData AI"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)

