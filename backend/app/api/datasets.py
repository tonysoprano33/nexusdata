import os
import uuid
from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, File, HTTPException, Query, UploadFile
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.db.database import DatasetAnalysis, SessionLocal
from app.services.data_pipeline import process_dataset
from app.services.agent_reasoning import generate_business_insights
from app.services.pdf_generator import generate_pdf_report
from app.services.pptx_generator import generate_pptx_report
from app.services.chat_service import chat_with_dataset, generate_sample_questions

router = APIRouter()

UPLOAD_DIR = "/tmp/uploads" if os.environ.get("VERCEL") else "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/")
async def list_analyses(
    status: str | None = Query(default=None),
    from_date: str | None = Query(default=None),
    to_date: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
):
    db: Session = SessionLocal()
    try:
        parsed_from_date = None
        parsed_to_date = None
        try:
            parsed_from_date = datetime.fromisoformat(from_date) if from_date else None
            parsed_to_date = datetime.fromisoformat(to_date) if to_date else None
        except ValueError as exc:
            raise HTTPException(
                status_code=400,
                detail="Invalid date format. Use ISO-8601 (e.g. 2026-04-13T12:00:00).",
            ) from exc

        query = db.query(DatasetAnalysis)
        if status:
            query = query.filter(DatasetAnalysis.status == status)
        if parsed_from_date:
            query = query.filter(DatasetAnalysis.created_at >= parsed_from_date)
        if parsed_to_date:
            query = query.filter(DatasetAnalysis.created_at <= parsed_to_date)

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
            }
            for row in records
        ]
    finally:
        db.close()


@router.post("/upload")
async def upload_dataset(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    db: Session = SessionLocal()
    try:
        db.add(DatasetAnalysis(id=file_id, filename=file.filename, status="processing"))
        db.commit()
    finally:
        db.close()

    if os.environ.get("VERCEL"):
        run_analysis_pipeline(file_id, file_path)

        db = SessionLocal()
        try:
            analysis = db.get(DatasetAnalysis, file_id)
            if not analysis:
                raise HTTPException(status_code=500, detail="Analysis could not be stored.")

            payload = {
                "id": file_id,
                "status": analysis.status,
                "message": "Dataset uploaded and analyzed successfully.",
                "result": analysis.analysis_result,
            }
            if analysis.error:
                payload["error"] = analysis.error
            return payload
        finally:
            db.close()

    background_tasks.add_task(run_analysis_pipeline, file_id, file_path)
    return {
        "id": file_id,
        "status": "processing",
        "message": "Dataset uploaded successfully and is being processed.",
    }


@router.get("/{file_id}")
async def get_analysis(file_id: str):
    db: Session = SessionLocal()
    try:
        analysis = db.get(DatasetAnalysis, file_id)
    finally:
        db.close()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found or expired.")

    payload = {
        "id": analysis.id,
        "status": analysis.status,
        "result": analysis.analysis_result,
    }
    if analysis.error:
        payload["error"] = analysis.error
    return payload


def run_analysis_pipeline(file_id: str, file_path: str):
    db: Session = SessionLocal()
    try:
        result = process_dataset(file_path)
        insights = generate_business_insights(result)
        result["business_insights"] = insights

        analysis = db.get(DatasetAnalysis, file_id)
        if analysis:
            analysis.status = "completed"
            analysis.analysis_result = result
            analysis.error = None
            db.commit()
    except Exception as e:
        analysis = db.get(DatasetAnalysis, file_id)
        if analysis:
            analysis.status = "failed"
            analysis.error = str(e)
            db.commit()
    finally:
        db.close()


@router.get("/{file_id}/export/pdf")
async def export_pdf(file_id: str):
    """Exporta el análisis completo como PDF"""
    db: Session = SessionLocal()
    try:
        analysis = db.get(DatasetAnalysis, file_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        if analysis.status != "completed":
            raise HTTPException(status_code=400, detail="Analysis not completed yet")
        
        # Generar PDF
        pdf_bytes = generate_pdf_report({"result": analysis.analysis_result})
        
        if pdf_bytes is None:
            raise HTTPException(status_code=500, detail="PDF generation failed. Install reportlab.")
        
        from fastapi.responses import Response
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=reporte_{file_id[:8]}.pdf"
            }
        )
    finally:
        db.close()


@router.get("/{file_id}/export/pptx")
async def export_pptx(file_id: str):
    """Exporta el análisis completo como PowerPoint"""
    db: Session = SessionLocal()
    try:
        analysis = db.get(DatasetAnalysis, file_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        if analysis.status != "completed":
            raise HTTPException(status_code=400, detail="Analysis not completed yet")
        
        # Generar PowerPoint
        pptx_bytes = generate_pptx_report({"result": analysis.analysis_result})
        
        if pptx_bytes is None:
            raise HTTPException(status_code=500, detail="PowerPoint generation failed. Install python-pptx.")
        
        from fastapi.responses import Response
        return Response(
            content=pptx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            headers={
                "Content-Disposition": f"attachment; filename=reporte_{file_id[:8]}.pptx"
            }
        )
    finally:
        db.close()


@router.post("/{file_id}/chat")
async def chat_dataset(file_id: str, question: str = Query(..., description="Pregunta sobre el dataset")):
    """
    Chat con el dataset - hacer preguntas en lenguaje natural
    """
    db: Session = SessionLocal()
    try:
        analysis = db.get(DatasetAnalysis, file_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        if analysis.status != "completed":
            raise HTTPException(status_code=400, detail="Analysis not completed yet")
        
        result = analysis.analysis_result or {}
        
        # Extraer muestra de datos si existe
        sample_data = result.get('sample_data', [])
        
        # Generar respuesta
        answer = chat_with_dataset(question, result, sample_data)
        
        return {
            "question": question,
            "answer": answer,
            "dataset_id": file_id
        }
    finally:
        db.close()


@router.get("/{file_id}/chat/questions")
async def get_sample_questions(file_id: str):
    """
    Obtener preguntas de ejemplo para el dataset
    """
    db: Session = SessionLocal()
    try:
        analysis = db.get(DatasetAnalysis, file_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        if analysis.status != "completed":
            raise HTTPException(status_code=400, detail="Analysis not completed yet")
        
        result = analysis.analysis_result or {}
        questions = generate_sample_questions(result)
        
        return {
            "questions": questions,
            "dataset_id": file_id
        }
    finally:
        db.close()
