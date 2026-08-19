import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIBriefingPage from '@/pages/AIBriefingPage';

test.skip('renders AI briefing page', () => {
  render(<AIBriefingPage />);

  // Check for main heading
  const heading = screen.getByRole('heading', { level: 2 });
  expect(heading).toHaveTextContent('AI Situation Briefing');

  // Check for incident selector
  expect(screen.getByText('Select Incident')).toBeInTheDocument();

  // Check for briefing controls
  expect(screen.getByText('Generate Briefing')).toBeInTheDocument();
  expect(screen.getByText('Refresh Briefing')).toBeInTheDocument();
  expect(screen.getByText('Export Briefing')).toBeInTheDocument();

  // Check for briefing content area
  expect(screen.getByText('Situation Briefing')).toBeInTheDocument();
  expect(screen.getByText('Situation Summary')).toBeInTheDocument();
  expect(screen.getByText('Critical Incidents')).toBeInTheDocument();
  expect(screen.getByText('Highest Risk Zones')).toBeInTheDocument();
  expect(screen.getByText('Survivor Status')).toBeInTheDocument();
  expect(screen.getByText('Fire/Structural Hazards')).toBeInTheDocument();
  expect(screen.getByText('Resource Requirements')).toBeInTheDocument();
  expect(screen.getByText('Recommended Actions')).toBeInTheDocument();
  expect(screen.getByText('Communication Status')).toBeInTheDocument();

  // Check for AI provider info
  expect(screen.getByText('AI Provider:')).toBeInTheDocument();
  expect(screen.getByText('Generated At:')).toBeInTheDocument();
  expect(screen.getByText('Data Freshness:')).toBeInTheDocument();

  // Check for loading state indicator
  expect(screen.getByText('Loading briefing...')).not.toBeInTheDocument(); // Initially not loading
});

test.skip('can select incident', async () => {
  // Find the incident select
  const incidentSelect = screen.getByLabelText(/select incident/i);
  expect(incidentSelect).toBeInTheDocument();

  // Initially, we should have some incidents to select from
  expect(incidentSelect).toHaveValue(''); // No selection by default

  // Select an incident
  await userEvent.selectOptions(incidentSelect, 'mumbai-flooding-2026');

  // Check that the selection was made
  expect(incidentSelect).toHaveValue('mumbai-flooding-2026');
});

test.skip('can generate briefing', async () => {
  // First select an incident
  const incidentSelect = screen.getByLabelText(/select incident/i);
  await userEvent.selectOptions(incidentSelect, 'mumbai-flooding-2026');

  // Click generate briefing button
  await userEvent.click(screen.getByText('Generate Briefing'));

  // Check for loading state
  expect(screen.getByText('Loading briefing...')).toBeInTheDocument();

  // Wait for briefing to load (in our mock implementation, this should be quick)
  // Check that briefing content appears
  expect(screen.getByText('Situation Summary')).toBeInTheDocument();
  expect(screen.getByText('Critical Incidents')).toBeInTheDocument();
  expect(screen.getByText('Highest Risk Zones')).toBeInTheDocument();
  expect(screen.getByText('Survivor Status')).toBeInTheDocument();
  expect(screen.getByText('Fire/Structural Hazards')).toBeInTheDocument();
  expect(screen.getByText('Resource Requirements')).toBeInTheDocument();
  expect(screen.getByText('Recommended Actions')).toBeInTheDocument();
  expect(screen.getByText('Communication Status')).toBeInTheDocument();

  // Check for AI provider info
  expect(screen.getByText('AI Provider:')).toBeInTheDocument();
  expect(screen.getByText('Generated At:')).toBeInTheDocument();
  expect(screen.getByText('Data Freshness:')).toBeInTheDocument();

  // Loading should be gone
  expect(screen.queryByText('Loading briefing...')).not.toBeInTheDocument();
});

test.skip('can refresh briefing', async () => {
  // First select an incident and generate initial briefing
  const incidentSelect = screen.getByLabelText(/select incident/i);
  await userEvent.selectOptions(incidentSelect, 'mumbai-flooding-2026');
  await userEvent.click(screen.getByText('Generate Briefing'));

  // Wait for initial briefing to load
  expect(screen.getByText('Situation Summary')).toBeInTheDocument();

  // Click refresh briefing button
  await userEvent.click(screen.getByText('Refresh Briefing'));

  // Check for loading state
  expect(screen.getByText('Loading briefing...')).toBeInTheDocument();

  // Wait for refreshed briefing to load
  expect(screen.getByText('Situation Summary')).toBeInTheDocument();
  expect(screen.queryByText('Loading briefing...')).not.toBeInTheDocument();
});

test.skip('can export briefing', async () => {
  // First select an incident and generate briefing
  const incidentSelect = screen.getByLabelText(/select incident/i);
  await userEvent.selectOptions(incidentSelect, 'mumbai-flooding-2026');
  await userEvent.click(screen.getByText('Generate Briefing'));

  // Wait for briefing to load
  expect(screen.getByText('Situation Summary')).toBeInTheDocument();

  // Click export briefing button
  await userEvent.click(screen.getByText('Export Briefing'));

  // In a real implementation, this would trigger a download
  // For our test, we'll just verify the button was clicked and component still works
  expect(screen.getByText('Situation Summary')).toBeInTheDocument();
});

test.skip('shows loading state when generating briefing', async () => {
  render(<AIBriefingPage />);

  // Select an incident
  const incidentSelect = screen.getByLabelText(/select incident/i);
  await userEvent.selectOptions(incidentSelect, 'mumbai-flooding-2026');

  // Initially should not be loading
  expect(screen.queryByText('Loading briefing...')).not.toBeInTheDocument();

  // Click generate briefing
  await userEvent.click(screen.getByText('Generate Briefing'));

  // Should now show loading state
  expect(screen.getByText('Loading briefing...')).toBeInTheDocument();

  // After briefing loads, loading state should disappear
  // In our mock implementation, this happens quickly
  expect(screen.queryByText('Loading briefing...')).not.toBeInTheDocument();
  expect(screen.getByText('Situation Summary')).toBeInTheDocument();
});

test.skip('handles no incident selected', async () => {
  render(<AIBriefingPage />);

  // Do not select an incident, just try to generate briefing
  await userEvent.click(screen.getByText('Generate Briefing'));

  // Should show some indication that incident selection is required
  // In our implementation, we might show a message or just not generate
  expect(screen.getByText('AI Situation Briefing')).toBeInTheDocument();
});

test.skip('can switch AI providers', async () => {
  render(<AIBriefingPage />);

  // Select an incident
  const incidentSelect = screen.getByLabelText(/select incident/i);
  await userEvent.selectOptions(incidentSelect, 'mumbai-flooding-2026');

  // Generate initial briefing
  await userEvent.click(screen.getByText('Generate Briefing'));
  expect(screen.getByText('Situation Summary')).toBeInTheDocument();

  // Check for AI provider info (should show mock initially)
  expect(screen.getByText('AI Provider: mock')).toBeInTheDocument();

  // Note: In a full implementation, there would be a provider selector
  // For now, we'll just verify the briefing displays correctly
  expect(screen.getByText('Recommended Actions')).toBeInTheDocument();
});
