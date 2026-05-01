/**
 * lib/training/context.mjs
 * Contexto de treinamento incremental por diretoria.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const TRAINING_DIR = path.join(ROOT, 'data', 'training');

export const DIRECTOR_AREAS = [
  'marketing',
  'conteudo',
  'parcerias',
  'vendas',
  'growth',
  'atendimento',
  'ops',
  'analise'
];

function ensureDir() {
  fs.mkdirSync(TRAINING_DIR, { recursive: true });
}

function fileOf(area) {
  return path.join(TRAINING_DIR, `${area}.json`);
}

export function normalizeArea(input = '') {
  const s = String(input).toLowerCase();
  if (s.includes('marketing')) return 'marketing';
  if (s.includes('conteudo') || s.includes('conteúdo')) return 'conteudo';
  if (s.includes('parceria')) return 'parcerias';
  if (s.includes('venda')) return 'vendas';
  if (s.includes('growth')) return 'growth';
  if (s.includes('atendimento')) return 'atendimento';
  if (s.includes('ops') || s.includes('operac')) return 'ops';
  if (s.includes('analise') || s.includes('análise')) return 'analise';
  return null;
}

export function inferAreaFromDirectorSystem(system = '') {
  const m = String(system).match(/diretor\s+de\s+([^\.\n]+)/i);
  if (!m) return normalizeArea(system);
  return normalizeArea(m[1]);
}

export function loadDirectorHints(area, { limit = 6 } = {}) {
  ensureDir();
  const file = fileOf(area);
  if (!fs.existsSync(file)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const hints = Array.isArray(data?.hints) ? data.hints : [];
    return hints.slice(0, limit);
  } catch {
    return [];
  }
}

export function saveDirectorHints(area, hints, meta = {}) {
  if (!DIRECTOR_AREAS.includes(area)) return null;
  ensureDir();
  const payload = {
    area,
    updatedAt: new Date().toISOString(),
    meta,
    hints: (Array.isArray(hints) ? hints : []).map(h => ({
      text: String(h.text || '').trim(),
      score: Number(h.score || 1),
      source: h.source || 'unknown'
    })).filter(h => h.text)
  };
  fs.writeFileSync(fileOf(area), JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}

export function getDirectorTrainingBlockFromSystem(system = '') {
  const area = inferAreaFromDirectorSystem(system);
  if (!area) return '';
  const hints = loadDirectorHints(area, { limit: 6 });
  if (!hints.length) return '';

  const bullets = hints
    .map((h, i) => `${i + 1}. ${h.text}`)
    .join('\n');

  return [
    'Contexto de treino (historico da operacao):',
    bullets,
    'Use essas diretrizes como prioridade, sem quebrar o JSON de saida exigido.'
  ].join('\n');
}
