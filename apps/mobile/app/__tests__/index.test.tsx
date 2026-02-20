import { render, screen } from '@testing-library/react-native';

import IndexScreen from '../index';

describe('IndexScreen', () => {
  it('shows milestone 0 foundation ready message', () => {
    render(<IndexScreen />);

    expect(screen.getByText('Milestone 0 foundation ready')).toBeTruthy();
    expect(screen.getByText('Run Data Runtime Smoke')).toBeTruthy();
    expect(screen.getByText('Data runtime smoke: idle')).toBeTruthy();
  });
});
