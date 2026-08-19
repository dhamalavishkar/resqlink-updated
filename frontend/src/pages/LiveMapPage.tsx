import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { WifiOff, Zap, Users, Activity, AlertTriangle, MapPin, CloudRain, ZapOff } from 'lucide-react';
import { api, Zone, Report, Detection, Resource } from '@/services/api';

// Custom icon factory
const createIcon = (icon: any, color: string) => {
  return L.divIcon({
    html: `<div className="flex items-center justify-center"><${icon} className="h-5 w-5 text-${color}-600" /></div>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

export const LiveMapPage = () => {
  const [layers, setLayers] = useState({
    survivors: true,
    fires: true,
    damage: true,
    reports: true,
    resources: true
  });

  const [zoom, setZoom] = useState(13);
  const [center, setCenter] = useState<[number, number]>([20.5937, 78.9629]); // Center of India

  const [zones, setZones] = useState<Zone[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [zData, rData, dData, resData] = await Promise.all([
          api.getZones(),
          api.getReports(),
          api.getDetections(),
          api.getResources()
        ]);
        setZones(zData);
        setReports(rData);
        setDetections(dData);
        setResources(resData);
      } catch (err) {
        console.error("Error fetching map data", err);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const survivors = detections.filter(d => d.class === 'person');
  const fires = detections.filter(d => d.class === 'fire');
  // Mock structural damage based on critical zones for now
  const damages = zones.filter(z => z.damage > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Live Incident Map</h2>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => setZoom(13), setCenter([20.5937, 78.9629])}>
            Reset View
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Map Controls</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-wrap items-center space-x-4 p-4 bg-gray-50">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={layers.survivors}
                    onChange={(e) => setLayers(prev => ({ ...prev, survivors: e.target.checked }))}
                  />
                  Survivors
                </label>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={layers.fires}
                    onChange={(e) => setLayers(prev => ({ ...prev, fires: e.target.checked }))}
                  />
                  Fires
                </label>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={layers.damage}
                    onChange={(e) => setLayers(prev => ({ ...prev, damage: e.target.checked }))}
                  />
                  Structural Damage
                </label>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={layers.reports}
                    onChange={(e) => setLayers(prev => ({ ...prev, reports: e.target.checked }))}
                  />
                  Reports
                </label>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={layers.resources}
                    onChange={(e) => setLayers(prev => ({ ...prev, resources: e.target.checked }))}
                  />
                  Resources
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Map</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div style={{ height: '500px' }}>
                <MapContainer
                  center={center}
                  zoom={zoom}
                  scrollWheelZoom={true}
                  whenCreated={map => map.invalidateSize()}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {/* Survivors */}
                  {layers.survivors && survivors.map(s => (
                    <Marker key={s.id} position={[s.location.lat, s.location.lng]} icon={createIcon(Users, 'green')}>
                      <Popup>
                        <strong>Survivor Detected</strong><br/>
                        Confidence: {(s.confidence * 100).toFixed(0)}%
                      </Popup>
                    </Marker>
                  ))}
                  {/* Fires */}
                  {layers.fires && fires.map(f => (
                    <Marker key={f.id} position={[f.location.lat, f.location.lng]} icon={createIcon(Activity, 'red')}>
                      <Popup>
                        <strong>Fire Detected</strong><br/>
                        Confidence: {(f.confidence * 100).toFixed(0)}%
                      </Popup>
                    </Marker>
                  ))}
                  {/* Structural Damage */}
                  {layers.damage && damages.map(d => (
                    <Marker key={d.id} position={[d.location.lat, d.location.lng]} icon={createIcon(AlertTriangle, 'orange')} eventHandlers={{ click: () => setSelectedZone(d) }}>
                      <Popup>
                        <strong>Zone: {d.name}</strong><br/>
                        Structural Damage Reported
                      </Popup>
                    </Marker>
                  ))}
                  {/* Reports */}
                  {layers.reports && reports.map(r => {
                    // Extract lat lng from location string if it was mock data, or use coordinates if available.
                    // Assuming for demo we map them randomly if location string is used instead of lat/lng object
                    const lat = 20.59 + (Math.random() * 0.04 - 0.02);
                    const lng = 78.96 + (Math.random() * 0.04 - 0.02);
                    return (
                      <Marker key={r.id} position={[lat, lng]} icon={createIcon(CloudRain, r.severity === 'CRITICAL' ? 'red' : 'yellow')}>
                        <Popup>
                          <strong>{r.title}</strong><br/>
                          Severity: {r.severity}
                        </Popup>
                      </Marker>
                    );
                  })}
                  {/* Resources */}
                  {layers.resources && resources.map(res => {
                    // Same as above for demo mock data string location
                    const lat = 20.59 + (Math.random() * 0.04 - 0.02);
                    const lng = 78.96 + (Math.random() * 0.04 - 0.02);
                    return (
                      <Marker key={res.id} position={[lat, lng]} icon={createIcon(MapPin, res.status === 'available' ? 'blue' : 'gray')}>
                        <Popup>
                          <strong>{res.type.replace('_', ' ').toUpperCase()}</strong><br/>
                          Status: {res.status}
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Map Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex-shrink-0">
                  {createIcon(Users, 'green')}
                </div>
                <div>
                  Survivor Detection
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex-shrink-0">
                  {createIcon(Activity, 'red')}
                </div>
                <div>
                  Fire Detection
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex-shrink-0">
                  {createIcon(AlertTriangle, 'orange')}
                </div>
                <div>
                  Structural Damage
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex-shrink-0">
                  {createIcon(CloudRain, 'yellow')}
                </div>
                <div>
                  Incident Report
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex-shrink-0">
                  {createIcon(MapPin, 'blue')}
                </div>
                <div>
                  Available Resource
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selected Area Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedZone ? (
                <div className="p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-gray-900">{selectedZone.name}</h4>
                  <p className="text-sm text-gray-500">Risk Score: {selectedZone.risk_score} ({selectedZone.severity})</p>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span>{selectedZone.survivors} survivors</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-red-500" />
                      <span>{selectedZone.fires} active fires</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span>{selectedZone.damage} structural damages</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-500">
                  Select a zone on the map to view details.
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full" disabled={!selectedZone}>
                View Zone Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};