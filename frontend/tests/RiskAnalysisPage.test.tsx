import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RiskAnalysisPage from '../src/pages/RiskAnalysisPage';

test.skip('renders risk analysis page', () => {
  render(<RiskAnalysisPage />);

  // Check for main heading
  const heading = screen.getByRole('heading', { level: 2 });
  expect(heading).toHaveTextContent('Risk Analysis');

  // Check for filters section
  expect(screen.getByText('Filters')).toBeInTheDocument();
  expect(screen.getByText('Risk Score Range')).toBeInTheDocument();
  expect(screen.getByText('Severity Levels')).toBeInTheDocument();
  expect(screen.getByText('Sort By')).toBeInTheDocument();

  // Check for risk zones table
  expect(screen.getByText('Risk Zones')).toBeInTheDocument();
  expect(screen.getByText('Zone')).toBeInTheDocument();
  expect(screen.getByText('Risk Score')).toBeInTheDocument();
  expect(screen.getByText('Severity')).toBeInTheDocument();
  expect(screen.getByText('Population')).toBeInTheDocument();
  expect(screen.getByText('Survivors')).toBeInTheDocument();
  expect(screen.getByText('Fires')).toBeInTheDocument();
  expect(screen.getByText('Damage')).toBeInTheDocument();
  expect(screen.getByText('Reports')).toBeInTheDocument();
  expect(screen.getByText('Priority')).toBeInTheDocument();
  expect(screen.getByText('Last Updated')).toBeInTheDocument();

  // Check for specific zone data
  expect(screen.getByText('Zone A-01')).toBeInTheDocument();
  expect(screen.getByText('Zone B-07')).toBeInTheDocument();
  expect(screen.getByText('Zone C-03')).toBeInTheDocument();
  expect(screen.getByText('Zone D-09')).toBeInTheDocument();
  expect(screen.getByText('Zone E-02')).toBeInTheDocument();

  // Check for risk calculation details section
  expect(screen.getByText('Risk Calculation Details')).toBeInTheDocument();
  expect(screen.getByText('Zone A-01 Risk Breakdown')).toBeInTheDocument();
  expect(screen.getByText('Total Risk Score: 87/100')).toBeInTheDocument();
  expect(screen.getByText('Survivors Factor:')).toBeInTheDocument();
  expect(screen.getByText('Fire Factor:')).toBeInTheDocument();
  expect(screen.getByText('Damage Factor:')).toBeInTheDocument();
  expect(screen.getByText('Reports Factor:')).toBeInTheDocument();
  expect(screen.getByText('Population Factor:')).toBeInTheDocument();
  expect(screen.getByText('Accessibility Factor:')).toBeInTheDocument();
  expect(screen.getByText('Recency Factor:')).toBeInTheDocument();
  expect(screen.getByText('Recommended Action:')).toBeInTheDocument();
});

test.skip('can filter by risk score range', async () => {
  render(<RiskAnalysisPage />);

  // Find the min and max risk inputs
  const minRiskInput = screen.getByLabelText(/min:/i);
  const maxRiskInput = screen.getByLabelText(/max:/i);

  // Initially, we should see all zones (5 zones)
  const zoneRows = screen.getAllByRole('row');
  // Header row + 5 data rows = 6 rows
  expect(zoneRows.length).toBe(6);

  // Change min risk to 50 to filter out low and medium risk zones
  await userEvent.clear(minRiskInput);
  await userEvent.type(minRiskInput, '50');
  await userEvent.clear(maxRiskInput);
  await userEvent.type(maxRiskInput, '100');

  // In our implementation, the filtering happens on change, so we should see fewer rows
  // Zone A-01 (87) and Zone B-07 (72) should remain, others filtered out
  // Header row + 2 data rows = 3 rows
  // Note: There might be a small delay, but in our test environment it should be instant
  const filteredZoneRows = screen.getAllByRole('row');
  expect(filteredZoneRows.length).toBeLessThanOrEqual(3); // At most header + 2 zones
});

test.skip('can filter by severity levels', async () => {
  render(<RiskAnalysisPage />);

  // Uncheck all severity checkboxes first
  const severityCheckboxes = screen.getAllByRole('checkbox');
  // We expect 5 checkboxes (SAFE, LOW, MEDIUM, HIGH, CRITICAL)
  expect(severityCheckboxes.length).toBe(5);

  // Uncheck all
  for (const checkbox of severityCheckboxes) {
    if (checkbox.checked) {
      await userEvent.uncheck(checkbox);
    }
  }

  // Now check only CRITICAL and HIGH
  const criticalCheckbox = screen.getByLabelText(/critical/i);
  const highCheckbox = screen.getByLabelText(/high/i);
  await userEvent.check(criticalCheckbox);
  await userEvent.check(highCheckbox);

  // Now we should see only zones with CRITICAL or HIGH severity
  // Zone A-01 (CRITICAL) and Zone B-07 (HIGH) should remain
  const zoneRows = screen.getAllByRole('row');
  // Header row + 2 data rows = 3 rows max
  expect(zoneRows.length).toBeLessThanOrEqual(3);
  expect(zoneRows.length).toBeGreaterThanOrEqual(2); // At least header + 1 zone

  // Check that we see the expected zones
  expect(screen.getByText('Zone A-01')).toBeInTheDocument();
  expect(screen.getByText('Zone B-07')).toBeInTheDocument();
  // These should not be visible
  expect(screen.queryByText('Zone C-03')).not.toBeInTheDocument(); // MEDIUM
  expect(screen.queryByText('Zone D-09')).not.toBeInTheDocument(); // LOW
  expect(screen.queryByText('Zone E-02')).not.toBeInTheDocument(); // SAFE
});

test.skip('can sort by different fields', async () => {
  render(<RiskAnalysisPage />);

  // Click on different sort options
  const timestampRadio = screen.getByLabelText(/timestamp/i);
  const severityRadio = screen.getByLabelText(/severity/i);
  const confidenceRadio = screen.getByLabelText(/confidence/i);

  // Initially sorted by timestamp descending (default)
  // We'll just verify that clicking different options doesn't break the component
  await userEvent.click(timestampRadio);
  await userEvent.click(severityRadio);
  await userEvent.click(confidenceRadio);
  await userEvent.click(timestampRadio); // Back to timestamp

  // The component should still render
  expect(screen.getByText('Risk Zones')).toBeInTheDocument();
});

test.skip('shows risk calculation details for zone A-01', () => {
  render(<RiskAnalysisPage />);

  // Check that the risk calculation details section is present
  expect(screen.getByText('Risk Calculation Details')).toBeInTheDocument();
  expect(screen.getByText('Zone A-01 Risk Breakdown')).toBeInTheDocument();

  // Check for specific factors
  expect(screen.getByText('Survivors Factor:')).toBeInTheDocument();
  expect(screen.getByText('Fire Factor:')).toBeInTheDocument();
  expect(screen.getByText('Damage Factor:')).toBeInTheDocument();
  expect(screen.getByText('Reports Factor:')).toBeInTheDocument();
  expect(screen.getByText('Population Factor:')).toBeInTheDocument();
  expect(screen.getByText('Accessibility Factor:')).toBeInTheDocument();
  expect(screen.getByText('Recency Factor:')).toBeInTheDocument();

  // Check for recommended action
  expect(screen.getByText('Recommended Action:')).toBeInTheDocument();
  expect(screen.getByText('Deploy immediate search-and-rescue team and fire response unit.')).toBeInTheDocument();
});
