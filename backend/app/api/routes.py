from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks, Query
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


# Legacy endpoints for frontend compatibility
@router.get("/datasets/")
async def list_datasets_legacy(limit: int = 24):
    """Legacy endpoint - returns array directly for frontend compatibility."""
    try:
        analyses = await analysis_service.list_analyses(limit)
        # Format each item for frontend
        formatted = []
        for item in analyses if analyses else []:
            analysis_result = item.get("analysis_result", {})
            formatted.append({
                "id": item.get("id"),
                "filename": item.get("filename"),
                "status": item.get("status"),
                "created_at": item.get("created_at"),
                "updated_at": item.get("updated_at"),
                "insights": analysis_result.get("insights", "")[:200] + "..." if len(analysis_result.get("insights", "")) > 200 else analysis_result.get("insights", ""),
                "summary": analysis_result.get("summary", "")
            })
        return formatted
    except Exception as e:
        logger.error(f"Error listing datasets: {e}")
        return []


@router.get("/datasets/{dataset_id}")
async def get_dataset_legacy(dataset_id: str):
    """Legacy endpoint - get dataset by ID with complete info."""
    try:
        result = await analysis_service.get_analysis(dataset_id)
        if not result:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Format for frontend
        analysis_result = result.get("analysis_result", {})
        
        return {
            "id": result.get("id"),
            "filename": result.get("filename"),
            "status": result.get("status"),
            "created_at": result.get("created_at"),
            "updated_at": result.get("updated_at"),
            "insights": analysis_result.get("insights", ""),
            "recommendations": analysis_result.get("recommendations", []),
            "summary": analysis_result.get("summary", ""),
            "statistics": analysis_result.get("statistics", {})
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving dataset: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve dataset")


@router.post("/datasets/upload")
async def upload_dataset_legacy(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    provider: str = Form("gemini")
):
    """Legacy endpoint - upload and analyze dataset with complete response."""
    # First do the analysis
    result = await analyze_dataset(background_tasks, file, provider, None)
    
    # Read file again for metadata (since analyze_dataset consumed it)
    await file.seek(0)
    content = await file.read()
    
    # Parse for additional metadata
    import io
    import pandas as pd
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(content))
        elif file.filename.endswith('.json'):
            df = pd.read_json(io.BytesIO(content))
        else:
            df = pd.DataFrame()
        
        # Build enhanced response
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        
        analysis_result = result.get("result", {})
        
        return {
            "id": result.get("id"),
            "filename": file.filename,
            "status": result.get("status"),
            "columns": df.columns.tolist(),
            "numeric_columns": numeric_cols,
            "categorical_columns": categorical_cols,
            "row_count": len(df),
            "preview": df.head(10).to_dict(orient='records'),
            "insights": analysis_result.get("insights", ""),
            "recommendations": analysis_result.get("recommendations", []),
            "summary": analysis_result.get("summary", ""),
            "statistics": analysis_result.get("statistics", {}),
            "fallback_used": result.get("fallback_used", False),
            "provider_used": "groq" if result.get("fallback_used") else provider
        }
    except Exception as e:
        logger.error(f"Error building response: {e}")
        # Return basic result if parsing fails
        return result


@router.post("/datasets/{dataset_id}/chat")
async def chat_with_dataset_legacy(
    dataset_id: str,
    question: str = Query(..., description="Question to ask about the dataset"),
    provider: str = Query("gemini", description="AI provider to use")
):
    """Legacy endpoint - chat with dataset analysis results."""
    try:
        # Get the analysis result
        result = await analysis_service.get_analysis(dataset_id)
        if not result:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Return a simple response based on the analysis
        analysis_data = result.get("analysis_result", {})
        insights = analysis_data.get("insights", "")
        
        return {
            "answer": f"Based on the analysis: {insights[:500]}..." if len(insights) > 500 else f"Based on the analysis: {insights}",
            "dataset_id": dataset_id,
            "question": question
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail="Chat failed")
