from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import datasets, auth
from app.db.database import init_db
import uvicorn
from dotenv import load_dotenv
import os

# Cargar variables de entorno desde .env
load_dotenv()
print(f"GEMINI_API_KEY cargada: {'Si' if os.environ.get('GEMINI_API_KEY') else 'No'}")

IS_VERCEL = bool(os.environ.get("VERCEL"))
API_PREFIX = "" if IS_VERCEL else "/api"

app = FastAPI(
    title="Data Analysis SaaS API",
    description="API for Automated Data Cleaning, Intelligence Analysis and Insights",
    version="1.0.0"
)

# Configuración CORS para comunicarse con Frontend
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://nexusdata-ai-dashboard-kiyudk509-tonysoprano3s-projects.vercel.app",
    "https://*.vercel.app",  # Permitir todos los subdominios de Vercel
    "https://nexusdata-api.onrender.com"  # URL del backend en Render
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(datasets.router, prefix=f"{API_PREFIX}/datasets", tags=["Datasets"])
app.include_router(auth.router, prefix=f"{API_PREFIX}/auth", tags=["Authentication"])


@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {"status": "ok", "message": "NexusData AI API is running."}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "nexusdata-api"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
