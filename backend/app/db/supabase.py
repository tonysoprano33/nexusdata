from supabase import create_client, Client
from app.core.config import get_settings
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class SupabaseDB:
    """Supabase database client and operations."""
    
    _instance: Optional['SupabaseDB'] = None
    _client: Optional[Client] = None
    
    def __new__(cls) -> 'SupabaseDB':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            settings = get_settings()
            if settings.supabase_url and settings.supabase_key:
                self._client = create_client(
                    settings.supabase_url,
                    settings.supabase_key
                )
                logger.info("Supabase client initialized")
            else:
                logger.warning("Supabase credentials not configured")
    
    @property
    def client(self) -> Optional[Client]:
        """Get Supabase client."""
        return self._client
    
    async def create_analysis(self, analysis_id: str, filename: str) -> Optional[Dict[str, Any]]:
        """Create a new dataset analysis record."""
        if not self._client:
            logger.error("Supabase client not initialized")
            return None
        
        try:
            result = self._client.table("dataset_analyses").insert({
                "id": analysis_id,
                "filename": filename,
                "status": "pending",
                "analysis_result": {}
            }).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error creating analysis: {e}")
            return None
    
    async def get_analysis(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        """Get analysis by ID."""
        if not self._client:
            return None
        
        try:
            result = self._client.table("dataset_analyses").select("*").eq("id", analysis_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting analysis: {e}")
            return None
    
    async def update_analysis_status(
        self, 
        analysis_id: str, 
        status: str, 
        result: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Update analysis status and optionally result."""
        if not self._client:
            return False
        
        try:
            update_data = {"status": status}
            if result:
                update_data["analysis_result"] = result
            
            self._client.table("dataset_analyses").update(update_data).eq("id", analysis_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error updating analysis: {e}")
            return False
    
    async def list_analyses(self, limit: int = 100) -> List[Dict[str, Any]]:
        """List all analyses."""
        if not self._client:
            return []
        
        try:
            result = self._client.table("dataset_analyses").select("*").order("created_at", desc=True).limit(limit).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error listing analyses: {e}")
            return []


# Global instance (lazy initialization)
_supabase_db_instance: Optional[SupabaseDB] = None

def get_supabase_db() -> SupabaseDB:
    """Get or create SupabaseDB instance."""
    global _supabase_db_instance
    if _supabase_db_instance is None:
        _supabase_db_instance = SupabaseDB()
    return _supabase_db_instance

# Backwards compatibility
supabase_db = get_supabase_db()
