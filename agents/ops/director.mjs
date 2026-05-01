/**
 * Diretor de Ops — agenda, publicacao, relatorios.
 */
import { callAgent } from '../../lib/claude-sdk/client.mjs';
import { runScheduler } from './workers/scheduler.mjs';
import { runReporter } from './workers/reporter.mjs';

const SYSTEM = `Voce e Diretor de Ops. Workers: scheduler, reporter.
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
    if (a.worker === 'scheduler') out.scheduler = await runScheduler({ instrucao: a.instrucao, productSlug });
    else if (a.worker === 'reporter') out.reporter = await runReporter({ instrucao: a.instrucao, productSlug });
  }
  return out;
}
