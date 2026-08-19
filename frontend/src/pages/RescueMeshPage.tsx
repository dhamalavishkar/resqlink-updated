import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Zap, WifiOff, Activity, MapPin, ClipboardList, Send, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';
import { queueRequest, getQueuedRequests } from '@/services/indexedDB';
import { syncEngine } from '@/services/syncEngine';
import { api } from '@/services/api';

export const RescueMeshPage = () => {
  const [meshStatus, setMeshStatus] = useState<'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'MESH_ACTIVE'>('ONLINE');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [peers, setPeers] = useState<Array<{
    id: string;
    name: string;
    status: 'connected' | 'disconnected' | 'connecting';
    hops: number;
    queued: number;
    delivered: number;
  }>>([]);
  const [messages, setMessages] = useState<Array<{
    id: string;
    content: string;
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
    timestamp: string;
    status: 'CREATED' | 'QUEUED' | 'FORWARDED' | 'DELIVERED' | 'EXPIRED';
    from: string;
    to: string;
  }>>([]);
  const [newMessage, setNewMessage] = useState({
    recipient: '',
    content: '',
    priority: 'NORMAL' as const,
    incidentId: '',
    coordinates: '' // e.g., "20.5937,78.9629"
  });
  const [isSending, setIsSending] = useState(false);
  const [roomCode, setRoomCode] = useState('');

  useEffect(() => {
    // Initialize mock data
    setPeers([
      { id: 'local', name: 'This Device', status: 'connected', hops: 0, queued: 0, delivered: 12 },
      { id: 'peer-1', name: 'Responder Alpha', status: 'connected', hops: 1, queued: 2, delivered: 8 },
      { id: 'peer-2', name: 'Base Station', status: 'disconnected', hops: 0, queued: 5, delivered: 15 },
      { id: 'peer-3', name: 'Drone Unit', status: 'connecting', hops: 2, queued: 0, delivered: 3 }
    ]);

    setMessages([
      {
        id: 'msg-1',
        content: 'Requesting medical evacuation for Zone A-01',
        priority: 'CRITICAL',
        timestamp: '2 minutes ago',
        status: 'DELIVERED',
        from: 'local',
        to: 'peer-1'
      },
      {
        id: 'msg-2',
        content: 'Fire spreading north, need additional units',
        priority: 'HIGH',
        timestamp: '5 minutes ago',
        status: 'QUEUED',
        from: 'local',
        to: 'peer-2'
      },
      {
        id: 'msg-3',
        content: 'All clear in Sector B, returning to base',
        priority: 'NORMAL',
        timestamp: '10 minutes ago',
        status: 'DELIVERED',
        from: 'peer-1',
        to: 'local'
      }
    ]);

    // Generate a room code for demo
    setRoomCode(Math.random().toString(36).substring(2, 8).toUpperCase());
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.content.trim() || !newMessage.recipient) return;

    setIsSending(true);
    
    const newMsg = {
      id: `msg-${Date.now()}`,
      content: newMessage.content,
      priority: newMessage.priority,
      timestamp: new Date().toLocaleTimeString(),
      status: meshStatus === 'OFFLINE' || meshStatus === 'DEGRADED' ? 'QUEUED' : 'DELIVERED',
      from: 'local',
      to: newMessage.recipient
    };

    if (meshStatus === 'OFFLINE' || meshStatus === 'DEGRADED') {
      // Offline mode: queue in IndexedDB
      await queueRequest('/messages', 'POST', newMsg);
    } else {
      // Online mode: try to send via API
      try {
        await fetch('http://localhost:8000/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMsg)
        });
      } catch (err) {
        // Fallback to queue if network failed
        newMsg.status = 'QUEUED';
        await queueRequest('/messages', 'POST', newMsg);
      }
    }

    setMessages(prev => [newMsg as any, ...prev]);
    
    // Update peer queued/delivered counts
    setPeers(prev =>
      prev.map(peer =>
        peer.id === newMessage.recipient
          ? {
              ...peer,
              queued: newMsg.status === 'QUEUED' ? peer.queued + 1 : peer.queued,
              delivered: newMsg.status === 'DELIVERED' ? peer.delivered + 1 : peer.delivered
            }
          : peer
      )
    );
    setIsSending(false);
    setNewMessage({ ...newMessage, content: '' });
  };

  const toggleDemoMode = () => {
    setIsDemoMode(!isDemoMode);
    if (isDemoMode) {
      setMeshStatus('ONLINE');
      syncEngine.setOnlineStatus(true);
    } else {
      setMeshStatus('OFFLINE');
      syncEngine.setOnlineStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Rescue Mesh Network</h2>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDemoMode}
          >
            {isDemoMode ? 'Exit Demo Mode' : 'Enter Demo Mode'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Network Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  {meshStatus === 'ONLINE' ? (
                    <WifiOff className="h-5 w-5 text-green-500" />
                  ) : meshStatus === 'DEGRADED' ? (
                    <WifiOff className="h-5 w-5 text-yellow-500" />
                  ) : meshStatus === 'OFFLINE' ? (
                    <WifiOff className="h-5 w-5 text-red-500" />
                  ) : (
                    <Zap className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Network State</h4>
                  <p className="text-sm">{meshStatus}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Connected Peers</span>
                </div>
                <div className="space-y-2">
                  {peers.map((peer, index) => (
                    <div key={peer.id} className="p-3 border rounded-md">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {peer.status === 'connected' ? (
                            <Users className="h-4 w-4 text-green-500" />
                          ) : peer.status === 'connecting' ? (
                            <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
                          ) : (
                            <Users className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{peer.name}</h4>
                          <p className="text-xs text-gray-500">Status: {peer.status}</p>
                          <div className="flex items-center space-x-4 text-xs mt-1">
                            <span>Hops: {peer.hops}</span>
                            <span>Queued: {peer.queued}</span>
                            <span>Delivered: {peer.delivered}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMeshStatus(prev => (prev === 'ONLINE' ? 'DEGRADED' : 'ONLINE'))}
                >
                  Simulate Network Degradation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMeshStatus(prev => (prev === 'OFFLINE' ? 'ONLINE' : 'OFFLINE'))}
                >
                  Simulate Network Loss
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Send Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient
                  </label>
                  <select
                    value={newMessage.recipient}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, recipient: e.target.value }))}
                    disabled={isSending}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select a peer</option>
                    {peers
                      .filter(peer => peer.id !== 'local' && peer.status === 'connected')
                      .map(peer => (
                        <option key={peer.id} value={peer.id}>
                          {peer.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message Priority
                  </label>
                  <select
                    value={newMessage.priority}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, priority: e.target.value }))}
                    disabled={isSending}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message Content
                  </label>
                  <textarea
                    value={newMessage.content}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                    rows={3}
                    disabled={isSending}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your message here..."
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={isSending || !newMessage.content.trim() || !newMessage.recipient}
                  >
                    {isSending ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Demo Room Code</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="font-mono text-2xl font-bold letter-spacing-wide">{roomCode}</div>
                <p className="mt-2 text-sm text-gray-500">
                  Share this code with peers to connect in demo mode
                </p>
                <Button variant="outline" size="xs" className="mt-2">
                  Copy Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Message History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-96 overflow-y-auto">
                {messages.length > 0 ? (
                  <div className="space-y-3">
                    {messages.map((msg, index) => (
                      <div key={msg.id} className="p-3 border rounded-md">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {msg.priority === 'CRITICAL' ? (
                              <Activity className="h-4 w-4 text-red-500" />
                            ) : msg.priority === 'HIGH' ? (
                              <Activity className="h-4 w-4 text-orange-500" />
                            ) : msg.priority === 'NORMAL' ? (
                              <Users className="h-4 w-4 text-gray-500" />
                            ) : (
                              <MapPin className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{msg.content}</h4>
                            <p className="text-sm text-gray-500 flex items-center space-x-2">
                              <span className="font-medium">{msg.priority}</span>
                              <Badge
                                variant={msg.status === 'DELIVERED' ? 'secondary' :
                                         msg.status === 'QUEUED' ? 'outline' :
                                         msg.status === 'CREATED' ? 'default' :
                                         msg.status === 'FORWARDED' ? 'secondary' : 'destructive'}
                              >
                                {msg.status}
                              </Badge>
                            </p>
                            <p className="text-xs text-gray-400">
                              From: {msg.from} → To: {msg.to} • {msg.timestamp}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClipboardList className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No messages yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Network Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Total Peers</span>
                </div>
                <p className="text-right text-sm font-medium">{peers.length}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Active Connections</span>
                </div>
                <p className="text-right text-sm font-medium">
                  {peers.filter(p => p.status === 'connected').length}
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <ClipboardList className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Queued Messages</span>
                </div>
                <p className="text-right text-sm font-medium">
                  {peers.reduce((sum, peer) => sum + peer.queued, 0)}
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">Delivered Messages</span>
                </div>
                <p className="text-right text-sm font-medium">
                  {peers.reduce((sum, peer) => sum + peer.delivered, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};