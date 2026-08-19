import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IncidentReportsPage } from '../src/pages/IncidentReportsPage';
import { vi } from 'vitest';

test.skip('renders incident reports page', () => {
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

test.skip('can filter by reporter type', async () => {
  render(<IncidentReportsPage />);

  // Find the Citizen checkbox and uncheck it to filter out Citizen reports
  const citizenCheckbox = screen.getByLabelText(/citizen/i);
  await userEvent.click(citizenCheckbox);
});

test.skip('can filter by severity', async () => {
  render(<IncidentReportsPage />);

  const highSeverityBadge = screen.getByLabelText(/high/i);
  await userEvent.click(highSeverityBadge);
});

test.skip('can filter by status', async () => {
  render(<IncidentReportsPage />);

  const newStatusCheckbox = screen.getByLabelText(/new/i);
  await userEvent.click(newStatusCheckbox);
});

test.skip('can sort by different fields', async () => {
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

test.skip('can create a new report', async () => {
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
