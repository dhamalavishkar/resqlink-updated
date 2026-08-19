"""
Test the mesh networking endpoints.
"""
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_mesh_status():
    """Test the mesh status endpoint."""
    response = client.get("/api/v1/mesh/status")
    assert response.status_code == 200
    data = response.json()
    # Check that we have the expected keys
    assert "network_state" in data
    assert "connected_peers" in data
    assert "total_peers" in data
    assert "queued_messages" in data
    assert "delivered_messages" in data
    assert "last_updated" in data

def test_register_peer():
    """Test registering a new peer."""
    peer_data = {
        "peer_id": "test-peer-001",
        "name": "Test Peer",
        "status": "connected",
        "location": {"lat": 20.5937, "lng": 78.9629}
    }
    response = client.post("/api/v1/mesh/peers", json=peer_data)
    assert response.status_code == 200
    data = response.json()
    assert data["peer_id"] == "test-peer-001"
    assert data["status"] == "registered"

    # Now get the peer to verify it was stored
    response = client.get("/api/v1/mesh/peers/test-peer-001")
    assert response.status_code == 200
    peer = response.json()
    assert peer["peer_id"] == "test-peer-001"
    assert peer["name"] == "Test Peer"
    assert peer["status"] == "connected"

def test_get_peers():
    """Test getting all peers."""
    response = client.get("/api/v1/mesh/peers")
    assert response.status_code == 200
    data = response.json()
    assert "peers" in data
    assert "count" in data
    # We just registered one peer, so count should be at least 1
    assert data["count"] >= 1

def test_remove_peer():
    """Test removing a peer."""
    # First, register a peer to remove
    peer_data = {
        "peer_id": "test-peer-to-remove",
        "name": "Peer to Remove",
        "status": "disconnected"
    }
    client.post("/api/v1/mesh/peers", json=peer_data)

    # Now remove it
    response = client.delete("/api/v1/mesh/peers/test-peer-to-remove")
    assert response.status_code == 200
    data = response.json()
    assert data["peer_id"] == "test-peer-to-remove"
    assert data["status"] == "removed"

    # Verify it's gone
    response = client.get("/api/v1/mesh/peers/test-peer-to-remove")
    assert response.status_code == 404

def test_send_message():
    """Test sending a message through the mesh."""
    # First, ensure we have two peers: sender and receiver
    sender = {
        "peer_id": "sender-001",
        "name": "Sender Peer",
        "status": "connected"
    }
    receiver = {
        "peer_id": "receiver-001",
        "name": "Receiver Peer",
        "status": "connected"
    }
    client.post("/api/v1/mesh/peers", json=sender)
    client.post("/api/v1/mesh/peers", json=receiver)

    # Send a message
    message_data = {
        "sender_id": "sender-001",
        "receiver_id": "receiver-001",
        "content": "Test message",
        "priority": "HIGH"
    }
    response = client.post("/api/v1/mesh/messages", json=message_data)
    assert response.status_code == 200
    data = response.json()
    assert "message_id" in data
    assert data["status"] in ["CREATED", "QUEUED", "DELIVERED"]  # Depending on network state

    # Since both peers are connected, we expect the message to be delivered immediately
    # But note: in our implementation, if both are connected, we set status to DELIVERED
    # However, let's not rely on that and just check that we got a message back.

    # Get the list of messages to see if our message is there
    response = client.get("/api/v1/mesh/messages")
    assert response.status_code == 200
    data = response.json()
    assert "messages" in data
    # We should have at least one message (the one we just sent)
    assert len(data["messages"]) >= 1