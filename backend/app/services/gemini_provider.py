"""
Google Gemini AI provider.
"""
import logging
from typing import Dict, Any, Optional
import google.generativeai as genai
from app.services.ai_provider import AIProvider
from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiAIProvider(AIProvider):
    """Google Gemini AI provider implementation."""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the Gemini provider.

        Args:
            api_key: Google Gemini API key. If None, uses settings.GEMINI_API_KEY
        """
        self.api_key = api_key or settings.GEMINI_API_KEY
        if not self.api_key:
            raise ValueError("Gemini API key is required")
        genai.configure(api_key=self.api_key)
        # Try multiple model names in order of preference
        model_names = [
            'gemini-2.5-pro',
            'gemini-2.5-flash',
            'gemini-flash-latest',
            'gemini-2.5-flash-lite',
        ]
        self.model = None
        last_error = None
        for model_name in model_names:
            try:
                self.model = genai.GenerativeModel(model_name)
                logger.info(f"Successfully initialized Gemini model: {model_name}")
                break
            except Exception as e:
                last_error = e
                logger.warning(f"Failed to initialize model {model_name}: {e}")
                continue

        if self.model is None:
            logger.error(f"Could not initialize any Gemini model. Last error: {last_error}")
            # Fallback to a mock model for development
            self.model = None
        logger.info("GeminiAIProvider initialized")

    async def generate_text(self, prompt: str, **kwargs) -> str:
        """
        Generate text from a prompt using Gemini.

        Args:
            prompt: Input prompt
            **kwargs: Additional arguments (e.g., temperature, max_output_tokens)

        Returns:
            Generated text
        """
        if self.model is None:
            raise ValueError("Gemini model not initialized")
        try:
            logger.info(f"Generating text with Gemini for prompt: {prompt[:50]}...")
            # Set default generation config
            generation_config = {
                "temperature": kwargs.get("temperature", 0.7),
                "top_p": kwargs.get("top_p", 0.9),
                "top_k": kwargs.get("top_k", 40),
                "max_output_tokens": kwargs.get("max_output_tokens", 2048),
            }
            response = await self.model.generate_content_async(
                prompt,
                generation_config=generation_config
            )
            return response.text
        except Exception as e:
            logger.error(f"Error generating text with Gemini: {e}")
            # Re-raise the exception so that the calling method can handle fallback
            raise e

    async def generate_briefing(self, data: Dict[str, Any]) -> str:
        """
        Generate a situation briefing from data using Gemini.

        Args:
            data: Dictionary containing all relevant data for the briefing

        Returns:
            Generated briefing as a string
        """
        try:
            logger.info("Generating situation briefing with Gemini")
            # Construct a prompt for the briefing
            prompt = self._construct_briefing_prompt(data)
            briefing = await self.generate_text(prompt)
            logger.info("Situation briefing generated successfully with Gemini")
            return briefing
        except Exception as e:
            logger.error(f"Error generating briefing with Gemini: {e}")
            # Fallback to mock provider
            from app.services.ai_provider import MockAIProvider
            mock_provider = MockAIProvider()
            return await mock_provider.generate_briefing(data)

    async def analyze_media(self, image_data: bytes, mime_type: str, prompt: str) -> str:
        """
        Analyze media (image) using Gemini Vision models.
        """
        if self.model is None:
            raise ValueError("Gemini model not initialized")
        try:
            logger.info("Analyzing media with Gemini")
            image_part = {
                "mime_type": mime_type,
                "data": image_data
            }
            response = await self.model.generate_content_async(
                [prompt, image_part]
            )
            return response.text
        except Exception as e:
            logger.error(f"Error analyzing media with Gemini: {e}")
            raise e

    def _construct_briefing_prompt(self, data: Dict[str, Any]) -> str:
        """
        Construct a prompt for generating a situation briefing with contextual awareness.

        Args:
            data: Dictionary containing zone, report, detection, resource, mesh, and BriefingService metadata

        Returns:
            Prompt string for Gemini
        """
        # Extract basic data
        zones = data.get('zones', [])
        reports = data.get('reports', [])
        detections = data.get('detections', [])
        resources = data.get('resources', [])
        mesh_status = data.get('mesh_status', {})
        timestamp = data.get('timestamp', 'Unknown')

        # Extract briefing metadata if available
        briefing_metadata = data.get('_briefing_metadata', {})
        template_type = briefing_metadata.get('template_type', 'general')
        version = briefing_metadata.get('version', '1.0')
        generated_at = briefing_metadata.get('generated_at', 'Unknown')

        # Extract key information
        critical_zones = [z for z in zones if z.get('risk_score', 0) >= 80]
        high_priority_reports = [r for r in reports if r.get('severity') in ['HIGH', 'CRITICAL']]
        survivor_detections = [d for d in detections if d.get('class') == 'person']
        fire_detections = [d for d in detections if d.get('class') == 'fire']

        # Environmental data if available
        environmental_data = {}
        if zones:
            # Get environmental data from the first zone as representative
            environmental_data = zones[0].get('environmental_data', {})

        # Infrastructure vulnerability if available
        infrastructure_vulnerability = 0.0
        if zones:
            infrastructure_vulnerability = zones[0].get('infrastructure_vulnerability', 0.0)

        # Get template-specific sections
        template_info = {
            "general": {
                "name": "General Disaster",
                "focus": "overall situation assessment and resource coordination"
            },
            "fire": {
                "name": "Fire Emergency",
                "focus": "fire behavior, spread prediction, and evacuation planning"
            },
            "flood": {
                "name": "Flood Emergency",
                "focus": "water levels, evacuation routes, and infrastructure protection"
            },
            "earthquake": {
                "name": "Earthquake Emergency",
                "focus": "structural damage, aftershock risk, and survivor rescue"
            }
        }.get(template_type, {
            "name": "General Disaster",
            "focus": "overall situation assessment"
        })

        prompt = f"""
You are an AI assistant for emergency response teams. Generate a detailed situation briefing based on the following multi-source data collected at {timestamp}.

**BRIEFING METADATA**
- Template Type: {template_info['name']} ({template_type})
- Focus Area: {template_info['focus']}
- Briefing Version: v{version}
- Generated At: {generated_at}

**DATA SUMMARY**
- Zones Analyzed: {len(zones)}
- Critical Zones (Risk Score >= 80): {len(critical_zones)}
- High Risk Zones (Risk Score 60-79): {len([z for z in zones if 60 <= z.get('risk_score', 0) < 80])}
- Incident Reports: {len(reports)}
- High Priority Reports: {len(high_priority_reports)}
- AI Detections: {len(detections)}
  - Potential Survivors: {len(survivor_detections)}
  - Fire Detections: {len(fire_detections)}
- Resources: {len(resources)}
  - Available: {len([r for r in resources if r.get('status') == 'available'])}
  - Deployed: {len([r for r in resources if r.get('status') == 'deployed'])}
- Mesh Network Status: {mesh_status.get('connected', False)} ({mesh_status.get('peers_connected', 0)} peers)
"""

        # Add environmental context if available
        if environmental_data:
            prompt += f"""
**ENVIRONMENTAL CONDITIONS**
- Precipitation: {environmental_data.get('precipitation', 0.0)} mm/h
- Wind Speed: {environmental_data.get('wind_speed', 0.0)} km/h
- Temperature: {environmental_data.get('temperature', 0.0)}°C
- Humidity: {environmental_data.get('humidity', 0.0)}%
"""

        # Add infrastructure context if available
        if infrastructure_vulnerability > 0:
            prompt += f"""
**INFRASTRUCTURE ASSESSMENT**
- Infrastructure Vulnerability Score: {infrastructure_vulnerability:.1f}/1.0
  (Higher values indicate greater susceptibility to damage)
"""

        prompt += """
**ZONE DETAILS (Top 5 by Risk Score)**
"""
        # Sort zones by risk score descending and show top 5
        sorted_zones = sorted(zones, key=lambda z: z.get('risk_score', 0), reverse=True)
        for zone in sorted_zones[:5]:
            prompt += f"- {zone.get('name', 'Unknown')}: Risk Score {zone.get('risk_score', 0)}/100 ({zone.get('severity', 'Unknown')})"
            details = []
            if zone.get('survivors', 0) > 0:
                details.append(f"{zone['survivors']} survivors")
            if zone.get('fires', 0) > 0:
                details.append(f"{zone['fires']} active fire(s)")
            if zone.get('damage', 0) > 0:
                details.append(f"{zone['damage']} structural damage")
            if zone.get('reports', 0) > 0:
                details.append(f"{zone['reports']} field reports")
        if details:
                prompt += f" [{', '.join(details)}]"
            prompt += "\n"

        prompt += """
**RECENT INCIDENTS & FIELD REPORTS (Most Recent First)**
"""
        # Sort reports by timestamp descending (most recent first) and show top 5
        def get_report_time(report):
            try:
                return report.get('created_at', '1970-01-01T00:00:00Z')
            except:
                return '1970-01-01T00:00:00Z'

        sorted_reports = sorted(reports, key=get_report_time, reverse=True)
        for report in sorted_reports[:5]:
            prompt += f"- {report.get('title', 'No title')} [{report.get('reporter_type', 'AI Field Reporter')}]"
            prompt += f": {report.get('severity', 'Unknown')} severity, Status: {report.get('status', 'Unknown')}"
            if report.get('location'):
                prompt += f" at {report['location']}"
            elif report.get('location_lat'):
                prompt += f" at ({report['location_lat']}, {report['location_lng']})"
            
            desc = report.get('description', '')
            if 'AI Logistics Report' in desc:
                prompt += " [AI logistics data included]"
            prompt += "\n"

        prompt += """
**DETECTIONS BREAKDOWN**
"""
        # Count detections by class
        detection_counts = {}
        for det in detections:
            class_name = det.get('class', 'unknown')
            detection_counts[class_name] = detection_counts.get(class_name, 0) + 1

        for class_name, count in sorted(detection_counts.items(), key=lambda x: x[1], reverse=True):
            if class_name != 'unknown':
                prompt += f"- {class_name.title()}: {count}\n"

        if 'unknown' in detection_counts:
            prompt += f"- Unknown/Other: {detection_counts['unknown']}\n"

        prompt += """
**RESOURCE STATUS**
"""
        # Group resources by type and status
        resources_by_type = {}
        for res in resources:
            res_type = res.get('type', 'unknown')
            status = res.get('status', 'unknown')
            if res_type not in resources_by_type:
                resources_by_type[res_type] = {'available': 0, 'deployed': 0, 'maintenance': 0}
            if status in resources_by_type[res_type]:
                resources_by_type[res_type][status] += 1

        for res_type, counts in resources_by_type.items():
            prompt += f"- {res_type.title()}: {counts['available']} available, {counts['deployed']} deployed"
            if counts['maintenance'] > 0:
                prompt += f", {counts['maintenance']} maintenance"
            prompt += "\n"

        prompt += """
**COMMUNICATION STATUS**
"""
        prompt += f"- Mesh Network: {'ACTIVE' if mesh_status.get('connected', False) else 'INACTIVE'}"
        if mesh_status.get('peers_connected') is not None:
            prompt += f" ({mesh_status['peers_connected']} peers connected)"
        prompt += "\n"
        prompt += f"- Internet Connectivity: {'ONLINE' if data.get('internet_available', True) else 'OFFLINE'}\n"

        # Add template-specific focus areas
        if template_type == "fire":
            prompt += f"""
**FIRE-SPECIFIC ANALYSIS**
- Active Fires: {sum(1 for z in zones if z.get('fires', 0) > 0)}
- Fire Spread Risk: {'HIGH' if environmental_data.get('wind_speed', 0) > 15 else 'MODERATE' if environmental_data.get('wind_speed', 0) > 5 else 'LOW'}
- Smoke Inhalation Risk: {'ELEVATED' if sum(1 for z in zones if z.get('fires', 0) > 0) > 0 else 'NORMAL'}
"""
        elif template_type == "flood":
            prompt += f"""
**FLOOD-SPECIFIC ANALYSIS**
- Flood Risk: {'HIGH' if environmental_data.get('precipitation', 0) > 10 else 'MODERATE' if environmental_data.get('precipitation', 0) > 2 else 'LOW'}
- Water Rise Rate: {environmental_data.get('precipitation', 0)} mm/hour
- Affected Infrastructure: {sum(1 for z in zones if z.get('damage', 0) > 0)} zones with damage
"""
        elif template_type == "earthquake":
            prompt += f"""
**EARTHQUAKE-SPECIFIC ANALYSIS**
- Structural Damage Zones: {sum(1 for z in zones if z.get('damage', 0) > 0)}
- Aftershock Risk: {'ELEVATED' if sum(1 for z in zones if z.get('survivors', 0) > 0) > 5 else 'MODERATE'}
- Rescue Priority: {'IMMEDIATE' if len(critical_zones) > 0 else 'ASSESSMENT'}
"""

        prompt += """
**INSTRUCTIONS**
Generate a professional situation briefing with the following sections:
1. SITUATION SUMMARY
2. CRITICAL INCIDENTS AND ZONES (focus on immediate threats)
3. SURVIVOR STATUS AND RESCUE OPERATIONS
4. HAZARD ASSESSMENT (fire, flood, structural, environmental)
5. RESOURCE STATUS AND DEPLOYMENT RECOMMENDATIONS
6. COMMUNICATION AND COORDINATION STATUS
7. RECOMMENDED ACTIONS (prioritized, specific, and time-bound)
8. LOGISTICS AND SUPPORT REQUIREMENTS

Guidelines:
- Be concise, clear, and actionable
- Prioritize life-saving interventions
- Include specific location references when available
- Provide clear resource allocation recommendations
- Use bullet points for readability
- Focus on what needs to happen in the next 2-4 hours
- Consider cascading risks and secondary hazards
"""
        return prompt