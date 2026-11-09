/**
 * Narrow database surface used by migrations.
 * Production uses expo-sqlite; integration tests use a Node SQLite adapter.
 */
export type MigrationDatabase = {
  execAsync(source: string): Promise<void>;
  runAsync(source: string, params?: unknown[]): Promise<unknown>;
  getFirstAsync<T>(source: string, params?: unknown[]): Promise<T | null>;
  getAllAsync<T>(source: string, params?: unknown[]): Promise<T[]>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
};

export type Migration = {
  version: number;
  name: string;
  up: (db: MigrationDatabase) => Promise<void>;
};
