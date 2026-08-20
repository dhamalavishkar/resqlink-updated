import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, MapPin, Upload, Loader2, AlertTriangle, CheckCircle2, Navigation } from 'lucide-react';
import { api } from '@/services/api';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Create a custom icon for the map marker
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// Component to handle map clicks for manual coordinate selection
function LocationPicker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const FieldReporterPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [disasterType, setDisasterType] = useState('flood');
  const [description, setDescription] = useState('');
  
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null); // Clear previous results
    }
  };

  const getLocationFromGPS = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
          setShowMap(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Failed to get GPS location. Please select on map manually.");
          setIsLocating(false);
          setShowMap(true);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setError("Geolocation is not supported by your browser. Please select manually.");
      setIsLocating(false);
      setShowMap(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    if (!coordinates) {
      setError("Please set a location (GPS or Map) before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.analyzeFieldMedia(
        file,
        coordinates.lat,
        coordinates.lng,
        disasterType,
        description
      );
      setResult(response.analysis);
    } catch (err: any) {
      setError(err.message || "Failed to analyze media");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Field Reporter</h2>
          <p className="text-gray-500">Upload media from the disaster zone for instant AI logistics analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Camera className="w-5 h-5 mr-2 text-blue-600" />
              Upload Evidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Disaster Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disaster Type</label>
                <select 
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  value={disasterType}
                  onChange={(e) => setDisasterType(e.target.value)}
                >
                  <option value="flood">Flood</option>
                  <option value="earthquake">Earthquake</option>
                  <option value="fire">Wildfire</option>
                  <option value="hurricane">Hurricane / Typhoon</option>
                  <option value="collapse">Structural Collapse</option>
                  <option value="general">Other / General Emergency</option>
                </select>
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Media (Image/Video)</label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${preview ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {preview ? (
                    <div className="relative">
                      {file?.type.startsWith('video/') ? (
                        <video src={preview} className="max-h-48 mx-auto rounded" controls />
                      ) : (
                        <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded" />
                      )}
                      <p className="text-xs text-blue-600 mt-2 font-medium">Click to change media</p>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Click to capture or upload</p>
                      <p className="text-xs text-gray-500">Supports JPG, PNG, MP4</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {/* Location Picker */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Location Coordinates</label>
                
                <div className="flex space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={getLocationFromGPS}
                    disabled={isLocating}
                    className="flex-1"
                  >
                    {isLocating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Navigation className="w-4 h-4 mr-2" />}
                    Auto GPS
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowMap(!showMap)}
                    className="flex-1"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Pick on Map
                  </Button>
                </div>

                {coordinates && (
                  <p className="text-sm text-green-600 flex items-center mt-2">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Lat: {coordinates.lat.toFixed(4)}, Lng: {coordinates.lng.toFixed(4)}
                  </p>
                )}

                {showMap && (
                  <div className="h-[200px] w-full mt-2 rounded-md overflow-hidden border border-gray-300">
                    <MapContainer 
                      center={coordinates ? [coordinates.lat, coordinates.lng] : [20.5937, 78.9629]} 
                      zoom={coordinates ? 15 : 4} 
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationPicker onLocationSelect={(lat, lng) => setCoordinates({ lat, lng })} />
                      {coordinates && (
                        <Marker position={[coordinates.lat, coordinates.lng]} icon={markerIcon} />
                      )}
                    </MapContainer>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Context (Optional)</label>
                <textarea 
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  rows={2}
                  placeholder="e.g., Water is rising fast, road is blocked."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-start">
                  <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting || !file || !coordinates}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Media via AI...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload & Analyze
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* AI Results */}
        <Card className={`transition-all duration-500 ${result ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'}`}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-blue-800">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              AI Logistics Estimation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-semibold text-blue-900 mb-2">{result.incident_title}</h3>
                  <div className="inline-flex px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded">
                    SEVERITY: {result.severity}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 border rounded-md">
                    <p className="text-xs text-gray-500 font-medium uppercase">Est. People Stuck</p>
                    <p className="text-2xl font-bold text-gray-900">{result.people_count}</p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <p className="text-xs text-gray-500 font-medium uppercase">Food (24h)</p>
                    <p className="text-2xl font-bold text-gray-900">{result.food_needed_kg} <span className="text-sm font-normal text-gray-500">kg</span></p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <p className="text-xs text-gray-500 font-medium uppercase">Water (24h)</p>
                    <p className="text-2xl font-bold text-gray-900">{result.water_needed_liters} <span className="text-sm font-normal text-gray-500">L</span></p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2 mt-4">Required Emergency Equipment</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.emergency_equipment?.map((eq: string, idx: number) => (
                      <span key={idx} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2 mt-4">Broadcast Survival Advice</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200 italic">
                    "{result.survival_advice}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Camera className="w-12 h-12 mb-2 opacity-50" />
                <p>Upload media to view AI analysis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
