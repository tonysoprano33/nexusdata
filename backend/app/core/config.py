from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application configuration settings."""
    
    # Supabase
    supabase_url: str = ""
    supabase_key: str = ""
    
    # AI API Keys
    gemini_api_key: str = ""
    groq_api_key: str = ""
    
    # Application
    app_env: str = "development"
    log_level: str = "info"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
