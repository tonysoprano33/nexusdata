import os
import uuid
import logging
from typing import Optional

import numpy as np
import pandas as pd

from fastapi import APIRouter, BackgroundTasks, File, HTTPException, Query, UploadFile, Depends
from fastapi.responses import Response
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.db.database import DatasetAnalysis, SessionLocal, get_db
from app.services.data_pipeline import process_dataset
from app.services.agent_reasoning import generate_insights as generate_business_insights
from app.services.pdf_generator import generate_pdf_report
from app.services.pptx_generator import generate_pptx_report
from app.services.chat_service import chat_with_dataset, generate_sample_questions

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

UPLOAD_DIR = "/tmp/uploads" if os.environ.get("RENDER") else "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE_MB = 50
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


def make_json_serializable(obj):
    """Convierte recursivamente tipos numpy/pandas a tipos Python nativos serializables por JSON."""
    if obj is None:
        return None
    if isinstance(obj, dict):
        return {str(k): make_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple, np.ndarray)):
        return [make_json_serializable(i) for i in obj]
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return float(obj)
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, float):
        if pd.isna(obj) or np.isinf(obj):
            return None
        return obj
    return obj


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
                    if row.analysis_result else None
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
    # Validar extensión
    valid_extensions = (".csv", ".xlsx", ".xls", ".json")
    if not any(file.filename.endswith(ext) for ext in valid_extensions):
        raise HTTPException(status_code=400, detail="Unsupported file format.")

    # Leer y validar tamaño
    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is {MAX_FILE_SIZE_MB} MB."
        )

    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")

    try:
        with open(file_path, "wb") as buffer:
            buffer.write(content)

        # Guardar registro inicial
        db.add(DatasetAnalysis(id=file_id, filename=file.filename, status="processing"))
        db.commit()

        logger.info(f"Dataset uploaded: {file_id} ({file.filename})")

        # Procesar en background
        background_tasks.add_task(run_analysis_pipeline, file_id, file_path)

        return {
            "id": file_id,
            "status": "processing",
            "message": "Dataset uploaded successfully and is being processed.",
        }
    except Exception as e:
        logger.error(f"Upload error: {e}")
        if os.path.exists(file_path):
            os.remove(file_path)
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
        "error": analysis.error,
        "filename": analysis.filename
    }


@router.delete("/{file_id}")
async def delete_analysis(file_id: str, db: Session = Depends(get_db)):
    analysis = db.get(DatasetAnalysis, file_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    try:
        db.delete(analysis)
        db.commit()
        logger.info(f"Deleted dataset: {file_id}")
        return {"message": "Dataset deleted successfully", "id": file_id}
    except Exception as e:
        logger.error(f"Delete error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete dataset")


def run_analysis_pipeline(file_id: str, file_path: str):
    """Pipeline principal de análisis - se ejecuta en background."""
    db = SessionLocal()
    analysis = None

    try:
        analysis = db.get(DatasetAnalysis, file_id)
        if not analysis:
            logger.error(f"Analysis record not found for {file_id}")
            return

        logger.info(f"Starting analysis pipeline for {file_id}")

        # 1. Procesar el dataset
        result = process_dataset(file_path)
        if result is None:
            raise ValueError("process_dataset returned None")

        logger.info(f"Dataset processed successfully. Shape: {result.get('summary', {}).get('total_rows')} rows")

        # === DEBUG FUERTE - INSIGHTS ===
        logger.info("=== INICIANDO GENERACIÓN DE INSIGHTS ===")
        insights = generate_business_insights(result)
        
        logger.info(f"Tipo de insights: {type(insights)}")
        logger.info(f"Longitud del texto: {len(insights) if isinstance(insights, str) else 'No es string'}")
        if isinstance(insights, str) and len(insights) > 100:
            logger.info(f"Primeros 300 caracteres: {insights[:300]}...")
        else:
            logger.info(f"Contenido completo: {insights}")
        
        result["business_insights"] = insights
        logger.info("=== FIN DE GENERACIÓN DE INSIGHTS ===")

        # 3. Guardar resultado
        analysis.status = "completed"
        analysis.analysis_result = make_json_serializable(result)
        analysis.error = None

        db.commit()
        logger.info(f"✅ Pipeline completed successfully for {file_id}")

    except Exception as e:
        logger.error(f"❌ Pipeline failed for {file_id}: {e}", exc_info=True)

        if analysis:
            analysis.status = "failed"
            analysis.error = str(e)
            db.commit()
        else:
            try:
                analysis = db.get(DatasetAnalysis, file_id)
                if analysis:
                    analysis.status = "failed"
                    analysis.error = str(e)
                    db.commit()
            except Exception as inner_e:
                logger.error(f"Could not update failed status: {inner_e}")

    finally:
        db.close()
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Cleaned up temporary file: {file_path}")


@router.get("/{file_id}/export/{format}")
async def export_report(file_id: str, format: str, db: Session = Depends(get_db)):
    analysis = db.get(DatasetAnalysis, file_id)
    if not analysis or analysis.status != "completed":
        raise HTTPException(status_code=404, detail="Analysis not ready or not found")

    try:
        if format == "pdf":
            report_bytes = generate_pdf_report({"result": analysis.analysis_result})
            media_type = "application/pdf"
        elif format == "pptx":
            report_bytes = generate_pptx_report({"result": analysis.analysis_result})
            media_type = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        else:
            raise HTTPException(status_code=400, detail="Invalid format. Use 'pdf' or 'pptx'.")

        if not report_bytes:
            raise HTTPException(status_code=500, detail=f"Failed to generate {format} report")

        return Response(
            content=report_bytes,
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename=report_{file_id[:8]}.{format}"}
        )
    except Exception as e:
        logger.error(f"Export error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate {format} report")


@router.post("/{file_id}/chat")
async def chat_dataset(file_id: str, question: str, db: Session = Depends(get_db)):
    analysis = db.get(DatasetAnalysis, file_id)
    if not analysis or analysis.status != "completed":
        raise HTTPException(status_code=404, detail="Analysis not ready")

    result = analysis.analysis_result or {}
    sample_data = result.get("sample_data", [])

    try:
        answer = chat_with_dataset(question, result, sample_data)
        return {"question": question, "answer": answer}
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="AI failed to respond")
