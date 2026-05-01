/**
 * agents/vendas/director.mjs
 * Diretor de Vendas — recupera carrinho, captura leads, fecha.
 */
import { callAgent } from '../../lib/claude-sdk/client.mjs';
import { runCartRecovery } from './workers/cart-recovery.mjs';
import { runLeadHunter } from './workers/lead-hunter.mjs';

const SYSTEM = `Voce e Diretor de Vendas. Workers: cart_recovery, lead_hunter.
Decida quais acionar dada a tarefa do CEO. Saida JSON: { acoes:[{worker, instrucao}] }.`;

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
    if (a.worker === 'cart_recovery') out.cart_recovery = await runCartRecovery({ instrucao: a.instrucao, productSlug });
    else if (a.worker === 'lead_hunter') out.lead_hunter = await runLeadHunter({ instrucao: a.instrucao, productSlug });
  }
  return out;
}
