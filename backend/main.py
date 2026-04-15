import os
import sys
from pathlib import Path

# Forzar el path para que encuentre la carpeta 'app' sin importar desde donde se ejecute
current_dir = Path(__file__).parent.absolute()
if str(current_dir) not in sys.path:
    sys.path.append(str(current_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import datasets, auth
from app.db.database import init_db
import uvicorn
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="NexusData AI API", version="1.1.2")

# CORS Pro para que Vercel no te rebote
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
def on_startup():
    try:
        init_db()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Database init error: {e}")

@app.get("/")
def root():
    return {"status": "ok", "service": "NexusData AI", "engine": "Groq Llama 3.3"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
