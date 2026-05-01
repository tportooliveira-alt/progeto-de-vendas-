/**
 * lib/claude-sdk/client.mjs
 * Cliente Claude com hierarquia de modelos.
 */
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const MOCK_AGENT_MODE = (process.env.MOCK_AGENT_MODE || '0') === '1';

const BASE_KEY = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY_CHEAP || '';
const CHEAP_KEY = process.env.ANTHROPIC_API_KEY_CHEAP || BASE_KEY;
const PREMIUM_KEY = process.env.ANTHROPIC_API_KEY_PREMIUM || BASE_KEY;

const COST_OPTIMIZE_SIMPLE = (process.env.COST_OPTIMIZE_SIMPLE || '1') !== '0';
const SIMPLE_MAX_TOKENS_THRESHOLD = Number(process.env.SIMPLE_MAX_TOKENS_THRESHOLD || 800);

const client = new Anthropic({ apiKey: BASE_KEY });
const cheapClient = new Anthropic({ apiKey: CHEAP_KEY });
const premiumClient = new Anthropic({ apiKey: PREMIUM_KEY });

export const MODELS = {
  ceo:      process.env.ANTHROPIC_MODEL_CEO || 'claude-sonnet-4-5',
  director: process.env.ANTHROPIC_MODEL_DIRECTOR || 'claude-sonnet-4-5',
  worker:   process.env.ANTHROPIC_MODEL_WORKER || 'claude-haiku-4-5',
  fast:     process.env.ANTHROPIC_MODEL_FAST || 'claude-haiku-4-5',
  simple:   process.env.ANTHROPIC_MODEL_SIMPLE || 'claude-haiku-4-5'
};

function resolveProfile({ tier, maxTokens, effort }) {
  if (tier === 'ceo' || effort === 'complex') {
    return { model: MODELS.ceo, sdk: premiumClient, keyType: 'premium' };
  }

  if (tier === 'fast' || effort === 'simple') {
    return { model: MODELS.simple, sdk: cheapClient, keyType: 'cheap' };
  }

  if (tier === 'worker') {
    return { model: MODELS.worker, sdk: cheapClient, keyType: 'cheap' };
  }

  if (tier === 'director') {
    if (COST_OPTIMIZE_SIMPLE && maxTokens <= SIMPLE_MAX_TOKENS_THRESHOLD) {
      return { model: MODELS.simple, sdk: cheapClient, keyType: 'cheap' };
    }
    return { model: MODELS.director, sdk: premiumClient, keyType: 'premium' };
  }

  return { model: MODELS.worker, sdk: cheapClient, keyType: 'cheap' };
}

function parseWorkersFromSystem(system = '') {
  const m = String(system).match(/Workers(?: disponiveis)?\s*:\s*([^\.\n]+)/i);
  if (!m) return [];
  return m[1]
    .split(',')
    .map(s => s.trim().toLowerCase())
    .map(s => s.replace(/[\s-]+/g, '_'))
    .filter(Boolean);
}

function buildMockText({ tier, system, messages }) {
  const prompt = Array.isArray(messages) && messages.length ? String(messages[messages.length - 1]?.content || '') : '';
  if (tier === 'ceo') {
    return JSON.stringify({
      decisao: 'Mock: foco em execucao enxuta de alto impacto',
      plano: [
        { diretor: 'marketing', tarefa: 'ajustar oferta e copy para conversao', prioridade: 'alta' },
        { diretor: 'conteudo', tarefa: 'publicar conteudo de demanda imediata', prioridade: 'media' },
        { diretor: 'vendas', tarefa: 'recuperar carrinhos e leads mornos', prioridade: 'alta' }
      ],
      kpi_alvo: 'CTR > 2.5% e recuperacao de carrinho > 12%'
    });
  }

  if (tier === 'director') {
    const workers = parseWorkersFromSystem(system);
    const acoes = workers.slice(0, 2).map(w => ({
      worker: w,
      instrucao: `Mock: execute a tarefa '${w}' com foco no briefing atual.`
    }));
    return JSON.stringify({ acoes });
  }

  return `Mock output (${tier}) para: ${prompt.slice(0, 140)}`;
}

/**
 * Chama um agente.
 * @param {Object} opts
 * @param {'ceo'|'director'|'worker'|'fast'} opts.tier
 * @param {'simple'|'normal'|'complex'} [opts.effort='normal']
 * @param {string} opts.system
 * @param {Array<{role:'user'|'assistant',content:string}>} opts.messages
 * @param {number} [opts.maxTokens=2048]
 * @param {number} [opts.temperature=0.7]
 */
export async function callAgent({ tier = 'worker', effort = 'normal', system, messages, maxTokens = 2048, temperature = 0.7 }) {
  const { model, sdk, keyType } = resolveProfile({ tier, maxTokens, effort });

  if (MOCK_AGENT_MODE) {
    const text = buildMockText({ tier, system, messages });
    return {
      text,
      model: `${model}:mock`,
      keyType: 'mock',
      effort,
      usage: { input_tokens: 0, output_tokens: 0 },
      raw: { mock: true }
    };
  }

  const res = await sdk.messages.create({
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
    keyType,
    effort,
    usage: res.usage,
    raw: res
  };
}

export { client };
