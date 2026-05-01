/**
 * agents/parcerias/workers/deal-maker.mjs
 * Gera oferta IRRESISTIVEL pro criador (Hormozi Grand Slam).
 */
import { callAgent } from '../../../lib/claude-sdk/client.mjs';
import { loadProduct } from '../../../lib/products/loader.mjs';

const SYSTEM = `Voce e DealMaker. Cria oferta IRRESISTIVEL pra um criador de conteudo virar parceiro.

Use Hormozi Grand Slam Offer:
- Comissao 70-80% (vs 30-40% mercado)
- Bonus desbloqueaveis por meta (gamificacao)
- Leads qualificados ENTREGUES pro parceiro (ganha-ganha real)
- Co-branding em campanha (status pro parceiro)
- Kit white-label pronto em 5min (zero esforco)

Adapte por tipo de produto:
- Recorrente (saas/comunidade): comissao recorrente
- Fisico: comissao menor + bonus exclusivos
- Mentoria: comissao alta + slots reservados

Saida: carta de proposta pt-BR, max 12 linhas, com bullets de bonus, numeros, prazo e CTA.
Tom: parceiro de verdade, nao vendedor. Direto, com prova.`;

export async function runDealMaker({ instrucao, productSlug }) {
  const p = productSlug ? loadProduct(productSlug) : null;
  const ctx = p
    ? `Produto: ${p.nome} (${p.tipo}) R$${p.preco}.\nComissao base: ${(p.partners?.comissao || 0.5) * 100}%\nComissao max top: ${(p.partners?.comissao_max_top || 0.7) * 100}%\nBonus extras: ${(p.partners?.oferta_extra || []).join(', ')}\nKit white-label: ${p.partners?.kit_white_label ? 'sim' : 'nao'}`
    : '';
  const { text } = await callAgent({
    tier: 'worker',
    system: SYSTEM,
    messages: [{ role: 'user', content: `${instrucao}\n\n${ctx}` }],
    maxTokens: 800,
    temperature: 0.7
  });
  return text;
}
