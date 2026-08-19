import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RescueOperationsPage } from '../src/pages/RescueOperationsPage';

test.skip('renders rescue operations page', () => {
  render(<RescueOperationsPage />);

  // Check for main heading
  const heading = screen.getByRole('heading', { level: 2 });
  expect(heading).toHaveTextContent('Rescue Operations');

  // Check for resources section
  expect(screen.getByText('Filters')).toBeInTheDocument();
  expect(screen.getByText('Resource Types')).toBeInTheDocument();
  expect(screen.getByText('Status')).toBeInTheDocument();

  // Check for resources table
  expect(screen.getByText('Resources List')).toBeInTheDocument();
  expect(screen.getByText('ID')).toBeInTheDocument();
  expect(screen.getByText('Name')).toBeInTheDocument();
  expect(screen.getByText('Type')).toBeInTheDocument();
  expect(screen.getByText('Status')).toBeInTheDocument();
  expect(screen.getByText('Location')).toBeInTheDocument();
  expect(screen.getByText('Assigned Zone')).toBeInTheDocument();

  // Check for specific resource data
  expect(screen.getByText('Ambulance 01')).toBeInTheDocument();
  expect(screen.getByText('Fire Truck 01')).toBeInTheDocument();
});

test.skip('can filter resources by type', async () => {
  render(<RescueOperationsPage />);
  const ambulanceCheckbox = screen.getByLabelText(/ambulance/i);
  await userEvent.click(ambulanceCheckbox);
});

test.skip('can filter resources by status', async () => {
  render(<RescueOperationsPage />);
  const availableStatus = screen.getByLabelText(/available/i);
  await userEvent.click(availableStatus);
});
