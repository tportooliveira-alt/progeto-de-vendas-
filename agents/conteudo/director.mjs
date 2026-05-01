/**
 * agents/conteudo/director.mjs
 * Diretor de Conteudo — pauta + roteiro + caption.
 */
import { callAgent } from '../../lib/claude-sdk/client.mjs';
import { runPautaMaker } from './workers/pauta-maker.mjs';
import { runCaption } from './workers/caption.mjs';
import { runVideoMaker } from './workers/video-maker.mjs';
import { runDesigner } from './workers/designer.mjs';
import { runPublisher } from './workers/publisher.mjs';

const SYSTEM = `Voce e Diretor de Conteudo. Aciona workers: pauta_maker, video_maker, designer, caption, publisher.
Saida JSON: { acoes:[{worker, instrucao}] }.`;

export async function runDirector({ tarefa, productSlug }) {
  const { text } = await callAgent({
    tier: 'director',
    system: SYSTEM,
    messages: [{ role: 'user', content: `Tarefa CEO: ${tarefa}\nProduto: ${productSlug || '—'}` }],
    maxTokens: 600,
    temperature: 0.4
  });
  let plano;
  try { plano = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}'); }
  catch { plano = { acoes: [] }; }

  const out = {};
  for (const a of plano.acoes || []) {
    if (a.worker === 'pauta_maker') out.pauta_maker = await runPautaMaker({ instrucao: a.instrucao, productSlug });
    else if (a.worker === 'caption') out.caption = await runCaption({ instrucao: a.instrucao, productSlug });
    else if (a.worker === 'video_maker') out.video_maker = await runVideoMaker({ instrucao: a.instrucao, productSlug });
    else if (a.worker === 'designer') out.designer = await runDesigner({ instrucao: a.instrucao, productSlug });
    else if (a.worker === 'publisher' && a.posts) out.publisher = await runPublisher({ posts: a.posts });
  }
  return out;
}
