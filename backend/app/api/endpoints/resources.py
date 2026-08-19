"""
Resource endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.database.supabase_client import SupabaseService, get_supabase
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("", response_model=List[Dict[str, Any]])
async def get_resources(
    limit: int = 100,
    supabase: SupabaseService = Depends(get_supabase)
):
    """Get all resources."""
    return await supabase.get_resources(limit)

@router.put("/{resource_id}", response_model=Dict[str, Any])
async def update_resource(
    resource_id: str,
    resource_data: Dict[str, Any],
    supabase: SupabaseService = Depends(get_supabase)
):
    """Update a specific resource."""
    result = await supabase.update_resource(resource_id, resource_data)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to update resource")
    return result

@router.get("/{resource_id}", response_model=Dict[str, Any])
async def get_resource(
    resource_id: str,
    supabase: SupabaseService = Depends(get_supabase)
):
    """Get a specific resource."""
    resources = await supabase.get_resources()
    for r in resources:
        if r.get("id") == resource_id:
            return r
    raise HTTPException(status_code=404, detail="Resource not found")