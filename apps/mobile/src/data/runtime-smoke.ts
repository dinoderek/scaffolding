import { insertSmokeRecord, listSmokeRecords, type SmokeRecord } from './smoke-records';

export type LocalDataRuntimeSmokeResult = {
  insertedRecord: SmokeRecord;
  latestValue: string;
  totalRecords: number;
};

const createRuntimeSmokeValue = () => `runtime-smoke-${Date.now()}`;

export const runLocalDataRuntimeSmoke = async (): Promise<LocalDataRuntimeSmokeResult> => {
  const insertedRecord = await insertSmokeRecord(createRuntimeSmokeValue());
  const records = await listSmokeRecords();
  const latestRecord = records[records.length - 1];

  if (!latestRecord || latestRecord.id !== insertedRecord.id) {
    throw new Error(
      'Runtime smoke read verification failed: latest record does not match inserted record'
    );
  }

  return {
    insertedRecord,
    latestValue: latestRecord.value,
    totalRecords: records.length,
  };
};
