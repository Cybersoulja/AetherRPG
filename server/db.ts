import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/schema';

export type Database = ReturnType<typeof drizzle<typeof schema>>;

let _db: Database | undefined;

export function getDb(): Database {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL is required. Copy .env.example to .env and configure your Neon database URL.'
      );
    }
    _db = drizzle(neon(process.env.DATABASE_URL), { schema });
  }
  return _db;
}
