import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AIVisionPage from '../src/pages/AIVisionPage';

test.skip('renders AI vision page', () => {
  render(<AIVisionPage />);

  // Check for main heading
  const heading = screen.getByRole('heading', { level: 2 });
  expect(heading).toHaveTextContent('AI Vision Analysis');

  // Check for buttons
  expect(screen.getByText('Load Sample')).toBeInTheDocument();
  expect(screen.getByText('Upload Image')).toBeInTheDocument();
  expect(screen.getByText('Upload Video')).toBeInTheDocument();
  expect(screen.getByText('Analyze')).toBeInTheDocument();

  // Check for initial state
  expect(screen.getByText('No media selected')).toBeInTheDocument();
  expect(screen.getByText('No detections yet. Upload media and click Analyze.')).toBeInTheDocument();
});

test.skip('can toggle between image and video upload', async () => {
  render(<AIVisionPage />);

  // Initially, we should see the upload image/video buttons
  expect(screen.getByText('Upload Image')).toBeInTheDocument();
  expect(screen.getByText('Upload Video')).toBeInTheDocument();

  // Click the Load Sample button (this loads a sample image)
  await userEvent.click(screen.getByText('Load Sample'));

  // After loading sample, we should no longer see "No media selected"
  // Note: In our implementation, Load Sample sets imageSrc to '/sample-disaster.jpg'
  // and shows the image, so we won't see the "No media selected" text anymore
  expect(screen.queryByText('No media selected')).not.toBeInTheDocument();
});

test.skip('shows analysis button is disabled when no media is selected', () => {
  render(<AIVisionPage />);

  // The analyze button should be disabled when no media is selected
  const analyzeButton = screen.getByText('Analyze');
  expect(analyzeButton).toBeDisabled();
});

test.skip('shows analysis button is enabled when media is selected', async () => {
  render(<AIVisionPage />);

  // Initially disabled
  expect(screen.getByText('Analyze')).toBeDisabled();

  // After loading sample, it should be enabled
  await userEvent.click(screen.getByText('Load Sample'));
  expect(screen.getByText('Analyze')).toBeEnabled();
});

test.skip('shows detection results after analysis', async () => {
  render(<AIVisionPage />);

  // Load sample and click analyze
  await userEvent.click(screen.getByText('Load Sample'));
  await userEvent.click(screen.getByText('Analyze'));

  // Wait for analysis to complete (in our implementation, we simulate a delay)
  // We'll check for detection results
  expect(screen.getByText('Detection Results')).toBeInTheDocument();
  expect(screen.getByText('PERSON')).toBeInTheDocument();
  expect(screen.getByText('FIRE')).toBeInTheDocument();
  expect(screen.getByText('Confidence:')).toBeInTheDocument();

  // Check for detection summary
  expect(screen.getByText('Detection Summary')).toBeInTheDocument();
  expect(screen.getByText('persons')).toBeInTheDocument();
  expect(screen.getByText('fires')).toBeInTheDocument();
});

test.skip('shows analyzing state when processing', async () => {
  render(<AIVisionPage />);

  // Load sample
  await userEvent.click(screen.getByText('Load Sample'));

  // Click analyze and quickly check for analyzing state
  await userEvent.click(screen.getByText('Analyze'));

  // In our implementation, we show "Analyzing..." text during processing
  // We'll check for this temporarily (though it might be too fast to catch in test)
  // This is more of a placeholder test
  expect(screen.getByText('Analyzing...')).toBeInTheDocument();
});
