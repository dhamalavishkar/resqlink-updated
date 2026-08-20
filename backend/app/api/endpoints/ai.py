"""
AI endpoints for briefing generation and other AI services.
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
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
        "internet_available": true,
        "template_type": "general"  // Optional: general, fire, flood, earthquake
    }
    """
    try:
        logger.info("Received briefing generation request")

        # Extract template type if provided, default to general
        template_type = data.get("template_type", "general")

        # Create briefing service with specific template type
        template_briefing_service = BriefingService(template_type=template_type)

        briefing = await template_briefing_service.generate_briefing(data)
        return {"briefing": briefing, "generated_at": data.get("timestamp"), "template_type": template_type}
    except Exception as e:
        logger.error(f"Error generating briefing: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate briefing")

@router.get("/briefing/status")
async def ai_status():
    """Get status of AI services."""
    return {
        "provider": "MockAIProvider" if settings.DEMO_MODE or not settings.GEMINI_API_KEY else "RealProvider",
        "demo_mode": settings.DEMO_MODE,
        "status": "operational"
    }

@router.get("/briefing/templates")
async def get_briefing_templates():
    """Get available briefing templates."""
    # Import here to avoid circular imports
    from app.services.briefing import BriefingService
    service = BriefingService()
    return {
        "templates": service.templates,
        "default_template": "general"
    }

@router.post("/briefing/template/{template_type}")
async def set_briefing_template(template_type: str):
    """Set the default briefing template."""
    from app.services.briefing import BriefingService
    if template_type not in BriefingService().templates:
        raise HTTPException(status_code=400, detail=f"Template '{template_type}' not available")

    # In a real implementation, this would update a configuration or user preference
    # For now, we'll just validate the template exists
    return {
        "message": f"Template '{template_type}' is available for use",
        "available_templates": list(BriefingService().templates.keys())
    }

@router.get("/briefing/version")
async def get_briefing_version():
    """Get current briefing version information."""
    from app.services.briefing import BriefingService
    service = BriefingService()
    return {
        "version": service.briefing_version,
        "template_type": service.template_type
    }