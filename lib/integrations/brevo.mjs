/**
 * lib/integrations/brevo.mjs
 * Email transacional + campanhas via Brevo (ex-Sendinblue).
 * Docs: https://developers.brevo.com/
 */
import 'dotenv/config';
import axios from 'axios';

const BASE = 'https://api.brevo.com/v3';
const KEY = process.env.BREVO_API_KEY;

function client() {
  if (!KEY) throw new Error('Configure BREVO_API_KEY no .env');
  return axios.create({
    baseURL: BASE,
    headers: { 'api-key': KEY, 'Content-Type': 'application/json', accept: 'application/json' },
    timeout: 30000
  });
}

/**
 * Envia email transacional 1-a-1.
 */
export async function sendTransactional({ toEmail, toName, subject, htmlContent, fromEmail, fromName }) {
  const c = client();
  const { data } = await c.post('/smtp/email', {
    sender: { email: fromEmail || process.env.BREVO_FROM_EMAIL || 'no-reply@dominio.com.br', name: fromName || process.env.BREVO_FROM_NAME || 'Equipe' },
    to: [{ email: toEmail, name: toName }],
    subject,
    htmlContent
  });
  return data;
}

/**
 * Adiciona/atualiza contato em uma lista.
 */
export async function upsertContact({ email, attributes = {}, listIds = [] }) {
  const c = client();
  const { data } = await c.post('/contacts', { email, attributes, listIds, updateEnabled: true });
  return data;
}

/**
 * Cria campanha email (rascunho).
 */
export async function createCampaign({ name, subject, htmlContent, listIds, scheduledAt }) {
  const c = client();
  const body = {
    name, subject, htmlContent,
    sender: { email: process.env.BREVO_FROM_EMAIL, name: process.env.BREVO_FROM_NAME },
    recipients: { listIds },
    ...(scheduledAt ? { scheduledAt } : {})
  };
  const { data } = await c.post('/emailCampaigns', body);
  return data;
}
