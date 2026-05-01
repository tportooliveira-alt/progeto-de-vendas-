/**
 * agents/ceo/run.mjs
 * CEO-Claude — recebe briefing, distribui tarefas pros diretores, consolida resultado.
 */
import 'dotenv/config';
import { callAgent } from '../../lib/claude-sdk/client.mjs';
import { sendMessage } from '../../lib/telegram/notify.mjs';
import { runDirector as runMarketing } from '../marketing/director.mjs';
import { runDirector as runConteudo } from '../conteudo/director.mjs';
import { runDirector as runParcerias } from '../parcerias/director.mjs';
import { runDirector as runVendas } from '../vendas/director.mjs';
import { runDirector as runGrowth } from '../growth/director.mjs';
import { runDirector as runAtendimento } from '../atendimento/director.mjs';
import { runDirector as runOps } from '../ops/director.mjs';
import { runDirector as runAnalise } from '../analise/director.mjs';
import { makeStubDirector } from '../_stub.mjs';
import { listProducts, loadProduct } from '../../lib/products/loader.mjs';

export const CEO_SYSTEM = `Voce e o CEO de uma empresa de IA que vende produtos digitais e fisicos.
Sua hierarquia: voce -> 8 diretores -> ~30 workers.

Diretorias: marketing, conteudo, parcerias, vendas, growth, atendimento, ops, analise.

Estilo: empreendedor brasileiro, direto, foco em resultado. Pense em ROI, parcerias com criadores de alto engajamento, e oferta irresistivel (Hormozi).

Quando recebe um briefing, voce decide:
1. quais diretores acionar
2. qual a prioridade
3. qual KPI esperar

Saida sempre em JSON valido com: { decisao, plano:[{diretor, tarefa, prioridade}], kpi_alvo }.`;

export async function runCEO({ briefing, productSlug }) {
  const product = productSlug ? loadProduct(productSlug) : null;
  const productCtx = product
    ? `Produto: ${product.nome} (${product.tipo}) — R$ ${product.preco}\nPromessa: ${product.oferta?.promessa || '—'}\nDor: ${product.oferta?.dor || '—'}`
    : 'Sem produto especifico (acao geral).';

  const { text } = await callAgent({
    tier: 'ceo',
    system: CEO_SYSTEM,
    messages: [{
      role: 'user',
      content: `BRIEFING:\n${briefing}\n\nCONTEXTO:\n${productCtx}\n\nResponda em JSON.`
    }],
    maxTokens: 1500,
    temperature: 0.5
  });

  let plano;
  try {
    const m = text.match(/\{[\s\S]*\}/);
    plano = m ? JSON.parse(m[0]) : { decisao: text, plano: [], kpi_alvo: '' };
  } catch {
    plano = { decisao: text, plano: [], kpi_alvo: '' };
  }
  return plano;
}

const DIRECTORS = {
  marketing: runMarketing,
  conteudo: runConteudo,
  parcerias: runParcerias,
  vendas: runVendas,
  growth: runGrowth,
  atendimento: runAtendimento,
  ops: runOps,
  analise: runAnalise
};

export async function executeDay({ briefing, productSlug }) {
  console.log(`\n🤖 CEO recebendo briefing pra ${productSlug || '(geral)'}...\n`);
  const plano = await runCEO({ briefing, productSlug });
  console.log('📋 Plano CEO:', JSON.stringify(plano, null, 2));

  const resultados = {};
  for (const tarefa of plano.plano || []) {
    const dir = (tarefa.diretor || '').toLowerCase();
    const fn = DIRECTORS[dir];
    if (!fn) {
      console.log(`⚠️  Diretor "${dir}" ainda nao implementado (Fase 0 piloto). Pulando.`);
      continue;
    }
    console.log(`\n→ Acionando ${dir}: ${tarefa.tarefa}`);
    resultados[dir] = await fn({ tarefa: tarefa.tarefa, productSlug });
  }

  const resumo = `🏭 *Briefing executado*\n\n*Decisao CEO:* ${plano.decisao}\n*KPI alvo:* ${plano.kpi_alvo || '—'}\n\n*Resultados:*\n${Object.entries(resultados).map(([d, r]) => `• *${d}*: ${typeof r === 'string' ? r.slice(0, 200) : 'OK'}`).join('\n') || '(nenhum diretor executado)'}`;
  await sendMessage(resumo);

  return { plano, resultados };
}

// CLI
if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  const briefing = process.argv[2] || 'Pauta de conteudo da semana, foco em parcerias, gerar plano de 7 reels + 3 emails.';
  const slug = process.argv[3] || (listProducts()[0] || null);
  executeDay({ briefing, productSlug: slug }).then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}
