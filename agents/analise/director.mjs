/**
 * Diretor de Analise — leitura de metricas, insights acionaveis.
 */
import { callAgent } from '../../lib/claude-sdk/client.mjs';
import { runMetricsReader } from './workers/metrics-reader.mjs';
import { runInsights } from './workers/insights.mjs';

const SYSTEM = `Voce e Diretor de Analise. Workers: metrics_reader, insights.
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
    if (a.worker === 'metrics_reader') out.metrics_reader = await runMetricsReader({ instrucao: a.instrucao, productSlug });
    else if (a.worker === 'insights') out.insights = await runInsights({ instrucao: a.instrucao, productSlug });
  }
  return out;
}
