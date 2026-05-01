/**
 * agents/marketing/workers/copywriter.mjs
 * Aplica framework Hormozi (Grand Slam Offer) + Brunson (Hook-Story-Offer).
 */
import { callAgent } from '../../../lib/claude-sdk/client.mjs';
import { loadProduct } from '../../../lib/products/loader.mjs';

const SYSTEM = `Voce e Copywriter expert em direct response brasileiro.
Use Hormozi Grand Slam Offer: Valor = (Sonho × Probabilidade) / (Tempo × Esforco).
Use Brunson Hook-Story-Offer em todo conteudo longo.
Tom: pt-BR, empatico-direto, sem promessa irreal.

Adapte o framework por tipo:
- ebook/planilha/audiobook: dor → solucao especifica → bonus
- curso: transformacao → metodo → comunidade
- mentoria: autoridade → escassez → resultado caso real
- saas/microsaas: ROI → reducao tempo → trial
- evento: urgencia data → escassez vagas
- fisico: tangivel → unboxing → frete gratis
- bundle: ancoragem → desconto agregado
- freemium: limitacao do free → valor do pro
- afiliacao: bonus seu sobre oferta-mae
- b2b: case → diagnostico → ROI

Saida: copy curta (max 8 linhas) + 1 hook + 1 CTA.`;

export async function runCopywriter({ instrucao, productSlug }) {
  const p = productSlug ? loadProduct(productSlug) : null;
  const ctx = p ? `Produto ${p.tipo}: ${p.nome}. Promessa: ${p.oferta?.promessa || '—'}. Dor: ${p.oferta?.dor || '—'}. Bonus: ${(p.oferta?.bonus || []).join(', ')}.` : '';
  const { text } = await callAgent({
    tier: 'worker',
    system: SYSTEM,
    messages: [{ role: 'user', content: `${instrucao}\n\n${ctx}` }],
    maxTokens: 800,
    temperature: 0.8
  });
  return text;
}
