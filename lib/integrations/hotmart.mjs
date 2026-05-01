/**
 * lib/integrations/hotmart.mjs
 * API Hotmart — lista vendas, assinantes, etc. (alem do webhook).
 * Docs: https://developers.hotmart.com/
 */
import 'dotenv/config';
import axios from 'axios';

const AUTH_URL = 'https://api-sec-vlc.hotmart.com/security/oauth/token';
const API_BASE = 'https://developers.hotmart.com/payments/api/v1';

let cachedToken = null;
let tokenExp = 0;

async function getToken() {
  if (cachedToken && Date.now() < tokenExp - 60_000) return cachedToken;
  const id = process.env.HOTMART_CLIENT_ID;
  const secret = process.env.HOTMART_CLIENT_SECRET;
  const basic = process.env.HOTMART_BASIC;
  if (!id || !secret || !basic) throw new Error('Configure HOTMART_CLIENT_ID/SECRET/BASIC no .env');

  const { data } = await axios.post(AUTH_URL, null, {
    params: { grant_type: 'client_credentials', client_id: id, client_secret: secret },
    headers: { Authorization: `Basic ${basic}` },
    timeout: 30000
  });
  cachedToken = data.access_token;
  tokenExp = Date.now() + (data.expires_in || 3600) * 1000;
  return cachedToken;
}

async function client() {
  const token = await getToken();
  return axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
    timeout: 30000
  });
}

export async function listSales({ from, to, transactionStatus } = {}) {
  const c = await client();
  const params = {};
  if (from) params.start_date = new Date(from).getTime();
  if (to) params.end_date = new Date(to).getTime();
  if (transactionStatus) params.transaction_status = transactionStatus;
  const { data } = await c.get('/sales/history', { params });
  return data;
}

export async function listSubscriptions({ status } = {}) {
  const c = await client();
  const { data } = await c.get('/subscriptions', { params: status ? { status } : {} });
  return data;
}
