import os
import io
import uuid
import logging
from typing import Optional
import numpy as np
import pandas as pd
from fastapi import APIRouter, BackgroundTasks, File, HTTPException, Query, UploadFile, Depends
from sqlalchemy import desc
from sqlalchemy.orm import Session
from app.db.database import DatasetAnalysis, SessionLocal, get_db
from app.services.data_pipeline import process_dataset
from app.services.agent_reasoning import generate_insights as generate_business_insights

logger = logging.getLogger(__name__)
router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def make_json_serializable(obj):
    if obj is None: return None
    if isinstance(obj, dict): return {str(k): make_json_serializable(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple, np.ndarray)): return [make_json_serializable(i) for i in obj]
    if isinstance(obj, (np.integer, int)): return int(obj)
    if isinstance(obj, (np.floating, float)): return float(obj) if not (pd.isna(obj) or np.isinf(obj)) else None
    if pd.isna(obj): return None
    if hasattr(obj, "isoformat"): return obj.isoformat()
    return str(obj)

@router.get("/")
async def list_datasets(
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[str] = Query(None, regex="^(processing|completed|failed)$"),
    db: Session = Depends(get_db)
):
    """Listar todos los datasets con filtros opcionales."""
    query = db.query(DatasetAnalysis)
    
    if status:
        query = query.filter(DatasetAnalysis.status == status)
    
    analyses = query.order_by(desc(DatasetAnalysis.created_at)).limit(limit).all()
    
    return [
        {
            "id": a.id,
            "filename": a.filename,
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "data_quality_score": a.analysis_result.get("summary", {}).get("data_quality_score") if a.analysis_result else None,
            "summary": {
                "total_rows": a.analysis_result.get("summary", {}).get("total_rows") if a.analysis_result else None,
                "total_columns": a.analysis_result.get("summary", {}).get("total_columns") if a.analysis_result else None,
            } if a.analysis_result else None
        }
        for a in analyses
    ]

@router.post("/upload")
async def upload_dataset(background_tasks: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_db)):
    # 1. Generar ID y guardar archivo físico primero
    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    
    content = await file.read()
    with open(file_path, "wb") as buffer:
        buffer.write(content)

    # 2. Forzar inserción en DB y cerrar sesión para asegurar persistencia física
    try:
        new_analysis = DatasetAnalysis(id=file_id, filename=file.filename, status="processing")
        db.add(new_analysis)
        db.commit()
        db.refresh(new_analysis)
        logger.info(f"+++ PERSISTIDO EXITOSAMENTE: {file_id}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error persistiendo dataset: {e}")
        raise HTTPException(status_code=500, detail="Database save failed")

    # 3. Lanzar tarea en segundo plano
    background_tasks.add_task(run_analysis_pipeline, file_id, file_path)
    
    return {"id": file_id, "status": "processing"}

@router.get("/{file_id}")
async def get_analysis(file_id: str, db: Session = Depends(get_db)):
    # Búsqueda directa sin filtros raros
    analysis = db.query(DatasetAnalysis).get(file_id)
    
    if not analysis:
        # Intento de re-búsqueda por si SQLite está lento
        db.expire_all()
        analysis = db.query(DatasetAnalysis).filter(DatasetAnalysis.id == file_id).first()
        
    if not analysis:
        logger.error(f"--- 404 CRÍTICO: {file_id} no existe en DB")
        raise HTTPException(status_code=404, detail=f"Dataset {file_id} not found in database.")
    
    return {
        "id": analysis.id, 
        "status": analysis.status, 
        "result": analysis.analysis_result, 
        "filename": analysis.filename
    }

def run_analysis_pipeline(file_id: str, file_path: str):
    db = SessionLocal()
    try:
        result = process_dataset(file_path)
        insights = generate_business_insights(result)
        result["business_insights"] = insights
        
        analysis = db.query(DatasetAnalysis).get(file_id)
        if analysis:
            analysis.status = "completed"
            analysis.analysis_result = make_json_serializable(result)
            db.commit()
            logger.info(f"✓ PROCESADO OK: {file_id}")
    except Exception as e:
        logger.error(f"X FALLÓ PIPELINE: {e}")
        analysis = db.query(DatasetAnalysis).get(file_id)
        if analysis:
            analysis.status = "failed"
            analysis.error = str(e)
            db.commit()
    finally:
        db.close()