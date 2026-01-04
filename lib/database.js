import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing');
}

const db = neon(process.env.DATABASE_URL);

await db`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

await db`
  CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path TEXT NOT NULL,
    url TEXT NOT NULL,
    preview_url TEXT NOT NULL,
    width INT NOT NULL,
    height INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  )
`;

export default db;
