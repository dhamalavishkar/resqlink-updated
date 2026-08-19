"""
AI Briefing service for generating situation reports.
"""
from typing import Dict, Any
from app.services.ai_provider import AIProvider, MockAIProvider
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class BriefingService:
    """Service for generating AI-powered situation briefings."""

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        """
        Initialize the briefing service.

        Args:
            ai_provider: AI provider to use. If None, uses mock provider.
        """
        if ai_provider is None:
            # Use mock provider in demo mode or when no API keys are available
            if settings.DEMO_MODE or not (settings.GEMINI_API_KEY or settings.OPENAI_API_KEY):
                self.provider = MockAIProvider()
                logger.info("Briefing service initialized with MockAIProvider")
            else:
                # In production, we would initialize real providers here
                # For now, fall back to mock for safety
                self.provider = MockAIProvider()
                logger.warning("No AI provider configured, using MockAIProvider")
        else:
            self.provider = ai_provider

    async def generate_briefing(self, data: Dict[str, Any]) -> str:
        """
        Generate a situation briefing from the provided data.

        Args:
            data: Dictionary containing all relevant data for the briefing

        Returns:
            Generated briefing as a string
        """
        try:
            logger.info("Generating situation briefing")
            briefing = await self.provider.generate_briefing(data)
            logger.info("Situation briefing generated successfully")
            return briefing
        except Exception as e:
            logger.error(f"Error generating briefing: {e}")
            # Fallback to a basic briefing
            return self._generate_fallback_briefing(data)

    def _generate_fallback_briefing(self, data: Dict[str, Any]) -> str:
        """Generate a basic fallback briefing when AI fails."""
        zones = data.get('zones', [])
        critical_zones = [z for z in zones if z.get('risk_score', 0) >= 80]

        return f"""
**SITUATION BRIEFING - RESQLINK**
Generated at: {data.get('timestamp', 'Unknown')}

**1. SITUATION SUMMARY**
{len(zones)} zones analyzed, {len(critical_zones)} critical zones identified.
Automatic briefing generation temporarily unavailable - showing basic status.

**2. CRITICAL ZONES**
{chr(10).join([f"- Zone {z.get('name', 'Unknown')}: Risk Score {z.get('risk_score', 0)}" for z in critical_zones[:5]]) if critical_zones else "- No critical zones identified"}

**3. RECOMMENDATION**
Please consult with emergency response personnel for detailed analysis and recommendations.

**NOTE: This is a fallback briefing generated due to AI service unavailability.**
""".strip()