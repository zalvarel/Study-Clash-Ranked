/**
 * Supabase Admin client — hanya diimpor di src/server/.
 * JANGAN diimpor di app/ atau components/.
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
