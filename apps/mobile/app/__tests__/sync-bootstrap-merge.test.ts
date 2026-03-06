import { __privateSyncBootstrapForTests, flushSyncOutboxUntilSettled } from '@/src/sync';

type ProjectionStateInput = Parameters<typeof __privateSyncBootstrapForTests.buildMergePlan>[0]['local'];

const emptyState = (): ProjectionStateInput => ({
  gyms: [],
  sessions: [],
  sessionExercises: [],
  exerciseSets: [],
  exerciseDefinitions: [],
  exerciseMuscleMappings: [],
  exerciseTagDefinitions: [],
  sessionExerciseTags: [],
});

describe('sync bootstrap merge determinism', () => {
  it('deterministically keeps local winners and ignores remote tombstones for local-only entities', () => {
    const local = emptyState();
    const remote = emptyState();

    local.gyms.push({
      id: 'gym-local',
      name: 'Local Gym',
      originScopeId: 'private',
      originSourceId: 'local',
      deletedAtMs: null,
      createdAtMs: 1_000,
      updatedAtMs: 9_000,
    });

    remote.gyms.push(
      {
        id: 'gym-local',
        name: 'Remote Older Gym',
        originScopeId: 'private',
        originSourceId: 'local',
        deletedAtMs: null,
        createdAtMs: 1_000,
        updatedAtMs: 8_000,
      },
      {
        id: 'gym-remote',
        name: 'Remote Gym',
        originScopeId: 'private',
        originSourceId: 'local',
        deletedAtMs: null,
        createdAtMs: 1_100,
        updatedAtMs: 1_100,
      },
      {
        id: 'gym-remote-deleted',
        name: 'Deleted Remote Gym',
        originScopeId: 'private',
        originSourceId: 'local',
        deletedAtMs: 2_000,
        createdAtMs: 1_200,
        updatedAtMs: 2_000,
      }
    );

    local.exerciseDefinitions.push({
      id: 'exercise-local',
      name: 'Local Exercise',
      deletedAtMs: null,
      createdAtMs: 1_000,
      updatedAtMs: 8_000,
    });

    remote.exerciseDefinitions.push(
      {
        id: 'exercise-local',
        name: 'Remote Older Exercise',
        deletedAtMs: null,
        createdAtMs: 1_000,
        updatedAtMs: 7_000,
      },
      {
        id: 'exercise-remote',
        name: 'Remote Exercise',
        deletedAtMs: null,
        createdAtMs: 2_000,
        updatedAtMs: 2_000,
      }
    );

    local.exerciseMuscleMappings.push({
      id: 'mapping-local',
      exerciseDefinitionId: 'exercise-local',
      muscleGroupId: 'pectorals',
      weight: 1,
      role: 'primary',
      createdAtMs: 3_000,
      updatedAtMs: 9_000,
    });

    remote.exerciseMuscleMappings.push(
      {
        id: 'mapping-remote-older',
        exerciseDefinitionId: 'exercise-local',
        muscleGroupId: 'pectorals',
        weight: 0.5,
        role: 'secondary',
        createdAtMs: 3_000,
        updatedAtMs: 8_000,
      },
      {
        id: 'mapping-remote',
        exerciseDefinitionId: 'exercise-remote',
        muscleGroupId: 'lats',
        weight: 0.8,
        role: 'primary',
        createdAtMs: 4_000,
        updatedAtMs: 4_000,
      }
    );

    const mergePlan = __privateSyncBootstrapForTests.buildMergePlan({
      local,
      remote,
    });

    expect(mergePlan.mergedState.gyms.map((row) => row.id)).toEqual(['gym-local', 'gym-remote']);
    expect(mergePlan.mergedState.gyms.find((row) => row.id === 'gym-local')?.name).toBe('Local Gym');

    expect(mergePlan.mergedState.exerciseDefinitions.map((row) => row.id)).toEqual([
      'exercise-local',
      'exercise-remote',
    ]);

    expect(mergePlan.mergedState.exerciseMuscleMappings.map((row) => row.id)).toEqual([
      'mapping-local',
      'mapping-remote',
    ]);

    const convergenceEvents = __privateSyncBootstrapForTests.buildConvergenceEvents(
      mergePlan.localSelections
    );

    expect(convergenceEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entityType: 'gyms',
          entityId: 'gym-local',
          eventType: 'upsert',
        }),
        expect.objectContaining({
          entityType: 'exercise_definitions',
          entityId: 'exercise-local',
          eventType: 'upsert',
        }),
        expect.objectContaining({
          entityType: 'exercise_muscle_mappings',
          entityId: 'exercise-local:pectorals',
          eventType: 'attach',
        }),
      ])
    );

    expect(convergenceEvents).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ entityId: 'gym-remote' }),
        expect.objectContaining({ entityId: 'exercise-remote:lats' }),
      ])
    );
  });

  it('flushes to convergence only when an idle terminal state is reached', async () => {
    const flush = jest
      .fn()
      .mockResolvedValueOnce({ status: 'success', sentCount: 3 })
      .mockResolvedValueOnce({ status: 'success', sentCount: 2 })
      .mockResolvedValueOnce({ status: 'idle' });

    const result = await flushSyncOutboxUntilSettled({
      flush,
      maxAttempts: 5,
    });

    expect(result.status).toBe('converged');
    expect(result.totalSentCount).toBe(5);
    expect(result.attempts).toBe(3);
    expect(result.lastFlushResult).toEqual({ status: 'idle' });

    const failureFlush = jest.fn().mockResolvedValue({
      status: 'failure_retry_scheduled',
      sentCount: 2,
      nextAttemptAt: new Date('2026-03-06T11:00:02.000Z'),
    });

    const failureResult = await flushSyncOutboxUntilSettled({
      flush: failureFlush,
      maxAttempts: 5,
    });

    expect(failureResult.status).toBe('not_converged');
    expect(failureResult.lastFlushResult.status).toBe('failure_retry_scheduled');
  });
});
