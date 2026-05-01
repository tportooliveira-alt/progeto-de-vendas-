/**
 * Lead Hunter — gera listas + scripts de prospeccao ativa (DM cold, email cold, comentario engajado).
 */
import { callAgent } from '../../../lib/claude-sdk/client.mjs';
import { loadProduct } from '../../../lib/products/loader.mjs';

const SYSTEM = `Voce e Lead Hunter B2C/B2B brasileiro.
Gere: 1) ICP (Ideal Customer Profile) detalhado, 2) onde encontrar (canais), 3) script DM cold (3 variacoes), 4) script email cold (assunto+corpo), 5) script comentario-engajado pra IG/TikTok de criadores adjacentes.
Tom: humano, sem cara de copia. Foco em iniciar conversa, nao vender direto.
Saida JSON: { icp, canais:[], dm_variacoes:[], email:{assunto,corpo}, comentario_engajado }.`;

export async function runLeadHunter({ instrucao, productSlug }) {
  const p = productSlug ? loadProduct(productSlug) : null;
  const ctx = p ? `Produto: ${p.nome} (${p.tipo}). Avatar: ${JSON.stringify(p.avatar_cliente || {}).slice(0, 400)}` : '';
  const { text } = await callAgent({
    tier: 'worker', system: SYSTEM,
    messages: [{ role: 'user', content: `${instrucao || 'Gerar plano de prospeccao'}\n${ctx}` }],
    maxTokens: 1500, temperature: 0.7
  });
  return text;
}
