/**
 * lib/claude-sdk/client.mjs
 * Cliente Claude com hierarquia de modelos.
 */
import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

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
