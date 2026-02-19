import type { migrate as migrateExpoSqlite } from 'drizzle-orm/expo-sqlite/migrator';

type RuntimeMigrationConfig = Parameters<typeof migrateExpoSqlite>[1];

export const localRuntimeMigrations: RuntimeMigrationConfig = {
  // Keep this bundle aligned with files generated under apps/mobile/drizzle/**.
  journal: {
    entries: [
      {
        idx: 0,
        when: 1771519674243,
        tag: '0000_quiet_famine',
        breakpoints: true,
      },
    ],
  },
  migrations: {
    m0000: `CREATE TABLE \`smoke_records\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`value\` text NOT NULL,
	\`created_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	\`updated_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
`,
  },
};
