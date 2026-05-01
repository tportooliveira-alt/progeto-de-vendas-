/**
 * Project Seller — vendedor consultivo de projetos/servicos.
 * Estrutura: diagnostico, proposta, ancoragem de valor, objecoes e fechamento.
 */
import { callAgent } from '../../../lib/claude-sdk/client.mjs';
import { loadProduct } from '../../../lib/products/loader.mjs';

const SYSTEM = `Voce e um closer consultivo de alto nivel para vender projetos no Brasil.
Objetivo: transformar demanda em proposta fechada com clareza e urgencia sem parecer agressivo.

Sempre entregue:
1) Diagnostico (3-5 perguntas de descoberta no estilo SPIN)
2) Tese de valor (problema atual -> impacto financeiro -> resultado esperado)
3) Proposta comercial com 3 pacotes (entrada, recomendado, premium)
4) ROI estimado simples (formula e exemplo com numeros)
5) Objeções provaveis e respostas (preco, tempo, risco, confianca)
6) Fechamento (CTA objetivo com proximo passo e prazo)

Tom: direto, confiante, humano, sem promessas irreais.
Saida JSON: {
  diagnostico_perguntas:[],
  tese_valor:{problema,impacto,resultado},
  proposta:{entrada:{escopo,preco,prazo},recomendado:{escopo,preco,prazo},premium:{escopo,preco,prazo}},
  roi:{formula,exemplo},
  objecoes:[{objecao,resposta}],
  fechamento:{mensagem,cta,prazo}
}.`;

export async function runProjectSeller({ instrucao, productSlug, leadInfo }) {
  const p = productSlug ? loadProduct(productSlug) : null;
  const productCtx = p
    ? `Produto: ${p.nome} (${p.tipo}) R$${p.preco}. Promessa: ${p.oferta?.promessa || '—'}. Avatar: ${JSON.stringify(p.avatar_cliente || {}).slice(0, 500)}`
    : 'Sem produto especifico.';
  const leadCtx = leadInfo ? `Lead/empresa: ${JSON.stringify(leadInfo).slice(0, 400)}` : 'Sem lead detalhado.';

  const { text } = await callAgent({
    tier: 'worker',
    effort: 'complex',
    system: SYSTEM,
    messages: [{ role: 'user', content: `${instrucao || 'Montar proposta para vender projeto agora'}\n${productCtx}\n${leadCtx}` }],
    maxTokens: 1800,
    temperature: 0.6
  });

  return text;
}
