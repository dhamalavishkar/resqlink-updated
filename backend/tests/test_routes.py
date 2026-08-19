"""
Test the route recommendation endpoints.
"""
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_recommend_route():
    """Test the route recommendation endpoint with valid data."""
    request_data = {
        "start": {"lat": 20.5937, "lng": 78.9629},
        "end": {"lat": 20.6500, "lng": 79.0000},
        "hazard_zones": [
            {"lat": 20.6200, "lng": 78.9800, "radius_km": 2.0},
            {"lat": 20.6000, "lng": 78.9500, "radius_km": 1.5}
        ],
        "avoid_hazards": True
    }
    response = client.post("/api/v1/routes/recommend", json=request_data)
    assert response.status_code == 200
    data = response.json()
    # Check that we have the expected structure
    assert "route" in data
    assert "safety" in data
    assert "summary" in data
    # Check the route has points, distance, and estimated time
    assert "points" in data["route"]
    assert "distance_km" in data["route"]
    assert "estimated_time_minutes" in data["route"]
    # Check the safety info
    assert "avoided_hazards" in data["safety"]
    assert "explanation" in data["safety"]
    # Check the summary
    assert "start" in data["summary"]
    assert "end" in data["summary"]
    assert "waypoints" in data["summary"]
    assert "safety_score" in data["summary"]

def test_recommend_route_missing_start_end():
    """Test the route recommendation endpoint with missing start or end."""
    # Missing start
    request_data = {
        "end": {"lat": 20.6500, "lng": 79.0000}
    }
    response = client.post("/api/v1/routes/recommend", json=request_data)
    assert response.status_code == 400

    # Missing end
    request_data = {
        "start": {"lat": 20.5937, "lng": 78.9629}
    }
    response = client.post("/api/v1/routes/recommend", json=request_data)
    assert response.status_code == 400

def test_recommend_route_invalid_point_format():
    """Test the route recommendation endpoint with invalid point format."""
    request_data = {
        "start": {"lat": 20.5937},  # Missing lng
        "end": {"lat": 20.6500, "lng": 79.0000}
    }
    response = client.post("/api/v1/routes/recommend", json=request_data)
    assert response.status_code == 400

    request_data = {
        "start": {"lat": 20.5937, "lng": 78.9629},
        "end": {"lat": 20.6500}  # Missing lng
    }
    response = client.post("/api/v1/routes/recommend", json=request_data)
    assert response.status_code == 400

def test_get_demo_scenarios():
    """Test the demo scenarios endpoint."""
    response = client.get("/api/v1/routes/demo/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert "scenarios" in data
    assert isinstance(data["scenarios"], list)
    # We expect at least one scenario
    if len(data["scenarios"]) > 0:
        scenario = data["scenarios"][0]
        assert "name" in scenario
        assert "start" in scenario
        assert "end" in scenario
        assert "hazard_zones" in scenario