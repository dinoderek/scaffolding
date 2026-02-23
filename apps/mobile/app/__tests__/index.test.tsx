import { render, screen } from '@testing-library/react-native';

import IndexScreen from '../index';

jest.mock('expo-router', () => {
  const mockPush = jest.fn();

  return {
    useRouter: () => ({
      push: mockPush,
    }),
    __mockPush: mockPush,
  };
});

const { __mockPush: mockPush } = jest.requireMock('expo-router') as {
  __mockPush: jest.Mock;
};

describe('IndexScreen', () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  it('renders the session list shell as the home route', () => {
    render(<IndexScreen />);

    expect(screen.getByText('Active Session')).toBeTruthy();
    expect(screen.getByText('Completed History')).toBeTruthy();
    expect(screen.getByTestId('resume-active-session-button')).toBeTruthy();
    expect(screen.getByTestId('complete-active-session-button')).toBeTruthy();
    expect(screen.queryByText('Milestone 0 foundation ready')).toBeNull();
  });
});
