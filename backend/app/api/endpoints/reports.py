"""
Report endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.database.supabase_client import SupabaseService, get_supabase
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("", response_model=List[Dict[str, Any]])
async def get_reports(
    limit: int = 100,
    supabase: SupabaseService = Depends(get_supabase)
):
    """Get all incident reports."""
    return await supabase.get_reports(limit)

@router.post("", response_model=Dict[str, Any])
async def create_report(
    report_data: Dict[str, Any],
    supabase: SupabaseService = Depends(get_supabase)
):
    """Create a new report."""
    result = await supabase.create_report(report_data)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create report")
    return result

@router.get("/{report_id}", response_model=Dict[str, Any])
async def get_report(
    report_id: str,
    supabase: SupabaseService = Depends(get_supabase)
):
    """Get a specific report."""
    reports = await supabase.get_reports()
    for rep in reports:
        if rep.get("id") == report_id:
            return rep
    raise HTTPException(status_code=404, detail="Report not found")