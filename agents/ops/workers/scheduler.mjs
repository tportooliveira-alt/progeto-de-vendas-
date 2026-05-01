/**
 * Scheduler — gera calendario semanal de publicacoes/disparos.
 */
import { callAgent } from '../../../lib/claude-sdk/client.mjs';
import { loadProduct } from '../../../lib/products/loader.mjs';

const SYSTEM = `Voce monta calendario editorial e de disparos.
Dado canais (IG/TikTok/YT/Email/WhatsApp) e cadencia, gere grade de 7 dias com horarios otimizados pt-BR.
Horarios fortes: IG 12h/19h, TikTok 19h/21h, YT 18h sab/dom, Email ter/qui 9h, WhatsApp seg/qua 18h.
Saida JSON: { dias:[{data, slots:[{hora,canal,tipo,tema}]}] }.`;

export async function runScheduler({ instrucao, productSlug }) {
  const p = productSlug ? loadProduct(productSlug) : null;
  const ctx = p ? `Produto: ${p.nome}. Canais: ${(p.canais || []).join(', ') || 'IG, TikTok, Email'}. Cadencia: ${JSON.stringify(p.cadencia || {}).slice(0, 200)}` : '';
  const { text } = await callAgent({
    tier: 'worker', system: SYSTEM,
    messages: [{ role: 'user', content: `${instrucao || 'Calendario semana proxima'}\n${ctx}` }],
    maxTokens: 1500, temperature: 0.5
  });
  return text;
}
