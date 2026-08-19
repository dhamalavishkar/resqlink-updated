import { render, screen } from '@testing-library/react';
import LiveMapPage from '../src/pages/LiveMapPage';

test.skip('renders live map page', () => {
  render(<LiveMapPage />);

  // Check for main heading
  const heading = screen.getByRole('heading', { level: 2 });
  expect(heading).toHaveTextContent('Live Incident Map');

  // Check for map controls
  expect(screen.getByText('Map Controls')).toBeInTheDocument();
  expect(screen.getByText('Survivors')).toBeInTheDocument();
  expect(screen.getByText('Fires')).toBeInTheDocument();
  expect(screen.getByText('Structural Damage')).toBeInTheDocument();
  expect(screen.getByText('Reports')).toBeInTheDocument();
  expect(screen.getByText('Resources')).toBeInTheDocument();

  // Check for map legend
  expect(screen.getByText('Map Legend')).toBeInTheDocument();
  expect(screen.getByText('Survivor Detection')).toBeInTheDocument();
  expect(screen.getByText('Fire Detection')).toBeInTheDocument();
  expect(screen.getByText('Structural Damage')).toBeInTheDocument();
  expect(screen.getByText('Incident Report')).toBeInTheDocument();
  expect(screen.getByText('Available Resource')).toBeInTheDocument();

  // Check for selected area info
  expect(screen.getByText('Selected Area Info')).toBeInTheDocument();
  expect(screen.getByText('Zone A-01')).toBeInTheDocument();
  expect(screen.getByText('Risk Score: 87 (CRITICAL)')).toBeInTheDocument();
});

test.skip('has reset view button', () => {
  render(<LiveMapPage />);
  expect(screen.getByText('Reset View')).toBeInTheDocument();
});
