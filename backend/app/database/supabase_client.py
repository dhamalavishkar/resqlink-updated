"""
Supabase database client and service.
"""
from typing import Optional, Dict, Any, List
from supabase import create_client, Client
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class SupabaseService:
    """Service for interacting with Supabase database."""

    def __init__(self):
        """Initialize the Supabase client."""
        self.supabase: Optional[Client] = None
        self.is_connected = False
        self._initialize_client()

    def _initialize_client(self):
        """Initialize the Supabase client with credentials."""
        try:
            if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
                self.supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
                self.is_connected = True
                logger.info("Supabase client initialized successfully")
            else:
                logger.warning("Supabase URL or ANON KEY not provided - running in demo mode")
                self.is_connected = False
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            self.is_connected = False

    def is_available(self) -> bool:
        """Check if Supabase is available and connected."""
        return self.is_connected and self.supabase is not None

    # User-related methods
    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a user by ID."""
        if not self.is_available():
            return None
        try:
            response = self.supabase.table("users").select("*").eq("id", user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error fetching user {user_id}: {e}")
            return None

    # Incident-related methods
    async def get_incidents(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get incidents from the database."""
        if not self.is_available():
            return self._get_demo_incidents()
        try:
            response = self.supabase.table("incidents").select("*").limit(limit).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching incidents: {e}")
            return self._get_demo_incidents()

    async def create_incident(self, incident_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new incident."""
        if not self.is_available():
            return self._get_demo_incident(incident_data)
        try:
            response = self.supabase.table("incidents").insert(incident_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating incident: {e}")
            return None

    # Report-related methods
    async def get_reports(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get incident reports."""
        if not self.is_available():
            return self._get_demo_reports()
        try:
            response = self.supabase.table("incident_reports").select("*").limit(limit).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching reports: {e}")
            return self._get_demo_reports()

    async def create_report(self, report_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Create a new incident report."""
        if not self.is_available():
            return self._get_demo_report(report_data)
        try:
            response = self.supabase.table("incident_reports").insert(report_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating report: {e}")
            return None

    # Zone-related methods
    async def get_zones(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get zones from the database."""
        if not self.is_available():
            return self._get_demo_zones()
        try:
            response = self.supabase.table("zones").select("*").limit(limit).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching zones: {e}")
            return self._get_demo_zones()

    async def update_zone(self, zone_id: str, zone_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a zone."""
        if not self.is_available():
            return self._get_demo_zone(zone_id, zone_data)
        try:
            response = self.supabase.table("zones").update(zone_data).eq("id", zone_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating zone {zone_id}: {e}")
            return None

    # Detection-related methods
    async def save_detection(self, detection_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Save a detection result."""
        if not self.is_available():
            return self._get_demo_detection(detection_data)
        try:
            response = self.supabase.table("detections").insert(detection_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error saving detection: {e}")
            return None

    async def get_recent_detections(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent detections."""
        if not self.is_available():
            return self._get_demo_detections(limit)
        try:
            response = self.supabase.table("detections").select("*").order("created_at", desc=True).limit(limit).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching detections: {e}")
            return self._get_demo_detections(limit)

    # Resource-related methods
    async def get_resources(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get resources from the database."""
        if not self.is_available():
            return self._get_demo_resources()
        try:
            response = self.supabase.table("resources").select("*").limit(limit).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching resources: {e}")
            return self._get_demo_resources()

    async def update_resource(self, resource_id: str, resource_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a resource."""
        if not self.is_available():
            return self._get_demo_resource(resource_id, resource_data)
        try:
            response = self.supabase.table("resources").update(resource_data).eq("id", resource_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating resource {resource_id}: {e}")
            return None

    # Mesh-related methods (for persistence)
    async def save_mesh_message(self, message_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Save a mesh message for persistence."""
        if not self.is_available():
            return self._get_demo_mesh_message(message_data)
        try:
            response = self.supabase.table("mesh_messages").insert(message_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error saving mesh message: {e}")
            return None

    # Briefing-related methods
    async def save_briefing(self, briefing_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Save an AI-generated briefing."""
        if not self.is_available():
            return self._get_demo_briefing(briefing_data)
        try:
            response = self.supabase.table("ai_briefings").insert(briefing_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error saving briefing: {e}")
            return None

    # Demo data methods (used when Supabase is not available)
    def _get_demo_incidents(self) -> List[Dict[str, Any]]:
        """Return demo incident data."""
        return []

    def _get_demo_incident(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        """Return a demo incident with provided data."""
        incident_data.update({
            "id": f"demo-{len(self._get_demo_incidents()) + 1}",
            "created_at": "2026-08-19T14:30:00Z",
            "updated_at": "2026-08-19T14:30:00Z"
        })
        return incident_data

    def _get_demo_reports(self) -> List[Dict[str, Any]]:
        """Return demo report data."""
        return []

    def _get_demo_report(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """Return a demo report with provided data."""
        report_data.update({
            "id": f"demo-report-{len(self._get_demo_reports()) + 1}",
            "created_at": "2026-08-19T14:30:00Z"
        })
        return report_data

    def _get_demo_zones(self) -> List[Dict[str, Any]]:
        """Return demo zone data."""
        return []

    def _get_demo_zone(self, zone_id: str, zone_data: Dict[str, Any]) -> Dict[str, Any]:
        """Return a demo zone with provided data."""
        zone_data.update({
            "id": zone_id,
            "updated_at": "2026-08-19T14:30:00Z"
        })
        return zone_data

    def _get_demo_detections(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Return demo detection data."""
        return []

    def _get_demo_detection(self, detection_data: Dict[str, Any]) -> Dict[str, Any]:
        """Return a demo detection with provided data."""
        detection_data.update({
            "id": f"demo-det-{len(self._get_demo_detections()) + 1}",
            "detected_at": "2026-08-19T14:30:00Z"
        })
        return detection_data

    def _get_demo_resources(self) -> List[Dict[str, Any]]:
        """Return demo resource data."""
        return []

    def _get_demo_resource(self, resource_id: str, resource_data: Dict[str, Any]) -> Dict[str, Any]:
        """Return a demo resource with provided data."""
        resource_data.update({
            "id": resource_id,
            "updated_at": "2026-08-19T14:30:00Z"
        })
        return resource_data

    def _get_demo_mesh_message(self, message_data: Dict[str, Any]) -> Dict[str, Any]:
        """Return a demo mesh message with provided data."""
        message_data.update({
            "id": f"demo-msg-{len([]) + 1}",  # Simplified
            "created_at": "2026-08-19T14:30:00Z"
        })
        return message_data

    def _get_demo_briefing(self, briefing_data: Dict[str, Any]) -> Dict[str, Any]:
        """Return a demo briefing with provided data."""
        briefing_data.update({
            "id": f"demo-brief-{len([]) + 1}",  # Simplified
            "created_at": "2026-08-19T14:30:00Z"
        })
        return briefing_data

# Global instance
supabase_service = SupabaseService()

# Dependency for FastAPI
def get_supabase() -> SupabaseService:
    """Dependency to get Supabase service."""
    return supabase_service