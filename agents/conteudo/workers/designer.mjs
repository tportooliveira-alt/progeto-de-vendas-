/**
 * Designer — gera prompts pra Midjourney/DALL-E/Ideogram + descricao alt.
 * Nao gera imagem em si (precisa MCP de imagem na Fase 3); gera o briefing certo.
 */
import { callAgent } from '../../../lib/claude-sdk/client.mjs';
import { loadProduct } from '../../../lib/products/loader.mjs';

const SYSTEM = `Voce e Designer/Art Director.
Pra cada peca pedida, gere: 1) prompt v6 (estilo Midjourney) 2) prompt DALL-E 3) prompt Ideogram (com texto) 4) alt text acessibilidade.
Estilo padrao do projeto: clean, alta contraste, paleta da marca, sem stock-photo cara de.
Saida JSON: { peca, prompts:{midjourney,dalle,ideogram}, alt_text, dimensoes }`;

export async function runDesigner({ instrucao, productSlug }) {
  const p = productSlug ? loadProduct(productSlug) : null;
  const ctx = p ? `Marca: ${p.nome}. Tom: ${JSON.stringify(p.brand || {}).slice(0, 200)}` : '';
  const { text } = await callAgent({
    tier: 'worker', system: SYSTEM,
    messages: [{ role: 'user', content: `${instrucao || 'Gerar 3 capas de Reels'}\n${ctx}` }],
    maxTokens: 1200, temperature: 0.7
  });
  return text;
}
