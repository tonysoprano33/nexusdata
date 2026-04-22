from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import sys

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

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "NexusData API",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
