from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import sys
import traceback

from app.api.routes import router
from app.core.config import get_settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    logger.info("Starting up NexusData API...")
    
    # Verify configuration
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_key:
        logger.warning("Supabase credentials not configured!")
    if not settings.gemini_api_key:
        logger.warning("Gemini API key not configured!")
    if not settings.groq_api_key:
        logger.warning("Groq API key not configured!")
    
    yield
    
    logger.info("Shutting down NexusData API...")


# Create FastAPI application
app = FastAPI(
    title="NexusData API",
    description="AI-powered dataset analysis API using Gemini and Groq",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware FIRST (before any other middleware)
origins = [
    "https://nexusdata-gamma.vercel.app",
    "https://nexusdata.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for now
    allow_credentials=False,  # Must be False when using "*"
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Global exception handler with CORS headers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error: {exc}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

# Include API routes
app.include_router(router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "NexusData API",
        "version": "1.0.0",
        "docs": "/docs",
        "cors": "enabled"
    }


@app.get("/test-cors")
async def test_cors():
    """Test CORS endpoint."""
    return {"message": "CORS is working"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
