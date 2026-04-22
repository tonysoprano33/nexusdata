from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class AnalysisStatus(str, Enum):
    """Status of dataset analysis."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class DatasetAnalysisCreate(BaseModel):
    """Schema for creating a new dataset analysis."""
    filename: str
    id: str


class DatasetAnalysisResponse(BaseModel):
    """Schema for dataset analysis response."""
    id: str
    filename: str
    status: AnalysisStatus
    analysis_result: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AnalysisRequest(BaseModel):
    """Schema for requesting dataset analysis."""
    dataset_id: str
    provider: str = "gemini"  # "gemini" or "groq"
    prompt: Optional[str] = None


class AnalysisResult(BaseModel):
    """Schema for analysis result."""
    insights: str
    summary: str
    recommendations: List[str]
    statistics: Dict[str, Any]


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    version: str = "1.0.0"
