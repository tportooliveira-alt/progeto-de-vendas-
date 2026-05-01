#!/usr/bin/env node
/**
 * scripts/smoke-test.mjs
 * Roda um pipeline ponta-a-ponta: CEO -> Diretores -> Telegram.
 *
 * Funciona SEM nenhuma config (apenas ANTHROPIC_API_KEY) — sem produto,
 * sem Supabase, sem Telegram. Mas se .env estiver completo, vai mais fundo.
 */
import 'dotenv/config';
import { listProducts } from '../lib/products/loader.mjs';

console.log('🔍 SMOKE TEST — agents-factory\n');

const mockMode = (process.env.MOCK_AGENT_MODE || '0') === '1';

const checks = [];

// 1. ANTHROPIC_API_KEY
checks.push({
  nome: 'ANTHROPIC_API_KEY',
  ok: !!process.env.ANTHROPIC_API_KEY || mockMode,
  detalhe: mockMode
    ? 'MOCK_AGENT_MODE=1 (teste offline sem custo)'
    : (process.env.ANTHROPIC_API_KEY ? 'configurada' : '❌ FALTA — preencha .env')
});

// 2. Produtos
const products = listProducts();
checks.push({
  nome: 'Produtos cadastrados',
  ok: true,
  detalhe: products.length ? products.join(', ') : '(nenhum — rode `npm run new-product`)'
});

// 3. Telegram
checks.push({
  nome: 'Telegram',
  ok: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
  detalhe: (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) ? 'configurado' : '⚠️  opcional — sem isso o CEO so loga no console'
});

// 4. Supabase
checks.push({
  nome: 'Supabase',
  ok: !!process.env.SUPABASE_URL,
  detalhe: process.env.SUPABASE_URL ? 'configurado' : '⚠️  opcional — runtime opera em memoria'
});

console.log('═══ Pre-flight ═══');
for (const c of checks) {
  console.log(`${c.ok ? '✅' : '❌'} ${c.nome}: ${c.detalhe}`);
}

if (!process.env.ANTHROPIC_API_KEY && !mockMode) {
  console.log('\n❌ Sem ANTHROPIC_API_KEY nao roda CEO. Preencha .env ou use MOCK_AGENT_MODE=1.');
  process.exit(1);
}

console.log('\n═══ Executando pipeline CEO -> Diretores ═══\n');

const { executeDay } = await import('../agents/ceo/run.mjs');
const briefing = 'Pauta da semana: gerar 3 reels + 2 emails + 1 oferta de parceria pra criadores top engajamento. Foco em conversao.';
const slug = products[0] || null;

try {
  const out = await executeDay({ briefing, productSlug: slug });
  console.log('\n✅ Pipeline executou.');
  console.log('Resultados-chave:');
  for (const [dir, res] of Object.entries(out.resultados)) {
    console.log(`\n--- ${dir} ---`);
    console.log(typeof res === 'string' ? res.slice(0, 400) : JSON.stringify(res, null, 2).slice(0, 400));
  }
  process.exit(0);
} catch (e) {
  console.error('\n❌ Erro:', e.message);
  process.exit(1);
}
