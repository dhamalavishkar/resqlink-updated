"""
Mesh networking endpoints for peer-to-peer communication.
"""
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import logging
import uuid
import json
from datetime import datetime
from app.services.webrtc_signaling import signaling_manager

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory storage for demo (in production, this would use a proper database or distributed store)
mesh_peers: Dict[str, Dict[str, Any]] = {}
mesh_messages: List[Dict[str, Any]] = []

@router.get("/status")
async def get_mesh_status():
    """Get current mesh network status."""
    connected_peers = [p for p in mesh_peers.values() if p.get("status") == "connected"]
    total_queued = sum(p.get("queued_messages", 0) for p in mesh_peers.values())
    total_delivered = sum(p.get("delivered_messages", 0) for p in mesh_peers.values())

    return {
        "network_state": "ONLINE" if len(connected_peers) > 0 else "OFFLINE",
        "connected_peers": len(connected_peers),
        "total_peers": len(mesh_peers),
        "queued_messages": total_queued,
        "delivered_messages": total_delivered,
        "last_updated": datetime.now().isoformat()
    }

@router.post("/peers")
async def register_peer(peer_data: Dict[str, Any]):
    """
    Register or update a peer in the mesh network.

    Expected format:
    {
        "peer_id": "unique-peer-id",
        "name": "Peer Name",
        "status": "connected|disconnected|connecting",
        "location": {"lat": 0.0, "lng": 0.0}  # Optional
    }
    """
    try:
        peer_id = peer_data.get("peer_id") or str(uuid.uuid4())
        peer_data["peer_id"] = peer_id
        peer_data["last_seen"] = datetime.now().isoformat()

        # Initialize counters if not present
        if "queued_messages" not in peer_data:
            peer_data["queued_messages"] = 0
        if "delivered_messages" not in peer_data:
            peer_data["delivered_messages"] = 0
        if "hops" not in peer_data:
            peer_data["hops"] = 0

        mesh_peers[peer_id] = peer_data
        logger.info(f"Peer registered/updated: {peer_id}")

        return {"peer_id": peer_id, "status": "registered"}
    except Exception as e:
        logger.error(f"Error registering peer: {e}")
        raise HTTPException(status_code=500, detail="Failed to register peer")

@router.get("/peers")
async def get_peers():
    """Get all peers in the mesh network."""
    return {"peers": list(mesh_peers.values()), "count": len(mesh_peers)}

@router.get("/peers/{peer_id}")
async def get_peer(peer_id: str):
    """Get a specific peer by ID."""
    if peer_id not in mesh_peers:
        raise HTTPException(status_code=404, detail="Peer not found")
    return mesh_peers[peer_id]

@router.delete("/peers/{peer_id}")
async def remove_peer(peer_id: str):
    """Remove a peer from the mesh network."""
    if peer_id not in mesh_peers:
        raise HTTPException(status_code=404, detail="Peer not found")

    removed_peer = mesh_peers.pop(peer_id)
    logger.info(f"Peer removed: {peer_id}")
    return {"peer_id": peer_id, "status": "removed", "peer": removed_peer}

@router.post("/messages")
async def send_message(message_data: Dict[str, Any]):
    """
    Send a message through the mesh network.

    Expected format:
    {
        "sender_id": "peer-id",
        "receiver_id": "peer-id",
        "content": "Message content",
        "priority": "LOW|NORMAL|HIGH|CRITICAL",
        "incident_id": "optional-incident-id",
        "coordinates": {"lat": 0.0, "lng": 0.0}  # Optional
    }
    """
    try:
        # Validate sender and receiver exist
        sender_id = message_data.get("sender_id")
        receiver_id = message_data.get("receiver_id")

        if sender_id not in mesh_peers:
            raise HTTPException(status_code=400, detail=f"Sender peer {sender_id} not found")
        if receiver_id not in mesh_peers:
            raise HTTPException(status_code=400, detail=f"Receiver peer {receiver_id} not found")

        # Create message
        message_id = str(uuid.uuid4())
        message = {
            "id": message_id,
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "content": message_data.get("content", ""),
            "priority": message_data.get("priority", "NORMAL"),
            "incident_id": message_data.get("incident_id"),
            "coordinates": message_data.get("coordinates"),
            "timestamp": datetime.now().isoformat(),
            "status": "CREATED",
            "ttl": message_data.get("ttl", 10),  # Time to live in hops
            "hop_count": 0,
            "route_history": [sender_id]
        }

        # Simulate message delivery based on network status
        sender = mesh_peers[sender_id]
        receiver = mesh_peers[receiver_id]

        # For demo, if both peers are connected, deliver immediately
        if sender.get("status") == "connected" and receiver.get("status") == "connected":
            message["status"] = "DELIVERED"
            # Update counters
            mesh_peers[sender_id]["delivered_messages"] = mesh_peers[sender_id].get("delivered_messages", 0) + 1
            mesh_peers[receiver_id]["delivered_messages"] = mesh_peers[receiver_id].get("delivered_messages", 0) + 1
        else:
            # Queue the message
            message["status"] = "QUEUED"
            # Update sender's queued count
            mesh_peers[sender_id]["queued_messages"] = mesh_peers[sender_id].get("queued_messages", 0) + 1

        mesh_messages.append(message)
        logger.info(f"Message sent: {message_id} from {sender_id} to {receiver_id}")

        return {
            "message_id": message_id,
            "status": message["status"],
            "message": message
        }
    except Exception as e:
        logger.error(f"Error sending message: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")

@router.get("/messages")
async def get_messages(limit: int = 50):
    """Get recent messages."""
    # Return most recent messages first
    recent_messages = sorted(mesh_messages, key=lambda m: m["timestamp"], reverse=True)[:limit]
    return {"messages": recent_messages, "count": len(recent_messages)}

@router.get("/messages/{message_id}")
async def get_message(message_id: str):
    """Get a specific message by ID."""
    for message in mesh_messages:
        if message["id"] == message_id:
            return message
    raise HTTPException(status_code=404, detail="Message not found")

@router.post("/process-queue")
async def process_message_queue():
    """
    Process queued messages (simulate store-and-forward).
    In a real implementation, this would be triggered by peer availability.
    """
    processed_count = 0
    for message in mesh_messages:
        if message["status"] == "QUEUED":
            # Try to deliver if both peers are now connected
            sender_id = message["sender_id"]
            receiver_id = message["receiver_id"]

            if sender_id in mesh_peers and receiver_id in mesh_peers:
                sender = mesh_peers[sender_id]
                receiver = mesh_peers[receiver_id]

                if sender.get("status") == "connected" and receiver.get("status") == "connected":
                    # Deliver the message
                    message["status"] = "DELIVERED"
                    message["delivered_at"] = datetime.now().isoformat()

                    # Update counters
                    mesh_peers[sender_id]["queued_messages"] = max(0, mesh_peers[sender_id].get("queued_messages", 0) - 1)
                    mesh_peers[sender_id]["delivered_messages"] = mesh_peers[sender_id].get("delivered_messages", 0) + 1
                    mesh_peers[receiver_id]["delivered_messages"] = mesh_peers[receiver_id].get("delivered_messages", 0) + 1

                    processed_count += 1

    return {
        "processed": processed_count,
        "message": f"Processed {processed_count} queued messages"
    }

@router.get("/stats")
async def get_mesh_stats():
    """Get mesh network statistics."""
    total_peers = len(mesh_peers)
    connected_peers = len([p for p in mesh_peers.values() if p.get("status") == "connected"])
    total_messages = len(mesh_messages)
    delivered_messages = len([m for m in mesh_messages if m.get("status") == "DELIVERED"])
    queued_messages = len([m for m in mesh_messages if m.get("status") == "QUEUED"])

    return {
        "peers": {
            "total": total_peers,
            "connected": connected_peers,
            "disconnected": total_peers - connected_peers
        },
        "messages": {
            "total": total_messages,
            "delivered": delivered_messages,
            "queued": queued_messages,
            "delivery_rate": round((delivered_messages / total_messages * 100) if total_messages > 0 else 0, 2)
        }
    }

@router.websocket("/ws/signaling/{peer_id}")
async def websocket_endpoint(websocket: WebSocket, peer_id: str):
    await signaling_manager.connect(peer_id, websocket)
    
    # Send current connected peers list to the newly connected peer
    await signaling_manager.send_personal_message({
        "type": "peer-list",
        "peers": signaling_manager.get_connected_peers()
    }, peer_id)

    try:
        while True:
            # Wait for any message from the client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # The message should always have a target peer
            target = message.get("target")
            if not target:
                logger.warning(f"Message from {peer_id} missing target. Payload: {message}")
                continue

            # Route the message to the target peer
            logger.debug(f"Routing message of type {message.get('type')} from {peer_id} to {target}")
            
            # Append the sender's id
            message["sender"] = peer_id
            
            await signaling_manager.send_personal_message(message, target)

    except WebSocketDisconnect:
        await signaling_manager.handle_disconnect(peer_id)
    except Exception as e:
        logger.error(f"Error in signaling websocket for peer {peer_id}: {e}")
        await signaling_manager.handle_disconnect(peer_id)