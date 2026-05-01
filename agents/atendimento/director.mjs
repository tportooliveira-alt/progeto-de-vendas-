/**
 * Diretor de Atendimento — FAQ + objecoes + suporte pos-venda.
 */
import { callAgent } from '../../lib/claude-sdk/client.mjs';
import { runFaqBot } from './workers/faq-bot.mjs';
import { runObjectionHandler } from './workers/objection-handler.mjs';

const SYSTEM = `Voce e Diretor de Atendimento. Workers: faq_bot, objection_handler.
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
    if (a.worker === 'faq_bot') out.faq_bot = await runFaqBot({ instrucao: a.instrucao, productSlug });
    else if (a.worker === 'objection_handler') out.objection_handler = await runObjectionHandler({ instrucao: a.instrucao, productSlug });
  }
  return out;
}
