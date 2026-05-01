/**
 * lib/integrations/youtube.mjs
 * Busca canais/videos via YouTube Data API v3.
 * Docs: https://developers.google.com/youtube/v3
 */
import 'dotenv/config';
import axios from 'axios';

const BASE = 'https://www.googleapis.com/youtube/v3';
const KEY = process.env.YOUTUBE_API_KEY;

function client() {
  if (!KEY) throw new Error('Configure YOUTUBE_API_KEY no .env');
  return axios.create({ baseURL: BASE, params: { key: KEY }, timeout: 30000 });
}

/**
 * Busca canais por palavra-chave + filtros aproximados.
 */
export async function searchChannels({ query, regionCode = 'BR', maxResults = 10 }) {
  const c = client();
  const { data } = await c.get('/search', {
    params: { part: 'snippet', type: 'channel', q: query, regionCode, relevanceLanguage: 'pt', maxResults }
  });
  const channelIds = data.items.map(i => i.snippet.channelId);
  if (!channelIds.length) return [];
  // hidrata com stats
  const stats = await c.get('/channels', {
    params: { part: 'snippet,statistics', id: channelIds.join(',') }
  });
  return stats.data.items.map(ch => ({
    id: ch.id,
    handle: ch.snippet.customUrl || ch.snippet.title,
    titulo: ch.snippet.title,
    descricao: ch.snippet.description,
    subs: parseInt(ch.statistics.subscriberCount || 0, 10),
    videos: parseInt(ch.statistics.videoCount || 0, 10),
    views_total: parseInt(ch.statistics.viewCount || 0, 10),
    pais: ch.snippet.country || null,
    url: `https://youtube.com/channel/${ch.id}`
  }));
}

/**
 * Pega ultimos N videos do canal (pra estimar engajamento).
 */
export async function lastVideosOf(channelId, max = 10) {
  const c = client();
  const { data } = await c.get('/search', {
    params: { part: 'snippet', channelId, order: 'date', type: 'video', maxResults: max }
  });
  const ids = data.items.map(i => i.id.videoId).filter(Boolean);
  if (!ids.length) return [];
  const stats = await c.get('/videos', { params: { part: 'snippet,statistics', id: ids.join(',') } });
  return stats.data.items.map(v => ({
    id: v.id, title: v.snippet.title, publishedAt: v.snippet.publishedAt,
    views: parseInt(v.statistics.viewCount || 0, 10),
    likes: parseInt(v.statistics.likeCount || 0, 10),
    comments: parseInt(v.statistics.commentCount || 0, 10)
  }));
}

/**
 * Estima engajamento medio (likes+comments)/views dos ultimos N videos.
 */
export async function estimateEngagement(channelId, max = 10) {
  const vids = await lastVideosOf(channelId, max);
  if (!vids.length) return 0;
  const ratios = vids.map(v => v.views > 0 ? (v.likes + v.comments) / v.views : 0);
  const avg = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  return Number((avg * 100).toFixed(2)); // %
}
