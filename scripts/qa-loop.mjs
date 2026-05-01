#!/usr/bin/env node
/**
 * scripts/qa-loop.mjs
 * Testador + validador (agente do contra) em loop para 10 cenarios.
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listProducts } from '../lib/products/loader.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const QA_DIR = path.join(ROOT, 'data', 'qa');

const scenarios = [
  'Lancar campanha de 7 dias para ebook com foco em conversao imediata.',
  'Recuperar carrinhos abandonados dos ultimos 3 dias com WhatsApp + email.',
  'Criar pauta de conteudo semanal com 5 reels e 3 carrosseis.',
  'Aumentar taxa de fechamento de leads mornos com oferta de entrada.',
  'Desenhar estrategia de parcerias com microinfluenciadores de nicho.',
  'Reduzir churn de assinantes com plano de retencao em 14 dias.',
  'Gerar plano de teste A/B para checkout e pagina de vendas.',
  'Organizar rotina operacional de publicacao e relatorios diarios.',
  'Auditar metricas da semana e propor 3 acoes de alto impacto.',
  'Criar campanha de reativacao de base inativa com urgencia e bonus.'
];

const repeats = Math.max(1, Math.min(10, Number(process.env.QA_REPEATS || 3)));
const maxScenarios = Math.max(1, Math.min(10, Number(process.env.QA_SCENARIOS || 10)));

function uniqueDirectors(plan) {
  const arr = Array.isArray(plan?.plano) ? plan.plano : [];
  return [...new Set(arr.map(x => String(x?.diretor || '').toLowerCase()).filter(Boolean))];
}

function scoreRun(output) {
  const issues = [];
  const tips = [];

  if (!output?.plano?.decisao) issues.push('Sem decisao do CEO');
  if (!output?.plano?.kpi_alvo) issues.push('Sem KPI alvo explicito');

  const dirs = uniqueDirectors(output?.plano || {});
  if (dirs.length === 0) issues.push('Nenhum diretor acionado');
  if (dirs.length > 0 && dirs.length < 2) tips.push('Acionar mais diretorias para cobertura do briefing');

  const resultados = output?.resultados || {};
  for (const d of dirs) {
    if (!(d in resultados)) {
      issues.push(`Diretor ${d} planejado mas sem resultado`);
    }
  }

  const hasRichOutput = Object.values(resultados).some(v => {
    if (typeof v === 'string') return v.length > 80;
    if (v && typeof v === 'object') return Object.keys(v).length > 0;
    return false;
  });

  if (!hasRichOutput) tips.push('Resultados curtos; expandir instrucoes para workers');

  const score = Math.max(0, 100 - (issues.length * 25) - (tips.length * 5));
  return {
    ok: issues.length === 0,
    score,
    issues,
    tips
  };
}

function printResultLine(r) {
  const icon = r.validation?.ok ? '✅' : '❌';
  const label = `${icon} [${r.scenarioIndex + 1}.${r.repeatIndex}] score=${r.validation.score}`;
  const msg = r.error ? `erro=${r.error}` : `dirs=${r.directors.join(',') || '-'} dur=${r.durationMs}ms`;
  console.log(`${label} ${msg}`);
}

async function run() {
  const selected = scenarios.slice(0, maxScenarios);
  const productSlug = listProducts()[0] || null;

  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY_CHEAP) {
    // Sem chave real: força modo mock para ainda testar orquestracao.
    process.env.MOCK_AGENT_MODE = '1';
  }

  const { executeDay } = await import('../agents/ceo/run.mjs');

  console.log('🧪 QA LOOP (testador + validador)');
  console.log(`- cenarios: ${selected.length}`);
  console.log(`- repeticoes por cenario: ${repeats}`);
  console.log(`- modo: ${process.env.MOCK_AGENT_MODE === '1' ? 'mock/offline' : 'real/api'}`);

  const rows = [];

  for (let s = 0; s < selected.length; s++) {
    for (let r = 1; r <= repeats; r++) {
      const briefing = selected[s];
      const t0 = Date.now();
      try {
        const out = await executeDay({ briefing, productSlug });
        const validation = scoreRun(out);
        const row = {
          scenarioIndex: s,
          repeatIndex: r,
          briefing,
          directors: uniqueDirectors(out?.plano || {}),
          durationMs: Date.now() - t0,
          validation,
          error: null,
          createdAt: new Date().toISOString()
        };
        rows.push(row);
        printResultLine(row);
      } catch (e) {
        const row = {
          scenarioIndex: s,
          repeatIndex: r,
          briefing,
          directors: [],
          durationMs: Date.now() - t0,
          validation: { ok: false, score: 0, issues: ['Falha de execucao'], tips: [] },
          error: e.message,
          createdAt: new Date().toISOString()
        };
        rows.push(row);
        printResultLine(row);
      }
    }
  }

  const okCount = rows.filter(x => x.validation.ok).length;
  const avgScore = rows.length ? Math.round(rows.reduce((s, x) => s + x.validation.score, 0) / rows.length) : 0;
  const summary = {
    generatedAt: new Date().toISOString(),
    mode: process.env.MOCK_AGENT_MODE === '1' ? 'mock' : 'real',
    scenarios: selected.length,
    repeats,
    totalRuns: rows.length,
    okRuns: okCount,
    failRuns: rows.length - okCount,
    avgScore,
    recommendations: [
      'Se houver falhas recorrentes por diretoria, ajustar SYSTEM prompt e worker mapping.',
      'Elevar QA_REPEATS para 5-10 antes de release critico.',
      'Rodar QA em modo real apos preencher chaves para validar integracoes externas.'
    ],
    rows
  };

  fs.mkdirSync(QA_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(QA_DIR, `qa-report-${ts}.json`);
  const latest = path.join(QA_DIR, 'qa-report-latest.json');
  fs.writeFileSync(file, JSON.stringify(summary, null, 2), 'utf8');
  fs.writeFileSync(latest, JSON.stringify(summary, null, 2), 'utf8');

  console.log('\n📌 Resumo QA');
  console.log(`- total: ${summary.totalRuns}`);
  console.log(`- ok: ${summary.okRuns}`);
  console.log(`- falhas: ${summary.failRuns}`);
  console.log(`- score medio: ${summary.avgScore}`);
  console.log(`- relatorio: ${file}`);

  if (summary.failRuns > 0) process.exitCode = 1;
}

run().catch(err => {
  console.error('❌ QA loop falhou:', err.message);
  process.exit(1);
});
