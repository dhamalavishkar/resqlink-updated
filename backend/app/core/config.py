"""
Application configuration module.
"""
from pydantic import Field
from pydantic_settings import BaseSettings
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

    # Custom YOLO Model (Phase 3)
    CUSTOM_YOLO_MODEL_PATH: Union[str, None] = None
    YOLO_CONFIDENCE_THRESHOLD: float = 0.5
    DISASTER_CLASS_WEIGHTS: dict = {
        "person": 1.0,      # Survivors
        "fire": 0.9,        # Fire detection
        "smoke": 0.8,       # Smoke indication
        "car": 0.7,         # Vehicles
        "truck": 0.8,       # Emergency vehicles
        "bus": 0.7,         # Transport
        "motorbike": 0.6,   # Personal transport
        "bicycle": 0.6,     # Personal transport
        "dog": 0.5,         # Animals
        "cat": 0.5,         # Animals
        "knife": 0.4,       # Weapons
        "gun": 0.4,         # Weapons
    }

    # Demo mode
    DEMO_MODE: bool = False

    # Risk Calculation Weights (Phase 3)
    RISK_TEMPORAL_DECAY_HOURS: float = 24.0
    RISK_CALCULATION_WEIGHTS: dict = {
        'survivor': 0.25,      # Weight for survivor factor
        'fire': 0.20,          # Weight for fire factor
        'damage': 0.15,        # Weight for structural damage factor
        'report': 0.15,        # Weight for report factor
        'population': 0.10,    # Weight for population density factor
        'accessibility': 0.05, # Weight for accessibility factor
        'recency': 0.10        # Weight for recency factor
    }
    ENVIRONMENTAL_FACTOR_WEIGHTS: dict = {
        'precipitation': 0.15,    # Rainfall increases flood/landslide risk
        'wind_speed': 0.10,       # High winds increase fire spread and structural risk
        'temperature': 0.05,      # Extreme temperatures affect survival and equipment
        'humidity': 0.05,         # Affects fire risk and comfort
        'infrastructure_vulnerability': 0.2  # Building age, materials, etc.
    }

    # Mesh networking (for demo)
    MESH_SIGNALING_SERVER: str = "http://localhost:3001"
    MESH_ROOM_CODE_LENGTH: int = 6

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()