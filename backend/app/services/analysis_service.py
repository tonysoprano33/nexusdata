import pandas as pd
import uuid
from typing import Optional, Dict, Any
from app.services.gemini_service import GeminiService
from app.services.groq_service import GroqService
from app.db.supabase import get_supabase_db
import logging
import io
import traceback

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
        logger.info(f"[ANALYSIS] Starting upload_and_analyze for {filename} with {provider}")
        
        # Get Supabase instance
        db = get_supabase_db()
        logger.info(f"[ANALYSIS] Supabase client: {db.client is not None}")
        
        # Generate unique ID
        analysis_id = str(uuid.uuid4())
        logger.info(f"[ANALYSIS] Generated ID: {analysis_id}")
        
        # Create record in Supabase (if configured)
        if db.client:
            record = await db.create_analysis(analysis_id, filename)
            if not record:
                raise ValueError("Failed to create analysis record")
            logger.info(f"[ANALYSIS] Supabase record created")
        else:
            record = {"id": analysis_id, "filename": filename, "status": "pending"}
            logger.info(f"[ANALYSIS] No Supabase, using local record")
        
        try:
            # Parse dataset
            logger.info(f"[ANALYSIS] Parsing dataset...")
            df = self._parse_dataset(file_content, filename)
            logger.info(f"[ANALYSIS] Dataset parsed: {len(df)} rows, {len(df.columns)} cols")
            
            # Update status to processing (if Supabase configured)
            if db.client:
                await db.update_analysis_status(analysis_id, "processing")
            
            # Perform analysis with fallback
            result = None
            fallback_used = False
            
            try:
                if provider == "gemini":
                    if not self.gemini.is_available():
                        raise ValueError("Gemini service not available")
                    result = await self.gemini.analyze_dataset(df, custom_prompt)
                    
                    # Check if Gemini returned an error
                    if result.get("error"):
                        logger.warning(f"Gemini returned error, trying fallback to Groq: {result['error']}")
                        if self.groq.is_available():
                            result = await self.groq.analyze_dataset(df, custom_prompt)
                            fallback_used = True
                            
                elif provider == "groq":
                    if not self.groq.is_available():
                        raise ValueError("Groq service not available")
                    result = await self.groq.analyze_dataset(df, custom_prompt)
                    
                    # Check if Groq returned an error
                    if result.get("error"):
                        logger.warning(f"Groq returned error, trying fallback to Gemini: {result['error']}")
                        if self.gemini.is_available():
                            result = await self.gemini.analyze_dataset(df, custom_prompt)
                            fallback_used = True
                else:
                    raise ValueError(f"Unknown provider: {provider}")
                
                # Check if we still have an error after fallback
                if result.get("error"):
                    raise ValueError(f"All providers failed. Last error: {result['error']}")
                
            except Exception as analysis_error:
                logger.error(f"Analysis failed with {provider}: {analysis_error}")
                # Try fallback provider
                fallback_provider = "groq" if provider == "gemini" else "gemini"
                try:
                    if fallback_provider == "gemini" and self.gemini.is_available():
                        logger.info(f"Trying fallback to Gemini")
                        result = await self.gemini.analyze_dataset(df, custom_prompt)
                        fallback_used = True
                    elif fallback_provider == "groq" and self.groq.is_available():
                        logger.info(f"Trying fallback to Groq")
                        result = await self.groq.analyze_dataset(df, custom_prompt)
                        fallback_used = True
                    else:
                        raise analysis_error
                except Exception as fallback_error:
                    logger.error(f"Fallback also failed: {fallback_error}")
                    raise analysis_error
            
            # Clean result for JSON serialization
            clean_result = self._clean_for_json(result)
            
            # Update with results (if Supabase configured)
            if db.client:
                await db.update_analysis_status(
                    analysis_id, 
                    "completed", 
                    clean_result
                )
            
            response = {
                "id": analysis_id,
                "status": "completed",
                "result": clean_result
            }
            
            if fallback_used:
                response["fallback_used"] = True
                response["original_provider"] = provider
            
            logger.info(f"[ANALYSIS] SUCCESS - ID: {analysis_id}, insights length: {len(result.get('insights', ''))}")
            return response
            
        except Exception as e:
            logger.error(f"[ANALYSIS] FAILED: {e}")
            logger.error(traceback.format_exc())
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
    
    def _clean_for_json(self, obj):
        """Clean NaN/Inf values for JSON serialization."""
        import math
        if isinstance(obj, dict):
            return {k: self._clean_for_json(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self._clean_for_json(v) for v in obj]
        elif isinstance(obj, float):
            if math.isnan(obj) or math.isinf(obj):
                return None
            return obj
        return obj
    
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
    
    async def delete_analysis(self, analysis_id: str) -> bool:
        """Delete an analysis by ID."""
        db = get_supabase_db()
        if not db.client:
            return False
        return await db.delete_analysis(analysis_id)
    
    async def delete_all_analyses(self) -> int:
        """Delete all analyses. Returns count of deleted items."""
        db = get_supabase_db()
        if not db.client:
            return 0
        return await db.delete_all_analyses()
