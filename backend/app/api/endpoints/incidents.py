"""
Incident endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.database.supabase_client import SupabaseService, get_supabase
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("", response_model=List[Dict[str, Any]])
async def get_incidents(
    limit: int = 100,
    supabase: SupabaseService = Depends(get_supabase)
):
    """Get all incidents."""
    return await supabase.get_incidents(limit)

@router.post("", response_model=Dict[str, Any])
async def create_incident(
    incident_data: Dict[str, Any],
    supabase: SupabaseService = Depends(get_supabase)
):
    """Create a new incident."""
    result = await supabase.create_incident(incident_data)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create incident")
    return result

@router.get("/{incident_id}", response_model=Dict[str, Any])
async def get_incident(
    incident_id: str,
    supabase: SupabaseService = Depends(get_supabase)
):
    """Get a specific incident."""
    # Since supabase_client doesn't have a get_incident yet, we can filter from get_incidents
    # Or ideally, implement get_incident in SupabaseService. 
    # For now, we'll filter from get_incidents
    incidents = await supabase.get_incidents()
    for inc in incidents:
        if inc.get("id") == incident_id:
            return inc
    raise HTTPException(status_code=404, detail="Incident not found")