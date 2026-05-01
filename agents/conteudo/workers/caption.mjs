/**
 * agents/conteudo/workers/caption.mjs
 * Gera legendas otimizadas (estilo IG/TikTok br).
 */
import { callAgent } from '../../../lib/claude-sdk/client.mjs';

const SYSTEM = `Voce escreve legendas pt-BR pra IG/TikTok que param o scroll.
Estrutura: hook na 1a linha + valor + storytelling curto + CTA.
Max 220 caracteres na 1a frase. Use emojis com moderacao. Sem #spam — max 5 hashtags relevantes.`;

export async function runCaption({ instrucao, productSlug }) {
  const { text } = await callAgent({
    tier: 'worker',
    system: SYSTEM,
    messages: [{ role: 'user', content: instrucao }],
    maxTokens: 400,
    temperature: 0.9
  });
  return text;
}
