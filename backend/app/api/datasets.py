import numpy as np
import pandas as pd

def make_json_serializable(obj):
    if isinstance(obj, dict):
        return {str(k): make_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple, np.ndarray)):
        return [make_json_serializable(i) for i in obj]
    elif isinstance(obj, (np.int64, np.int32, np.int16, np.int8)):
        return int(obj)
    elif isinstance(obj, (np.float64, np.float32, np.float16)):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return float(obj)
    elif isinstance(obj, (np.bool_)):
        return bool(obj)
    elif pd.isna(obj):
        return None
    return obj
import os
import uuid
import logging
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, File, HTTPException, Query, UploadFile, Depends
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.db.database import DatasetAnalysis, get_db
from app.services.data_pipeline import process_dataset
from app.services.agent_reasoning import generate_business_insights
from app.services.pdf_generator import generate_pdf_report
from app.services.pptx_generator import generate_pptx_report
from app.services.chat_service import chat_with_dataset, generate_sample_questions

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

UPLOAD_DIR = "/tmp/uploads" if os.environ.get("VERCEL") else "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/")
async def list_analyses(
    status: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(DatasetAnalysis)
        if status:
            query = query.filter(DatasetAnalysis.status == status)

        records = query.order_by(desc(DatasetAnalysis.created_at)).limit(limit).all()
        return [
            {
                "id": row.id,
                "filename": row.filename,
                "status": row.status,
                "created_at": row.created_at.isoformat() if row.created_at else None,
                "data_quality_score": (
                    row.analysis_result.get("summary", {}).get("data_quality_score")
                    if row.analysis_result
                    else None
                ),
                "summary": row.analysis_result.get("summary") if row.analysis_result else None
            }
            for row in records
        ]
    except Exception as e:
        logger.error(f"Error listing analyses: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/upload")
async def upload_dataset(
    background_tasks: BackgroundTasks, 
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    valid_extensions = (".csv", ".xlsx", ".xls", ".json")
    if not any(file.filename.endswith(ext) for ext in valid_extensions):
        raise HTTPException(status_code=400, detail="Unsupported file format.")

    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")

    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        db.add(DatasetAnalysis(id=file_id, filename=file.filename, status="processing"))
        db.commit()
        
        logger.info(f"Dataset uploaded: {file_id} ({file.filename})")
        
        background_tasks.add_task(run_analysis_pipeline, file_id, file_path)
        
        return {
            "id": file_id,
            "status": "processing",
            "message": "Dataset uploaded successfully and is being processed.",
        }
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload dataset")


@router.get("/{file_id}")
async def get_analysis(file_id: str, db: Session = Depends(get_db)):
    analysis = db.get(DatasetAnalysis, file_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    return {
        "id": analysis.id,
        "status": analysis.status,
        "result": analysis.analysis_result,
        "error": analysis.error
    }


def run_analysis_pipeline(file_id: str, file_path: str):
    # This runs in background, manual session management is needed here
    from app.db.database import SessionLocal
    db = SessionLocal()
    try:
        logger.info(f"Starting pipeline for {file_id}")
        result = process_dataset(file_path)
        insights = generate_business_insights(result)
        result["business_insights"] = insights

        analysis = db.get(DatasetAnalysis, file_id)
        if analysis:
            analysis.status = "completed"
            analysis.analysis_result = make_json_serializable(result)
            analysis.error = None
            db.commit()
            logger.info(f"Pipeline completed for {file_id}")
    except Exception as e:
        logger.error(f"Pipeline failed for {file_id}: {e}")
        analysis = db.get(DatasetAnalysis, file_id)
        if analysis:
            analysis.status = "failed"
            analysis.error = str(e)
            db.commit()
    finally:
        db.close()
        # Cleanup file after processing
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Cleaned up file: {file_path}")

@router.get("/{file_id}/export/{format}")
async def export_report(file_id: str, format: str, db: Session = Depends(get_db)):
    analysis = db.get(DatasetAnalysis, file_id)
    if not analysis or analysis.status != "completed":
        raise HTTPException(status_code=404, detail="Ready analysis not found")

    if format == "pdf":
        report_bytes = generate_pdf_report({"result": analysis.analysis_result})
        media_type = "application/pdf"
    elif format == "pptx":
        report_bytes = generate_pptx_report({"result": analysis.analysis_result})
        media_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    else:
        raise HTTPException(status_code=400, detail="Invalid format")

    if not report_bytes:
        raise HTTPException(status_code=500, detail=f"Failed to generate {format} report")

    from fastapi.responses import Response
    return Response(
        content=report_bytes,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename=report_{file_id[:8]}.{format}"}
    )

@router.post("/{file_id}/chat")
async def chat_dataset(file_id: str, question: str, db: Session = Depends(get_db)):
    analysis = db.get(DatasetAnalysis, file_id)
    if not analysis or analysis.status != "completed":
        raise HTTPException(status_code=404, detail="Ready analysis not found")

    result = analysis.analysis_result or {}
    sample_data = result.get('sample_data', [])
    
    try:
        answer = chat_with_dataset(question, result, sample_data)
        return {"question": question, "answer": answer}
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="AI failed to respond")

