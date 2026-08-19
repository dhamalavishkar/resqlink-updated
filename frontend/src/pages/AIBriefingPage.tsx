import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { RefreshCw, Copy, Share2, AlertTriangle, Users, Activity, Flame, MapPin, Clock, ZapOff, Zap } from 'lucide-react';
import { api } from '@/services/api';

export const AIBriefingPage = () => {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const generateBriefing = async () => {
    setIsGenerating(true);
    try {
      // Gather current state to send to AI
      const [zones, reports, detections, resources] = await Promise.all([
        api.getZones(),
        api.getReports(),
        api.getDetections(),
        api.getResources()
      ]);
      
      const payload = {
        zones,
        reports,
        detections,
        resources,
        mesh_status: { connected: navigator.onLine },
        timestamp: new Date().toISOString(),
        internet_available: navigator.onLine
      };

      const res = await api.getAiBriefing(payload);
      setBriefing(res.briefing);
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      console.error(err);
      alert('Failed to generate briefing. Is the backend running?');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">AI Situation Briefing</h2>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={generateBriefing}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Briefing'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (briefing) {
                navigator.clipboard.writeText(briefing);
                alert('Briefing copied to clipboard!');
              }
            }}
            disabled={!briefing}
          >
            <Copy className="h-4 w-4 mr-1" /> Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (briefing) {
                const blob = new Blob([briefing], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `resqlink-briefing-${new Date()
                  .toISOString()
                  .slice(0, 10)}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }
            }}
            disabled={!briefing}
          >
            <Share2 className="h-4 w-4 mr-1" /> Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Latest Briefing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isGenerating ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full border-4 border-blue-500 border-t-transparent h-8 w-8 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">Generating AI briefing...</p>
                </div>
              ) : briefing ? (
                <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md text-sm text-gray-700">
                  {briefing}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    No briefing generated yet. Click "Generate Briefing" to create an AI-generated situation report based on current data.
                  </p>
                </div>
              )}
              {lastUpdated && !isGenerating && (
                <div className="text-xs text-gray-500 text-right mt-2">
                  Last updated: {lastUpdated}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Briefing Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Activity className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Data Sources</h4>
                    <p className="text-sm text-gray-500">
                      The AI briefing synthesizes data from:
                    </p>
                    <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
                      <li>Computer vision detections (survivors, fire, damage)</li>
                      <li>Incident reports from citizens and responders</li>
                      <li>Risk analysis scores for all zones</li>
                      <li>Resource availability and deployment status</li>
                      <li>Rescue mesh network status</li>
                      <li>Environmental and weather data (if available)</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Users className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Update Frequency</h4>
                    <p className="text-sm text-gray-500">
                      Briefings are generated on demand or can be set to auto-update at specified intervals during active operations.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Flame className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Customization</h4>
                    <p className="text-sm text-gray-500">
                      Organizations can tailor the briefing format, included sections, and technical depth to match their standard operating procedures.
                    </p>
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