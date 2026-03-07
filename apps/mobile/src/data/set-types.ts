export const SESSION_SET_TYPES = ['warm_up', 'rir_0', 'rir_1', 'rir_2'] as const;

export type SessionSetType = (typeof SESSION_SET_TYPES)[number];
export type SessionSetTypeValue = SessionSetType | null;

const sessionSetTypeSet = new Set<string>(SESSION_SET_TYPES);

export const normalizeSessionSetType = (value: unknown): SessionSetTypeValue => {
  if (typeof value !== 'string') {
    return null;
  }

  return sessionSetTypeSet.has(value) ? (value as SessionSetType) : null;
};
