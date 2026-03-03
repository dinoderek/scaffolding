import { asc, eq, inArray } from 'drizzle-orm';

import { bootstrapLocalDataLayer, type LocalDatabase } from '@/src/data';
import { exerciseSets, gyms, sessionExercises, sessions } from '@/src/data/schema';

import type {
  SyncDataset,
  SyncExerciseRecord,
  SyncGymRecord,
  SyncLocalSessionStatus,
  SyncLocalStore,
  SyncSessionGraph,
  SyncSetRecord,
} from './types';

const normalizeSessionStatus = (status: string): SyncLocalSessionStatus => (status === 'completed' ? 'completed' : 'active');

const replaceExerciseGraph = (
  database: Pick<LocalDatabase, 'select' | 'insert' | 'update' | 'delete'>,
  graph: SyncSessionGraph
) => {
  const existingExerciseRows = database
    .select({ id: sessionExercises.id })
    .from(sessionExercises)
    .where(eq(sessionExercises.sessionId, graph.sessionId))
    .all();
  const existingExerciseIds = existingExerciseRows.map((row) => row.id);

  if (existingExerciseIds.length > 0) {
    database.delete(exerciseSets).where(inArray(exerciseSets.sessionExerciseId, existingExerciseIds)).run();
  }
  database.delete(sessionExercises).where(eq(sessionExercises.sessionId, graph.sessionId)).run();

  graph.exercises.forEach((exercise) => {
    database
      .insert(sessionExercises)
      .values({
        id: exercise.id,
        sessionId: graph.sessionId,
        orderIndex: exercise.orderIndex,
        name: exercise.name,
        machineName: exercise.machineName,
        originScopeId: exercise.originScopeId,
        originSourceId: exercise.originSourceId,
        createdAt: exercise.createdAt,
        updatedAt: exercise.updatedAt,
      })
      .run();

    exercise.sets.forEach((set) => {
      database
        .insert(exerciseSets)
        .values({
          id: set.id,
          sessionExerciseId: exercise.id,
          orderIndex: set.orderIndex,
          weightValue: set.weightValue,
          repsValue: set.repsValue,
          createdAt: set.createdAt,
          updatedAt: set.updatedAt,
        })
        .run();
    });
  });
};

const mapGymRecord = (row: typeof gyms.$inferSelect): SyncGymRecord => ({
  id: row.id,
  name: row.name,
  originScopeId: row.originScopeId,
  originSourceId: row.originSourceId,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const mapSetRecord = (row: typeof exerciseSets.$inferSelect): SyncSetRecord => ({
  id: row.id,
  sessionExerciseId: row.sessionExerciseId,
  orderIndex: row.orderIndex,
  weightValue: row.weightValue,
  repsValue: row.repsValue,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const mapExerciseRecord = (
  row: typeof sessionExercises.$inferSelect,
  setsForExercise: SyncSetRecord[]
): SyncExerciseRecord => ({
  id: row.id,
  sessionId: row.sessionId,
  orderIndex: row.orderIndex,
  name: row.name,
  machineName: row.machineName,
  originScopeId: row.originScopeId,
  originSourceId: row.originSourceId,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  sets: setsForExercise,
});

const mapSessionGraph = (
  row: typeof sessions.$inferSelect,
  exercisesForSession: SyncExerciseRecord[]
): SyncSessionGraph => ({
  sessionId: row.id,
  gymId: row.gymId,
  status: normalizeSessionStatus(row.status),
  startedAt: row.startedAt,
  completedAt: row.completedAt,
  durationSec: row.durationSec,
  deletedAt: row.deletedAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  exercises: exercisesForSession,
});

export const createSyncLocalStore = (): SyncLocalStore => ({
  async pullDataset(): Promise<SyncDataset> {
    const database = await bootstrapLocalDataLayer();
    const gymRows = database.select().from(gyms).all();
    const sessionRows = database.select().from(sessions).all();
    const exerciseRows = database.select().from(sessionExercises).orderBy(asc(sessionExercises.orderIndex)).all();
    const setRows = database.select().from(exerciseSets).orderBy(asc(exerciseSets.orderIndex)).all();

    const setsByExerciseId = setRows.reduce<Map<string, SyncSetRecord[]>>((acc, row) => {
      const current = acc.get(row.sessionExerciseId) ?? [];
      current.push(mapSetRecord(row));
      acc.set(row.sessionExerciseId, current);
      return acc;
    }, new Map<string, SyncSetRecord[]>());

    const exercisesBySessionId = exerciseRows.reduce<Map<string, SyncExerciseRecord[]>>((acc, row) => {
      const current = acc.get(row.sessionId) ?? [];
      current.push(mapExerciseRecord(row, setsByExerciseId.get(row.id) ?? []));
      acc.set(row.sessionId, current);
      return acc;
    }, new Map<string, SyncExerciseRecord[]>());

    return {
      gyms: gymRows.map(mapGymRecord),
      sessionGraphs: sessionRows.map((row) => mapSessionGraph(row, exercisesBySessionId.get(row.id) ?? [])),
    };
  },
  async upsertGym(gym) {
    const database = await bootstrapLocalDataLayer();

    database.transaction((tx) => {
      const existing = tx.select({ id: gyms.id }).from(gyms).where(eq(gyms.id, gym.id)).get();

      if (existing) {
        tx.update(gyms)
          .set({
            name: gym.name,
            originScopeId: gym.originScopeId,
            originSourceId: gym.originSourceId,
            createdAt: gym.createdAt,
            updatedAt: gym.updatedAt,
          })
          .where(eq(gyms.id, gym.id))
          .run();
        return;
      }

      tx.insert(gyms)
        .values({
          id: gym.id,
          name: gym.name,
          originScopeId: gym.originScopeId,
          originSourceId: gym.originSourceId,
          createdAt: gym.createdAt,
          updatedAt: gym.updatedAt,
        })
        .run();
    });
  },
  async replaceSessionGraph(graph) {
    const database = await bootstrapLocalDataLayer();

    database.transaction((tx) => {
      const existing = tx.select({ id: sessions.id }).from(sessions).where(eq(sessions.id, graph.sessionId)).get();

      if (existing) {
        tx.update(sessions)
          .set({
            gymId: graph.gymId,
            status: graph.status,
            startedAt: graph.startedAt,
            completedAt: graph.completedAt,
            durationSec: graph.durationSec,
            deletedAt: graph.deletedAt,
            createdAt: graph.createdAt,
            updatedAt: graph.updatedAt,
          })
          .where(eq(sessions.id, graph.sessionId))
          .run();
      } else {
        tx.insert(sessions)
          .values({
            id: graph.sessionId,
            gymId: graph.gymId,
            status: graph.status,
            startedAt: graph.startedAt,
            completedAt: graph.completedAt,
            durationSec: graph.durationSec,
            deletedAt: graph.deletedAt,
            createdAt: graph.createdAt,
            updatedAt: graph.updatedAt,
          })
          .run();
      }

      replaceExerciseGraph(tx, graph);
    });
  },
});
