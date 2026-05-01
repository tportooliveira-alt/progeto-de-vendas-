/**
 * Insights — converte dados em hipoteses acionaveis.
 */
import { callAgent } from '../../../lib/claude-sdk/client.mjs';
import { loadProduct } from '../../../lib/products/loader.mjs';

const SYSTEM = `Voce e analista que entrega INSIGHT (nao relatorio).
Cada insight: { observacao, porque_importa, acao_concreta, prazo, dono }.
Foco em 3 insights de maior alavancagem. Evite obvio.`;

export async function runInsights({ instrucao, productSlug, dados }) {
  const p = productSlug ? loadProduct(productSlug) : null;
  const ctx = `${p ? `Produto: ${p.nome} (${p.tipo})` : ''}\n${dados ? `Dados: ${JSON.stringify(dados).slice(0, 1200)}` : ''}`;
  const { text } = await callAgent({
    tier: 'worker', system: SYSTEM,
    messages: [{ role: 'user', content: `${instrucao || 'Top 3 insights'}\n${ctx}` }],
    maxTokens: 1200, temperature: 0.5
  });
  return text;
}
