#!/usr/bin/env node
/**
 * scripts/train-agents.mjs
 * Treino incremental dos diretores usando runs locais e feedback no Supabase.
 */
import 'dotenv/config';
import { listRuns } from '../lib/storage/runs.mjs';
import { supabase } from '../lib/supabase/client.mjs';
import { DIRECTOR_AREAS, saveDirectorHints } from '../lib/training/context.mjs';

const BASE_HINTS = {
  marketing: [
    'Priorize oferta, prova e CTA claro antes de expandir volume.',
    'Ajuste copy ao avatar e canal antes de pedir criativo novo.'
  ],
  conteudo: [
    'Comece por ganchos curtos e promessa especifica por formato.',
    'Transforme uma ideia em multiplos recortes (reels, caption, carrossel).'
  ],
  parcerias: [
    'Priorize criadores com engajamento real e aderencia ao avatar.',
    'Feche proposta simples com risco baixo e upside claro para o parceiro.'
  ],
  vendas: [
    'Ative recuperacao de carrinho com urgencia e objecao principal.',
    'Segmente lead frio, morno e quente com abordagem diferente.'
  ],
  growth: [
    'Rode teste com hipotese unica e metrica de sucesso definida.',
    'Escalone apenas o que bate meta com consistencia.'
  ],
  atendimento: [
    'Responder rapido, empatico e com proximo passo acionavel.',
    'Mapear objecoes recorrentes para reduzir atrito no funil.'
  ],
  ops: [
    'Padronize checklist de execucao e janelas de publicacao.',
    'Consolide relatorio curto com decisoes recomendadas.'
  ],
  analise: [
    'Conectar metrica de vaidade com impacto real em receita.',
    'Entregar no maximo 3 insights acionaveis por ciclo.'
  ]
};

function emptyMap() {
  return Object.fromEntries(DIRECTOR_AREAS.map(a => [a, []]));
}

function addHint(map, area, text, score = 1, source = 'local') {
  if (!DIRECTOR_AREAS.includes(area)) return;
  const clean = String(text || '').trim();
  if (!clean) return;
  map[area].push({ text: clean, score, source });
}

function dedupeAndRank(arr, limit = 8) {
  const byKey = new Map();
  for (const item of arr) {
    const key = item.text.toLowerCase();
    const prev = byKey.get(key);
    if (!prev) byKey.set(key, { ...item });
    else {
      prev.score += item.score;
      if (prev.source !== item.source) prev.source = `${prev.source}+${item.source}`;
    }
  }
  return Array.from(byKey.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function learnFromRuns(map, runs) {
  let learned = 0;
  for (const run of runs) {
    if (run.status && run.status !== 'ok') continue;
    const resultados = run.resultados || {};
    for (const area of Object.keys(resultados)) {
      if (!DIRECTOR_AREAS.includes(area)) continue;
      const out = resultados[area];
      if (out && typeof out === 'object' && !Array.isArray(out)) {
        const workers = Object.keys(out).slice(0, 3);
        if (workers.length) {
          addHint(
            map,
            area,
            `Em tarefas amplas, distribuir para workers-chave (${workers.join(', ')}) aumenta cobertura e velocidade.`,
            2,
            'runs'
          );
          learned += 1;
        }
      } else if (typeof out === 'string') {
        addHint(map, area, out.slice(0, 140), 1, 'runs');
        learned += 1;
      }
    }
  }
  return learned;
}

async function learnFromSupabase(map) {
  const db = supabase();
  if (!db) return { learned: 0, table: 'none' };

  const tables = ['agent_feedback', 'agent_training_feedback'];
  for (const table of tables) {
    try {
      const { data, error } = await db.from(table).select('area,hint,score').limit(200);
      if (error) continue;
      let learned = 0;
      for (const row of data || []) {
        const area = String(row.area || '').toLowerCase();
        addHint(map, area, row.hint, Number(row.score || 2), `supabase:${table}`);
        learned += 1;
      }
      return { learned, table };
    } catch {
      // tenta proxima tabela
    }
  }
  return { learned: 0, table: 'not-found' };
}

async function saveSnapshot(db, summary) {
  if (!db) return false;
  try {
    await db.from('agent_training_snapshots').insert({
      created_at: new Date().toISOString(),
      summary
    });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🧠 Treino incremental dos agentes\n');

  const hintMap = emptyMap();

  // baseline inicial por diretoria
  for (const area of DIRECTOR_AREAS) {
    for (const h of BASE_HINTS[area] || []) addHint(hintMap, area, h, 2, 'baseline');
  }

  const runs = listRuns({ limit: 500 });
  const learnedRuns = learnFromRuns(hintMap, runs);
  const supa = await learnFromSupabase(hintMap);

  const summary = [];
  for (const area of DIRECTOR_AREAS) {
    const ranked = dedupeAndRank(hintMap[area], 8);
    saveDirectorHints(area, ranked, {
      localRuns: runs.length,
      learnedRuns,
      learnedSupabase: supa.learned,
      sourceTable: supa.table
    });
    summary.push({ area, hints: ranked.length });
  }

  const db = supabase();
  const snapOk = await saveSnapshot(db, {
    localRuns: runs.length,
    learnedRuns,
    learnedSupabase: supa.learned,
    table: supa.table,
    areas: summary
  });

  console.log('✅ Treino concluido');
  console.log(`- Runs locais lidas: ${runs.length}`);
  console.log(`- Hints aprendidas de runs: ${learnedRuns}`);
  console.log(`- Hints aprendidas do Supabase: ${supa.learned} (tabela: ${supa.table})`);
  console.log(`- Snapshot Supabase: ${snapOk ? 'ok' : 'nao salvo (opcional)'}`);
  console.log('- Arquivos gerados em data/training/*.json');
}

main().catch(err => {
  console.error('❌ Falha no treino:', err.message);
  process.exit(1);
});
