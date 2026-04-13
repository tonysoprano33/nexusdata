from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import datasets, auth
from app.db.database import init_db
import uvicorn
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="NexusData AI API",
    description="API for Automated Data Cleaning, Intelligence Analysis and Insights",
    version="1.1.0"
)

# Dynamic CORS for Vercel and Localhost
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://nexusdata-ai-dashboard-kiyudk509-tonysoprano3s-projects.vercel.app",
    "https://nexusdata-ai.vercel.app",  # Common production pattern
]

# Allow all Vercel subdomains in development/preview if needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex="https://nexusdata-.*\\.vercel\\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(datasets.router, prefix="/api/datasets", tags=["Datasets"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {"status": "ok", "message": "NexusData AI API is running.", "version": "1.1.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "nexusdata-api"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
