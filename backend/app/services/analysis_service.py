import pandas as pd
import uuid
from typing import Optional, Dict, Any
from app.services.gemini_service import GeminiService
from app.services.groq_service import GroqService
from app.db.supabase import get_supabase_db, supabase_db
import logging
import io

logger = logging.getLogger(__name__)


class AnalysisService:
    """Service for orchestrating dataset analysis."""
    
    def __init__(self):
        self.gemini = GeminiService()
        self.groq = GroqService()
    
    async def upload_and_analyze(
        self,
        file_content: bytes,
        filename: str,
        provider: str = "gemini",
        custom_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Upload a dataset and perform analysis."""
        
        # Get Supabase instance
        db = get_supabase_db()
        
        # Check if Supabase is configured
        if not db.client:
            logger.warning("Supabase not configured, analysis will not be persisted")
        
        # Generate unique ID
        analysis_id = str(uuid.uuid4())
        
        # Create record in Supabase (if configured)
        if db.client:
            record = await db.create_analysis(analysis_id, filename)
            if not record:
                raise ValueError("Failed to create analysis record")
        else:
            record = {"id": analysis_id, "filename": filename, "status": "pending"}
        
        try:
            # Parse dataset
            df = self._parse_dataset(file_content, filename)
            
            # Update status to processing (if Supabase configured)
            if db.client:
                await db.update_analysis_status(analysis_id, "processing")
            
            # Perform analysis
            if provider == "gemini":
                if not self.gemini.is_available():
                    raise ValueError("Gemini service not available")
                result = await self.gemini.analyze_dataset(df, custom_prompt)
            elif provider == "groq":
                if not self.groq.is_available():
                    raise ValueError("Groq service not available")
                result = await self.groq.analyze_dataset(df, custom_prompt)
            else:
                raise ValueError(f"Unknown provider: {provider}")
            
            # Update with results (if Supabase configured)
            if db.client:
                await db.update_analysis_status(
                    analysis_id, 
                    "completed", 
                    result
                )
            
            return {
                "id": analysis_id,
                "status": "completed",
                "result": result
            }
            
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            if db.client:
                await db.update_analysis_status(analysis_id, "failed")
            raise
    
    async def get_analysis(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        """Get analysis by ID."""
        db = get_supabase_db()
        if not db.client:
            return None
        return await db.get_analysis(analysis_id)
    
    async def list_analyses(self, limit: int = 100) -> list:
        """List all analyses."""
        db = get_supabase_db()
        if not db.client:
            return []
        return await db.list_analyses(limit)
    
    def _parse_dataset(self, file_content: bytes, filename: str) -> pd.DataFrame:
        """Parse dataset from file content."""
        try:
            if filename.endswith('.csv'):
                return pd.read_csv(io.BytesIO(file_content))
            elif filename.endswith(('.xlsx', '.xls')):
                return pd.read_excel(io.BytesIO(file_content))
            elif filename.endswith('.json'):
                return pd.read_json(io.BytesIO(file_content))
            else:
                raise ValueError(f"Unsupported file format: {filename}")
        except Exception as e:
            logger.error(f"Error parsing dataset: {e}")
            raise ValueError(f"Failed to parse dataset: {e}")
    
    def get_available_providers(self) -> Dict[str, bool]:
        """Get available AI providers."""
        return {
            "gemini": self.gemini.is_available(),
            "groq": self.groq.is_available()
        }
