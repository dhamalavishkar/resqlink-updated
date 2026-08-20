"""
Google Gemini AI provider.
"""
import logging
from typing import Dict, Any, Optional
import httpx
import base64
from app.services.ai_provider import AIProvider
from app.core.config import settings

logger = logging.getLogger(__name__)

import logging
import json
from typing import Dict, Any, Optional
from app.services.ai_provider import AIProvider
from app.services.ai_provider import MockAIProvider

logger = logging.getLogger(__name__)

class GeminiAIProvider(AIProvider):
    """Google Gemini AI provider implementation.
    NOTE: Repurposed to use a MOCK provider per user request so the demo works
    flawlessly without needing Ollama, Gemini API keys, or any setup!
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the Mock provider.
        """
        self.mock = MockAIProvider()
        logger.info("Mock AI Provider initialized (Bypassing Gemini/Ollama).")

    async def generate_text(self, prompt: str, **kwargs) -> str:
        return await self.mock.generate_text(prompt, **kwargs)

    async def generate_briefing(self, data: Dict[str, Any]) -> str:
        return await self.mock.generate_briefing(data)

    async def analyze_media(self, image_data: bytes, mime_type: str, prompt: str) -> str:
        """
        Analyze media (image) using Mock AI to perfectly simulate the Logistics extraction.
        """
        logger.info("Analyzing media with Mock AI")
        
        # We will parse the prompt to determine the disaster type if possible
        disaster_type = "Flood"
        if "earthquake" in prompt.lower():
            disaster_type = "Earthquake"
        elif "fire" in prompt.lower():
            disaster_type = "Fire"
            
        # Generate a realistic, mock JSON response mimicking Gemini
        mock_response = {
            "people_count": 14,
            "food_needed_kg": 25.5,
            "water_needed_liters": 42.0,
            "emergency_equipment": [],
            "survival_advice": "",
            "severity": "CRITICAL",
            "incident_title": f"Critical {disaster_type} Incident Detected"
        }
        
        if disaster_type == "Flood":
            mock_response["emergency_equipment"] = ["Rescue Boats", "Life Jackets", "Hovercraft"]
            mock_response["survival_advice"] = "Move to the highest ground immediately. Avoid walking through moving water."
        elif disaster_type == "Earthquake":
            mock_response["emergency_equipment"] = ["Concrete Cutters", "Heavy Machinery", "Seismic Sensors"]
            mock_response["survival_advice"] = "Drop, cover, and hold on. Stay away from windows and damaged walls."
        else:
            mock_response["emergency_equipment"] = ["First Aid Kits", "Emergency Blankets"]
            mock_response["survival_advice"] = "Stay calm and wait for emergency personnel."
            
        return json.dumps(mock_response)

    def _construct_briefing_prompt(self, data: Dict[str, Any]) -> str:
        # We don't need this since we are using MockAIProvider directly, but keeping it for interface compliance.
        return ""
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