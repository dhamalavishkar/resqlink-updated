import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Truck, Ambulance, Stethoscope, Flame, HelpingHand, Clock, Activity, ClipboardList } from 'lucide-react';
import { api, Resource } from '@/services/api';
import { useTranslation } from 'react-i18next';

const iconAmbulance = L.divIcon({ html: `<div class="text-blue-500">🚑</div>`, className: '', iconSize: [24, 24] });
const iconFire = L.divIcon({ html: `<div class="text-red-500">🚒</div>`, className: '', iconSize: [24, 24] });
const iconDefault = L.divIcon({ html: `<div class="text-gray-500">📍</div>`, className: '', iconSize: [24, 24] });

export const RescueOperationsPage = () => {
  const { t } = useTranslation();
  const [resources, setResources] = useState<Resource[]>([]);
  const [filters, setFilters] = useState({
    types: ['ambulance', 'fire_truck', 'medical_unit', 'sar_team', 'water_truck', 'supply_truck'] as const,
    statuses: ['available', 'deployed', 'maintenance', 'offline'] as const
  });
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [route, setRoute] = useState<any>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const data = await api.getResources();
      setResources(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectResource = async (resource: Resource) => {
    setSelectedResource(resource);
    setLoadingRoute(true);
    setRoute(null);
    try {
      // Mocking a destination based on the resource location (slightly offset)
      const lat = resource.location_lat || 20.5937;
      const lng = resource.location_lng || 78.9629;
      
      const destination = { lat: lat + 0.05, lng: lng + 0.05 };
      
      const routeData = await api.getRouteRecommendation({
        start: { lat, lng },
        end: destination,
        hazard_zones: [
          { lat: lat + 0.02, lng: lng + 0.02, radius_km: 1.5 }
        ],
        avoid_hazards: true
      });
      setRoute(routeData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRoute(false);
    }
  };

  const filteredResources = resources.filter(resource =>
    filters.types.includes(resource.type as any) &&
    filters.statuses.includes(resource.status as any)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{t('Rescue Operations', 'Rescue Operations')}</h2>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={fetchResources}>
            Refresh
          </Button>
          <Button variant="default" size="sm">
            Manage Resources
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List and Filters */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('Filters', 'Filters')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="font-medium text-sm text-gray-900 mb-1">{t('Status', 'Status')}</div>
                <div className="flex flex-wrap gap-2">
                  {['available', 'deployed', 'maintenance', 'offline'].map(status => (
                    <label key={status} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.statuses.includes(status as any)}
                        onChange={(e) => {
                          const newList = e.target.checked
                            ? [...filters.statuses, status as any]
                            : filters.statuses.filter(s => s !== status);
                          setFilters(prev => ({ ...prev, statuses: newList }));
                        }}
                      />
                      <span className="capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('Resources', 'Resources')} ({filteredResources.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-y-auto h-[600px] divide-y divide-gray-100">
                {filteredResources.map(resource => (
                  <div
                    key={resource.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedResource?.id === resource.id ? 'bg-blue-50' : ''}`}
                    onClick={() => handleSelectResource(resource)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">{resource.name}</h4>
                      <Badge variant={resource.status === 'available' ? 'secondary' : resource.status === 'deployed' ? 'destructive' : 'outline'} className="text-[10px] uppercase">
                        {resource.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 capitalize mb-2">{resource.type.replace('_', ' ')}</div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {resource.location || 'Unknown'}</span>
                      {resource.eta && <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> ETA: {resource.eta}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Map and Route info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('Route Map', 'Route Map')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div style={{ height: '500px' }} className="w-full bg-gray-100">
                <MapContainer center={[20.5937, 78.9629]} zoom={12} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  
                  {filteredResources.map(res => (
                    res.location_lat && res.location_lng && (
                      <Marker 
                        key={res.id} 
                        position={[res.location_lat, res.location_lng]} 
                        icon={res.type === 'ambulance' ? iconAmbulance : res.type === 'fire_truck' ? iconFire : iconDefault}
                      >
                        <Popup>{res.name}</Popup>
                      </Marker>
                    )
                  ))}

                  {route && route.route.points && (
                    <Polyline 
                      positions={route.route.points.map((p: any) => [p.lat, p.lng])} 
                      color="blue" 
                      weight={5} 
                      opacity={0.7} 
                    />
                  )}
                </MapContainer>
              </div>
            </CardContent>
          </Card>

          {selectedResource && (
            <Card>
              <CardHeader>
                <CardTitle>Routing Details: {selectedResource.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRoute ? (
                  <p className="text-sm text-gray-500">Calculating optimal route...</p>
                ) : route ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">{t('Distance', 'Distance')}</p>
                      <p className="font-semibold">{route.route.distance_km} km</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('Estimated Time', 'Estimated Time')}</p>
                      <p className="font-semibold">{route.route.estimated_time_minutes} mins</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">{t('Safety Info', 'Safety Info')}</p>
                      <p className="font-semibold text-sm">{route.safety.explanation}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No route data available.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};