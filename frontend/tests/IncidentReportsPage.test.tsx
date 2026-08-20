import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IncidentReportsPage } from '../src/pages/IncidentReportsPage';
import { api } from '@/services/api';
import { vi } from 'vitest';

vi.mock('@/services/api');

beforeEach(() => {
  // Mock the API calls for reports
  api.getReports.mockResolvedValue([
    { id: '1', title: 'Flood in Main Street', description: 'Flooding reported', reporter_type: 'Citizen', severity: 'HIGH', location: 'Main Street', confidence: 0.9, status: 'NEW', created_at: new Date().toISOString(), media: null },
    { id: '2', title: 'Person trapped in building', description: 'Person trapped in building', reporter_type: 'Citizen', severity: 'CRITICAL', location: 'Elm Street', confidence: 0.95, status: 'NEW', created_at: new Date(Date.now() - 3600000).toISOString(), media: null }, // 1 hour ago
    { id: '3', title: 'Road blocked by debris', description: 'Road blocked by fallen tree', reporter_type: 'Citizen', severity: 'NORMAL', location: 'Oak Avenue', confidence: 0.8, status: 'NEW', created_at: new Date(Date.now() - 7200000).toISOString(), media: null }, // 2 hours ago
    { id: '4', title: 'Medical assistance needed', description: 'Person needs medical help', reporter_type: 'Citizen', severity: 'HIGH', location: 'Pine Street', confidence: 0.85, status: 'NEW', created_at: new Date(Date.now() - 10800000).toISOString(), media: null }, // 3 hours ago
    { id: '5', title: 'Fire spreading north', description: 'Fire spreading north of town', reporter_type: 'Citizen', severity: 'CRITICAL', location: 'North Forest', confidence: 0.9, status: 'NEW', created_at: new Date(Date.now() - 14400000).toISOString(), media: null }, // 4 hours ago
  ]);
});

afterEach(() => {
  vi.resetAllMocks();
});

test('renders incident reports page', () => {
  render(<IncidentReportsPage />);

  // Check for main heading
  const heading = screen.getByRole('heading', { level: 2 });
  expect(heading).toHaveTextContent('Incident Reports');

  // Check for filters section
  expect(screen.getByText('Filters')).toBeInTheDocument();
  expect(screen.getByText('Reporter Types')).toBeInTheDocument();
  expect(screen.getByText('Severity Levels')).toBeInTheDocument();
  expect(screen.getByText('Status')).toBeInTheDocument();
  expect(screen.getByText('Sort By')).toBeInTheDocument();

  // Check for reports table
  expect(screen.getByText('Reports List')).toBeInTheDocument();
  expect(screen.getByText('ID')).toBeInTheDocument();
  expect(screen.getByText('Title')).toBeInTheDocument();
  expect(screen.getByText('Reporter')).toBeInTheDocument();
  expect(screen.getByText('Severity')).toBeInTheDocument();
  expect(screen.getByText('Status')).toBeInTheDocument();
  expect(screen.getByText('Location')).toBeInTheDocument();
  expect(screen.getByText('Time')).toBeInTheDocument();

  // Check for specific report data
  expect(screen.getByText('Flood in Main Street')).toBeInTheDocument();
  expect(screen.getByText('Person trapped in building')).toBeInTheDocument();
  expect(screen.getByText('Road blocked by debris')).toBeInTheDocument();
  expect(screen.getByText('Medical assistance needed')).toBeInTheDocument();
  expect(screen.getByText('Fire spreading north')).toBeInTheDocument();

  // Check for create report button
  expect(screen.getByText('New Report')).toBeInTheDocument();

  // Check for refresh button
  expect(screen.getByText('Refresh')).toBeInTheDocument();
});

test('can filter by reporter type', async () => {
  render(<IncidentReportsPage />);

  // Find the Citizen checkbox and uncheck it to filter out Citizen reports
  const citizenCheckbox = screen.getByLabelText(/citizen/i);
  await userEvent.click(citizenCheckbox);
  // After unchecking Citizen, we should not see any Citizen reports
  expect(screen.queryByText('Flood in Main Street')).not.toBeInTheDocument();
  expect(screen.queryByText('Person trapped in building')).not.toBeInTheDocument();
  expect(screen.queryByText('Road blocked by debris')).not.toBeInTheDocument();
  expect(screen.queryByText('Medical assistance needed')).not.toBeInTheDocument();
  expect(screen.queryByText('Fire spreading north')).not.toBeInTheDocument();
});

test('can filter by severity', async () => {
  render(<IncidentReportsPage />);

  const highSeverityCheckbox = screen.getByLabelText(/high/i);
  await userEvent.click(highSeverityCheckbox);
  // After checking only HIGH, we should see only HIGH severity reports
  expect(screen.getByText('Flood in Main Street')).toBeInTheDocument();
  expect(screen.getByText('Medical assistance needed')).toBeInTheDocument();
  expect(screen.queryByText('Person trapped in building')).not.toBeInTheDocument(); // CRITICAL
  expect(screen.queryByText('Road blocked by debris')).not.toBeInTheDocument(); // NORMAL
  expect(screen.queryByText('Fire spreading north')).not.toBeInTheDocument(); // CRITICAL
});

test('can filter by status', async () => {
  render(<IncidentReportsPage />);

  const newStatusCheckbox = screen.getByLabelText(/new/i);
  await userEvent.click(newStatusCheckbox);
  // All reports are NEW, so they should still be visible
  expect(screen.getByText('Flood in Main Street')).toBeInTheDocument();
  expect(screen.getByText('Person trapped in building')).toBeInTheDocument();
  expect(screen.getByText('Road blocked by debris')).toBeInTheDocument();
  expect(screen.getByText('Medical assistance needed')).toBeInTheDocument();
  expect(screen.getByText('Fire spreading north')).toBeInTheDocument();
});

test('can sort by different fields', async () => {
  render(<IncidentReportsPage />);

  // Click on different sort options - these are radio buttons
  const timestampRadio = screen.getByLabelText(/timestamp/i);
  const severityRadio = screen.getByLabelText(/severity/i);
  const confidenceRadio = screen.getByLabelText(/confidence/i);

  // Initially sorted by timestamp descending (default)
  await userEvent.click(timestampRadio);
  await userEvent.click(severityRadio);
  await userEvent.click(confidenceRadio);
  await userEvent.click(timestampRadio); // Back to timestamp

  // The component should still render
  expect(screen.getByText('Reports List')).toBeInTheDocument();
});

test('can create a new report', async () => {
  // Mock the alert function
  const alertMock = vi.fn();
  window.alert = alertMock;

  render(<IncidentReportsPage />);

  // Click create new report button
  await userEvent.click(screen.getByText('New Report'));

  // Verify alert was called
  expect(alertMock).toHaveBeenCalledWith('New report form would open here');

  // Check that we're still on the reports page
  expect(screen.getByText('Reports List')).toBeInTheDocument();
});
