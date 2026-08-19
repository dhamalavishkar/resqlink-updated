"""
Application configuration module.
"""
from pydantic import BaseSettings, Field
from typing import List, Union
import secrets

class Settings(BaseSettings):
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "ResQLink"

    # Security
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = []

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # GenAI
    GEMINI_API_KEY: Union[str, None] = None
    OPENAI_API_KEY: Union[str, None] = None

    # Demo mode
    DEMO_MODE: bool = False

    # Mesh networking (for demo)
    MESH_SIGNALING_SERVER: str = "http://localhost:3001"
    MESH_ROOM_CODE_LENGTH: int = 6

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()