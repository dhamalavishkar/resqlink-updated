"""
Zone endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.database.supabase_client import SupabaseService, get_supabase
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("", response_model=List[Dict[str, Any]])
async def get_zones(
    limit: int = 100,
    supabase: SupabaseService = Depends(get_supabase)
):
    """Get all zones."""
    return await supabase.get_zones(limit)

@router.put("/{zone_id}", response_model=Dict[str, Any])
async def update_zone(
    zone_id: str,
    zone_data: Dict[str, Any],
    supabase: SupabaseService = Depends(get_supabase)
):
    """Update a specific zone."""
    result = await supabase.update_zone(zone_id, zone_data)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to update zone")
    return result

@router.get("/{zone_id}", response_model=Dict[str, Any])
async def get_zone(
    zone_id: str,
    supabase: SupabaseService = Depends(get_supabase)
):
    """Get a specific zone."""
    zones = await supabase.get_zones()
    for z in zones:
        if z.get("id") == zone_id:
            return z
    raise HTTPException(status_code=404, detail="Zone not found")