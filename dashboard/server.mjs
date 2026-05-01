/**
 * dashboard/server.mjs
 * Painel de controle local — Express + HTML estatico.
 * Acesse http://localhost:3000
 */
import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { fileURLToPath } from 'node:url';
import { listProducts, loadProduct } from '../lib/products/loader.mjs';
import { listRuns, saveRun, getRun } from '../lib/storage/runs.mjs';
import { executeDay } from '../agents/ceo/run.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = process.env.DASHBOARD_PORT || 3000;

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// helpers
function deepMerge(base, over) {
  if (Array.isArray(base) || Array.isArray(over)) return over ?? base;
  if (typeof base !== 'object' || typeof over !== 'object' || !base || !over) return over ?? base;
  const out = { ...base };
  for (const k of Object.keys(over)) {
    out[k] = (k in base) ? deepMerge(base[k], over[k]) : over[k];
  }
  return out;
}
function slugify(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ---- API ----

app.get('/api/health', (_, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.get('/api/integrations', (_, res) => {
  const keys = [
    ['Anthropic (CEO)', 'ANTHROPIC_API_KEY', true],
    ['Telegram', 'TELEGRAM_BOT_TOKEN'],
    ['Supabase', 'SUPABASE_URL'],
    ['Metricool', 'METRICOOL_USER_TOKEN'],
    ['Brevo (email)', 'BREVO_API_KEY'],
    ['Evolution (WhatsApp)', 'EVOLUTION_URL'],
    ['HeyGen', 'HEYGEN_API_KEY'],
    ['ElevenLabs', 'ELEVENLABS_API_KEY'],
    ['Hotmart', 'HOTMART_CLIENT_ID'],
    ['YouTube Data', 'YOUTUBE_API_KEY'],
    ['Firecrawl', 'FIRECRAWL_API_KEY']
  ];
  res.json(keys.map(([nome, env, required]) => ({
    nome, env, required: !!required, configurado: !!process.env[env]
  })));
});

app.get('/api/products', (_, res) => {
  const slugs = listProducts();
  res.json(slugs.map(slug => {
    try {
      const p = loadProduct(slug);
      return { slug, nome: p.nome, tipo: p.tipo, preco: p.preco, status: p.status || 'ativo' };
    } catch (e) {
      return { slug, error: e.message };
    }
  }));
});

app.get('/api/products/:slug', (req, res) => {
  try { res.json(loadProduct(req.params.slug)); }
  catch (e) { res.status(404).json({ error: e.message }); }
});

app.get('/api/runs', (req, res) => {
  res.json(listRuns({ limit: parseInt(req.query.limit) || 50 }));
});

app.get('/api/runs/:id', (req, res) => {
  const r = getRun(req.params.id);
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json(r);
});

app.post('/api/run', async (req, res) => {
  const { briefing, productSlug } = req.body || {};
  if (!briefing) return res.status(400).json({ error: 'briefing obrigatorio' });
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY nao configurada' });
  }

  // executa em background
  const start = Date.now();
  try {
    const result = await executeDay({ briefing, productSlug });
    const entry = saveRun({
      briefing, productSlug, status: 'ok',
      durationMs: Date.now() - start,
      plano: result.plano,
      resultados: result.resultados
    });
    res.json({ ok: true, run: entry });
  } catch (e) {
    const entry = saveRun({
      briefing, productSlug, status: 'error',
      durationMs: Date.now() - start,
      error: e.message
    });
    res.status(500).json({ ok: false, error: e.message, run: entry });
  }
});

// ---- Agentes (arvore) ----
function listWorkers(area) {
  const dir = path.join(ROOT, 'agents', area, 'workers');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.mjs'))
    .map(f => f.replace(/\.mjs$/, ''));
}
app.get('/api/agents', (_, res) => {
  const areas = ['marketing', 'conteudo', 'parcerias', 'vendas', 'growth', 'atendimento', 'ops', 'analise'];
  const tree = areas.map(a => ({
    area: a,
    director: fs.existsSync(path.join(ROOT, 'agents', a, 'director.mjs')),
    workers: listWorkers(a)
  }));
  const totalWorkers = tree.reduce((s, t) => s + t.workers.length, 0);
  res.json({ ceo: true, directors: tree.length, totalWorkers, tree });
});

// ---- Presets disponíveis ----
app.get('/api/presets', (_, res) => {
  const dir = path.join(ROOT, 'products', '_presets');
  if (!fs.existsSync(dir)) return res.json([]);
  res.json(fs.readdirSync(dir).filter(f => f.endsWith('.yaml')).map(f => f.replace(/\.yaml$/, '')));
});

// ---- Criar produto ----
app.post('/api/products', (req, res) => {
  const { tipo, nome, slug, preco, plataforma, promessa, dor } = req.body || {};
  if (!tipo || !nome) return res.status(400).json({ error: 'tipo e nome obrigatorios' });

  const finalSlug = slug || slugify(nome);
  const dest = path.join(ROOT, 'products', finalSlug);
  if (fs.existsSync(dest)) return res.status(409).json({ error: `produto ja existe: ${finalSlug}` });

  const schemaPath = path.join(ROOT, 'products', '_schema.yaml');
  const presetPath = path.join(ROOT, 'products', '_presets', `${tipo}.yaml`);
  if (!fs.existsSync(presetPath)) return res.status(400).json({ error: `preset invalido: ${tipo}` });

  const schema = YAML.parse(fs.readFileSync(schemaPath, 'utf8'));
  const preset = YAML.parse(fs.readFileSync(presetPath, 'utf8'));
  const merged = deepMerge(schema, preset);
  merged.slug = finalSlug;
  merged.nome = nome;
  merged.tipo = tipo;
  merged.preco = parseFloat(preco) || 0;
  merged.plataforma_venda = plataforma || 'hotmart';
  merged.oferta = merged.oferta || {};
  if (promessa) merged.oferta.promessa = promessa;
  if (dor) merged.oferta.dor = dor;

  fs.mkdirSync(dest, { recursive: true });
  fs.mkdirSync(path.join(dest, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(dest, 'product.yaml'), YAML.stringify(merged), 'utf8');
  fs.writeFileSync(path.join(dest, 'assets', '.gitkeep'), '');

  res.json({ ok: true, slug: finalSlug });
});

// ---- Status webhooks ----
app.get('/api/webhooks/status', async (_, res) => {
  const port = process.env.HOTMART_WEBHOOK_PORT || 3002;
  const result = { hotmart: { port, up: false } };
  try {
    const r = await fetch(`http://localhost:${port}/health`, { signal: AbortSignal.timeout(1500) });
    result.hotmart.up = r.ok;
  } catch { /* down */ }
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`📊 Dashboard rodando em http://localhost:${PORT}`);
});
