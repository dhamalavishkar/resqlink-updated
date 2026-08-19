import { render, screen } from '@testing-library/react';

test.skip('renders learn react link', () => {
  render(<div>Hello World</div>);
  expect(screen.getByText(/Hello World/i)).toBeInTheDocument();
});
