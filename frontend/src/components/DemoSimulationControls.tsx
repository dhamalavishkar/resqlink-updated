import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { Play, Square, FastForward, Activity } from 'lucide-react';

export const DemoSimulationControls = () => {
  const [status, setStatus] = useState<any>({ active: false, step: 0, status: 'STOpped' });
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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center text-[var(--color-text)]">
          <Activity className="mr-2 h-5 w-5 text-[var(--color-primary)]" />
          Emergency Simulation Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-[var(--color-secondary)]">
              Status: <span className={status.active ? 'text-[var(--color-accent-green)]' : 'text-[var(--color-secondary)]'}>{status.status}</span>
            </p>
            <p className="text-sm text-[var(--color-secondary)]">Current Step: T+{status.step * 10}</p>
          </div>
          <div className="flex items-center space-x-2">
            {!status.active ? (
              <Button onClick={handleStart} disabled={loading} className="text-[var(--color-background)] bg-[var(--color-primary)] hover:bg-[var(--color-primary)/90] hover-shadow">
                <Play className="mr-2 h-4 w-4" /> Start Simulation
              </Button>
            ) : (
              <>
                <Button onClick={handleStep} disabled={loading} variant="outline" className="text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-primary)/10%] hover-shadow">
                  <FastForward className="mr-2 h-4 w-4" /> Next Step (T+{(status.step + 1) * 10})
                </Button>
                <Button onClick={handleStop} disabled={loading} variant="destructive" className="text-[var(--color-background)] bg-[var(--color-accent-red)] hover:bg-[var(--color-accent-red)/90] hover-shadow">
                  <Square className="mr-2 h-4 w-4" /> Stop
                </Button>
              </>
            )}
          </div>
        </div>

        {events.length > 0 && (
          <div className="mt-4 p-3 bg-[var(--color-background)/50%] rounded-md max-h-32 overflow-y-auto text-sm font-mono border-[var(--color-border)/50%]">
            {events.map((e, i) => (
              <div key={i} className="mb-1 text-[var(--color-text)]">&gt; {e}</div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};