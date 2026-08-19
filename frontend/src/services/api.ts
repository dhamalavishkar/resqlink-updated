const API_URL = 'http://localhost:8000';

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  location: { lat: number; lng: number };
  reported_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  reporter_type: string;
  severity: string;
  location: string;
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
  location: { lat: number; lng: number };
  detected_at: string;
}

export interface Resource {
  id: string;
  type: string;
  name: string;
  status: string;
  location: string;
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

  // Zones
  getZones: async (): Promise<Zone[]> => {
    const res = await fetch(`${API_URL}/zones`);
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
  
  analyzeImage: async (imageFile: File) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    const res = await fetch(`${API_URL}/detections/analyze`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to analyze image');
    return res.json();
  }
};
