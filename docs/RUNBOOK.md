# Runbook — operação diária

Procedimentos pra quando algo precisa de intervenção manual.

## 🚨 Bot Telegram não responde

1. Verifique se servidor está no ar:
   ```powershell
   curl http://localhost:3001/health
   ```
2. Se OFF: `npm run telegram:dev`
3. Verifique webhook:
   ```powershell
   curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
   ```
4. Se webhook errado, re-set:
   ```powershell
   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://seudominio/webhook/telegram/<TOKEN>"
   ```

## 🚨 n8n caiu na VPS

```bash
ssh root@vps
docker ps                              # n8n está rodando?
docker logs n8n --tail 50              # erro recente?
docker compose -f docker-compose-n8n.yml restart
```

## 🚨 CEO retorna JSON inválido

O parser tem fallback (regex extrai `{...}` da resposta). Se mesmo assim falhar:
1. Confira `ANTHROPIC_API_KEY` válida e saldo
2. Reduza `temperature` em `agents/ceo/run.mjs` (atual: 0.5)
3. Verifique se o briefing não tem caractere quebrando JSON

## 🚨 Conta IG/TikTok shadowbanada

1. Pause TODA automação imediatamente:
   ```powershell
   # Edite todos products/*/product.yaml: autonomia.conteudo: pausado
   ```
2. Use a conta manualmente por 7-14 dias (humano normal)
3. Reduza cadência ao retomar

## 🚨 Hotmart webhook não chega

1. Confira em https://app-vlc.hotmart.com/tools/webhook
2. URL deve ser `https://seudominio/webhook/hotmart` (Fase 2)
3. HOTTOK no `.env` igual ao do painel

## 🚨 Custo Claude estourando

1. Cheque uso: https://console.anthropic.com/settings/usage
2. Em `lib/claude-sdk/client.mjs`:
   - Force `tier: 'worker'` (Haiku) onde estiver `'director'`
   - Reduza `maxTokens` dos workers
3. Adicione cache: marque mensagens recorrentes com `cache_control` (Anthropic prompt caching)

## 🔄 Atualizar agente em produção

```powershell
cd C:\dev\agents-factory
git pull                # se versionado
npm install             # se mudaram deps
npm run smoke           # validar
# Re-deploy via PM2 / systemd / Docker conforme setup
```

## 📊 Logs

- **Console:** stdout do processo (capture com PM2/systemd)
- **Telegram:** consolidado por `executeDay()`
- **Supabase (Fase 2+):** tabela `agent_logs`

## 🔐 Secrets

NUNCA commite `.env`. Está no `.gitignore`. Pra produção use:
- VPS: secrets em `/etc/agents-factory/.env` com `chmod 600`
- Cloud: secrets manager (AWS/GCP/Doppler)
