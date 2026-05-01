/**
 * Funnel Optimizer — analisa funil e sugere ajustes.
 */
import { callAgent } from '../../../lib/claude-sdk/client.mjs';
import { loadProduct } from '../../../lib/products/loader.mjs';

const SYSTEM = `Voce otimiza funis: TOFU (anuncio/conteudo) -> MOFU (LP/lead-magnet) -> BOFU (checkout/upsell).
Dado um produto e metricas (mesmo aproximadas), aponte: 1) maior gargalo, 2) 3 mudancas rapidas (impacto/esforco), 3) novo upsell/downsell se faltar.
Saida JSON: { gargalo, quick_wins:[], upsell, downsell }.`;

export async function runFunnelOptimizer({ instrucao, productSlug }) {
  const p = productSlug ? loadProduct(productSlug) : null;
  const ctx = p ? `Produto: ${p.nome} (${p.tipo}) R$${p.preco}. Upsell atual: ${JSON.stringify(p.upsell || {}).slice(0, 200)}` : '';
  const { text } = await callAgent({
    tier: 'worker', system: SYSTEM,
    messages: [{ role: 'user', content: `${instrucao || 'Analisar funil'}\n${ctx}` }],
    maxTokens: 1200, temperature: 0.6
  });
  return text;
}
