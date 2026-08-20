"""
WebRTC Signaling Service using WebSockets.
"""
from fastapi import WebSocket
from typing import Dict, List, Any
import logging
import json

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        # Maps peer_id to their active WebSocket connection
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, peer_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[peer_id] = websocket
        logger.info(f"Peer {peer_id} connected to signaling server.")
        
        # Broadcast to all other peers that a new peer joined
        await self.broadcast({
            "type": "peer-joined",
            "peer_id": peer_id
        }, exclude_peer=peer_id)

    def disconnect(self, peer_id: str):
        if peer_id in self.active_connections:
            del self.active_connections[peer_id]
            logger.info(f"Peer {peer_id} disconnected from signaling server.")
            
    async def handle_disconnect(self, peer_id: str):
        self.disconnect(peer_id)
        # Notify others
        await self.broadcast({
            "type": "peer-left",
            "peer_id": peer_id
        })

    async def send_personal_message(self, message: Dict[str, Any], peer_id: str):
        if peer_id in self.active_connections:
            websocket = self.active_connections[peer_id]
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to {peer_id}: {e}")
                await self.handle_disconnect(peer_id)
        else:
            logger.warning(f"Attempted to send message to disconnected peer {peer_id}")

    async def broadcast(self, message: Dict[str, Any], exclude_peer: str = None):
        disconnected_peers = []
        for peer_id, connection in self.active_connections.items():
            if exclude_peer and peer_id == exclude_peer:
                continue
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to {peer_id}: {e}")
                disconnected_peers.append(peer_id)
                
        for peer_id in disconnected_peers:
            await self.handle_disconnect(peer_id)

    def get_connected_peers(self) -> List[str]:
        return list(self.active_connections.keys())

signaling_manager = ConnectionManager()
