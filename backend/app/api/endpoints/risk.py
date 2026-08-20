"""
Risk calculation endpoints.
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from app.services.risk import RiskCalculationService
from app.database.supabase_client import get_supabase
import logging
import json
import re
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

router = APIRouter()
risk_service = RiskCalculationService()

SEVERITY_BASE = {"CRITICAL": 90, "HIGH": 75, "MEDIUM": 50, "LOW": 25}


def _parse_logistics(description: str) -> Dict[str, Any]:
    """Extract Gemini logistics JSON embedded in incident description."""
    if not description or "AI Logistics Report" not in description:
        return {}
    try:
        json_str = description.split("AI Logistics Report:", 1)[1].strip()
        return json.loads(json_str)
    except (json.JSONDecodeError, IndexError):
        pass
    match = re.search(r"\{[\s\S]*\}", description)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass
    return {}


def _count_nearby_detections(
    lat: float,
    lng: float,
    detections: List[Dict[str, Any]],
    det_class: str,
    radius: float = 0.05,
) -> int:
    count = 0
    for det in detections:
        if det.get("class") != det_class:
            continue
        d_lat = det.get("location_lat") or (det.get("location") or {}).get("lat")
        d_lng = det.get("location_lng") or (det.get("location") or {}).get("lng")
        if d_lat is None or d_lng is None:
            continue
        if abs(float(d_lat) - lat) <= radius and abs(float(d_lng) - lng) <= radius:
            count += 1
    return count


@router.post("/calculate")
async def calculate_risk(zone_data: Dict[str, Any]):
    try:
        logger.info(f"Calculating risk for zone: {zone_data.get('name', 'Unknown')}")
        return risk_service.calculate_risk_score(zone_data)
    except Exception as e:
        logger.error(f"Error calculating risk: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate risk score")


@router.post("/calculate/batch")
async def calculate_multiple_risks(zones_data: List[Dict[str, Any]]):
    try:
        logger.info(f"Calculating risk for {len(zones_data)} zones")
        results = risk_service.calculate_multiple_zones(zones_data)
        return {"zones": results, "count": len(results)}
    except Exception as e:
        logger.error(f"Error calculating multiple risks: {e}")
        raise HTTPException(status_code=500, detail="Failed to calculate risk scores")


@router.get("/zones")
async def get_risk_zones(supabase=Depends(get_supabase)):
    """
    Build dynamic danger zones from Supabase incidents and detections.
    """
    incidents: List[Dict[str, Any]] = []
    detections: List[Dict[str, Any]] = []
    try:
        incidents = await supabase.get_incidents(100)
        detections = await supabase.get_recent_detections(200)
    except Exception as e:
        logger.error(f"Failed to fetch data for zones: {e}")

    dynamic_zones: List[Dict[str, Any]] = []
    for inc in incidents:
        lat = inc.get("location_lat") or (inc.get("location") or {}).get("lat")
        lng = inc.get("location_lng") or (inc.get("location") or {}).get("lng")
        if lat is None or lng is None:
            continue

        lat, lng = float(lat), float(lng)
        severity = inc.get("severity", "MEDIUM")
        logistics = _parse_logistics(inc.get("description", ""))

        survivors = int(logistics.get("people_count", 0) or 0)
        nearby_fires = _count_nearby_detections(lat, lng, detections, "fire")
        nearby_survivors = _count_nearby_detections(lat, lng, detections, "person")
        survivors = max(survivors, nearby_survivors)

        title_lower = (inc.get("title", "") + inc.get("description", "")).lower()
        fires = nearby_fires
        if fires == 0 and ("fire" in title_lower or inc.get("disaster_type") == "fire"):
            fires = 1

        damage = _count_nearby_detections(lat, lng, detections, "damage")
        if damage == 0 and severity in ("HIGH", "CRITICAL"):
            damage = 1

        base_score = SEVERITY_BASE.get(severity, 50)
        risk_score = min(base_score + min(survivors * 5, 25) + fires * 15 + damage * 10, 100)

        dynamic_zones.append({
            "id": inc.get("id", f"dyn-{len(dynamic_zones)}"),
            "name": inc.get("title", f"Zone {len(dynamic_zones) + 1}"),
            "risk_score": risk_score,
            "severity": severity,
            "population": max(survivors * 10, 100),
            "survivors": survivors,
            "fires": fires,
            "damage": damage,
            "reports": 1,
            "location": {"lat": lat, "lng": lng},
            "last_updated": inc.get("created_at") or inc.get("updated_at") or datetime.utcnow().isoformat() + "Z",
            "priority": "Immediate Response" if risk_score >= 80 else "Assess & Deploy",
            "resources": "Evaluate on site",
            "environmental_data": {
                "precipitation": 0.0,
                "wind_speed": 5.0,
                "temperature": 32.0,
                "humidity": 85.0,
            },
        })

    if dynamic_zones:
        return dynamic_zones

    # Fallback when no incidents exist yet
    now = datetime.utcnow()
    return [
        {
            "id": "mock-1",
            "name": "Zone A-01",
            "risk_score": 87,
            "severity": "CRITICAL",
            "population": 1200,
            "survivors": 12,
            "fires": 1,
            "damage": 2,
            "reports": 8,
            "location": {"lat": 20.5937, "lng": 78.9629},
            "last_updated": (now - timedelta(minutes=10)).isoformat() + "Z",
            "priority": "Immediate SAR and Fire Response",
            "resources": "Fire Truck x2, Ambulance x3, SAR Team",
            "environmental_data": {"precipitation": 0.0, "wind_speed": 5.0, "temperature": 32.0, "humidity": 85.0},
        },
        {
            "id": "mock-2",
            "name": "Zone B-07",
            "risk_score": 72,
            "severity": "HIGH",
            "population": 800,
            "survivors": 5,
            "fires": 0,
            "damage": 3,
            "reports": 5,
            "location": {"lat": 20.6937, "lng": 78.8629},
            "last_updated": (now - timedelta(minutes=20)).isoformat() + "Z",
            "priority": "SAR Team Deployment",
            "resources": "Ambulance x2, SAR Team, Medical Unit",
            "environmental_data": {"precipitation": 2.5, "wind_speed": 12.0, "temperature": 28.0, "humidity": 78.0},
        },
    ]


@router.get("/zones/{zone_id}")
async def get_risk_zone(zone_id: str, supabase=Depends(get_supabase)):
    zones = await get_risk_zones(supabase)
    zone = next((z for z in zones if str(z["id"]) == str(zone_id)), None)
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone
