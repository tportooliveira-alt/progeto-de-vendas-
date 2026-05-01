/**
 * Diretor de Growth — A/B test, otimizacao funil, retencao.
 */
import { callAgent } from '../../lib/claude-sdk/client.mjs';
import { runABTest } from './workers/ab-test.mjs';
import { runFunnelOptimizer } from './workers/funnel-optimizer.mjs';

const SYSTEM = `Voce e Diretor de Growth. Workers: ab_test, funnel_optimizer.
Saida JSON: { acoes:[{worker, instrucao}] }.`;

export async function runDirector({ tarefa, productSlug }) {
  const { text } = await callAgent({
    tier: 'director', system: SYSTEM,
    messages: [{ role: 'user', content: `Tarefa CEO: ${tarefa}\nProduto: ${productSlug || '—'}` }],
    maxTokens: 600, temperature: 0.4
  });
  let plano;
  try { plano = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}'); } catch { plano = { acoes: [] }; }
  const out = {};
  for (const a of plano.acoes || []) {
    if (a.worker === 'ab_test') out.ab_test = await runABTest({ instrucao: a.instrucao, productSlug });
    else if (a.worker === 'funnel_optimizer') out.funnel_optimizer = await runFunnelOptimizer({ instrucao: a.instrucao, productSlug });
  }
  return out;
}
