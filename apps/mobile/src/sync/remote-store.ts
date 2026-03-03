import { createSyncBackendClient, type SyncBackendClient } from './backend-client';
import { SyncError } from './error';
import type {
  SyncDataset,
  SyncExerciseRecord,
  SyncGymRecord,
  SyncRemoteStore,
  SyncSessionGraph,
  SyncSetRecord,
} from './types';

const APP_PUBLIC_SCHEMA = 'app_public';

type RemoteGymRow = {
  id: string;
  name: string;
  origin_scope_id: string;
  origin_source_id: string;
  created_at: number;
  updated_at: number;
};

type RemoteSessionRow = {
  id: string;
  gym_id: string | null;
  status: string;
  started_at: number;
  completed_at: number | null;
  duration_sec: number | null;
  deleted_at: number | null;
  created_at: number;
  updated_at: number;
};

type RemoteExerciseRow = {
  id: string;
  session_id: string;
  order_index: number;
  name: string;
  machine_name: string | null;
  origin_scope_id: string;
  origin_source_id: string;
  created_at: number;
  updated_at: number;
  sets?: RemoteSetRow[];
};

type RemoteSetRow = {
  id: string;
  session_exercise_id: string;
  order_index: number;
  weight_value: string;
  reps_value: string;
  created_at: number;
  updated_at: number;
};

type RemoteSessionGraphResponse = {
  session: RemoteSessionRow;
  exercises: RemoteExerciseRow[];
};

const mapRemoteGym = (row: RemoteGymRow): SyncGymRecord => ({
  id: row.id,
  name: row.name,
  originScopeId: row.origin_scope_id,
  originSourceId: row.origin_source_id,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

const mapRemoteSet = (row: RemoteSetRow): SyncSetRecord => ({
  id: row.id,
  sessionExerciseId: row.session_exercise_id,
  orderIndex: row.order_index,
  weightValue: row.weight_value,
  repsValue: row.reps_value,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

const mapRemoteExercise = (row: RemoteExerciseRow): SyncExerciseRecord => ({
  id: row.id,
  sessionId: row.session_id,
  orderIndex: row.order_index,
  name: row.name,
  machineName: row.machine_name,
  originScopeId: row.origin_scope_id,
  originSourceId: row.origin_source_id,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  sets: (row.sets ?? []).map(mapRemoteSet),
});

const normalizeSessionStatus = (status: string): SyncSessionGraph['status'] => (status === 'completed' ? 'completed' : 'active');

const mapRemoteSessionGraph = (response: RemoteSessionGraphResponse): SyncSessionGraph => ({
  sessionId: response.session.id,
  gymId: response.session.gym_id,
  status: normalizeSessionStatus(response.session.status),
  startedAt: new Date(response.session.started_at),
  completedAt: response.session.completed_at === null ? null : new Date(response.session.completed_at),
  durationSec: response.session.duration_sec,
  deletedAt: response.session.deleted_at === null ? null : new Date(response.session.deleted_at),
  createdAt: new Date(response.session.created_at),
  updatedAt: new Date(response.session.updated_at),
  exercises: response.exercises.map((exercise) =>
    mapRemoteExercise({
      ...exercise,
      session_id: exercise.session_id ?? response.session.id,
    })
  ),
});

const toRemoteSessionPayload = (graph: SyncSessionGraph) => ({
  id: graph.sessionId,
  gym_id: graph.gymId,
  status: graph.status,
  started_at: graph.startedAt.getTime(),
  completed_at: graph.completedAt?.getTime() ?? null,
  duration_sec: graph.durationSec,
  deleted_at: graph.deletedAt?.getTime() ?? null,
  created_at: graph.createdAt.getTime(),
  updated_at: graph.updatedAt.getTime(),
});

const toRemoteExercisePayload = (exercise: SyncExerciseRecord) => ({
  id: exercise.id,
  session_id: exercise.sessionId,
  order_index: exercise.orderIndex,
  name: exercise.name,
  machine_name: exercise.machineName,
  origin_scope_id: exercise.originScopeId,
  origin_source_id: exercise.originSourceId,
  created_at: exercise.createdAt.getTime(),
  updated_at: exercise.updatedAt.getTime(),
  sets: exercise.sets.map((set) => ({
    id: set.id,
    session_exercise_id: set.sessionExerciseId,
    order_index: set.orderIndex,
    weight_value: set.weightValue,
    reps_value: set.repsValue,
    created_at: set.createdAt.getTime(),
    updated_at: set.updatedAt.getTime(),
  })),
});

const parseErrorBody = async (response: Response) => {
  try {
    return (await response.json()) as { message?: string; detail?: string };
  } catch {
    return {};
  }
};

const mapResponseError = async (response: Response): Promise<never> => {
  const body = await parseErrorBody(response);
  const message = body.message ?? response.statusText ?? 'Sync request failed';
  const detail = body.detail ?? message;

  if (message === 'SESSION_GRAPH_STALE') {
    throw new SyncError('session_graph_stale', detail);
  }

  if (response.status === 401 || response.status === 403 || message === 'AUTH_REQUIRED') {
    throw new SyncError('auth_expired', detail);
  }

  throw new SyncError('backend_unavailable', detail);
};

const requestJson = async <T>(
  backendClient: SyncBackendClient,
  path: string,
  init: Parameters<SyncBackendClient['request']>[1] = {}
): Promise<T> => {
  let response: Response;
  try {
    response = await backendClient.request(path, {
      ...init,
      schema: APP_PUBLIC_SCHEMA,
    });
  } catch (error) {
    throw new SyncError('backend_unavailable', error instanceof Error ? error.message : 'Sync request failed');
  }

  if (!response.ok) {
    return mapResponseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

const buildDataset = ({
  gymRows,
  sessionRows,
  exerciseRows,
  setRows,
}: {
  gymRows: RemoteGymRow[];
  sessionRows: RemoteSessionRow[];
  exerciseRows: RemoteExerciseRow[];
  setRows: RemoteSetRow[];
}): SyncDataset => {
  const setsByExerciseId = setRows.reduce<Map<string, SyncSetRecord[]>>((acc, row) => {
    const current = acc.get(row.session_exercise_id) ?? [];
    current.push(mapRemoteSet(row));
    acc.set(row.session_exercise_id, current);
    return acc;
  }, new Map<string, SyncSetRecord[]>());

  const exercisesBySessionId = exerciseRows.reduce<Map<string, SyncExerciseRecord[]>>((acc, row) => {
    const current = acc.get(row.session_id) ?? [];
    current.push({
      ...mapRemoteExercise(row),
      sets: setsByExerciseId.get(row.id) ?? [],
    });
    acc.set(row.session_id, current);
    return acc;
  }, new Map<string, SyncExerciseRecord[]>());

  return {
    gyms: gymRows.map(mapRemoteGym),
    sessionGraphs: sessionRows.map((row) =>
      mapRemoteSessionGraph({
        session: row,
        exercises: (exercisesBySessionId.get(row.id) ?? []).map((exercise) => ({
          id: exercise.id,
          session_id: exercise.sessionId,
          order_index: exercise.orderIndex,
          name: exercise.name,
          machine_name: exercise.machineName,
          origin_scope_id: exercise.originScopeId,
          origin_source_id: exercise.originSourceId,
          created_at: exercise.createdAt.getTime(),
          updated_at: exercise.updatedAt.getTime(),
          sets: exercise.sets.map((set) => ({
            id: set.id,
            session_exercise_id: set.sessionExerciseId,
            order_index: set.orderIndex,
            weight_value: set.weightValue,
            reps_value: set.repsValue,
            created_at: set.createdAt.getTime(),
            updated_at: set.updatedAt.getTime(),
          })),
        })),
      })
    ),
  };
};

export const createSyncRemoteStore = ({
  backendClient,
}: {
  backendClient: SyncBackendClient;
}): SyncRemoteStore => ({
  async pullDataset() {
    const [gymRows, sessionRows, exerciseRows, setRows] = await Promise.all([
      requestJson<RemoteGymRow[]>(
        backendClient,
        '/rest/v1/gyms?select=id,name,origin_scope_id,origin_source_id,created_at,updated_at&order=updated_at.asc'
      ),
      requestJson<RemoteSessionRow[]>(
        backendClient,
        '/rest/v1/sessions?select=id,gym_id,status,started_at,completed_at,duration_sec,deleted_at,created_at,updated_at&order=updated_at.asc'
      ),
      requestJson<RemoteExerciseRow[]>(
        backendClient,
        '/rest/v1/session_exercises?select=id,session_id,order_index,name,machine_name,origin_scope_id,origin_source_id,created_at,updated_at&order=session_id.asc,order_index.asc'
      ),
      requestJson<RemoteSetRow[]>(
        backendClient,
        '/rest/v1/exercise_sets?select=id,session_exercise_id,order_index,weight_value,reps_value,created_at,updated_at&order=session_exercise_id.asc,order_index.asc'
      ),
    ]);

    return buildDataset({
      gymRows,
      sessionRows,
      exerciseRows,
      setRows,
    });
  },
  async createGym(gym) {
    await requestJson<RemoteGymRow[]>(backendClient, '/rest/v1/gyms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        id: gym.id,
        name: gym.name,
        origin_scope_id: gym.originScopeId,
        origin_source_id: gym.originSourceId,
        created_at: gym.createdAt.getTime(),
        updated_at: gym.updatedAt.getTime(),
      }),
    });
  },
  async updateGym(gym) {
    await requestJson<RemoteGymRow[]>(
      backendClient,
      `/rest/v1/gyms?id=eq.${encodeURIComponent(gym.id)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          name: gym.name,
          origin_scope_id: gym.originScopeId,
          origin_source_id: gym.originSourceId,
          created_at: gym.createdAt.getTime(),
          updated_at: gym.updatedAt.getTime(),
        }),
      }
    );
  },
  async replaceSessionGraph(graph, { expectedUpdatedAt }) {
    const response = await requestJson<RemoteSessionGraphResponse>(backendClient, '/rest/v1/rpc/replace_session_graph', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_expected_updated_at: expectedUpdatedAt?.getTime() ?? null,
        p_session: toRemoteSessionPayload(graph),
        p_exercises: graph.exercises.map(toRemoteExercisePayload),
      }),
    });

    return mapRemoteSessionGraph(response);
  },
  async pullSessionGraph(sessionId) {
    const [sessionsResponse, exercisesResponse] = await Promise.all([
      requestJson<RemoteSessionRow[]>(
        backendClient,
        `/rest/v1/sessions?id=eq.${encodeURIComponent(
          sessionId
        )}&select=id,gym_id,status,started_at,completed_at,duration_sec,deleted_at,created_at,updated_at`
      ),
      requestJson<RemoteExerciseRow[]>(
        backendClient,
        `/rest/v1/session_exercises?session_id=eq.${encodeURIComponent(
          sessionId
        )}&select=id,session_id,order_index,name,machine_name,origin_scope_id,origin_source_id,created_at,updated_at&order=order_index.asc`
      ),
    ]);

    const sessionRow = sessionsResponse[0];
    if (!sessionRow) {
      return null;
    }

    const exerciseIds = exercisesResponse.map((row) => row.id);
    const setRows =
      exerciseIds.length === 0
        ? []
        : await requestJson<RemoteSetRow[]>(
            backendClient,
            `/rest/v1/exercise_sets?session_exercise_id=in.(${exerciseIds.map((id) => `"${id}"`).join(',')})&select=id,session_exercise_id,order_index,weight_value,reps_value,created_at,updated_at&order=session_exercise_id.asc,order_index.asc`
          );

    const dataset = buildDataset({
      gymRows: [],
      sessionRows: [sessionRow],
      exerciseRows: exercisesResponse,
      setRows,
    });

    return dataset.sessionGraphs[0] ?? null;
  },
});

export const createDefaultSyncRemoteStore = (backendClient: SyncBackendClient) => createSyncRemoteStore({ backendClient });
export { createSyncBackendClient };
