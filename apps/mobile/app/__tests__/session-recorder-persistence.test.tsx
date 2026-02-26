import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import SessionRecorderScreen from '../session-recorder';

let mockSearchParams: Record<string, string | undefined> = {};

jest.mock('@/src/data', () => ({
  loadLocalGymById: jest.fn().mockResolvedValue(null),
  loadLatestSessionDraftSnapshot: jest.fn().mockResolvedValue(null),
  loadSessionSnapshotById: jest.fn().mockResolvedValue(null),
  persistCompletedSessionSnapshot: jest.fn().mockResolvedValue({
    sessionId: 'persisted-session-1',
    completedAt: new Date('2026-02-24T00:00:00.000Z'),
    durationSec: 0,
  }),
  persistSessionDraftSnapshot: jest.fn().mockResolvedValue({ sessionId: 'persisted-session-1' }),
  upsertLocalGym: jest.fn().mockResolvedValue(undefined),
  completeSessionDraft: jest.fn().mockResolvedValue({
    sessionId: 'persisted-session-1',
    completedAt: new Date('2026-02-24T00:00:00.000Z'),
    durationSec: 0,
    wasAlreadyCompleted: false,
  }),
}));

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockSearchParams,
  useNavigation: () => ({ addListener: jest.fn(() => () => undefined), dispatch: jest.fn() }),
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}));

const {
  loadLatestSessionDraftSnapshot: mockLoadLatestSessionDraftSnapshot,
  loadSessionSnapshotById: mockLoadSessionSnapshotById,
  persistCompletedSessionSnapshot: mockPersistCompletedSessionSnapshot,
  persistSessionDraftSnapshot: mockPersistSessionDraftSnapshot,
} = jest.requireMock('@/src/data') as {
  loadLatestSessionDraftSnapshot: jest.Mock;
  loadSessionSnapshotById: jest.Mock;
  persistCompletedSessionSnapshot: jest.Mock;
  persistSessionDraftSnapshot: jest.Mock;
};

const flushMicrotasks = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('SessionRecorderScreen persistence wiring', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockSearchParams = {};
    mockLoadLatestSessionDraftSnapshot.mockReset();
    mockLoadSessionSnapshotById.mockReset();
    mockPersistCompletedSessionSnapshot.mockReset();
    mockPersistSessionDraftSnapshot.mockReset();
    mockLoadLatestSessionDraftSnapshot.mockResolvedValue(null);
    mockLoadSessionSnapshotById.mockResolvedValue(null);
    mockPersistCompletedSessionSnapshot.mockResolvedValue({
      sessionId: 'persisted-session-1',
      completedAt: new Date('2026-02-24T00:00:00.000Z'),
      durationSec: 0,
    });
    mockPersistSessionDraftSnapshot.mockResolvedValue({ sessionId: 'persisted-session-1' });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('persists structural edits immediately and text edits with the existing 3s debounce SLA', async () => {
    render(<SessionRecorderScreen />);

    await waitFor(() => {
      expect(mockLoadLatestSessionDraftSnapshot).toHaveBeenCalledTimes(1);
    });
    await act(async () => {
      await flushMicrotasks();
    });

    fireEvent.press(screen.getByText('Log new exercise'));
    fireEvent.press(screen.getByLabelText('Select exercise Barbell Squat'));

    await waitFor(() => {
      expect(mockPersistSessionDraftSnapshot).toHaveBeenCalledTimes(1);
    });
    expect(mockPersistSessionDraftSnapshot.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        status: 'active',
        exercises: [
          expect.objectContaining({
            name: 'Barbell Squat',
            sets: [expect.objectContaining({ repsValue: '', weightValue: '' })],
          }),
        ],
      })
    );

    mockPersistSessionDraftSnapshot.mockClear();

    fireEvent.changeText(screen.getByLabelText('Weight for exercise 1 set 1'), '225');

    await act(async () => {
      jest.advanceTimersByTime(2_999);
      await flushMicrotasks();
    });
    expect(mockPersistSessionDraftSnapshot).toHaveBeenCalledTimes(0);

    await act(async () => {
      jest.advanceTimersByTime(1);
      await flushMicrotasks();
    });

    expect(mockPersistSessionDraftSnapshot).toHaveBeenCalledTimes(1);
    expect(mockPersistSessionDraftSnapshot.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        sessionId: 'persisted-session-1',
        exercises: [
          expect.objectContaining({
            sets: [expect.objectContaining({ weightValue: '225' })],
          }),
        ],
      })
    );
  });

  it('flushes pending debounced text edits on unmount (best-effort navigation-out/exit flush)', async () => {
    const rendered = render(<SessionRecorderScreen />);

    await waitFor(() => {
      expect(mockLoadLatestSessionDraftSnapshot).toHaveBeenCalledTimes(1);
    });
    await act(async () => {
      await flushMicrotasks();
    });

    fireEvent.press(screen.getByText('Log new exercise'));
    fireEvent.press(screen.getByLabelText('Select exercise Barbell Squat'));
    await waitFor(() => {
      expect(mockPersistSessionDraftSnapshot).toHaveBeenCalledTimes(1);
    });

    mockPersistSessionDraftSnapshot.mockClear();

    fireEvent.changeText(screen.getByLabelText('Reps for exercise 1 set 1'), '5');

    await act(async () => {
      jest.advanceTimersByTime(1_000);
      await flushMicrotasks();
    });
    expect(mockPersistSessionDraftSnapshot).toHaveBeenCalledTimes(0);

    await act(async () => {
      rendered.unmount();
      await flushMicrotasks();
    });

    expect(mockPersistSessionDraftSnapshot).toHaveBeenCalledTimes(1);
    expect(mockPersistSessionDraftSnapshot.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        sessionId: 'persisted-session-1',
        exercises: [
          expect.objectContaining({
            sets: [expect.objectContaining({ repsValue: '5' })],
          }),
        ],
      })
    );
  });

  it('pauses completed-edit autosave while times are invalid and resumes when valid', async () => {
    mockSearchParams = { mode: 'completed-edit', sessionId: 'completed-edit-1' };
    mockLoadSessionSnapshotById.mockResolvedValue({
      sessionId: 'completed-edit-1',
      gymId: null,
      status: 'completed',
      startedAt: new Date('2026-02-25T10:00:00.000Z'),
      completedAt: new Date('2026-02-25T10:45:00.000Z'),
      durationSec: 2700,
      deletedAt: null,
      createdAt: new Date('2026-02-25T10:00:00.000Z'),
      updatedAt: new Date('2026-02-25T10:45:00.000Z'),
      exercises: [
        {
          id: 'exercise-1',
          name: 'Bench Press',
          machineName: null,
          originScopeId: 'private',
          originSourceId: 'local',
          sets: [{ id: 'set-1', repsValue: '5', weightValue: '225' }],
        },
      ],
    });

    render(<SessionRecorderScreen />);

    await waitFor(() => {
      expect(mockLoadSessionSnapshotById).toHaveBeenCalledWith('completed-edit-1');
      expect(screen.queryByTestId('completed-edit-banner')).toBeNull();
      expect(screen.getByTestId('completed-edit-end-time-input')).toBeTruthy();
      expect(screen.getByText('Save Changes')).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId('completed-edit-end-time-input'), '2026-02-25 09:50');

    await act(async () => {
      jest.advanceTimersByTime(3_000);
      await flushMicrotasks();
    });

    expect(mockPersistCompletedSessionSnapshot).toHaveBeenCalledTimes(0);
    expect(screen.getByTestId('completed-edit-autosave-notice')).toBeTruthy();

    fireEvent.changeText(screen.getByTestId('completed-edit-end-time-input'), '2026-02-25 10:50');

    await act(async () => {
      jest.advanceTimersByTime(3_000);
      await flushMicrotasks();
    });

    expect(mockPersistCompletedSessionSnapshot).toHaveBeenCalledTimes(1);
    expect(mockPersistCompletedSessionSnapshot.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        sessionId: 'completed-edit-1',
      })
    );
  });
});
