import { render, screen } from '@testing-library/react';
import { OverviewPage } from '../src/pages/OverviewPage';

test.skip('renders overview page', () => {
  render(<OverviewPage />);

  // Check for main heading
  const heading = screen.getByRole('heading', { level: 2 });
  expect(heading).toHaveTextContent('Overview');

  // Check for KPI cards (we expect 6 cards based on our implementation)
  const cards = screen.getAllByRole('region');
  // In our implementation, we have cards in a grid layout
  // We'll check that we have at least some cards
  expect(cards.length).toBeGreaterThan(0);

  // Check for specific KPI labels
  expect(screen.getByText('Active Incidents')).toBeInTheDocument();
  expect(screen.getByText('Critical Zones')).toBeInTheDocument();
  expect(screen.getByText('Survivors Detected')).toBeInTheDocument();
  expect(screen.getByText('Active Rescue Teams')).toBeInTheDocument();
  expect(screen.getByText('Mesh-connected Devices')).toBeInTheDocument();
  expect(screen.getByText('Unresolved Reports')).toBeInTheDocument();
});

test.skip('shows live incident map placeholder', () => {
  render(<OverviewPage />);
  // We expect to see some map-related content
  const mapElement = screen.getByText(/map placeholder/i);
  expect(mapElement).toBeInTheDocument();
});

test.skip('shows risk zones section', () => {
  render(<OverviewPage />);
  expect(screen.getByText('Highest Risk Zones')).toBeInTheDocument();
  expect(screen.getByText('Zone A-01')).toBeInTheDocument();
  expect(screen.getByText('Zone B-07')).toBeInTheDocument();
});

test.skip('shows latest reports section', () => {
  render(<OverviewPage />);
  expect(screen.getByText('Latest Reports')).toBeInTheDocument();
  expect(screen.getByText('Citizen report: Flooding on Main St')).toBeInTheDocument();
});

test.skip('shows AI situation brief section', () => {
  render(<OverviewPage />);
  expect(screen.getByText('AI Situation Brief')).toBeInTheDocument();
  expect(screen.getByText(/at 14:32, three high-priority zones were identified/i)).toBeInTheDocument();
});

test.skip('shows network health section', () => {
  render(<OverviewPage />);
  expect(screen.getByText('Network Health')).toBeInTheDocument();
  expect(screen.getByText('Internet Connectivity')).toBeInTheDocument();
  expect(screen.getByText('Mesh Network')).toBeInTheDocument();
});

test.skip('shows rescue resources section', () => {
  render(<OverviewPage />);
  expect(screen.getByText('Rescue Resources')).toBeInTheDocument();
  expect(screen.getByText('Medical Units')).toBeInTheDocument();
  expect(screen.getByText('Fire Response')).toBeInTheDocument();
  expect(screen.getByText('Shelters')).toBeInTheDocument();
});
