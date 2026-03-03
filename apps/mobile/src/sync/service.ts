import { toSyncError } from './error';
import type { SyncGymRecord, SyncLocalStore, SyncRemoteStore, SyncRunResult, SyncSessionGraph, SyncTrigger } from './types';

const compareDateMs = (left: Date, right: Date) => left.getTime() - right.getTime();

const toStableJson = (value: unknown) =>
  JSON.stringify(value, (_key, currentValue) => (currentValue instanceof Date ? currentValue.getTime() : currentValue));

const sameGymRecord = (left: SyncGymRecord, right: SyncGymRecord) => toStableJson(left) === toStableJson(right);

const sameSessionGraph = (left: SyncSessionGraph, right: SyncSessionGraph) => toStableJson(left) === toStableJson(right);

const createResult = (): SyncRunResult => ({
  gymsPulled: 0,
  gymsPushed: 0,
  sessionGraphsPulled: 0,
  sessionGraphsPushed: 0,
});

const collectIds = (localRecords: { id: string }[], remoteRecords: { id: string }[]) =>
  [...new Set([...localRecords.map((record) => record.id), ...remoteRecords.map((record) => record.id)])].sort();

const collectSessionIds = (localRecords: SyncSessionGraph[], remoteRecords: SyncSessionGraph[]) =>
  [...new Set([...localRecords.map((record) => record.sessionId), ...remoteRecords.map((record) => record.sessionId)])].sort();

const resolveStaleSessionGraph = async ({
  localGraph,
  remoteStore,
  localStore,
}: {
  localGraph: SyncSessionGraph;
  remoteStore: SyncRemoteStore;
  localStore: SyncLocalStore;
}): Promise<'pulled' | 'pushed'> => {
  const latestRemote = await remoteStore.pullSessionGraph(localGraph.sessionId);

  if (!latestRemote) {
    const createdGraph = await remoteStore.replaceSessionGraph(localGraph, {
      expectedUpdatedAt: null,
    });
    await localStore.replaceSessionGraph(createdGraph);
    return 'pushed';
  }

  if (compareDateMs(latestRemote.updatedAt, localGraph.updatedAt) >= 0) {
    await localStore.replaceSessionGraph(latestRemote);
    return 'pulled';
  }

  const pushedGraph = await remoteStore.replaceSessionGraph(localGraph, {
    expectedUpdatedAt: latestRemote.updatedAt,
  });
  await localStore.replaceSessionGraph(pushedGraph);
  return 'pushed';
};

export const createSyncService = ({
  localStore,
  remoteStore,
}: {
  localStore: SyncLocalStore;
  remoteStore: SyncRemoteStore;
}) => ({
  async runOnce(_trigger?: SyncTrigger): Promise<SyncRunResult> {
    const result = createResult();
    const [localDataset, remoteDataset] = await Promise.all([localStore.pullDataset(), remoteStore.pullDataset()]);

    const localGymsById = new Map(localDataset.gyms.map((gym) => [gym.id, gym]));
    const remoteGymsById = new Map(remoteDataset.gyms.map((gym) => [gym.id, gym]));

    for (const gymId of collectIds(localDataset.gyms, remoteDataset.gyms)) {
      const localGym = localGymsById.get(gymId);
      const remoteGym = remoteGymsById.get(gymId);

      if (localGym && !remoteGym) {
        await remoteStore.createGym(localGym);
        result.gymsPushed += 1;
        continue;
      }

      if (!localGym || !remoteGym) {
        if (remoteGym) {
          await localStore.upsertGym(remoteGym);
          result.gymsPulled += 1;
        }
        continue;
      }

      if (compareDateMs(localGym.updatedAt, remoteGym.updatedAt) > 0) {
        await remoteStore.updateGym(localGym);
        result.gymsPushed += 1;
        continue;
      }

      if (!sameGymRecord(localGym, remoteGym)) {
        await localStore.upsertGym(remoteGym);
        result.gymsPulled += 1;
      }
    }

    const localSessionGraphsById = new Map(localDataset.sessionGraphs.map((graph) => [graph.sessionId, graph]));
    const remoteSessionGraphsById = new Map(remoteDataset.sessionGraphs.map((graph) => [graph.sessionId, graph]));

    for (const sessionId of collectSessionIds(localDataset.sessionGraphs, remoteDataset.sessionGraphs)) {
      const localGraph = localSessionGraphsById.get(sessionId);
      const remoteGraph = remoteSessionGraphsById.get(sessionId);

      if (localGraph && !remoteGraph) {
        const pushedGraph = await remoteStore.replaceSessionGraph(localGraph, {
          expectedUpdatedAt: null,
        });
        await localStore.replaceSessionGraph(pushedGraph);
        result.sessionGraphsPushed += 1;
        continue;
      }

      if (!localGraph || !remoteGraph) {
        if (remoteGraph) {
          await localStore.replaceSessionGraph(remoteGraph);
          result.sessionGraphsPulled += 1;
        }
        continue;
      }

      if (compareDateMs(localGraph.updatedAt, remoteGraph.updatedAt) > 0) {
        try {
          const pushedGraph = await remoteStore.replaceSessionGraph(localGraph, {
            expectedUpdatedAt: remoteGraph.updatedAt,
          });
          await localStore.replaceSessionGraph(pushedGraph);
          result.sessionGraphsPushed += 1;
        } catch (error) {
          const syncError = toSyncError(error);
          if (syncError.code !== 'session_graph_stale') {
            throw syncError;
          }

          const resolution = await resolveStaleSessionGraph({
            localGraph,
            remoteStore,
            localStore,
          });
          if (resolution === 'pushed') {
            result.sessionGraphsPushed += 1;
          } else {
            result.sessionGraphsPulled += 1;
          }
        }
        continue;
      }

      if (!sameSessionGraph(localGraph, remoteGraph)) {
        await localStore.replaceSessionGraph(remoteGraph);
        result.sessionGraphsPulled += 1;
      }
    }

    return result;
  },
});

export type { SyncLocalStore, SyncRemoteStore };
