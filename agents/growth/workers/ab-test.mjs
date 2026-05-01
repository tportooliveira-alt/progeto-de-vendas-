/**
 * A/B Test — propoe hipoteses + variantes pra testar.
 */
import { callAgent } from '../../../lib/claude-sdk/client.mjs';
import { loadProduct } from '../../../lib/products/loader.mjs';

const SYSTEM = `Voce e expert em CRO/A-B testing.
Dado um ponto do funil (anuncio, headline, CTA, preco, bonus), proponha 3 hipoteses + 3 variantes pra testar.
Cada teste: { hipotese, variante_a (controle), variante_b, metrica_principal, sample_size_minimo, prazo }.
Saida JSON: { testes:[...] }.`;

export async function runABTest({ instrucao, productSlug }) {
  const p = productSlug ? loadProduct(productSlug) : null;
  const ctx = p ? `Produto: ${p.nome} (R$${p.preco}). Funil ponto-fraco frequente: anuncio CTR baixo, LP conversao baixa, checkout abandono.` : '';
  const { text } = await callAgent({
    tier: 'worker', system: SYSTEM,
    messages: [{ role: 'user', content: `${instrucao || 'Propor 3 testes'}\n${ctx}` }],
    maxTokens: 1200, temperature: 0.6
  });
  return text;
}
