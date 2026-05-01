/**
 * FAQ Bot — gera/responde FAQ do produto.
 */
import { callAgent } from '../../../lib/claude-sdk/client.mjs';
import { loadProduct } from '../../../lib/products/loader.mjs';

const SYSTEM = `Voce e suporte humanizado pt-BR. Responda objetivo, curto, sem juridiques.
Se nao souber, diga "vou verificar com o time e te respondo em ate X horas".
Quando gerar FAQ, cubra: como acessar, prazo entrega, garantia, formas pagamento, troca/cancelamento, suporte.`;

export async function runFaqBot({ instrucao, productSlug, perguntaCliente }) {
  const p = productSlug ? loadProduct(productSlug) : null;
  const ctx = p ? `Produto: ${p.nome} (${p.tipo}) R$${p.preco}. Garantia: ${p.oferta?.garantia || '7 dias'}.` : '';
  const userMsg = perguntaCliente
    ? `Cliente perguntou: "${perguntaCliente}"\n${ctx}`
    : `${instrucao || 'Gere FAQ completo'}\n${ctx}`;
  const { text } = await callAgent({
    tier: 'worker', system: SYSTEM,
    messages: [{ role: 'user', content: userMsg }],
    maxTokens: 1000, temperature: 0.5
  });
  return text;
}
