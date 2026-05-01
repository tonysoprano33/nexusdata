from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any, Dict, List, Optional

from app.core.config import get_settings

try:
    from supabase import Client, create_client
except ImportError:  # pragma: no cover - optional dependency
    Client = Any  # type: ignore[assignment]
    create_client = None

logger = logging.getLogger(__name__)


class SupabaseDB:
    """Persistence layer with Supabase first and local JSON fallback."""

    _instance: Optional["SupabaseDB"] = None
    _client: Optional[Client] = None
    _storage_lock = Lock()

    def __new__(cls) -> "SupabaseDB":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if hasattr(self, "_initialized") and self._initialized:
            return

        settings = get_settings()
        self._client = None
        if os.environ.get("VERCEL"):
            self._storage_path = Path("/tmp/analyses.json")
        else:
            self._storage_path = Path(__file__).resolve().parents[2] / "storage" / "analyses.json"
        self._initialized = True

        if create_client and settings.supabase_url and settings.supabase_key:
            try:
                self._client = create_client(settings.supabase_url, settings.supabase_key)
                logger.info("Supabase client initialized")
            except Exception as exc:  # pragma: no cover - network/runtime specific
                logger.warning("Supabase unavailable, switching to local storage: %s", exc)
        else:
            logger.info("Supabase not configured, using local storage")

        self._ensure_storage()

    @property
    def client(self) -> Optional[Client]:
        """Expose the live Supabase client when available."""
        return self._client

    def _ensure_storage(self) -> None:
        self._storage_path.parent.mkdir(parents=True, exist_ok=True)
        if not self._storage_path.exists():
            self._storage_path.write_text("{}", encoding="utf-8")

    def _utcnow(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def _read_records(self) -> Dict[str, Dict[str, Any]]:
        self._ensure_storage()
        with self._storage_lock:
            raw = self._storage_path.read_text(encoding="utf-8").strip() or "{}"
            try:
                data = json.loads(raw)
                if isinstance(data, dict):
                    return data
            except json.JSONDecodeError:
                logger.warning("Local storage file was corrupted. Resetting %s", self._storage_path)
        return {}

    def _write_records(self, records: Dict[str, Dict[str, Any]]) -> None:
        self._ensure_storage()
        with self._storage_lock:
            self._storage_path.write_text(
                json.dumps(records, ensure_ascii=True, indent=2),
                encoding="utf-8",
            )

    async def create_analysis(self, analysis_id: str, filename: str) -> Optional[Dict[str, Any]]:
        """Create a new dataset analysis record."""
        if self._client:
            try:
                result = self._client.table("dataset_analyses").insert(
                    {
                        "id": analysis_id,
                        "filename": filename,
                        "status": "pending",
                        "analysis_result": {},
                    }
                ).execute()
                return result.data[0] if result.data else None
            except Exception as exc:
                logger.warning("Supabase create failed, falling back locally: %s", exc)

        now = self._utcnow()
        record = {
            "id": analysis_id,
            "filename": filename,
            "status": "pending",
            "analysis_result": {},
            "created_at": now,
            "updated_at": now,
        }
        records = self._read_records()
        records[analysis_id] = record
        self._write_records(records)
        return record

    async def get_analysis(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        """Get analysis by ID."""
        if self._client:
            try:
                result = self._client.table("dataset_analyses").select("*").eq("id", analysis_id).execute()
                if result.data:
                    return result.data[0]
            except Exception as exc:
                logger.warning("Supabase get failed, checking local storage: %s", exc)

        return self._read_records().get(analysis_id)

    async def update_analysis_status(
        self,
        analysis_id: str,
        status: str,
        result: Optional[Dict[str, Any]] = None,
    ) -> bool:
        """Update analysis status and optionally result."""
        if self._client:
            try:
                update_data = {"status": status}
                if result is not None:
                    update_data["analysis_result"] = result
                self._client.table("dataset_analyses").update(update_data).eq("id", analysis_id).execute()
                return True
            except Exception as exc:
                logger.warning("Supabase update failed, updating local storage: %s", exc)

        records = self._read_records()
        if analysis_id not in records:
            return False

        records[analysis_id]["status"] = status
        records[analysis_id]["updated_at"] = self._utcnow()
        if result is not None:
            records[analysis_id]["analysis_result"] = result
        self._write_records(records)
        return True

    async def list_analyses(self, limit: int = 100) -> List[Dict[str, Any]]:
        """List all analyses ordered by recency."""
        if self._client:
            try:
                result = (
                    self._client.table("dataset_analyses")
                    .select("*")
                    .order("created_at", desc=True)
                    .limit(limit)
                    .execute()
                )
                return result.data or []
            except Exception as exc:
                logger.warning("Supabase list failed, using local storage: %s", exc)

        records = list(self._read_records().values())
        records.sort(key=lambda item: item.get("created_at", ""), reverse=True)
        return records[:limit]

    async def delete_analysis(self, analysis_id: str) -> bool:
        """Delete an analysis by ID."""
        if self._client:
            try:
                result = self._client.table("dataset_analyses").delete().eq("id", analysis_id).execute()
                if result.data:
                    return True
            except Exception as exc:
                logger.warning("Supabase delete failed, deleting locally: %s", exc)

        records = self._read_records()
        existed = analysis_id in records
        if existed:
            records.pop(analysis_id, None)
            self._write_records(records)
        return existed

    async def delete_all_analyses(self) -> int:
        """Delete all analyses. Returns the number of deleted items."""
        if self._client:
            try:
                count_result = self._client.table("dataset_analyses").select("id", count="exact").execute()
                count = count_result.count if hasattr(count_result, "count") else 0
                result = self._client.table("dataset_analyses").delete().neq("id", "").execute()
                return len(result.data) if result.data else count
            except Exception as exc:
                logger.warning("Supabase bulk delete failed, deleting locally: %s", exc)

        records = self._read_records()
        count = len(records)
        self._write_records({})
        return count


_supabase_db_instance: Optional[SupabaseDB] = None


def get_supabase_db() -> SupabaseDB:
    """Get or create the persistence client."""
    global _supabase_db_instance
    if _supabase_db_instance is None:
        _supabase_db_instance = SupabaseDB()
    return _supabase_db_instance
