import { v4 as uuidv4 } from 'uuid';

type PeerCallback = (peerId: string) => void;
type MessageCallback = (message: any) => void;

export class WebRTCMeshEngine {
  private signalingSocket: WebSocket | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private dataChannels: Map<string, RTCDataChannel> = new Map();
  
  public peerId: string = uuidv4();
  
  private onPeerConnectedCallback?: PeerCallback;
  private onPeerDisconnectedCallback?: PeerCallback;
  private onMessageReceivedCallback?: MessageCallback;

  constructor(private signalingUrl: string = 'ws://localhost:8000/api/v1/mesh/ws/signaling') {}

  public connect() {
    this.signalingSocket = new WebSocket(`${this.signalingUrl}/${this.peerId}`);
    
    this.signalingSocket.onopen = () => {
      console.log('Connected to signaling server as', this.peerId);
    };

    this.signalingSocket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      
      switch (message.type) {
        case 'peer-list':
          // Start connections with all existing peers
          message.peers.forEach((id: string) => {
            if (id !== this.peerId) {
              this.initiateConnection(id);
            }
          });
          break;
        case 'peer-joined':
          console.log('New peer joined:', message.peer_id);
          // Wait for the new peer to initiate, or we can initiate
          break;
        case 'peer-left':
          this.handlePeerLeft(message.peer_id);
          break;
        case 'offer':
          await this.handleOffer(message.sender, message.offer);
          break;
        case 'answer':
          await this.handleAnswer(message.sender, message.answer);
          break;
        case 'ice-candidate':
          await this.handleIceCandidate(message.sender, message.candidate);
          break;
      }
    };
  }

  public disconnect() {
    this.signalingSocket?.close();
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    this.dataChannels.clear();
  }

  public onPeerConnected(cb: PeerCallback) {
    this.onPeerConnectedCallback = cb;
  }

  public onPeerDisconnected(cb: PeerCallback) {
    this.onPeerDisconnectedCallback = cb;
  }

  public onMessageReceived(cb: MessageCallback) {
    this.onMessageReceivedCallback = cb;
  }

  public getConnectedPeers(): string[] {
    return Array.from(this.dataChannels.keys()).filter(id => 
      this.dataChannels.get(id)?.readyState === 'open'
    );
  }

  public broadcastMessage(payload: any) {
    const message = JSON.stringify(payload);
    this.dataChannels.forEach((channel, id) => {
      if (channel.readyState === 'open') {
        channel.send(message);
      }
    });
  }

  private createPeerConnection(targetPeerId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignalingMessage({
          type: 'ice-candidate',
          target: targetPeerId,
          candidate: event.candidate
        });
      }
    };

    pc.ondatachannel = (event) => {
      const channel = event.channel;
      this.setupDataChannel(targetPeerId, channel);
    };

    pc.onconnectionstatechange = () => {
      console.log(`Connection to ${targetPeerId} state:`, pc.connectionState);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.handlePeerLeft(targetPeerId);
      }
    };

    this.peerConnections.set(targetPeerId, pc);
    return pc;
  }

  private setupDataChannel(targetPeerId: string, channel: RTCDataChannel) {
    this.dataChannels.set(targetPeerId, channel);
    
    channel.onopen = () => {
      console.log(`Data channel to ${targetPeerId} opened`);
      if (this.onPeerConnectedCallback) {
        this.onPeerConnectedCallback(targetPeerId);
      }
    };
    
    channel.onclose = () => {
      console.log(`Data channel to ${targetPeerId} closed`);
      this.handlePeerLeft(targetPeerId);
    };
    
    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (this.onMessageReceivedCallback) {
          this.onMessageReceivedCallback(data);
        }
      } catch (e) {
        console.error('Error parsing peer message', e);
      }
    };
  }

  private async initiateConnection(targetPeerId: string) {
    if (this.peerConnections.has(targetPeerId)) return;

    const pc = this.createPeerConnection(targetPeerId);
    const channel = pc.createDataChannel('mesh-data');
    this.setupDataChannel(targetPeerId, channel);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    this.sendSignalingMessage({
      type: 'offer',
      target: targetPeerId,
      offer: offer
    });
  }

  private async handleOffer(senderId: string, offer: RTCSessionDescriptionInit) {
    let pc = this.peerConnections.get(senderId);
    if (!pc) {
      pc = this.createPeerConnection(senderId);
    }
    
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    this.sendSignalingMessage({
      type: 'answer',
      target: senderId,
      answer: answer
    });
  }

  private async handleAnswer(senderId: string, answer: RTCSessionDescriptionInit) {
    const pc = this.peerConnections.get(senderId);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  private async handleIceCandidate(senderId: string, candidate: RTCIceCandidateInit) {
    const pc = this.peerConnections.get(senderId);
    if (pc) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('Error adding ICE candidate', e);
      }
    }
  }

  private handlePeerLeft(peerId: string) {
    this.peerConnections.get(peerId)?.close();
    this.peerConnections.delete(peerId);
    this.dataChannels.delete(peerId);
    if (this.onPeerDisconnectedCallback) {
      this.onPeerDisconnectedCallback(peerId);
    }
  }

  private sendSignalingMessage(message: any) {
    if (this.signalingSocket?.readyState === WebSocket.OPEN) {
      this.signalingSocket.send(JSON.stringify(message));
    }
  }
}

export const webrtcMesh = new WebRTCMeshEngine();
