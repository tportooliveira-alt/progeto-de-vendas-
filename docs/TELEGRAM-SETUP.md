# Setup Telegram Bot

## 1. Criar bot

1. Abra Telegram, fale com `@BotFather`
2. `/newbot` → escolha nome (ex: "Agents Factory") → escolha username (ex: `@agents_factory_bot`)
3. Copie o **token** (algo como `123456:ABC-DEF...`) → cole em `.env` como `TELEGRAM_BOT_TOKEN`

## 2. Pegar seu chat_id

1. Mande qualquer mensagem pro bot
2. Abra: `https://api.telegram.org/bot<SEU_TOKEN>/getUpdates`
3. Procure `"chat":{"id": NUMERO ...}` → cole em `.env` como `TELEGRAM_CHAT_ID`

## 3. Testar

```powershell
cd C:\dev\agents-factory
npm install
node -e "import('./lib/telegram/notify.mjs').then(m => m.sendMessage('🚀 agents-factory online'))"
```

Você deve receber a mensagem no Telegram.

## 4. Webhook (depois de subir VPS)

Quando o servidor estiver no ar (via Cloudflare Tunnel ou domínio público):

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://seudominio.com.br/webhook/telegram/<TOKEN>"
```

Aí o bot conversa de verdade — recebe comandos e botões de aprovação.
