/**
 * lib/storage/runs.mjs
 * Persistencia simples em JSON local pra histórico de execucoes.
 * Em producao trocar por Supabase.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT, 'data');
const FILE = path.join(DATA_DIR, 'runs.json');

function ensure() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]');
}

export function listRuns({ limit = 50 } = {}) {
  ensure();
  try {
    const arr = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    return arr.slice(-limit).reverse();
  } catch {
    return [];
  }
}

export function saveRun(run) {
  ensure();
  let arr = [];
  try { arr = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch {}
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    createdAt: new Date().toISOString(),
    ...run
  };
  arr.push(entry);
  // mantém só últimos 500
  if (arr.length > 500) arr = arr.slice(-500);
  fs.writeFileSync(FILE, JSON.stringify(arr, null, 2));
  return entry;
}

export function getRun(id) {
  return listRuns({ limit: 500 }).find(r => r.id === id) || null;
}
