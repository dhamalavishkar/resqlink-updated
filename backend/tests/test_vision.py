"""
Test the vision endpoints.
"""
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_vision_model_status():
    """Test the vision model status endpoint."""
    response = client.get("/api/v1/vision/model/status")
    assert response.status_code == 200
    data = response.json()
    # Check that we have the expected keys
    assert "model_loaded" in data
    assert "model_path" in data
    assert "available_classes" in data
    assert "classes_count" in data
    # The classes_count should be an integer
    assert isinstance(data["classes_count"], int)

def test_vision_analyze_no_file():
    """Test the vision analyze endpoint with no file (should return 422)."""
    response = client.post("/api/v1/vision/analyze")
    # We expect a 422 Unprocessable Entity because the file is required
    assert response.status_code == 422

def test_vision_analyze_invalid_file():
    """Test the vision analyze endpoint with an invalid file (should return 400 or 422)."""
    # Create a dummy file that is not an image
    files = {"file": ("test.txt", b"not an image content", "text/plain")}
    response = client.post("/api/v1/vision/analyze", files=files)
    # We expect either 400 (bad request) or 422 (unprocessable entity) depending on how the endpoint handles it
    # In our implementation, we try to decode the image and if it fails we return 400
    assert response.status_code == 400
    # Check that the error message is present
    data = response.json()
    assert "detail" in data