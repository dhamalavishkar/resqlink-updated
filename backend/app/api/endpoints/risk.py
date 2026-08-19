"""
Risk calculation endpoints.
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.services.risk import RiskCalculationService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize service
risk_service = RiskCalculationService()

@router.post("/calculate")
async def calculate_risk(zone_data: Dict[str, Any]):
    """
    Calculate risk score for a single zone.

    Expected format:
    {
        "name": "Zone A-01",
        "survivors": 12,
        "fires": 1,
        "damage": 2,
        "reports": 8,
        "population": 1200,
        "accessibility": 0.3,
        "confidence": 0.9
    }
    """
    try:
        logger.info(f"Calculating risk for zone: {zone_data.get('name', 'Unknown')}")
        result = risk_service.calculate_risk_score(zone_data)
        return result
    except Exception as e:
        logger.error(f"Error calculating risk: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate risk score")

@router.post("/calculate/batch")
async def calculate_multiple_risks(zones_data: List[Dict[str, Any]]):
    """
    Calculate risk scores for multiple zones.

    Expected format: List of zone data dictionaries
    """
    try:
        logger.info(f"Calculating risk for {len(zones_data)} zones")
        results = risk_service.calculate_multiple_zones(zones_data)
        return {"zones": results, "count": len(results)}
    except Exception as e:
        logger.error(f"Error calculating multiple risks: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate risk scores")

@router.get("/zones")
async def get_risk_zones():
    """
    Get predefined risk zones with scores (for demo).
    In production, this would fetch from database.
    """
    # Mock data for demonstration
    mock_zones = [
        {
            "id": 1,
            "name": "Zone A-01",
            "risk_score": 87,
            "severity": "CRITICAL",
            "population": 1200,
            "survivors": 12,
            "fires": 1,
            "damage": 2,
            "reports": 8,
            "last_updated": "2 minutes ago",
            "priority": "Immediate SAR and Fire Response",
            "resources": "Fire Truck x2, Ambulance x3, SAR Team"
        },
        {
            "id": 2,
            "name": "Zone B-07",
            "risk_score": 72,
            "severity": "HIGH",
            "population": 800,
            "survivors": 5,
            "fires": 0,
            "damage": 3,
            "reports": 5,
            "last_updated": "5 minutes ago",
            "priority": "SAR Team Deployment",
            "resources": "Ambulance x2, SAR Team, Medical Unit"
        },
        {
            "id": 3,
            "name": "Zone C-03",
            "risk_score": 45,
            "severity": "MEDIUM",
            "population": 500,
            "survivors": 0,
            "fires": 0,
            "damage": 1,
            "reports": 3,
            "last_updated": "10 minutes ago",
            "priority": "Monitor and Assess",
            "resources": "Medical Unit on Standby"
        }
    ]
    return mock_zones

@router.get("/zones/{zone_id}")
async def get_risk_zone(zone_id: int):
    """Get a specific zone by ID."""
    # In production, fetch from database
    zones = await get_risk_zones()
    zone = next((z for z in zones if z["id"] == zone_id), None)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone