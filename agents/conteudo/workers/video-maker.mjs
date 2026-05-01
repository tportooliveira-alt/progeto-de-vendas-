/**
 * Video Maker — produz roteiro + dispara HeyGen+ElevenLabs.
 * Saida: { roteiro, video_id (heygen), audio_path (opcional) }
 */
import { callAgent } from '../../../lib/claude-sdk/client.mjs';
import { loadProduct } from '../../../lib/products/loader.mjs';
import { generateVideo } from '../../../lib/integrations/heygen.mjs';

const SYSTEM = `Voce e roteirista de Reels/TikTok pt-BR (15-60s).
Estrutura: HOOK forte (3s) -> PROBLEMA -> VIRADA -> CTA.
Sem jargao. Frases curtas. Linguagem oral. 1 emoji max.
Saida em texto puro do roteiro (sem cabecalho).`;

export async function runVideoMaker({ instrucao, productSlug, opts = {} }) {
  const p = productSlug ? loadProduct(productSlug) : null;
  const ctx = p ? `Produto: ${p.nome} (${p.tipo}). Promessa: ${p.oferta?.promessa || '—'}.` : '';

  // 1. roteiro
  const { text: roteiro } = await callAgent({
    tier: 'worker', system: SYSTEM,
    messages: [{ role: 'user', content: `${instrucao || 'Gerar reel sobre o produto'}\n${ctx}` }],
    maxTokens: 600, temperature: 0.8
  });

  // 2. (opcional) gerar video HeyGen — so se tiver IDs e flag
  let videoJob = null;
  if (opts.generateVideo && opts.avatarId && opts.voiceId) {
    try {
      videoJob = await generateVideo({ script: roteiro, avatarId: opts.avatarId, voiceId: opts.voiceId });
    } catch (e) {
      videoJob = { error: e.message };
    }
  }

  return { roteiro, videoJob };
}
