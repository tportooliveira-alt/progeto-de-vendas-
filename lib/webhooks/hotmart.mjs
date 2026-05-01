/**
 * lib/webhooks/hotmart.mjs
 * Webhook Hotmart -> dispara cart-recovery / pos-venda / reembolso.
 *
 * Eventos Hotmart cobertos:
 * - PURCHASE_APPROVED  -> agradecimento + upsell
 * - PURCHASE_BILLET_PRINTED -> lembrete boleto
 * - PURCHASE_PROTEST   -> reembolso/chargeback (atendimento)
 * - PURCHASE_REFUNDED  -> registrar perda
 * - PURCHASE_CANCELED  -> cart-recovery
 * - PURCHASE_DELAYED   -> cart-recovery suave
 * - SUBSCRIPTION_CANCELLATION -> retencao
 * - PURCHASE_OUT_OF_SHOPPING_CART -> cart-recovery agressivo
 */
import 'dotenv/config';
import express from 'express';
import { sendMessage } from '../telegram/notify.mjs';
import { runCartRecovery } from '../../agents/vendas/workers/cart-recovery.mjs';
import { runFaqBot } from '../../agents/atendimento/workers/faq-bot.mjs';

const PORT = process.env.HOTMART_WEBHOOK_PORT || 3002;
const SECRET = process.env.HOTMART_HOTTOK; // valida origem
const PRODUCT_SLUG = process.env.HOTMART_PRODUCT_SLUG || null;

const app = express();
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_, res) => res.json({ ok: true, ts: Date.now() }));

app.post('/webhook/hotmart', async (req, res) => {
  // Valida hottok (Hotmart envia em header x-hotmart-hottok ou body.hottok)
  const got = req.headers['x-hotmart-hottok'] || req.body?.hottok;
  if (SECRET && got !== SECRET) {
    return res.status(401).json({ error: 'invalid hottok' });
  }

  const evento = req.body?.event || req.body?.data?.event || 'UNKNOWN';
  const compra = req.body?.data || req.body || {};
  const buyer = compra.buyer || compra.purchase?.buyer || {};
  console.log(`📨 Hotmart: ${evento} - ${buyer.email || '?'}`);

  try {
    switch (evento) {
      case 'PURCHASE_APPROVED':
        await sendMessage(`✅ *VENDA APROVADA*\n${buyer.name || '?'} - ${buyer.email || '?'}\nValor: R$ ${compra.purchase?.price?.value || '?'}`);
        break;

      case 'PURCHASE_OUT_OF_SHOPPING_CART':
      case 'PURCHASE_CANCELED':
      case 'PURCHASE_DELAYED': {
        const seq = await runCartRecovery({
          instrucao: `Carrinho abandonado (${evento}). Gere sequencia personalizada.`,
          productSlug: PRODUCT_SLUG,
          leadInfo: { nome: buyer.name, email: buyer.email, telefone: buyer.checkout_phone }
        });
        await sendMessage(`🛒 *CART RECOVERY*\n${buyer.email}\n\n${String(seq).slice(0, 1500)}`);
        break;
      }

      case 'PURCHASE_BILLET_PRINTED':
        await sendMessage(`🧾 *BOLETO GERADO*\n${buyer.email}\nLembrar em 24h e 48h.`);
        break;

      case 'PURCHASE_REFUNDED':
      case 'PURCHASE_PROTEST': {
        const r = await runFaqBot({
          instrucao: 'Cliente solicitou reembolso/protesto. Gere resposta empatica + proxima acao.',
          productSlug: PRODUCT_SLUG,
          perguntaCliente: `Quero reembolso da compra (${evento})`
        });
        await sendMessage(`💸 *REEMBOLSO/PROTESTO*\n${buyer.email}\n\n${String(r).slice(0, 1200)}`);
        break;
      }

      case 'SUBSCRIPTION_CANCELLATION':
        await sendMessage(`🚪 *CANCELOU ASSINATURA*\n${buyer.email}\nDisparar fluxo de retencao.`);
        break;

      default:
        await sendMessage(`📨 Hotmart: \`${evento}\` (${buyer.email || '?'}) - sem handler ainda.`);
    }
  } catch (err) {
    console.error('Hotmart handler erro:', err);
    await sendMessage(`⚠️ Erro processando \`${evento}\`: ${err.message}`);
  }

  res.json({ ok: true });
});

export function startHotmartWebhook() {
  return app.listen(PORT, () => {
    console.log(`💰 Hotmart webhook em :${PORT}/webhook/hotmart`);
  });
}

export { app };

// CLI
if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  startHotmartWebhook();
}
