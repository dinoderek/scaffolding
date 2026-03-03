import { createSyncService, type SyncLocalStore, type SyncRemoteStore } from '@/src/sync/service';
import { SyncError } from '@/src/sync/error';
import type { SyncDataset, SyncGymRecord, SyncSessionGraph } from '@/src/sync/types';

const createGym = (overrides: Partial<SyncGymRecord> = {}): SyncGymRecord => ({
  id: 'gym-1',
  name: 'Warehouse Gym',
  originScopeId: 'private',
  originSourceId: 'local',
  createdAt: new Date('2026-03-03T10:00:00.000Z'),
  updatedAt: new Date('2026-03-03T10:00:00.000Z'),
  ...overrides,
});

const createSessionGraph = (overrides: Partial<SyncSessionGraph> = {}): SyncSessionGraph => ({
  sessionId: 'session-1',
  gymId: 'gym-1',
  status: 'active',
  startedAt: new Date('2026-03-03T10:05:00.000Z'),
  completedAt: null,
  durationSec: null,
  deletedAt: null,
  createdAt: new Date('2026-03-03T10:05:00.000Z'),
  updatedAt: new Date('2026-03-03T10:05:00.000Z'),
  exercises: [
    {
      id: 'exercise-1',
      sessionId: 'session-1',
      orderIndex: 0,
      name: 'Bench Press',
      machineName: 'Flat Bench',
      originScopeId: 'private',
      originSourceId: 'local',
      createdAt: new Date('2026-03-03T10:05:00.000Z'),
      updatedAt: new Date('2026-03-03T10:05:00.000Z'),
      sets: [
        {
          id: 'set-1',
          sessionExerciseId: 'exercise-1',
          orderIndex: 0,
          weightValue: '100',
          repsValue: '8',
          createdAt: new Date('2026-03-03T10:05:00.000Z'),
          updatedAt: new Date('2026-03-03T10:05:00.000Z'),
        },
      ],
    },
  ],
  ...overrides,
});

const createDataset = (overrides: Partial<SyncDataset> = {}): SyncDataset => ({
  gyms: [],
  sessionGraphs: [],
  ...overrides,
});

const createMemoryLocalStore = (initialDataset: SyncDataset): SyncLocalStore & { snapshot: () => SyncDataset } => {
  let dataset: SyncDataset = {
    gyms: [...initialDataset.gyms],
    sessionGraphs: [...initialDataset.sessionGraphs],
  };

  return {
    async pullDataset() {
      return {
        gyms: [...dataset.gyms],
        sessionGraphs: [...dataset.sessionGraphs],
      };
    },
    async upsertGym(gym) {
      dataset = {
        ...dataset,
        gyms: [...dataset.gyms.filter((record) => record.id !== gym.id), gym],
      };
    },
    async replaceSessionGraph(graph) {
      dataset = {
        ...dataset,
        sessionGraphs: [...dataset.sessionGraphs.filter((record) => record.sessionId !== graph.sessionId), graph],
      };
    },
    snapshot() {
      return dataset;
    },
  };
};

const createRemoteStore = (initialDataset: SyncDataset): jest.Mocked<SyncRemoteStore> => {
  let dataset: SyncDataset = {
    gyms: [...initialDataset.gyms],
    sessionGraphs: [...initialDataset.sessionGraphs],
  };

  return {
    pullDataset: jest.fn(async () => ({
      gyms: [...dataset.gyms],
      sessionGraphs: [...dataset.sessionGraphs],
    })),
    createGym: jest.fn(async (gym) => {
      dataset = {
        ...dataset,
        gyms: [...dataset.gyms.filter((record) => record.id !== gym.id), gym],
      };
    }),
    updateGym: jest.fn(async (gym) => {
      dataset = {
        ...dataset,
        gyms: [...dataset.gyms.filter((record) => record.id !== gym.id), gym],
      };
    }),
    replaceSessionGraph: jest.fn(async (graph, _options) => {
      dataset = {
        ...dataset,
        sessionGraphs: [...dataset.sessionGraphs.filter((record) => record.sessionId !== graph.sessionId), graph],
      };
      return graph;
    }),
    pullSessionGraph: jest.fn(async (sessionId) => dataset.sessionGraphs.find((graph) => graph.sessionId === sessionId) ?? null),
  };
};

describe('sync service', () => {
  it('pushes local-only gyms before pushing a local-only session graph', async () => {
    const localStore = createMemoryLocalStore(
      createDataset({
        gyms: [createGym()],
        sessionGraphs: [createSessionGraph()],
      })
    );
    const remoteStore = createRemoteStore(createDataset());
    const service = createSyncService({
      localStore,
      remoteStore,
    });

    const result = await service.runOnce();

    expect(remoteStore.createGym).toHaveBeenCalledWith(createGym());
    expect(remoteStore.replaceSessionGraph).toHaveBeenCalledWith(createSessionGraph(), {
      expectedUpdatedAt: null,
    });
    expect(result).toEqual({
      gymsPulled: 0,
      gymsPushed: 1,
      sessionGraphsPulled: 0,
      sessionGraphsPushed: 1,
    });
  });

  it('treats a newer remote session graph as authoritative and replaces the local aggregate', async () => {
    const localGraph = createSessionGraph({
      updatedAt: new Date('2026-03-03T10:05:00.000Z'),
      exercises: [],
    });
    const remoteGraph = createSessionGraph({
      updatedAt: new Date('2026-03-03T10:10:00.000Z'),
      exercises: [
        {
          ...createSessionGraph().exercises[0]!,
          name: 'Incline Press',
        },
      ],
    });
    const localStore = createMemoryLocalStore(createDataset({ sessionGraphs: [localGraph] }));
    const remoteStore = createRemoteStore(createDataset({ sessionGraphs: [remoteGraph] }));
    const service = createSyncService({
      localStore,
      remoteStore,
    });

    const result = await service.runOnce();

    expect(remoteStore.replaceSessionGraph).not.toHaveBeenCalled();
    expect(localStore.snapshot().sessionGraphs).toEqual([remoteGraph]);
    expect(result).toEqual({
      gymsPulled: 0,
      gymsPushed: 0,
      sessionGraphsPulled: 1,
      sessionGraphsPushed: 0,
    });
  });

  it('pulls the latest remote session graph after a stale aggregate write rejection', async () => {
    const localGraph = createSessionGraph({
      updatedAt: new Date('2026-03-03T10:15:00.000Z'),
      exercises: [
        {
          ...createSessionGraph().exercises[0]!,
          name: 'Paused Bench Press',
        },
      ],
    });
    const remoteGraph = createSessionGraph({
      updatedAt: new Date('2026-03-03T10:12:00.000Z'),
    });
    const fresherRemoteGraph = createSessionGraph({
      updatedAt: new Date('2026-03-03T10:20:00.000Z'),
      exercises: [
        {
          ...createSessionGraph().exercises[0]!,
          name: 'Remote Machine Press',
        },
      ],
    });
    const localStore = createMemoryLocalStore(createDataset({ sessionGraphs: [localGraph] }));
    const remoteStore = createRemoteStore(createDataset({ sessionGraphs: [remoteGraph] }));

    remoteStore.replaceSessionGraph.mockRejectedValueOnce(new SyncError('session_graph_stale', 'stale'));
    remoteStore.pullSessionGraph.mockResolvedValueOnce(fresherRemoteGraph);

    const service = createSyncService({
      localStore,
      remoteStore,
    });

    const result = await service.runOnce();

    expect(remoteStore.replaceSessionGraph).toHaveBeenCalledWith(localGraph, {
      expectedUpdatedAt: remoteGraph.updatedAt,
    });
    expect(localStore.snapshot().sessionGraphs).toEqual([fresherRemoteGraph]);
    expect(result).toEqual({
      gymsPulled: 0,
      gymsPushed: 0,
      sessionGraphsPulled: 1,
      sessionGraphsPushed: 0,
    });
  });
});
