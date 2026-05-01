/**
 * lib/claude-sdk/client.mjs
 * Cliente Claude com hierarquia de modelos.
 */
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const MODELS = {
  ceo:      'claude-sonnet-4-5',     // estrategia, decisoes
  director: 'claude-sonnet-4-5',     // diretores
  worker:   'claude-haiku-4-5',      // tarefas executoras
  fast:     'claude-haiku-4-5'
};

/**
 * Chama um agente.
 * @param {Object} opts
 * @param {'ceo'|'director'|'worker'|'fast'} opts.tier
 * @param {string} opts.system
 * @param {Array<{role:'user'|'assistant',content:string}>} opts.messages
 * @param {number} [opts.maxTokens=2048]
 * @param {number} [opts.temperature=0.7]
 */
export async function callAgent({ tier = 'worker', system, messages, maxTokens = 2048, temperature = 0.7 }) {
  const model = MODELS[tier] || MODELS.worker;
  const res = await client.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system,
    messages
  });
  const text = res.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
  return {
    text,
    model,
    usage: res.usage,
    raw: res
  };
}

export { client };
