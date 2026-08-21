import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WifiOff, Zap, Users, Activity, ClipboardList, MapPin, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { api, Zone, Report, Detection, Resource, Incident } from '@/services/api';
import { DemoSimulationControls } from '@/components/DemoSimulationControls';

type CoordsSource = {
  location?: { lat?: number; lng?: number } | null;
  location_lat?: number | null;
  location_lng?: number | null;
};

function getCoords(item: CoordsSource): [number, number] | null {
  const lat = item.location?.lat ?? item.location_lat;
  const lng = item.location?.lng ?? item.location_lng;
  if (lat == null || lng == null || Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) {
    return null;
  }
  return [Number(lat), Number(lng)];
}

const createIcon = (color: string, emoji: string) =>
  L.divIcon({
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:13px;line-height:1;">${emoji}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });

export const OverviewPage = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incidentsData, zonesData, reportsData, detectionsData, resourcesData] = await Promise.all([
          api.getIncidents(),
          api.getZones(),
          api.getReports(),
          api.getDetections(),
          api.getResources()
        ]);

        setIncidents(incidentsData);
        setZones(zonesData);
        setReports(reportsData);
        setDetections(detectionsData);
        setResources(resourcesData);

      } catch (err) {
        console.error("Error fetching overview data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Poll every 3 seconds so newly uploaded incidents reflect immediately
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Optimize computations with useMemo to prevent recalculating on every render
  const topZones = useMemo(() => {
    return [...zones].sort((a, b) => b.risk_score - a.risk_score).slice(0, 3);
  }, [zones]);

  const recentReports = useMemo(() => {
    return [...reports].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3);
  }, [reports]);

  const criticalZones = useMemo(() => {
    return zones.filter(z => z.severity === 'CRITICAL' || z.risk_score > 80);
  }, [zones]);

  const survivorsDetected = useMemo(() => {
    return detections.filter(d => d.class === 'person').length;
  }, [detections]);

  const activeRescueTeams = useMemo(() => {
    return resources.filter(r => r.type !== 'shelter' && r.status === 'deployed').length;
  }, [resources]);

  const unresolvedReports = useMemo(() => {
    return reports.filter(r => r.status === 'NEW' || r.status === 'INVESTIGATING').length;
  }, [reports]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[var(--color-text)]">Overview</h2>
      </div>

      <DemoSimulationControls />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass shadow-card hover-shadow transition-all duration-200 p-4" role="region" aria-label="Active Incidents">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-[var(--color-secondary)]">Active Incidents</h3>
              <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">{incidents.length}</p>
            </div>
            <div className="p-2 rounded-md bg-[var(--color-primary)/10%]">
              <MapPin className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
          </div>
        </div>
        <div className="glass shadow-card hover-shadow transition-all duration-200 p-4" role="region" aria-label="Critical Zones">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-[var(--color-secondary)]">Critical Zones</h3>
              <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">{criticalZones.length}</p>
            </div>
            <div className="p-2 rounded-md bg-[var(--color-accent-red)/10%]">
              <AlertTriangle className="h-5 w-5 text-[var(--color-accent-red)]" />
            </div>
          </div>
        </div>
        <div className="glass shadow-card hover-shadow transition-all duration-200 p-4" role="region" aria-label="Survivors Detected">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-[var(--color-secondary)]">Survivors Detected</h3>
              <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">{survivorsDetected}</p>
            </div>
            <div className="p-2 rounded-md bg-[var(--color-accent-green)/10%]">
              <Users className="h-5 w-5 text-[var(--color-accent-green)]" />
            </div>
          </div>
        </div>
        <div className="glass shadow-card hover-shadow transition-all duration-200 p-4" role="region" aria-label="Active Rescue Teams">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-[var(--color-secondary)]">Active Rescue Teams</h3>
              <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">{activeRescueTeams}</p>
            </div>
            <div className="p-2 rounded-md bg-[var(--color-primary)/10%]">
              <Users className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
          </div>
        </div>
        <div className="glass shadow-card hover-shadow transition-all duration-200 p-4" role="region" aria-label="Mesh-connected Devices">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-[var(--color-secondary)]">Mesh-connected Devices</h3>
              <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">0</p>
            </div>
            <div className="p-2 rounded-md bg-[var(--color-accent-blue)/10%]">
              <Zap className="h-5 w-5 text-[var(--color-accent-blue)]" />
            </div>
          </div>
        </div>
        <div className="glass shadow-card hover-shadow transition-all duration-200 p-4" role="region" aria-label="Unresolved Reports">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-[var(--color-secondary)]">Unresolved Reports</h3>
              <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">{unresolvedReports}</p>
            </div>
            <div className="p-2 rounded-md bg-[var(--color-primary)/10%]">
              <ClipboardList className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="col-span-1 lg:col-span-3">
          <Card className="glass shadow-card hover-shadow transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-[var(--color-text)] font-semibold">Live Incident Map</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-96 w-full relative z-0">
                <MapContainer
                  center={[20.5937, 78.9629]}
                  zoom={4}
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                  {incidents.map((incident) => {
                    const coords = getCoords(incident);
                    if (!coords) return null;
                    return (
                      <Marker
                        key={incident.id}
                        position={coords}
                        icon={createIcon('#dc2626', '🚨')}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-bold text-[var(--color-accent-red)]">{incident.title}</h3>
                            <p className="text-[var(--color-text)] text-sm">{incident.description}</p>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-1 lg:col-span-3">
          <Card className="glass shadow-card hover-shadow transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-[var(--color-text)] font-semibold">Highest Risk Zones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topZones.map(zone => (
                  <div key={zone.id} className={`${zone.severity === 'CRITICAL' ? 'bg-[var(--color-accent-red)/10%]' : 'bg-[var(--color-accent-blue)/10%]'} p-3 rounded-md`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-[var(--color-text)]">{zone.name}</h4>
                        <p className="text-[var(--color-secondary)] text-sm">Risk Score: {zone.risk_score}</p>
                      </div>
                      <div className={`w-3 h-3 ${zone.severity === 'CRITICAL' ? 'bg-[var(--color-accent-red)]' : 'bg-[var(--color-accent-yellow)]'} rounded-full`} />
                    </div>
                  </div>
                ))}
                {topZones.length === 0 && <p className="text-[var(--color-secondary)] text-sm">No zones reported.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-1 lg:col-span-3">
          <Card className="glass shadow-card hover-shadow transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-[var(--color-text)] font-semibold">Latest Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReports.map(report => (
                  <div key={report.id} className="p-3 bg-[var(--color-background)/50%] rounded-md">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {report.reporter_type === 'AI Detection' ? <Activity className="h-4 w-4 text-[var(--color-secondary)]" /> : <Users className="h-4 w-4 text-[var(--color-secondary)]" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-[var(--color-text)]">{report.reporter_type} report: {report.title}</h4>
                        <p className="text-[var(--color-secondary)] text-sm">{new Date(report.created_at).toLocaleTimeString()} • {report.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {recentReports.length === 0 && <p className="text-[var(--color-secondary)] text-sm">No recent reports.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-1 lg:col-span-3">
          <Card className="glass shadow-card hover-shadow transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-[var(--color-text)] font-semibold">AI Situation Brief</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-[var(--color-text)] text-sm">
                <p className="mb-2">
                  At 14:32, three high-priority zones were identified in the northern sector.
                  Survivor detections increased by 40% over the last hour.
                </p>
                <p className="mb-2">
                  Fire risk remains elevated in the industrial district due to damaged storage facilities.
                  Structural collapse risk is moderate in residential areas.
                </p>
                <p className="mb-2">
                  Recommended actions: Deploy SAR teams to zones A-01 and B-07, establish evacuation routes,
                  and coordinate with fire response units.
                </p>
                <Button variant="outline" size="sm" className="text-[var(--color-primary)] hover:text-[var(--color-text)] border-[var(--color-primary)] hover:border-[var(--color-primary)/50%] hover-shadow transition-all duration-200">
                  View Full Briefing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-1 lg:col-span-3">
          <Card className="glass shadow-card hover-shadow transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-[var(--color-text)] font-semibold">Network Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)/10%] flex items-center justify-center">
                  <WifiOff className="h-5 w-5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h4 className="font-medium text-[var(--color-text)]">Internet Connectivity</h4>
                  <p className="text-[var(--color-secondary)] text-sm">Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-yellow)/10%] flex items-center justify-center">
                  <Zap className="h-5 w-5 text-[var(--color-accent-yellow)]" />
                </div>
                <div>
                  <h4 className="font-medium text-[var(--color-text)]">Mesh Network</h4>
                  <p className="text-[var(--color-secondary)] text-sm">8 devices connected</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-accent-green)/10%] flex items-center justify-center">
                  <Users className="h-5 w-5 text-[var(--color-accent-green)]" />
                </div>
                <div>
                  <h4 className="font-medium text-[var(--color-text)]">Peers in Range</h4>
                  <p className="text-[var(--color-secondary)] text-sm">3 devices available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="col-span-1 lg:col-span-3">
          <Card className="glass shadow-card hover-shadow transition-all duration-200">
            <CardHeader>
              <CardTitle className="text-[var(--color-text)] font-semibold">Rescue Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-[var(--color-background)/50%] rounded-md">
                  <div className="flex-shrink-0">
                    <Users className="h-4 w-4 text-[var(--color-secondary)]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--color-text)]">Medical Units</h4>
                    <p className="text-[var(--color-secondary)] text-sm">4 available</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-[var(--color-background)/50%] rounded-md">
                  <div className="flex-shrink-0">
                    <Activity className="h-4 w-4 text-[var(--color-secondary)]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--color-text)]">Fire Response</h4>
                    <p className="text-[var(--color-secondary)] text-sm">2 available</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-[var(--color-background)/50%] rounded-md">
                  <div className="flex-shrink-0">
                    <MapPin className="h-4 w-4 text-[var(--color-secondary)]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--color-text)]">Shelters</h4>
                    <p className="text-[var(--color-secondary)] text-sm">6 available</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};