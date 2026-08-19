import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { Play, Square, FastForward, Activity } from 'lucide-react';

export const DemoSimulationControls = () => {
  const [status, setStatus] = useState<any>({ active: false, step: 0, status: 'STOPPED' });
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<string[]>([]);

  const fetchStatus = async () => {
    try {
      const res = await api.getSimulationStatus();
      setStatus(res);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    setLoading(true);
    try {
      await api.startSimulation();
      await fetchStatus();
      setEvents(['Simulation started.']);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await api.stopSimulation();
      await fetchStatus();
      setEvents(prev => [...prev, 'Simulation stopped.']);
    } finally {
      setLoading(false);
    }
  };

  const handleStep = async () => {
    setLoading(true);
    try {
      const res = await api.stepSimulation();
      if (res.events) {
        setEvents(prev => [...prev, ...res.events]);
      }
      await fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6 border-blue-500 shadow-md border-2">
      <CardHeader className="bg-blue-50 pb-4">
        <CardTitle className="flex items-center text-blue-800">
          <Activity className="mr-2 h-5 w-5" />
          Emergency Simulation Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Status: <span className={status.active ? 'text-green-600' : 'text-gray-500'}>{status.status}</span>
            </p>
            <p className="text-sm text-gray-500">Current Step: T+{status.step * 10}</p>
          </div>
          <div className="flex items-center space-x-2">
            {!status.active ? (
              <Button onClick={handleStart} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                <Play className="mr-2 h-4 w-4" /> Start Simulation
              </Button>
            ) : (
              <>
                <Button onClick={handleStep} disabled={loading} variant="outline" className="border-blue-500 text-blue-700 hover:bg-blue-50">
                  <FastForward className="mr-2 h-4 w-4" /> Next Step (T+{(status.step + 1) * 10})
                </Button>
                <Button onClick={handleStop} disabled={loading} variant="destructive">
                  <Square className="mr-2 h-4 w-4" /> Stop
                </Button>
              </>
            )}
          </div>
        </div>
        
        {events.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md max-h-32 overflow-y-auto text-sm font-mono border">
            {events.map((e, i) => (
              <div key={i} className="mb-1 text-gray-700">&gt; {e}</div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
