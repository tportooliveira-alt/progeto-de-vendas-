/**
 * agents/marketing/director.mjs
 * Diretor de Marketing — recebe tarefa do CEO, aciona workers (Strategist, Copywriter, AdsPlanner, BrandKeeper).
 */
import { callAgent } from '../../lib/claude-sdk/client.mjs';
import { runStrategist } from './workers/strategist.mjs';
import { runCopywriter } from './workers/copywriter.mjs';

const SYSTEM = `Voce e o Diretor de Marketing. Recebe tarefa do CEO e decide quais workers acionar.
Workers disponiveis: strategist, copywriter, ads_planner, brand_keeper.
Responda em JSON: { acoes:[{worker, instrucao}] }.`;

export async function runDirector({ tarefa, productSlug }) {
  const { text } = await callAgent({
    tier: 'director',
    system: SYSTEM,
    messages: [{ role: 'user', content: `Tarefa do CEO: ${tarefa}\nProduto slug: ${productSlug || '—'}` }],
    maxTokens: 800,
    temperature: 0.4
  });

  let plano;
  try { plano = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}'); }
  catch { plano = { acoes: [] }; }

  const out = {};
  for (const a of plano.acoes || []) {
    if (a.worker === 'strategist') out.strategist = await runStrategist({ instrucao: a.instrucao, productSlug });
    else if (a.worker === 'copywriter') out.copywriter = await runCopywriter({ instrucao: a.instrucao, productSlug });
  }
  return out;
}
