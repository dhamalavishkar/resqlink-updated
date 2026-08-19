# Offline Mesh Networking in ResQLink

## Overview

ResQLink implements a mesh networking layer using WebRTC to enable peer-to-peer communication between devices when traditional internet connectivity is unavailable or unreliable. This document explains the implementation details, limitations, and considerations for the mesh networking component.

## How It Works

### Peer Discovery and Connection

In ResQLink, mesh networking requires a signaling mechanism for peers to discover each other and establish connections. Due to browser security restrictions, websites cannot automatically discover nearby devices via Bluetooth or Wi-Fi Direct without explicit user permission and a mediating server.

Our implementation uses a simple signaling approach for demonstration:

1. **Room Codes**: Users can generate a room code that others can enter to join the same mesh network
2. **Manual Signaling**: In more advanced setups, peers can exchange signaling data (SDPs and ICE candidates) via any channel (QR code, manual copy/paste, etc.)
3. **Local Server Option**: For local testing, a simple signaling server can be run to facilitate connections

### Connection Establishment

Once peers have exchanged signaling information through the chosen method:
1. Each peer creates an `RTCPeerConnection`
2. Local ICE candidates are gathered and sent to other peers via the signaling channel
3. Remote ICE candidates are received and added to the connection
4. When ICE connection state becomes "connected", peers can exchange data via `RTCDataChannel`

### Data Transfer

Mesh communication uses `RTCDataChannel` for reliable, ordered data transfer. Each message is packaged as a JSON object with the following structure:

```javascript
{
  "id": "unique-message-id",
  "senderId": "peer-identifier",
  "receiverId": "target-peer-identifier",
  "timestamp": "ISO timestamp",
  "payload": "message content",
  "priority": "LOW|NORMAL|HIGH|CRITICAL",
  "ttl": 10,           // Time to live in hops
  "hopCount": 0,       // Number of hops traveled so far
  "routeHistory": ["peer1", "peer2"], // Array of peer IDs that handled this message
  "status": "CREATED|QUEUED|FORWARDED|DELIVERED|EXPIRED"
}
```

### Store-and-Forward Mechanism

When a peer cannot directly connect to the intended recipient:
1. The message is stored locally in IndexedDB
2. The peer attempts to forward the message to any connected peers
3. When a peer receives a message:
   - It checks if it's the intended recipient
   - If not, and if TTL > 0 and hop count < TTL, it forwards the message to its connected peers (excluding the sender)
   - It decrements TTL and increments hop count
   - It adds its ID to the route history
   - It stores the message locally to prevent reprocessing (using a message ID cache)

### Duplicate Prevention

To prevent infinite loops and duplicate processing:
1. Each message has a globally unique ID
2. Peers maintain a cache of recently seen message IDs
3. When a message is received, the peer checks if it has already processed that ID
4. If yes, the message is discarded
5. The cache has a limited size and uses LRU eviction

## Implementation Limitations

### Browser Constraints

1. **No Direct Discovery**: Browsers do not provide APIs for discovering nearby devices without user mediation. This is a security feature to prevent unwanted tracking.
2. **HTTPS Requirement**: WebRTC requires HTTPS except for localhost, which can complicate deployment in field environments.
3. **Firewall/NAT Traversal**: Depending on network configuration, peers may not be able to establish direct connections without STUN/TURN servers.

### Demo vs Production

The current implementation is optimized for hackathon demonstration:

**Demo Features:**
- Simple room-code based signaling
- In-browser peer simulation (multiple tabs/windows can act as peers)
- Visual representation of mesh connections
- Message queueing and forwarding simulation

**Production Requirements:**
- Integration with actual device-to-device discovery mechanisms (Bluetooth LE, Wi-Fi Aware, etc.)
- Robust signaling server with authentication
- Fallback mechanisms for when direct P2P connections fail
- Battery-efficient implementation for mobile devices
- Encryption and authentication for mesh communications

## Usage in ResQLink

In the RescueMesh page, users can:
1. View their current mesh network status (ONLINE, DEGRADED, OFFLINE, MESH_ACTIVE)
2. See connected peers, their connection status, and message statistics
3. Send messages with priority levels to specific peers
4. Observe message queueing when peers are disconnected
5. Simulate network conditions for testing

The mesh networking layer integrates with the rest of the system by:
- Allowing incident reports and sensor data to be shared between devices
- Enabling coordinated response even when internet is down
- Providing a resilient communication backbone for emergency operations

## Future Improvements

1. **Hybrid Connectivity**: Combine mesh networking with opportunistic Wi-Fi and cellular when available
2. **Advanced Routing**: Implement more sophisticated routing protocols (like OLSR or B.A.T.M.A.N.)
3. **Service Discovery**: Allow peers to advertise available resources (medical supplies, expertise, etc.)
4. **Encryption**: Add end-to-end encryption for sensitive communications
5. **Power Optimization**: Implement duty cycling and low-power modes for battery-operated devices

## Conclusion

While the current implementation does not provide a production-ready mesh network suitable for immediate disaster deployment, it demonstrates the core concepts and provides a foundation for future development. The store-and-forward approach with duplicate prevention ensures that messages will eventually reach their destination when connectivity is restored, making it a valuable tool for emergency communication planning.