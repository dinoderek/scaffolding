import { fireEvent, render, screen } from '@testing-library/react-native';

import {
  SessionListItem,
  SessionListScreenShell,
  formatCompactDuration,
} from '../session-list';

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

const NO_ACTIVE_SESSIONS: SessionListItem[] = [
  {
    id: 'completed-visible',
    startedAt: '2026-02-20T16:00:00.000Z',
    status: 'completed',
    completedAt: '2026-02-20T16:58:00.000Z',
    durationSec: 3480,
    setCount: 12,
    totalWeight: 4230,
    deletedAt: null,
  },
  {
    id: 'completed-deleted',
    startedAt: '2026-02-19T16:00:00.000Z',
    status: 'completed',
    completedAt: '2026-02-19T17:05:00.000Z',
    durationSec: 3900,
    setCount: 9,
    totalWeight: 2780,
    deletedAt: '2026-02-20T12:00:00.000Z',
  },
];

const ACTIVE_ONLY_SESSIONS: SessionListItem[] = [
  {
    id: 'active-only',
    startedAt: '2026-02-22T07:45:00.000Z',
    status: 'active',
    completedAt: null,
    durationSec: 1200,
    setCount: 5,
    totalWeight: 1800,
    deletedAt: null,
  },
];

describe('SessionListScreenShell', () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  it('shows Start Session when no active session exists and navigates to the recorder', () => {
    render(<SessionListScreenShell initialSessions={NO_ACTIVE_SESSIONS} />);

    expect(screen.queryByText('Active Session')).toBeNull();
    expect(screen.getByText('Start Session')).toBeTruthy();
    expect(screen.queryByText('Resume Active')).toBeNull();
    expect(screen.queryByText('Close Active')).toBeNull();

    fireEvent.press(screen.getByTestId('start-session-button'));
    expect(mockPush).toHaveBeenCalledWith('/session-recorder');
  });

  it('renders a compact active row and tapping it resumes the session', () => {
    render(<SessionListScreenShell />);

    expect(screen.queryByText('Start Session')).toBeNull();
    expect(screen.getByTestId('resume-active-session-button')).toBeTruthy();
    expect(screen.getByTestId('complete-active-session-button')).toBeTruthy();
    expect(screen.getByTestId('active-session-menu-button')).toBeTruthy();
    expect(screen.getByTestId('session-summary-session-active-1-start').props.children).toBe('2/20 17:30');
    expect(screen.getByTestId('session-summary-session-active-1-sets').props.children).toBe('14 sets');
    expect(screen.queryByTestId('session-summary-session-active-1-weight')).toBeNull();

    fireEvent.press(screen.getByTestId('resume-active-session-button'));
    expect(mockPush).toHaveBeenCalledWith('/session-recorder');
  });

  it('shows no completed-history state while an active session exists', () => {
    render(<SessionListScreenShell initialSessions={ACTIVE_ONLY_SESSIONS} />);

    expect(screen.getByText('Active Session')).toBeTruthy();
    expect(screen.getByTestId('resume-active-session-button')).toBeTruthy();
    expect(screen.getByText('No completed sessions')).toBeTruthy();
    expect(screen.queryByTestId('session-list-empty-state')).toBeNull();
  });

  it('completes the active session from the inline action and returns Start Session gating', () => {
    render(<SessionListScreenShell />);

    fireEvent.press(screen.getByTestId('complete-active-session-button'));

    expect(screen.getByText('Start Session')).toBeTruthy();
    expect(screen.queryByTestId('resume-active-session-button')).toBeNull();
    expect(screen.getByTestId('completed-session-row-session-active-1')).toBeTruthy();
  });

  it('opens the active-session menu and discards the active session', () => {
    render(<SessionListScreenShell />);

    fireEvent.press(screen.getByTestId('active-session-menu-button'));
    expect(screen.getByText('Discard session')).toBeTruthy();

    fireEvent.press(screen.getByTestId('discard-active-session-button'));

    expect(screen.getByText('Start Session')).toBeTruthy();
    expect(screen.queryByTestId('active-session-menu-button')).toBeNull();
  });

  it('toggles deleted-session visibility, shows compact metrics, and supports delete/undelete', () => {
    render(<SessionListScreenShell initialSessions={NO_ACTIVE_SESSIONS} />);

    expect(screen.getByTestId('session-summary-completed-visible-duration').props.children).toBe('58m');
    expect(screen.getByTestId('session-summary-completed-visible-sets').props.children).toBe('12 sets');
    expect(screen.queryByTestId('session-summary-completed-visible-weight')).toBeNull();
    expect(screen.queryByText('Read-only')).toBeNull();
    expect(screen.queryByTestId('completed-session-row-completed-deleted')).toBeNull();

    fireEvent.press(screen.getByTestId('completed-session-menu-button-completed-visible'));
    expect(screen.getByTestId('completed-session-delete-modal-card')).toBeTruthy();
    expect(screen.getByText('Delete session')).toBeTruthy();
    fireEvent.press(screen.getByTestId('completed-session-menu-overlay'));
    expect(screen.queryByTestId('completed-session-delete-modal-card')).toBeNull();
    expect(screen.getByTestId('completed-session-row-completed-visible')).toBeTruthy();

    fireEvent.press(screen.getByTestId('completed-session-menu-button-completed-visible'));
    fireEvent.press(screen.getByTestId('completed-session-modal-action-button'));
    expect(screen.queryByTestId('completed-session-row-completed-visible')).toBeNull();

    fireEvent.press(screen.getByTestId('toggle-deleted-sessions-button'));

    expect(screen.getByTestId('completed-session-row-completed-deleted')).toBeTruthy();
    expect(screen.getByTestId('session-summary-completed-deleted-duration').props.children).toBe('1h 5m');
    expect(screen.getByTestId('completed-session-menu-button-completed-deleted')).toBeTruthy();

    fireEvent.press(screen.getByTestId('completed-session-menu-button-completed-deleted'));
    expect(screen.getByTestId('completed-session-undelete-modal-card')).toBeTruthy();
    expect(screen.getByText('Undelete session')).toBeTruthy();
    fireEvent.press(screen.getByTestId('completed-session-menu-overlay'));
    expect(screen.queryByTestId('completed-session-undelete-modal-card')).toBeNull();
    expect(screen.getByTestId('completed-session-row-completed-deleted')).toBeTruthy();

    fireEvent.press(screen.getByTestId('completed-session-menu-button-completed-deleted'));
    fireEvent.press(screen.getByTestId('completed-session-modal-action-button'));
    expect(screen.getByLabelText('Open completed session actions completed-deleted')).toBeTruthy();
  });

  it('shows the empty state when there are no active or completed sessions', () => {
    render(<SessionListScreenShell initialSessions={[]} />);

    expect(screen.getByText('No sessions yet')).toBeTruthy();
    expect(screen.getByText('Start Session')).toBeTruthy();
  });
});

describe('formatCompactDuration', () => {
  it('formats durations in compact tokens', () => {
    expect(formatCompactDuration(null)).toBe('0m');
    expect(formatCompactDuration(3600)).toBe('1h');
    expect(formatCompactDuration(4500)).toBe('1h 15m');
  });
});
