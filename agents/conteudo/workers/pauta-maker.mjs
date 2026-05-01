/**
 * agents/conteudo/workers/pauta-maker.mjs
 * Cria pauta semanal usando Atomic Content (1 ancora -> N derivados).
 */
import { callAgent } from '../../../lib/claude-sdk/client.mjs';
import { loadProduct } from '../../../lib/products/loader.mjs';

const SYSTEM = `Voce e PautaMaker. Use Atomic Content: 1 conteudo ancora -> 7 reels + 7 posts + 3 emails.
Considere a cadencia definida no produto. Retorne lista numerada de pecas (formato + tema + hook).
Adapte ao tipo do produto (evento usa contagem regressiva, saas foca em ROI, fisico em unboxing, etc.).`;

export async function runPautaMaker({ instrucao, productSlug }) {
  const p = productSlug ? loadProduct(productSlug) : null;
  const ctx = p ? `Produto ${p.tipo}: ${p.nome}. Cadencia: ${JSON.stringify(p.cadencia)}. Avatar dor: ${p.avatar_cliente?.dor_principal || '—'}.` : '';
  const { text } = await callAgent({
    tier: 'worker',
    system: SYSTEM,
    messages: [{ role: 'user', content: `${instrucao}\n\n${ctx}` }],
    maxTokens: 1200,
    temperature: 0.8
  });
  return text;
}
