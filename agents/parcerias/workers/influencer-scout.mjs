/**
 * agents/parcerias/workers/influencer-scout.mjs
 * Score 0-100: engajamento(30) + audiencia-alvo(25) + freq(15) + autoridade(15) + fit(15).
 *
 * Quando YOUTUBE_API_KEY estiver setado, busca real via API.
 * Caso contrario, cai pra inferencia do Claude (fase 0 piloto).
 */
import { callAgent } from '../../../lib/claude-sdk/client.mjs';
import { loadProduct } from '../../../lib/products/loader.mjs';
import { searchChannels, estimateEngagement } from '../../../lib/integrations/youtube.mjs';

const SYSTEM_REAL = `Voce e InfluencerScout. Recebe lista de canais reais (YouTube) com stats e calcula score 0-100:
- engajamento (30pts): >5%=30, 3-5%=20, 1-3%=10, <1%=5
- audiencia-alvo (25pts): subs 10k-500k=25, 5k-10k=15, <5k=8, >500k=20
- frequencia (15pts): videos recentes
- autoridade (15pts): qualidade descricao + niche-fit
- fit-de-nicho (15pts): match com avatar/produto

Saida JSON: { criadores:[{handle, plataforma:'youtube', url, subs, engajamento_pct, score, justificativa, abordagem_sugerida}] }
Ordene DESC.`;

const SYSTEM_FALLBACK = `Voce sugere criadores brasileiros adequados ao nicho. Use seu conhecimento.
Saida JSON: { criadores:[{handle, plataforma, seguidores_aprox, engajamento_estimado, score, justificativa, _estimativa:true}] }`;

export async function runInfluencerScout({ instrucao, productSlug, queries }) {
  const p = productSlug ? loadProduct(productSlug) : null;
  const ctx = p
    ? `Produto: ${p.nome} (${p.tipo}). Avatar: ${JSON.stringify(p.avatar_cliente || {}).slice(0, 300)}. Concorrentes: ${(p.concorrentes || []).join(', ')}.`
    : '';

  let realData = null;
  if (process.env.YOUTUBE_API_KEY) {
    try {
      const qs = queries && queries.length ? queries : [
        p?.partners?.perfil_ideal?.nicho || p?.tipo || 'financas pessoais',
        p?.avatar_cliente?.dor_principal || 'controle financeiro'
      ].filter(Boolean);
      const todos = [];
      for (const q of qs) {
        const chs = await searchChannels({ query: q, maxResults: 8 });
        for (const ch of chs) {
          if (ch.subs < 5000 || ch.subs > 800000) continue;
          const eng = await estimateEngagement(ch.id, 6).catch(() => 0);
          todos.push({ ...ch, engagement_pct: eng, query: q });
        }
      }
      realData = todos;
    } catch (e) {
      realData = { error: e.message };
    }
  }

  const useReal = realData && Array.isArray(realData) && realData.length > 0;
  const sys = useReal ? SYSTEM_REAL : SYSTEM_FALLBACK;
  const userMsg = useReal
    ? `${instrucao || 'Score e ranqueie:'}\n${ctx}\n\nCanais reais YT:\n${JSON.stringify(realData, null, 2).slice(0, 4000)}`
    : `${instrucao || 'Sugira 8 criadores brasileiros'}\n${ctx}`;

  const { text } = await callAgent({
    tier: 'worker', system: sys,
    messages: [{ role: 'user', content: userMsg }],
    maxTokens: 2000, temperature: useReal ? 0.4 : 0.6
  });

  return { dataSource: useReal ? 'youtube_api' : 'claude_estimate', resultado: text };
}
