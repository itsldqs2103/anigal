import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const db = neon(DATABASE_URL);

export default db;

await ensureExtensions();
await ensureTables();

async function ensureExtensions() {
  await db`CREATE EXTENSION IF NOT EXISTS pgcrypto`;
}

async function ensureTables() {
  await db`
    CREATE TABLE IF NOT EXISTS images (
      id BIGINT PRIMARY KEY,
      path TEXT NOT NULL,
      url TEXT NOT NULL,
      preview_url TEXT NOT NULL,
      width INT NOT NULL,
      height INT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  `;
}
