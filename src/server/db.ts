/**
 * src/server/db.ts
 * Supabase Admin client — only imported in src/server/.
 * NEVER import this file in src/app/ or src/components/.
 */

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.warn(
    '[DB] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. ' +
    'The server will run, but database operations will fail.'
  );
}

export const db = createClient(
  url ?? 'https://placeholder.supabase.co',
  key ?? 'placeholder',
  { auth: { autoRefreshToken: false, persistSession: false } }
);
