/**
 * Objection Handler — mapeia top objecoes + scripts de quebra.
 */
import { callAgent } from '../../../lib/claude-sdk/client.mjs';
import { loadProduct } from '../../../lib/products/loader.mjs';

const SYSTEM = `Voce e expert em quebra de objecao (Jeffrey Gitomer + Hormozi).
Mapeie top 8 objecoes do produto/avatar e de scripts curtos de quebra.
Categorias classicas: preco, tempo, "ja tentei e nao deu certo", "nao confio", "vou pensar", "marido/esposa nao deixa", "nao sou tecnico", "e pra mim?".
Saida JSON: { objecoes:[{tipo, fala_cliente, quebra_curta, quebra_longa}] }.`;

export async function runObjectionHandler({ instrucao, productSlug }) {
  const p = productSlug ? loadProduct(productSlug) : null;
  const ctx = p ? `Produto: ${p.nome} (${p.tipo}) R$${p.preco}. Avatar: ${JSON.stringify(p.avatar_cliente || {}).slice(0, 300)}` : '';
  const { text } = await callAgent({
    tier: 'worker', system: SYSTEM,
    messages: [{ role: 'user', content: `${instrucao || 'Mapear objecoes'}\n${ctx}` }],
    maxTokens: 1500, temperature: 0.6
  });
  return text;
}
