"""
AI Briefing service for generating situation reports.
"""
from typing import Dict, Any, Optional, List
from datetime import datetime
from app.services.ai_provider import AIProvider, MockAIProvider
from app.services.gemini_provider import GeminiAIProvider
from app.core.config import settings
import logging
import json

logger = logging.getLogger(__name__)

class BriefingService:
    """Service for generating AI-powered situation briefings."""

    def __init__(self, ai_provider: Optional[AIProvider] = None, template_type: str = "general"):
        """
        Initialize the briefing service.

        Args:
            ai_provider: AI provider to use. If None, uses mock provider.
            template_type: Type of briefing template to use (general, fire, flood, earthquake, etc.)
        """
        if ai_provider is None:
            # Use mock provider in demo mode
            if settings.DEMO_MODE:
                self.provider = MockAIProvider()
                logger.info("Briefing service initialized with MockAIProvider (demo mode)")
            # Use Gemini provider if API key is available
            elif settings.GEMINI_API_KEY:
                try:
                    self.provider = GeminiAIProvider(settings.GEMINI_API_KEY)
                    logger.info("Briefing service initialized with GeminiAIProvider")
                except Exception as e:
                    logger.error(f"Failed to initialize GeminiAIProvider: {e}")
                    logger.warning("Falling back to MockAIProvider")
                    self.provider = MockAIProvider()
            else:
                # No API key and not in demo mode
                self.provider = MockAIProvider()
                logger.warning("No AI provider configured, using MockAIProvider")
        else:
            self.provider = ai_provider

        self.template_type = template_type
        self.briefing_version = "1.0"
        # Available briefing templates
        self.templates = {
            "general": {
                "name": "General Disaster",
                "sections": [
                    "SITUATION SUMMARY",
                    "CRITICAL INCIDENTS AND ZONES",
                    "SURVIVOR STATUS",
                    "FIRE/STRUCTURAL HAZARDS",
                    "RESOURCE STATUS",
                    "COMMUNICATION STATUS",
                    "RECOMMENDED ACTIONS"
                ]
            },
            "fire": {
                "name": "Fire Emergency",
                "sections": [
                    "SITUATION SUMMARY",
                    "FIRE BEHAVIOR AND SPREAD",
                    "EVACUATION STATUS",
                    "RESOURCE DEPLOYMENT",
                    "WEATHER CONDITIONS",
                    "COMMUNICATION STATUS",
                    "RECOMMENDED ACTIONS"
                ]
            },
            "flood": {
                "name": "Flood Emergency",
                "sections": [
                    "SITUATION SUMMARY",
                    "WATER LEVELS AND TRENDS",
                    "EVACUATION AND RESCUE",
                    "INFRASTRUCTURE IMPACT",
                    "RESOURCE DEPLOYMENT",
                    "COMMUNICATION STATUS",
                    "RECOMMENDED ACTIONS"
                ]
            },
            "earthquake": {
                "name": "Earthquake Emergency",
                "sections": [
                    "SITUATION SUMMARY",
                    "SEISMIC ACTIVITY AND AFTERSHOCKS",
                    "STRUCTURAL DAMAGE ASSESSMENT",
                    "SURVIVOR STATUS",
                    "RESOURCE DEPLOYMENT",
                    "COMMUNICATION STATUS",
                    "RECOMMENDED ACTIONS"
                ]
            }
        }

    async def generate_briefing(self, data: Dict[str, Any]) -> str:
        """
        Generate a situation briefing from the provided data.

        Args:
            data: Dictionary containing all relevant data for the briefing

        Returns:
            Generated briefing as a string with version information
        """
        try:
            logger.info(f"Generating situation briefing (template: {self.template_type}, version: {self.briefing_version})")

            # Enhance data with metadata about the briefing
            enhanced_data = data.copy()
            enhanced_data['_briefing_metadata'] = {
                'template_type': self.template_type,
                'version': self.briefing_version,
                'generated_at': datetime.utcnow().isoformat() + 'Z',
                'template_name': self.templates.get(self.template_type, {}).get('name', 'Unknown')
            }

            # Generate the briefing using the AI provider
            briefing = await self.provider.generate_briefing(enhanced_data)

            # Add version header to the briefing
            versioned_briefing = f"[RESQLINK BRIEFING v{self.briefing_version} | {self.template_type.upper()} TEMPLATE]\n\n{briefing}"

            logger.info(f"Situation briefing generated successfully with {self.template_type} template")
            return versioned_briefing
        except Exception as e:
            logger.error(f"Error generating briefing: {e}")
            # Fallback to a basic briefing
            fallback = self._generate_fallback_briefing(data)
            return f"[RESQLINK BRIEFING v{self.briefing_version} | FALLBACK]\n\n{fallback}"

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