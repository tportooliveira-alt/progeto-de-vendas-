/**
 * lib/telegram/server.mjs
 * Servidor Express recebe webhooks do Telegram (botoes inline) e roteia pra agentes.
 */
import 'dotenv/config';
import express from 'express';
import { sendMessage } from './notify.mjs';

const PORT = process.env.TELEGRAM_PORT || 3001;
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const app = express();
app.use(express.json());

app.get('/health', (_, res) => res.json({ ok: true, ts: Date.now() }));

app.post(`/webhook/telegram/${TOKEN || 'unset'}`, async (req, res) => {
  const upd = req.body;
  console.log('📨 Telegram update:', JSON.stringify(upd).slice(0, 500));

  // texto
  if (upd.message?.text) {
    const t = upd.message.text;
    if (t.startsWith('/start')) {
      await sendMessage('Oi! Eu sou o orquestrador da agents-factory. Mande comandos ou aprove pautas aqui.');
    } else if (t.startsWith('/status')) {
      await sendMessage('✅ Sistema online. Diretores piloto: marketing, conteudo, parcerias.');
    } else {
      await sendMessage(`Recebi: "${t}". (CEO ainda nao plugado em comandos livres — Fase 1)`);
    }
  }

  // botoes inline (aprovacao)
  if (upd.callback_query) {
    const data = upd.callback_query.data;
    await sendMessage(`Acao registrada: \`${data}\``);
    // TODO: rotear pra fila de aprovacao
  }

  res.json({ ok: true });
});

export function startServer() {
  return app.listen(PORT, () => {
    console.log(`🤖 Telegram webhook server em :${PORT}`);
    console.log(`   Path: /webhook/telegram/<TOKEN>`);
  });
}

export { app };

// CLI
if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  startServer();
}
