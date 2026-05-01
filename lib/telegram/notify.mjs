/**
 * lib/telegram/notify.mjs
 * Envia mensagem pro Telegram (notificacao + aprovacao).
 */
import 'dotenv/config';
import axios from 'axios';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT = process.env.TELEGRAM_CHAT_ID;
const API = TOKEN ? `https://api.telegram.org/bot${TOKEN}` : null;

function check() {
  if (!API || !CHAT) {
    console.warn('⚠️  TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID nao configurado — pulando');
    return false;
  }
  return true;
}

export async function sendMessage(text, opts = {}) {
  if (!check()) return null;
  const { reply_markup, parse_mode = 'Markdown' } = opts;
  try {
    const { data } = await axios.post(`${API}/sendMessage`, {
      chat_id: CHAT,
      text,
      parse_mode,
      reply_markup
    });
    return data;
  } catch (err) {
    console.error('Telegram error:', err.response?.data || err.message);
    return null;
  }
}

export async function sendApproval(text, callbackPrefix) {
  return sendMessage(text, {
    reply_markup: {
      inline_keyboard: [[
        { text: '✅ Aprovar', callback_data: `${callbackPrefix}:approve` },
        { text: '✏️ Editar',  callback_data: `${callbackPrefix}:edit` },
        { text: '❌ Rejeitar', callback_data: `${callbackPrefix}:reject` }
      ]]
    }
  });
}
