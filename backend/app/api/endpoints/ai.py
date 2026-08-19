"""
AI endpoints for briefing generation and other AI services.
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from app.services.briefing import BriefingService
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services
briefing_service = BriefingService()

@router.post("/briefing")
async def generate_briefing(data: Dict[str, Any]):
    """
    Generate an AI-powered situation briefing from provided data.

    Expected data format:
    {
        "zones": [...],
        "reports": [...],
        "detections": [...],
        "resources": [...],
        "mesh_status": {...},
        "timestamp": "ISO timestamp",
        "internet_available": true
    }
    """
    try:
        logger.info("Received briefing generation request")
        briefing = await briefing_service.generate_briefing(data)
        return {"briefing": briefing, "generated_at": data.get("timestamp")}
    except Exception as e:
        logger.error(f"Error generating briefing: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate briefing")

@router.get("/briefing/status")
async def ai_status():
    """Get status of AI services."""
    return {
        "provider": "MockAIProvider" if settings.DEMO_MODE or not (settings.GEMINI_API_KEY or settings.OPENAI_API_KEY) else "RealProvider",
        "demo_mode": settings.DEMO_MODE,
        "status": "operational"
    }