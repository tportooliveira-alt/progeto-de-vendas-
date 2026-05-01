/**
 * lib/integrations/firecrawl.mjs
 * Scraping pagina/perfis via Firecrawl API (suporta JS-rendered).
 * Docs: https://docs.firecrawl.dev/
 */
import 'dotenv/config';
import axios from 'axios';

const BASE = 'https://api.firecrawl.dev/v1';
const KEY = process.env.FIRECRAWL_API_KEY;

function client() {
  if (!KEY) throw new Error('Configure FIRECRAWL_API_KEY no .env');
  return axios.create({
    baseURL: BASE,
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    timeout: 90000
  });
}

/**
 * Faz scrape de uma URL e retorna markdown + metadata.
 */
export async function scrape(url, opts = {}) {
  const c = client();
  const { data } = await c.post('/scrape', {
    url,
    formats: ['markdown', 'html', 'extract'],
    waitFor: 1500,
    ...opts
  });
  return data.data; // { markdown, html, metadata, ... }
}

/**
 * Busca na web e retorna lista de URLs+resumos.
 */
export async function search(query, { limit = 10 } = {}) {
  const c = client();
  const { data } = await c.post('/search', { query, limit });
  return data.data || [];
}
