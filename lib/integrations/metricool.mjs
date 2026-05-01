/**
 * lib/integrations/metricool.mjs
 * Publica/agenda em IG, TikTok, YouTube, FB, LinkedIn via Metricool API.
 * Docs: https://app.metricool.com/api/
 */
import 'dotenv/config';
import axios from 'axios';

const BASE = 'https://app.metricool.com/api';
const USER_TOKEN = process.env.METRICOOL_USER_TOKEN;
const BLOG_ID = process.env.METRICOOL_BLOG_ID;

function client() {
  if (!USER_TOKEN || !BLOG_ID) throw new Error('Configure METRICOOL_USER_TOKEN e METRICOOL_BLOG_ID no .env');
  return axios.create({
    baseURL: BASE,
    params: { userToken: USER_TOKEN, blogId: BLOG_ID },
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000
  });
}

/**
 * Agenda 1 post.
 * @param {Object} p
 * @param {string} p.text - Legenda/texto
 * @param {string[]} p.providers - ['instagram','tiktok','youtube','facebook','linkedin','twitter']
 * @param {string[]} p.mediaUrls - URLs publicas das midias (foto/video)
 * @param {string} p.publicationDate - ISO 8601 ex: '2026-05-02T19:00:00Z'
 * @param {Object} [p.options] - { hashtags, firstComment, ... }
 */
export async function schedulePost({ text, providers = ['instagram'], mediaUrls = [], publicationDate, options = {} }) {
  const c = client();
  const body = {
    publicationDate: { dateTime: publicationDate, timezone: 'America/Sao_Paulo' },
    text,
    providers: providers.map(p => ({ network: p })),
    media: mediaUrls.map(url => ({ url })),
    ...options
  };
  const { data } = await c.post('/v2/scheduler/posts', body);
  return data;
}

export async function listScheduled() {
  const c = client();
  const { data } = await c.get('/v2/scheduler/posts');
  return data;
}

export async function getAnalytics({ provider, from, to }) {
  const c = client();
  const { data } = await c.get(`/stats/${provider}`, { params: { start: from, end: to } });
  return data;
}
