from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Optional, List
from app.services.analysis_service import AnalysisService
from app.models.schemas import (
    DatasetAnalysisResponse, 
    AnalysisRequest, 
    HealthResponse,
    AnalysisResult
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
analysis_service = AnalysisService()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    providers = analysis_service.get_available_providers()
    status = "healthy" if any(providers.values()) else "degraded"
    
    return HealthResponse(
        status=status,
        version="1.0.0"
    )


@router.get("/providers")
async def get_providers():
    """Get available AI providers."""
    return analysis_service.get_available_providers()


@router.post("/analyze", response_model=dict)
async def analyze_dataset(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    provider: str = Form("gemini"),
    prompt: Optional[str] = Form(None)
):
    """Upload and analyze a dataset."""
    
    # Validate provider
    available_providers = analysis_service.get_available_providers()
    if provider not in available_providers or not available_providers[provider]:
        raise HTTPException(
            status_code=400, 
            detail=f"Provider '{provider}' is not available"
        )
    
    # Validate file
    allowed_extensions = ('.csv', '.xlsx', '.xls', '.json')
    if not file.filename.endswith(allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail=f"File must be one of: {', '.join(allowed_extensions)}"
        )
    
    try:
        # Read file content
        content = await file.read()
        
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Empty file")
        
        # Limit file size (100MB)
        if len(content) > 100 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 100MB)")
        
        # Perform analysis
        result = await analysis_service.upload_and_analyze(
            content,
            file.filename,
            provider,
            prompt
        )
        
        return result
        
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail="Analysis failed")


@router.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str):
    """Get analysis result by ID."""
    try:
        result = await analysis_service.get_analysis(analysis_id)
        if not result:
            raise HTTPException(status_code=404, detail="Analysis not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve analysis")


@router.get("/analyses")
async def list_analyses(limit: int = 100):
    """List all analyses."""
    try:
        analyses = await analysis_service.list_analyses(limit)
        return {"analyses": analyses}
    except Exception as e:
        logger.error(f"Error listing analyses: {e}")
        raise HTTPException(status_code=500, detail="Failed to list analyses")
