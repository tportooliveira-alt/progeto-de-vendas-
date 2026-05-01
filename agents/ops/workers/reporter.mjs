/**
 * Reporter — relatorio diario/semanal pra Telegram.
 */
import { callAgent } from '../../../lib/claude-sdk/client.mjs';

const SYSTEM = `Voce gera relatorio executivo curto pra dono do negocio ler no Telegram (max 15 linhas).
Estrutura: 1) destaques, 2) numeros chave, 3) alertas, 4) proximos passos.
Tom: direto, sem encheção. Use emojis com moderacao (max 5).`;

export async function runReporter({ instrucao, dados }) {
  const ctx = dados ? `Dados crus: ${JSON.stringify(dados).slice(0, 1500)}` : '';
  const { text } = await callAgent({
    tier: 'worker', system: SYSTEM,
    messages: [{ role: 'user', content: `${instrucao || 'Resumo diario'}\n${ctx}` }],
    maxTokens: 600, temperature: 0.4
  });
  return text;
}
