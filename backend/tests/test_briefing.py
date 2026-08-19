"""
Test the AI briefing generation endpoint.
"""
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_generate_briefing():
    """Test the briefing generation endpoint with sample data."""
    # Sample data that mimics what the frontend would send
    data = {
        "zones": [
            {
                "name": "Zone A-01 - Downtown Mumbai",
                "risk_score": 87,
                "survivors": 12,
                "fires": 1,
                "damage": 2,
                "reports": 8,
                "population": 1200
            },
            {
                "name": "Zone B-07 - Suburban Area",
                "risk_score": 72,
                "survivors": 5,
                "fires": 0,
                "damage": 3,
                "reports": 5,
                "population": 800
            }
        ],
        "reports": [
            {
                "title": "Floating debris blocking main road",
                "description": "Large tree trunk and debris blocking Oak Street near the river",
                "severity": "HIGH",
                "confidence": 0.8,
                "reporter_type": "Citizen"
            },
            {
                "title": "Survivors spotted on roof",
                "description": "Three individuals waving for help on the roof of a collapsed building",
                "severity": "CRITICAL",
                "confidence": 0.95,
                "reporter_type": "Drone"
            }
        ],
        "detections": [
            {
                "class": "person",
                "confidence": 0.92,
                "source": "drone"
            },
            {
                "class": "person",
                "confidence": 0.87,
                "source": "drone"
            },
            {
                "class": "fire",
                "confidence": 0.91,
                "source": "satellite"
            }
        ],
        "resources": [
            {
                "type": "ambulance",
                "name": "Ambulance 01",
                "status": "available",
                "capacity": "2 patients"
            },
            {
                "type": "fire_truck",
                "name": "Fire Truck 07",
                "status": "deployed",
                "capacity": "1500 gal water"
            }
        ],
        "mesh_status": {
            "connected_peers": 8,
            "total_peers": 10,
            "status": "ACTIVE"
        },
        "timestamp": "2026-08-19T14:30:00Z",
        "internet_available": True
    }
    response = client.post("/api/v1/ai/briefing", json=data)
    assert response.status_code == 200
    data = response.json()
    assert "briefing" in data
    assert isinstance(data["briefing"], str)
    # The briefing should not be empty
    assert len(data["briefing"]) > 0
    # Check that it contains some expected sections (optional)
    # We'll just check for a few keywords that should be in the mock briefing
    assert "SITUATION BRIEFING" in data["briefing"]
    assert "ZONE A-01" in data["briefing"].upper() or "ZONE A-01" in data["briefing"]

def test_generate_briefing_invalid_data():
    """Test the briefing generation endpoint with invalid data (missing required fields)."""
    # We'll send an empty object
    response = client.post("/api/v1/ai/briefing", json={})
    # The endpoint should still work because the BriefingService can handle empty data
    # but let's check that it returns a 200 and a briefing (even if it's a fallback)
    # In our implementation, the BriefingService will generate a fallback briefing if there's an error
    # or if the data is empty, it will still produce a briefing (the mock provider doesn't require specific fields)
    # So we expect a 200.
    assert response.status_code == 200
    data = response.json()
    assert "briefing" in data
    assert isinstance(data["briefing"], str)

def test_ai_status():
    """Test the AI status endpoint."""
    response = client.get("/api/v1/ai/briefing/status")
    assert response.status_code == 200
    data = response.json()
    assert "provider" in data
    assert "demo_mode" in data
    assert "status" in data