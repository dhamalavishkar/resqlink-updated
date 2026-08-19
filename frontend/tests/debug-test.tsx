import { render } from '@testing-library/react';
import AIBriefingPage from '@/pages/AIBriefingPage';

test('component renders without throwing', () => {
  console.log('Rendering AIBriefingPage...');
  const { container } = render(<AIBriefingPage />);
  console.log('Container:', container);
  expect(container).toBeInTheDocument();
});