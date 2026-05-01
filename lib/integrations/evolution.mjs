/**
 * lib/integrations/evolution.mjs
 * WhatsApp via Evolution API (self-hosted).
 * Docs: https://doc.evolution-api.com/
 */
import 'dotenv/config';
import axios from 'axios';

const URL = process.env.EVOLUTION_URL;
const KEY = process.env.EVOLUTION_API_KEY;
const INSTANCE = process.env.EVOLUTION_INSTANCE;

function client() {
  if (!URL || !KEY || !INSTANCE) throw new Error('Configure EVOLUTION_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE no .env');
  return axios.create({
    baseURL: URL.replace(/\/$/, ''),
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    timeout: 30000
  });
}

function normalizePhone(num) {
  // remove tudo nao-numerico
  let n = String(num).replace(/\D/g, '');
  // adiciona 55 se BR sem DDI
  if (n.length === 11 || n.length === 10) n = '55' + n;
  return n;
}

export async function sendText({ to, message }) {
  const c = client();
  const { data } = await c.post(`/message/sendText/${INSTANCE}`, {
    number: normalizePhone(to),
    text: message
  });
  return data;
}

export async function sendMedia({ to, mediaUrl, caption, type = 'image' }) {
  const c = client();
  const { data } = await c.post(`/message/sendMedia/${INSTANCE}`, {
    number: normalizePhone(to),
    mediatype: type, // image|video|document
    media: mediaUrl,
    caption
  });
  return data;
}

export async function checkInstance() {
  const c = client();
  const { data } = await c.get(`/instance/connectionState/${INSTANCE}`);
  return data;
}
