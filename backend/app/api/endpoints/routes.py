"""
Route recommendation endpoints for avoiding hazardous areas.
"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
import logging
import math

logger = logging.getLogger(__name__)

router = APIRouter()

from app.services.routing import GraphRoutingEngine

class RouteRecommendationService:
    """Service for recommending safe routes avoiding hazardous zones."""

    def __init__(self):
        """Initialize the route service."""
        # Initialize graph routing engine
        self.routing_engine = GraphRoutingEngine()

    def calculate_distance(self, point1: Dict[str, float], point2: Dict[str, float]) -> float:
        """Calculate distance between two points using Haversine formula."""
        return self.routing_engine.calculate_distance(point1, point2)

    def is_point_in_hazard_zone(self, point: Dict[str, float], hazard_zones: List[Dict[str, Any]]) -> bool:
        """Check if a point is within any hazard zone."""
        for zone in hazard_zones:
            zone_center = {"lat": zone.get("lat", 0), "lng": zone.get("lng", 0)}
            zone_radius = zone.get("radius_km", 1.0)
            if self.calculate_distance(point, zone_center) <= zone_radius:
                return True
        return False

    def recommend_route(self, start: Dict[str, float], end: Dict[str, float],
                       hazard_zones: List[Dict[str, Any]], avoid_hazards: bool = True) -> Dict[str, Any]:
        """
        Recommend a route from start to end, optionally avoiding hazard zones.
        """
        try:
            logger.info(f"Calculating route from {start} to {end}")

            if avoid_hazards and hazard_zones:
                route_points = self.routing_engine.calculate_route(start, end, hazard_zones, algorithm='astar')
            else:
                route_points = [start, end]

            total_distance = self._calculate_route_distance(route_points)
            avoided_hazards = self._get_avoided_hazards(route_points, hazard_zones)
            
            if len(route_points) > 2 and avoid_hazards:
                explanation = f"Route adjusted to avoid {len(avoided_hazards)} hazardous area(s)."
            else:
                explanation = "Direct route is used."

            # Calculate estimated time (assuming average speed of 20 km/h for emergency vehicles)
            estimated_time_hours = total_distance / 20.0
            estimated_time_minutes = estimated_time_hours * 60

            return {
                "route": {
                    "points": route_points,
                    "distance_km": round(total_distance, 2),
                    "estimated_time_minutes": round(estimated_time_minutes, 1)
                },
                "safety": {
                    "avoided_hazards": avoided_hazards,
                    "hazard_zones_total": len(hazard_zones),
                    "explanation": explanation
                },
                "summary": {
                    "start": start,
                    "end": end,
                    "waypoints": max(0, len(route_points) - 2),
                    "safety_score": self._calculate_safety_score(route_points, hazard_zones)
                }
            }

        except Exception as e:
            logger.error(f"Error recommending route: {e}")
            # Return a basic route even if calculation fails
            return {
                "route": {
                    "points": [start, end],
                    "distance_km": round(self.calculate_distance(start, end), 2),
                    "estimated_time_minutes": round((self.calculate_distance(start, end) / 20.0) * 60, 1)
                },
                "safety": {
                    "avoided_hazards": [],
                    "explanation": "Route calculation encountered an error - showing direct route."
                },
                "error": str(e)
            }

    def _create_detour_route(self, start: Dict[str, float], end: Dict[str, float],
                           hazard_zones: List[Dict[str, Any]]) -> List[Dict[str, float]]:
        """Create a simple detour route around hazards."""
        # For MVP, we'll use a simple approach: go around the bounding box of hazards
        # In reality, this would use proper pathfinding algorithms

        # Find the general direction
        mid_lat = (start["lat"] + end["lat"]) / 2
        mid_lng = (start["lng"] + end["lng"]) / 2

        # Create a detour point perpendicular to the direct path
        # This is a simplified approach for demonstration
        detour_lat = mid_lat + (end["lng"] - start["lng"]) * 0.1  # Offset by longitude difference
        detour_lng = mid_lng - (end["lat"] - start["lat"]) * 0.1  # Offset by latitude difference

        # Ensure the detour point is not in a hazard zone
        detour_point = {"lat": detour_lat, "lng": detour_lng}
        max_attempts = 5
        attempt = 0

        while self.is_point_in_hazard_zone(detour_point, hazard_zones) and attempt < max_attempts:
            # Increase offset
            detour_lat = mid_lat + (end["lng"] - start["lng"]) * 0.2 * (attempt + 1)
            detour_lng = mid_lng - (end["lat"] - start["lat"]) * 0.2 * (attempt + 1)
            detour_point = {"lat": detour_lat, "lng": detour_lng}
            attempt += 1

        return [start, detour_point, end]

    def _calculate_route_distance(self, points: List[Dict[str, float]]) -> float:
        """Calculate total distance of a route with multiple points."""
        total_distance = 0.0
        for i in range(len(points) - 1):
            total_distance += self.calculate_distance(points[i], points[i + 1])
        return total_distance

    def _get_avoided_hazards(self, route_points: List[Dict[str, float]],
                           hazard_zones: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Get list of hazard zones that were avoided by this route."""
        avoided = []
        direct_route_points = [route_points[0], route_points[-1]]  # Just start and end

        for zone in hazard_zones:
            # Check if direct route would go through this hazard
            zone_center = {"lat": zone.get("lat", 0), "lng": zone.get("lng", 0)}
            zone_radius = zone.get("radius_km", 1.0)

            # Simple check: if zone is roughly between start and end, consider it avoided
            start_point = route_points[0]
            end_point = route_points[-1]

            # Calculate if zone is between start and end (simplified)
            lat_between = (start_point["lat"] <= zone_center["lat"] <= end_point["lat"]) or \
                         (end_point["lat"] <= zone_center["lat"] <= start_point["lat"])
            lng_between = (start_point["lng"] <= zone_center["lng"] <= end_point["lng"]) or \
                         (end_point["lng"] <= zone_center["lng"] <= start_point["lng"])

            if lat_between and lng_between:
                avoided.append(zone)

        return avoided

    def _calculate_safety_score(self, route_points: List[Dict[str, float]],
                              hazard_zones: List[Dict[str, Any]]) -> int:
        """Calculate a safety score for the route (0-100, higher is safer)."""
        if not hazard_zones:
            return 100

        # Calculate minimum distance from route to any hazard
        min_distance = float('inf')
        for point in route_points:
            for zone in hazard_zones:
                zone_center = {"lat": zone.get("lat", 0), "lng": zone.get("lng", 0)}
                distance = self.calculate_distance(point, zone_center)
                zone_radius = zone.get("radius_km", 1.0)
                distance_to_edge = max(0, distance - zone_radius)
                min_distance = min(min_distance, distance_to_edge)

        # Convert distance to safety score (closer to hazards = lower score)
        # Assume 5km+ distance is perfectly safe, 0km is dangerous
        safety_score = min(100, max(0, int((min_distance / 5.0) * 100)))
        return safety_score

# Initialize service
route_service = RouteRecommendationService()

@router.post("/recommend")
async def recommend_route(request: Dict[str, Any]):
    """
    Recommend a safe route from start to end point, avoiding hazards.

    Expected format:
    {
        "start": {"lat": 20.5937, "lng": 78.9629},
        "end": {"lat": 20.6500, "lng": 79.0000},
        "hazard_zones": [
            {"lat": 20.6200, "lng": 78.9800, "radius_km": 2.0},
            {"lat": 20.6000, "lng": 78.9500, "radius_km": 1.5}
        ],
        "avoid_hazards": true
    }
    """
    try:
        start = request.get("start")
        end = request.get("end")
        hazard_zones = request.get("hazard_zones", [])
        avoid_hazards = request.get("avoid_hazards", True)

        if not start or not end:
            raise HTTPException(status_code=400, detail="Start and end points are required")

        # Validate point format
        for point_name, point in [("start", start), ("end", end)]:
            if not isinstance(point, dict) or "lat" not in point or "lng" not in point:
                raise HTTPException(status_code=400, detail=f"{point_name} must have 'lat' and 'lng' fields")

        # Validate hazard zones
        for i, zone in enumerate(hazard_zones):
            if not isinstance(zone, dict) or "lat" not in zone or "lng" not in zone:
                raise HTTPException(status_code=400, detail=f"Hazard zone {i} must have 'lat' and 'lng' fields")

        recommendation = route_service.recommend_route(start, end, hazard_zones, avoid_hazards)
        return recommendation

    except Exception as e:
        logger.error(f"Error in route recommendation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to recommend route: {str(e)}")

@router.get("/demo/scenarios")
async def get_demo_scenarios():
    """Get demo scenarios for route recommendation."""
    return {
        "scenarios": [
            {
                "name": "Urban Flood Avoidance",
                "start": {"lat": 20.5937, "lng": 78.9629},
                "end": {"lat": 20.6500, "lng": 79.0000},
                "hazard_zones": [
                    {"lat": 20.6100, "lng": 78.9700, "radius_km": 1.5, "name": "Flooded Main Street"},
                    {"lat": 20.6300, "lng": 78.9900, "radius_km": 1.0, "name": "River Overflow Area"}
                ]
            },
            {
                "name": "Fire Zone Avoidance",
                "start": {"lat": 20.5500, "lng": 78.9000},
                "end": {"lat": 20.6200, "lng": 79.0500},
                "hazard_zones": [
                    {"lat": 20.5800, "lng": 78.9500, "radius_km": 2.0, "name": "Industrial Fire Zone"},
                    {"lat": 20.6000, "lng": 79.0200, "radius_km": 1.5, "name": "Storage Facility Fire"}
                ]
            }
        ]
    }