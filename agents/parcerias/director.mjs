/**
 * agents/parcerias/director.mjs
 * 🔥 Diretor de Parcerias — JOIA DA COROA.
 * Aciona: influencer_scout, deal_maker, kit_builder, partner_crm, performance_tracker.
 */
import { callAgent } from '../../lib/claude-sdk/client.mjs';
import { runInfluencerScout } from './workers/influencer-scout.mjs';
import { runDealMaker } from './workers/deal-maker.mjs';

const SYSTEM = `Voce e Diretor de Parcerias. Foco em achar criadores de ALTO engajamento (>3%) e fechar oferta IRRESISTIVEL.
Workers: influencer_scout (varre redes), deal_maker (gera oferta Hormozi), kit_builder (kit white-label), partner_crm, performance_tracker.
Saida JSON: { acoes:[{worker, instrucao}] }.`;

export async function runDirector({ tarefa, productSlug }) {
  const { text } = await callAgent({
    tier: 'director',
    system: SYSTEM,
    messages: [{ role: 'user', content: `Tarefa CEO: ${tarefa}\nProduto: ${productSlug || '—'}` }],
    maxTokens: 600,
    temperature: 0.4
  });
  let plano;
  try { plano = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}'); }
  catch { plano = { acoes: [] }; }

  const out = {};
  for (const a of plano.acoes || []) {
    if (a.worker === 'influencer_scout') out.influencer_scout = await runInfluencerScout({ instrucao: a.instrucao, productSlug });
    else if (a.worker === 'deal_maker') out.deal_maker = await runDealMaker({ instrucao: a.instrucao, productSlug });
  }
  return out;
}
