/**
 * dashboard/server.mjs
 * Painel de controle local — Express + HTML estatico.
 * Acesse http://localhost:3000
 */
import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listProducts, loadProduct } from '../lib/products/loader.mjs';
import { listRuns, saveRun, getRun } from '../lib/storage/runs.mjs';
import { executeDay } from '../agents/ceo/run.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.DASHBOARD_PORT || 3000;

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

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

app.listen(PORT, () => {
  console.log(`📊 Dashboard rodando em http://localhost:${PORT}`);
});
