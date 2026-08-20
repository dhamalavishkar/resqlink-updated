import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  Users, Activity, AlertTriangle, MapPin, CloudRain,
  Camera, Upload, Loader2, CheckCircle2, Navigation, Eye
} from 'lucide-react';
import { api, Zone, Detection, Resource, Incident } from '@/services/api';

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

const ICON_COLORS: Record<string, string> = {
  survivor: '#16a34a',
  fire: '#dc2626',
  damage: '#ea580c',
  report: '#ca8a04',
  reportCritical: '#dc2626',
  resource: '#2563eb',
  resourceBusy: '#6b7280',
  zone: '#9333ea',
};

const createIcon = (color: string, emoji: string) =>
  L.divIcon({
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:13px;line-height:1;">${emoji}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });

function LocationPicker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const LiveMapPage = () => {
  const [layers, setLayers] = useState({
    zones: true,
    survivors: true,
    fires: true,
    damage: true,
    reports: true,
    resources: true,
  });

  const [center, setCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  // Upload panel state
  const [uploadMode, setUploadMode] = useState<'field' | 'vision'>('field');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [disasterType, setDisasterType] = useState('flood');
  const [description, setDescription] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [visionDetections, setVisionDetections] = useState<any[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [zData, iData, dData, resData] = await Promise.all([
        api.getZones(),
        api.getIncidents(),
        api.getDetections(),
        api.getResources(),
      ]);
      setZones(zData);
      setIncidents(iData);
      setDetections(dData);
      setResources(resData);
    } catch (err) {
      console.error('Error fetching map data', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const survivors = useMemo(() => detections.filter(d => d.class === 'person'), [detections]);
  const fires = useMemo(() => detections.filter(d => d.class === 'fire'), [detections]);
  const damages = useMemo(() => zones.filter(z => z.damage > 0), [zones]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setUploadResult(null);
      setVisionDetections([]);
      setUploadError(null);
    }
  };

  const getLocationFromGPS = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setCenter([pos.coords.latitude, pos.coords.longitude]);
          setIsLocating(false);
          setShowMiniMap(false);
        },
        () => {
          setUploadError('Failed to get GPS location. Please pick on map.');
          setIsLocating(false);
          setShowMiniMap(true);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      setUploadError('Geolocation not supported. Please pick on map.');
      setIsLocating(false);
      setShowMiniMap(true);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setIsSubmitting(true);
    setUploadError(null);
    setUploadResult(null);
    setVisionDetections([]);

    try {
      if (uploadMode === 'field') {
        if (!coordinates) {
          setUploadError('Please set a location (GPS or map) for field reports.');
          setIsSubmitting(false);
          return;
        }
        const response = await api.analyzeFieldMedia(
          file, coordinates.lat, coordinates.lng, disasterType, description,
        );
        setUploadResult(response.analysis);
        if (coordinates) setCenter([coordinates.lat, coordinates.lng]);
      } else {
        const response = await api.analyzeImage(
          file,
          coordinates?.lat,
          coordinates?.lng,
        );
        setVisionDetections(response.detections || []);
        if (coordinates) setCenter([coordinates.lat, coordinates.lng]);
      }
      await fetchData();
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const zoneSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#ea580c';
      case 'MEDIUM': return '#ca8a04';
      default: return '#2563eb';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Live Incident Map</h2>
          <p className="text-sm text-gray-500">Real-time disaster zones, AI detections, and field evidence</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCenter([20.5937, 78.9629]);
          }}
        >
          Reset View
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Map — centerpiece */}
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Map Controls</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-4 p-3 bg-gray-50 rounded-md">
                {(['zones', 'survivors', 'fires', 'damage', 'reports', 'resources'] as const).map(key => (
                  <label key={key} className="flex items-center space-x-2 text-sm font-medium text-gray-700 capitalize">
                    <input
                      type="checkbox"
                      checked={layers[key]}
                      onChange={(e) => setLayers(prev => ({ ...prev, [key]: e.target.checked }))}
                    />
                    {key === 'reports' ? 'Incidents' : key}
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div style={{ height: '520px' }}>
                <MapContainer
                  center={center}
                  zoom={13}
                  scrollWheelZoom
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {layers.zones && zones.map(z => {
                    const coords = getCoords(z);
                    if (!coords) return null;
                    return (
                      <CircleMarker
                        key={z.id}
                        center={coords}
                        radius={12}
                        pathOptions={{
                          color: zoneSeverityColor(z.severity),
                          fillColor: zoneSeverityColor(z.severity),
                          fillOpacity: 0.35,
                          weight: 2,
                        }}
                        eventHandlers={{ click: () => setSelectedZone(z) }}
                      >
                        <Popup>
                          <strong>{z.name}</strong><br />
                          Risk: {z.risk_score}/100 ({z.severity})<br />
                          {z.survivors} survivors, {z.fires} fires
                        </Popup>
                      </CircleMarker>
                    );
                  })}

                  {layers.survivors && survivors.map(s => {
                    const coords = getCoords(s);
                    if (!coords) return null;
                    return (
                      <Marker key={s.id} position={coords} icon={createIcon(ICON_COLORS.survivor, '👤')}>
                        <Popup>
                          <strong>Survivor Detected</strong><br />
                          Confidence: {((s.confidence ?? 0) * 100).toFixed(0)}%
                        </Popup>
                      </Marker>
                    );
                  })}

                  {layers.fires && fires.map(f => {
                    const coords = getCoords(f);
                    if (!coords) return null;
                    return (
                      <Marker key={f.id} position={coords} icon={createIcon(ICON_COLORS.fire, '🔥')}>
                        <Popup>
                          <strong>Fire Detected</strong><br />
                          Confidence: {((f.confidence ?? 0) * 100).toFixed(0)}%
                        </Popup>
                      </Marker>
                    );
                  })}

                  {layers.damage && damages.map(d => {
                    const coords = getCoords(d);
                    if (!coords) return null;
                    return (
                      <Marker
                        key={d.id}
                        position={coords}
                        icon={createIcon(ICON_COLORS.damage, '⚠️')}
                        eventHandlers={{ click: () => setSelectedZone(d) }}
                      >
                        <Popup>
                          <strong>Zone: {d.name}</strong><br />
                          Structural damage reported
                        </Popup>
                      </Marker>
                    );
                  })}

                  {layers.reports && incidents.map(r => {
                    const coords = getCoords(r);
                    if (!coords) return null;
                    const isCritical = r.severity === 'CRITICAL';
                    return (
                      <Marker
                        key={r.id}
                        position={coords}
                        icon={createIcon(isCritical ? ICON_COLORS.reportCritical : ICON_COLORS.report, '📋')}
                      >
                        <Popup>
                          <strong>{r.title}</strong><br />
                          Severity: {r.severity}
                        </Popup>
                      </Marker>
                    );
                  })}

                  {layers.resources && resources.map(res => {
                    const coords = getCoords(res);
                    if (!coords) return null;
                    const available = res.status === 'available';
                    return (
                      <Marker
                        key={res.id}
                        position={coords}
                        icon={createIcon(available ? ICON_COLORS.resource : ICON_COLORS.resourceBusy, '🚑')}
                      >
                        <Popup>
                          <strong>{res.type.replace('_', ' ').toUpperCase()}</strong><br />
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

        {/* Unified Upload Evidence panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Camera className="w-4 h-4 mr-2 text-blue-600" />
                Upload Evidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex rounded-md border mb-4 overflow-hidden">
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium ${uploadMode === 'field' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700'}`}
                  onClick={() => setUploadMode('field')}
                >
                  Field Report
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium ${uploadMode === 'vision' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700'}`}
                  onClick={() => setUploadMode('vision')}
                >
                  AI Vision
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-3">
                {uploadMode === 'field' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Disaster Type</label>
                    <select
                      className="w-full rounded-md border border-gray-300 p-2 text-sm"
                      value={disasterType}
                      onChange={(e) => setDisasterType(e.target.value)}
                    >
                      <option value="flood">Flood</option>
                      <option value="earthquake">Earthquake</option>
                      <option value="fire">Wildfire</option>
                      <option value="hurricane">Hurricane / Typhoon</option>
                      <option value="collapse">Structural Collapse</option>
                      <option value="general">Other / General</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Media</label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${preview ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {preview ? (
                      file?.type.startsWith('video/') ? (
                        <video src={preview} className="max-h-32 mx-auto rounded" controls />
                      ) : (
                        <img src={preview} alt="Preview" className="max-h-32 mx-auto rounded" />
                      )
                    ) : (
                      <div className="py-2">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="text-xs text-gray-500 mt-1">Image or video</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Location {uploadMode === 'field' ? '(required)' : '(optional)'}
                  </label>
                  <div className="flex space-x-2">
                    <Button type="button" variant="outline" size="sm" onClick={getLocationFromGPS} disabled={isLocating} className="flex-1">
                      {isLocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3 mr-1" />}
                      GPS
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowMiniMap(!showMiniMap)} className="flex-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      Map
                    </Button>
                  </div>
                  {coordinates && (
                    <p className="text-xs text-green-600 flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                    </p>
                  )}
                  {showMiniMap && (
                    <div className="h-[160px] rounded-md overflow-hidden border">
                      <MapContainer
                        center={coordinates ? [coordinates.lat, coordinates.lng] : center}
                        zoom={coordinates ? 14 : 5}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationPicker onLocationSelect={(lat, lng) => setCoordinates({ lat, lng })} />
                        {coordinates && (
                          <Marker position={[coordinates.lat, coordinates.lng]} />
                        )}
                      </MapContainer>
                    </div>
                  )}
                </div>

                {uploadMode === 'field' && (
                  <textarea
                    className="w-full rounded-md border border-gray-300 p-2 text-sm"
                    rows={2}
                    placeholder="Additional context (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                )}

                {uploadError && (
                  <div className="p-2 bg-red-50 text-red-700 rounded text-xs flex items-start">
                    <AlertTriangle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                    {uploadError}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !file || (uploadMode === 'field' && !coordinates)}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : uploadMode === 'field' ? (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload & Analyze Logistics
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Run AI Vision Detection
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {(uploadResult || visionDetections.length > 0) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {uploadMode === 'field' ? 'Logistics Analysis' : 'Vision Detections'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {uploadResult && (
                  <>
                    <p className="font-semibold">{uploadResult.incident_title}</p>
                    <span className="inline-block px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded font-bold">
                      {uploadResult.severity}
                    </span>
                    <p className="text-gray-600">{uploadResult.people_count} people · {uploadResult.food_needed_kg}kg food · {uploadResult.water_needed_liters}L water</p>
                    <p className="text-xs italic text-gray-500">Map refreshed with new incident.</p>
                  </>
                )}
                {visionDetections.length > 0 && (
                  <div className="space-y-1">
                    {visionDetections.map((d: any, i: number) => (
                      <div key={d.id ?? i} className="flex items-center space-x-2 text-xs">
                        {d.class === 'person' ? <Users className="w-3 h-3 text-green-600" /> : <Activity className="w-3 h-3 text-red-600" />}
                        <span className="uppercase font-medium">{d.class}</span>
                        <span className="text-gray-400">{((d.confidence ?? 0) * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                    <p className="text-xs italic text-gray-500 pt-1">Detections plotted on map.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Selected Zone</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedZone ? (
                <div className="space-y-2 text-sm">
                  <h4 className="font-medium">{selectedZone.name}</h4>
                  <p className="text-gray-500">Risk: {selectedZone.risk_score} ({selectedZone.severity})</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Users className="w-3 h-3 text-green-500" /> {selectedZone.survivors} survivors
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Activity className="w-3 h-3 text-red-500" /> {selectedZone.fires} fires
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <AlertTriangle className="w-3 h-3 text-orange-500" /> {selectedZone.damage} damage
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Click a danger zone on the map.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center space-x-2"><span>🟣</span> Danger zones</div>
              <div className="flex items-center space-x-2"><span>👤</span> Survivor detection</div>
              <div className="flex items-center space-x-2"><span>🔥</span> Fire detection</div>
              <div className="flex items-center space-x-2"><span>📋</span> Field incident</div>
              <div className="flex items-center space-x-2"><span>🚑</span> Resources</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveMapPage;
