/**
 * Cart Recovery — gera sequencia de mensagens (email + whatsapp) pra recuperar carrinho abandonado.
 * Usa framework: 5min (urgencia), 1h (objecao), 24h (bonus extra), 72h (ultimo aviso + desconto).
 */
import { callAgent } from '../../../lib/claude-sdk/client.mjs';
import { loadProduct } from '../../../lib/products/loader.mjs';

const SYSTEM = `Voce e especialista em recuperacao de carrinho abandonado.
Gere sequencia de 4 toques: 5min, 1h, 24h, 72h.
Cada toque tem: canal (email|whatsapp), assunto, corpo curto (max 4 linhas), CTA.
Use gatilho diferente em cada: 1) urgencia, 2) objecao comum, 3) bonus extra, 4) ultimo aviso + desconto pequeno.
Saida em JSON: { sequencia:[{tempo, canal, assunto, corpo, cta}] }.`;

export async function runCartRecovery({ instrucao, productSlug, leadInfo }) {
  const p = productSlug ? loadProduct(productSlug) : null;
  const ctx = p ? `Produto: ${p.nome} (${p.tipo}) R$${p.preco}. Promessa: ${p.oferta?.promessa || '—'}.` : '';
  const lead = leadInfo ? `Lead: ${JSON.stringify(leadInfo).slice(0, 300)}` : '';
  const { text } = await callAgent({
    tier: 'worker', system: SYSTEM,
    messages: [{ role: 'user', content: `${instrucao || 'Gerar sequencia padrao'}\n${ctx}\n${lead}` }],
    maxTokens: 1200, temperature: 0.7
  });
  return text;
}
