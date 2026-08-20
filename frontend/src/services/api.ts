const API_URL = 'http://localhost:8000/api/v1';

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  location?: { lat: number; lng: number };
  location_lat?: number;
  location_lng?: number;
  status?: string;
  reported_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  reporter_type: string;
  severity: string;
  location: string;
  location_lat: number;
  location_lng: number;
  confidence: number;
  status: string;
  created_at: string;
}

export interface Zone {
  id: string;
  name: string;
  risk_score: number;
  severity: string;
  population: number;
  survivors: number;
  fires: number;
  damage: number;
  reports: number;
  location: { lat: number; lng: number };
  updated_at: string;
}

export interface Detection {
  id: string;
  class: string;
  confidence: number;
  bbox: number[];
  source: string;
  location?: { lat: number; lng: number };
  location_lat?: number;
  location_lng?: number;
  detected_at: string;
}

export interface Resource {
  id: string;
  type: string;
  name: string;
  status: string;
  location: string;
  location_lat: number;
  location_lng: number;
  assigned_zone: string | null;
  eta: string | null;
  capacity: string;
  updated_at: string;
}

export const api = {
  // Incidents
  getIncidents: async (): Promise<Incident[]> => {
    const res = await fetch(`${API_URL}/incidents`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },
  
  // Reports
  getReports: async (): Promise<Report[]> => {
    const res = await fetch(`${API_URL}/reports`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  createReport: async (reportData: any): Promise<any> => {
    const res = await fetch(`${API_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    if (!res.ok) throw new Error('Failed to create report');
    return res.json();
  },

  // Zones
  getZones: async (): Promise<Zone[]> => {
    const res = await fetch(`${API_URL}/risk/zones`);
    if (!res.ok) throw new Error('Failed to fetch zones');
    return res.json();
  },
  
  // Detections
  getDetections: async (): Promise<Detection[]> => {
    const res = await fetch(`${API_URL}/detections`);
    if (!res.ok) throw new Error('Failed to fetch detections');
    return res.json();
  },

  // Resources
  getResources: async (): Promise<Resource[]> => {
    const res = await fetch(`${API_URL}/resources`);
    if (!res.ok) throw new Error('Failed to fetch resources');
    return res.json();
  },

  // Routes
  getRouteRecommendation: async (data: any): Promise<any> => {
    const res = await fetch(`${API_URL}/routes/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to fetch route recommendation');
    return res.json();
  },

  // Simulation
  getSimulationStatus: async () => {
    const res = await fetch(`${API_URL}/simulation/status`);
    if (!res.ok) throw new Error('Failed to fetch sim status');
    return res.json();
  },
  startSimulation: async () => {
    const res = await fetch(`${API_URL}/simulation/start`, { method: 'POST' });
    return res.json();
  },
  stepSimulation: async () => {
    const res = await fetch(`${API_URL}/simulation/step`, { method: 'POST' });
    return res.json();
  },
  stopSimulation: async () => {
    const res = await fetch(`${API_URL}/simulation/stop`, { method: 'POST' });
    return res.json();
  },
  
  // AI
  getAiBriefing: async (data: any) => {
    const res = await fetch(`${API_URL}/ai/briefing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to fetch AI briefing');
    return res.json();
  },

  getAiBriefingTemplates: async () => {
    const res = await fetch(`${API_URL}/ai/briefing/templates`);
    if (!res.ok) throw new Error('Failed to fetch briefing templates');
    return res.json();
  },

  setAiBriefingTemplate: async (templateType: string) => {
    const res = await fetch(`${API_URL}/ai/briefing/template/${templateType}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to set briefing template');
    return res.json();
  },

  getAiBriefingVersion: async () => {
    const res = await fetch(`${API_URL}/ai/briefing/version`);
    if (!res.ok) throw new Error('Failed to fetch briefing version');
    return res.json();
  },
  
  analyzeImage: async (imageFile: File, lat?: number, lng?: number) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    if (lat != null) formData.append('latitude', lat.toString());
    if (lng != null) formData.append('longitude', lng.toString());
    const res = await fetch(`${API_URL}/detections/analyze`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to analyze image');
    return res.json();
  },

  // Mesh Networking
  getMeshStatus: async (): Promise<any> => {
    const res = await fetch(`${API_URL}/mesh/status`);
    if (!res.ok) throw new Error('Failed to fetch mesh status');
    return res.json();
  },

  registerPeer: async (peerData: any): Promise<any> => {
    const res = await fetch(`${API_URL}/mesh/peers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(peerData)
    });
    if (!res.ok) throw new Error('Failed to register peer');
    return res.json();
  },

  getPeers: async (): Promise<any> => {
    const res = await fetch(`${API_URL}/mesh/peers`);
    if (!res.ok) throw new Error('Failed to fetch peers');
    return res.json();
  },

  getPeer: async (peerId: string): Promise<any> => {
    const res = await fetch(`${API_URL}/mesh/peers/${peerId}`);
    if (!res.ok) throw new Error('Failed to fetch peer');
    return res.json();
  },

  removePeer: async (peerId: string): Promise<any> => {
    const res = await fetch(`${API_URL}/mesh/peers/${peerId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to remove peer');
    return res.json();
  },

  sendMeshMessage: async (messageData: any): Promise<any> => {
    const res = await fetch(`${API_URL}/mesh/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData)
    });
    if (!res.ok) throw new Error('Failed to send mesh message');
    return res.json();
  },

  getMeshMessages: async (limit: number = 50): Promise<any> => {
    const res = await fetch(`${API_URL}/mesh/messages?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch mesh messages');
    return res.json();
  },

  getMeshMessage: async (messageId: string): Promise<any> => {
    const res = await fetch(`${API_URL}/mesh/messages/${messageId}`);
    if (!res.ok) throw new Error('Failed to fetch mesh message');
    return res.json();
  },

  processMessageQueue: async (): Promise<any> => {
    const res = await fetch(`${API_URL}/mesh/process-queue`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to process message queue');
    return res.json();
  },

  getMeshStats: async (): Promise<any> => {
    const res = await fetch(`${API_URL}/mesh/stats`);
    if (!res.ok) throw new Error('Failed to fetch mesh stats');
    return res.json();
  },

  // Field Reports
  analyzeFieldMedia: async (file: File, lat: number, lng: number, disasterType: string, description: string = '') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('latitude', lat.toString());
    formData.append('longitude', lng.toString());
    formData.append('disaster_type', disasterType);
    if (description) formData.append('description', description);

    const res = await fetch(`${API_URL}/field-reports/analyze`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to analyze field media: ${errorText}`);
    }
    return res.json();
  }
};
