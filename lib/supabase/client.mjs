/**
 * lib/supabase/client.mjs
 * Cliente Supabase (opcional — agentes funcionam sem ele).
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

let _client = null;

export function supabase() {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn('⚠️  Supabase nao configurado — runtime opera em modo memoria');
    return null;
  }
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}
