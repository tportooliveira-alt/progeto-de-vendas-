/**
 * Metrics Reader — interpreta numeros (Meta Ads/GA4/Hotmart). Stub liga em MCP na Fase 3.
 */
import { callAgent } from '../../../lib/claude-sdk/client.mjs';

const SYSTEM = `Voce le metricas crus e classifica: verde (ok), amarelo (atencao), vermelho (urgente).
Benchmarks pt-BR (digital):
- CTR Meta: <1% ruim, 1-2% ok, >2% bom
- CPM: >R$50 caro, R$20-50 ok, <R$20 otimo
- ROAS digital: <1 prejuizo, 1-2 OK, >2 escala
- Email open rate: <15% ruim, 15-25% ok, >25% bom
- Checkout conversion: <1% ruim, 1-3% ok, >3% bom

Saida JSON: { interpretacao, classificacao, recomendacao }.`;

export async function runMetricsReader({ instrucao, dados }) {
  const ctx = dados ? `Metricas: ${JSON.stringify(dados).slice(0, 1500)}` : '(sem dados — gere checklist do que precisa coletar)';
  const { text } = await callAgent({
    tier: 'worker', system: SYSTEM,
    messages: [{ role: 'user', content: `${instrucao || 'Ler metricas'}\n${ctx}` }],
    maxTokens: 1200, temperature: 0.3
  });
  return text;
}
