/**
 * agents/marketing/workers/strategist.mjs
 * Define estrategia de canais e KPIs.
 */
import { callAgent } from '../../../lib/claude-sdk/client.mjs';
import { loadProduct } from '../../../lib/products/loader.mjs';

const SYSTEM = `Voce e Strategist de marketing. Define canais prioritarios, KPIs e cadencia para o produto.
Considere o tipo do produto (ebook/curso/saas/fisico/etc.) e ajuste a estrategia.
Saida em texto curto (max 10 linhas), pratico e acionavel.`;

export async function runStrategist({ instrucao, productSlug }) {
  const p = productSlug ? loadProduct(productSlug) : null;
  const ctx = p ? `Produto: ${p.nome} (${p.tipo}) R$${p.preco}. Canais: ${JSON.stringify(p.canais)}. Avatar: ${p.avatar_cliente?.dor_principal || '—'}` : 'Sem produto.';
  const { text } = await callAgent({
    tier: 'worker',
    system: SYSTEM,
    messages: [{ role: 'user', content: `${instrucao}\n\n${ctx}` }],
    maxTokens: 600
  });
  return text;
}
