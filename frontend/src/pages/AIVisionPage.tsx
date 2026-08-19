import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Users, Activity, Image, Video, Upload, CheckCircle2, X } from 'lucide-react';
import { api } from '@/services/api';

export const AIVisionPage = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detections, setDetections] = useState<Array<{
    id: number;
    class: string;
    confidence: number;
    bbox: [number, number, number, number];
  }>>([]);
  const [isImageUpload, setIsImageUpload] = useState(true);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setVideoSrc(null);
        setIsImageUpload(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setVideoSrc(reader.result as string);
        setImageSrc(null);
        setIsImageUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSampleClick = () => {
    // In a real app, this would load a sample image/video
    setImageSrc('/sample-disaster.jpg');
    setImageFile(null);
    setIsImageUpload(true);
    setVideoSrc(null);
  };

  const handleAnalyze = async () => {
    setIsProcessing(true);
    
    if (imageFile) {
      try {
        const result = await api.analyzeImage(imageFile);
        // The API returns { detections: [...] }
        setDetections(result.detections || []);
      } catch (err) {
        console.error(err);
        alert('Failed to analyze image. Ensure backend is running.');
      }
    } else {
      // Mock detections based on whether it's image or video (sample fallback)
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (isImageUpload) {
        setDetections([
          { id: 1, class: 'person', confidence: 0.92, bbox: [100, 200, 150, 300] },
          { id: 2, class: 'person', confidence: 0.87, bbox: [300, 180, 350, 280] },
          { id: 3, class: 'fire', confidence: 0.91, bbox: [400, 100, 500, 200] }
        ]);
      } else {
        setDetections([
          { id: 1, class: 'person', confidence: 0.88, bbox: [120, 220, 170, 320] },
          { id: 2, class: 'fire', confidence: 0.93, bbox: [350, 150, 450, 250] },
          { id: 3, class: 'person', confidence: 0.79, bbox: [500, 200, 550, 300] }
        ]);
      }
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">AI Vision Analysis</h2>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSampleClick}
            disabled={isProcessing}
          >
            Load Sample
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleAnalyze}
            disabled={isProcessing || (!imageSrc && !videoSrc)}
          >
            {isProcessing ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Media Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={isProcessing}
                  >
                    Upload Image
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('video-upload')?.click()}
                    disabled={isProcessing}
                  >
                    Upload Video
                  </Button>
                </div>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                <input
                  type="file"
                  id="video-upload"
                  accept="video/*"
                  style={{ display: 'none' }}
                  onChange={handleVideoChange}
                />
              </div>
              <div className="h-96 bg-gray-200 flex items-center justify-center relative overflow-hidden">
                {isImageUpload && imageSrc ? (
                  <img src={imageSrc} alt="Uploaded" className="max-w-full max-h-full object-contain" />
                ) : !isImageUpload && videoSrc ? (
                  <video src={videoSrc} alt="Uploaded" className="max-w-full max-h-full object-contain" controls />
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No media selected</p>
                  </div>
                )}
                {isProcessing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-white text-lg">
                      Analyzing...
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Detection Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isProcessing ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full border-4 border-blue-500 border-t-transparent h-8 w-8 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">Processing analysis...</p>
                </div>
              ) : detections.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {detections.map((det, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-md">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {det.class === 'person' ? (
                              <Users className="h-4 w-4 text-green-500" />
                            ) : det.class === 'fire' ? (
                              <Activity className="h-4 w-4 text-red-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{det.class.toUpperCase()}</h4>
                            <p className="text-sm text-gray-500">
                              Confidence: {(det.confidence * 100).toFixed(0)}%
                            </p>
                            <p className="text-xs text-gray-400">
                              BBox: [{det.bbox[0]}, {det.bbox[1]}, {det.bbox[2]}, {det.bbox[3]}]
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Export Results
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No detections yet. Upload media and click Analyze.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detection Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isProcessing ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full border-2 border-blue-500 border-t-transparent h-5 w-5 mx-auto" />
                </div>
              ) : detections.length > 0 ? (
                <>
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{detections.filter(d => d.class === 'person').length} persons</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Activity className="h-4 w-4 text-red-500" />
                    <span className="font-medium">{detections.filter(d => d.class === 'fire').length} fires</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">{detections.filter(d => d.class === 'person' || d.class === 'fire').length === 0 ? 0 : detections.length - detections.filter(d => d.class === 'person').length - detections.filter(d => d.class === 'fire').length} other</span>
                  </div>
                </>
              ) : (
                <div className="text-center text-xs text-gray-500">
                  No detections
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};