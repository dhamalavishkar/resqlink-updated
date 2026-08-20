import { render, screen } from '@testing-library/react';
import LiveMapPage from '../src/pages/LiveMapPage';
import { api } from '@/services/api';
import { vi } from 'vitest';

vi.mock('@/services/api');

beforeEach(() => {
  api.getZones.mockResolvedValue([
    { id: '1', name: 'Zone A-01', risk_score: 90, severity: 'CRITICAL', population: 1000, survivors: 10, fires: 2, damage: 5, reports: 3, location: { lat: 20.5937, lng: 78.9629 }, updated_at: new Date().toISOString() },
    { id: '2', name: 'Zone B-07', risk_score: 85, severity: 'HIGH', population: 2000, survivors: 5, fires: 1, damage: 3, reports: 2, location: { lat: 20.6, lng: 78.97 }, updated_at: new Date().toISOString() },
  ]);
  api.getIncidents.mockResolvedValue([
    { id: '1', title: 'Flood in Main Street', description: 'Flooding reported', severity: 'HIGH', location_lat: 20.59, location_lng: 78.96, created_at: new Date().toISOString() },
    { id: '2', title: 'Person trapped in building', description: 'Person trapped', severity: 'CRITICAL', location_lat: 20.58, location_lng: 78.95, created_at: new Date().toISOString() },
  ]);
  api.getDetections.mockResolvedValue([
    { id: '1', class: 'person', confidence: 0.9, bbox: [10, 10, 50, 50], source: 'camera', location: { lat: 20.5937, lng: 78.9629 }, detected_at: new Date().toISOString() },
    { id: '2', class: 'fire', confidence: 0.8, bbox: [20, 20, 60, 60], source: 'drone', location: { lat: 20.5938, lng: 78.9630 }, detected_at: new Date().toISOString() },
  ]);
  api.getResources.mockResolvedValue([
    { id: '1', type: 'medical_unit', name: 'Medical Unit 1', status: 'available', location: 'Hospital A', location_lat: 20.59, location_lng: 78.96, assigned_zone: null, eta: null, capacity: '10 patients', updated_at: new Date().toISOString() },
    { id: '2', type: 'fire_truck', name: 'Fire Truck 1', status: 'deployed', location: 'Fire Station 1', location_lat: 20.60, location_lng: 78.97, assigned_zone: '1', eta: '5 min', capacity: '1000 gallons', updated_at: new Date().toISOString() },
  ]);
});

afterEach(() => {
  vi.resetAllMocks();
});

test('renders live map page', () => {
  render(<LiveMapPage />);

  const heading = screen.getByRole('heading', { level: 2 });
  expect(heading).toHaveTextContent('Live Incident Map');

  expect(screen.getByText('Map Controls')).toBeInTheDocument();
  expect(screen.getByText('survivors')).toBeInTheDocument();
  expect(screen.getByText('fires')).toBeInTheDocument();
  expect(screen.getByText('Upload Evidence')).toBeInTheDocument();
  expect(screen.getByText('Field Report')).toBeInTheDocument();
  expect(screen.getByText('AI Vision')).toBeInTheDocument();
  expect(screen.getByText('Legend')).toBeInTheDocument();
});

test('has reset view button', () => {
  render(<LiveMapPage />);
  expect(screen.getByText('Reset View')).toBeInTheDocument();
});
