from __future__ import annotations

import logging
import traceback
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import Response

from app.demo_dataset import DEMO_DATASET_CSV, DEMO_DATASET_FILENAME
from app.models.schemas import HealthResponse
from app.services.analysis_service import AnalysisService

logger = logging.getLogger(__name__)

router = APIRouter()
analysis_service = AnalysisService()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    providers = analysis_service.get_available_providers()
    status = "healthy" if any(providers.values()) else "degraded"
    return HealthResponse(status=status, version="1.0.0")


@router.get("/providers")
async def get_providers():
    """Get available AI providers."""
    return analysis_service.get_available_providers()


@router.get("/portfolio/metrics")
async def get_portfolio_metrics():
    """Expose portfolio-friendly project metrics computed from stored analyses."""
    return await analysis_service.get_portfolio_metrics()


@router.post("/analyze", response_model=dict)
async def analyze_dataset(
    file: UploadFile = File(...),
    provider: str = Form("gemini"),
    prompt: Optional[str] = Form(None),
):
    """Upload and analyze a dataset."""
    return await _handle_upload(file=file, provider=provider, prompt=prompt)


@router.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str):
    """Get analysis result by ID."""
    result = await analysis_service.get_analysis(analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return result


@router.get("/analyses")
async def list_analyses(limit: int = 100, status: Optional[str] = None):
    """List analyses with optional status filtering."""
    analyses = await analysis_service.list_analyses(limit)
    if status:
        analyses = [item for item in analyses if item.get("status") == status]
    return {"analyses": analyses}


@router.get("/datasets/")
async def list_datasets_legacy(limit: int = 24, status: Optional[str] = None):
    """Frontend-friendly dataset history endpoint."""
    analyses = await analysis_service.list_analyses(limit)
    if status:
        analyses = [item for item in analyses if item.get("status") == status]

    formatted = []
    for item in analyses:
        normalized = analysis_service.normalize_analysis_record(item)
        result = normalized.get("result", {})
        summary = result.get("summary", {})
        cleaning = result.get("cleaning_report", {})
        insights = result.get("business_insights") or result.get("insights") or ""

        formatted.append(
            {
                "id": normalized.get("id"),
                "filename": normalized.get("filename"),
                "status": normalized.get("status"),
                "created_at": normalized.get("created_at"),
                "updated_at": normalized.get("updated_at"),
                "data_quality_score": cleaning.get("score_after"),
                "summary": {
                    "total_rows": summary.get("total_rows", 0),
                    "total_columns": summary.get("total_columns", 0),
                },
                "insights": insights[:220] + "..." if len(insights) > 220 else insights,
            }
        )
    return formatted


@router.post("/datasets/demo")
async def create_demo_dataset(provider: str = Query("auto")):
    """Create a portfolio demo analysis from a bundled business dataset."""
    if provider not in {"gemini", "groq", "auto"}:
        raise HTTPException(status_code=400, detail="Provider must be gemini, groq, or auto")

    prompt = (
        "This is a portfolio demo dataset about customer revenue, order volume, "
        "satisfaction, churn risk, and recency. Prioritize executive summary, "
        "business recommendations, cleaning decisions, and analyst limitations."
    )
    return await analysis_service.upload_and_analyze(
        DEMO_DATASET_CSV.encode("utf-8"),
        DEMO_DATASET_FILENAME,
        provider,
        prompt,
    )


@router.get("/datasets/{dataset_id}")
async def get_dataset_legacy(dataset_id: str):
    """Frontend-friendly dataset detail endpoint."""
    result = await analysis_service.get_analysis(dataset_id)
    if not result:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return analysis_service.normalize_analysis_record(result)


@router.post("/datasets/upload")
async def upload_dataset_legacy(
    file: UploadFile = File(...),
    provider: str = Form("gemini"),
):
    """Upload and analyze dataset for the current frontend."""
    return await _handle_upload(file=file, provider=provider, prompt=None)


@router.post("/datasets/{dataset_id}/chat")
async def chat_with_dataset_legacy(
    dataset_id: str,
    question: str = Query(..., description="Question to ask about the dataset"),
):
    """Chat with a dataset using stored artifacts."""
    try:
        return await analysis_service.answer_dataset_question(dataset_id, question)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("Error in chat: %s", exc)
        raise HTTPException(status_code=500, detail="Chat failed") from exc


@router.get("/datasets/{dataset_id}/chat/questions")
async def get_chat_questions(dataset_id: str):
    """Suggested chat prompts for the dataset."""
    return {"questions": await analysis_service.get_suggested_questions(dataset_id)}


@router.get("/datasets/{dataset_id}/export/pdf")
async def export_dataset_pdf(dataset_id: str):
    """Export dataset report as PDF."""
    try:
        payload = await analysis_service.generate_pdf_report(dataset_id)
        return Response(
            content=payload,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="report-{dataset_id[:8]}.pdf"'},
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("PDF export failed: %s", exc)
        raise HTTPException(status_code=500, detail="PDF export failed") from exc


@router.get("/datasets/{dataset_id}/export/pptx")
async def export_dataset_pptx(dataset_id: str):
    """Export dataset report as PowerPoint."""
    try:
        payload = await analysis_service.generate_pptx_report(dataset_id)
        return Response(
            content=payload,
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            headers={"Content-Disposition": f'attachment; filename="report-{dataset_id[:8]}.pptx"'},
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("PPTX export failed: %s", exc)
        raise HTTPException(status_code=500, detail="PPTX export failed") from exc


@router.delete("/datasets/{dataset_id}")
async def delete_dataset_legacy(dataset_id: str):
    """Delete a specific dataset by ID."""
    deleted = await analysis_service.delete_analysis(dataset_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Dataset not found or could not be deleted")
    return {"success": True, "message": f"Dataset {dataset_id} deleted successfully", "id": dataset_id}


@router.delete("/datasets/")
async def delete_all_datasets_legacy(
    confirm: bool = Query(False, description="Set to true to confirm deletion of all datasets"),
):
    """Delete all datasets. Requires explicit confirmation."""
    if not confirm:
        raise HTTPException(status_code=400, detail="Add ?confirm=true to confirm deletion of all datasets")

    count = await analysis_service.delete_all_analyses()
    return {"success": True, "message": f"Deleted {count} datasets", "count": count}


async def _handle_upload(file: UploadFile, provider: str, prompt: Optional[str]) -> dict:
    """Shared upload handler with consistent validation and error mapping."""
    allowed_extensions = (".csv", ".xlsx", ".xls", ".json")
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing file name")
    if not file.filename.endswith(allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail=f"File must be one of: {', '.join(allowed_extensions)}",
        )
    if provider not in {"gemini", "groq", "auto"}:
        raise HTTPException(status_code=400, detail="Provider must be gemini, groq, or auto")

    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file")
        if len(content) > 100 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 100MB)")
        return await analysis_service.upload_and_analyze(content, file.filename, provider, prompt)
    except HTTPException:
        raise
    except ValueError as exc:
        logger.error("Validation error: %s", exc)
        message = str(exc)
        if "parse" in message.lower() or "tokenizing" in message.lower():
            message = (
                "We couldn't read this file. Please check that it uses a valid delimiter, "
                "contains at least one header row, and is not password protected."
            )
        raise HTTPException(status_code=400, detail=message) from exc
    except Exception as exc:
        logger.error("Upload failed: %s", exc)
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Upload failed: {exc}") from exc
