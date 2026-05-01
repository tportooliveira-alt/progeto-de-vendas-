# Workflows n8n — biblioteca curada

Lista de workflows prontos pra importar no n8n self-hosted.
Curadoria feita pra fábrica de marketing/vendas com Claude.

## Como importar

1. Acesse seu n8n: `https://automacoes.seudominio.com.br`
2. Menu → Workflows → Import from URL
3. Cole a URL do workflow
4. Configure as credenciais (Telegram, Claude, Supabase, Brevo, etc.)
5. Ative

## Workflows recomendados

| # | Nome | URL | Pra que usar |
|---|---|---|---|
| 1 | Summarize AI News (Claude + RSS) | https://n8n.io/workflows/13527 | Adaptar pra IG/TikTok scraping → resumo → Telegram |
| 2 | Angie: Telegram AI Assistant | https://n8n.io/workflows/2462 | Base do bot Telegram do CEO |
| 3 | Website Downtime → Telegram Alert | https://n8n.io/workflows/11763 | HealthMonitor (notifica se agente cair) |
| 4 | Build Your First AI Agent | https://n8n.io/workflows/6270 | Estrutura baseline pra agente novo |
| 5 | Chat with Database (AI) | https://n8n.io/workflows/2090 | ReportBot consultando Supabase |
| 6 | Personal Life Manager | https://n8n.io/workflows/8237 | Multi-integração Telegram |
| 7 | Sell Products via Telegram | https://n8n.io/workflows/15388 | Venda via Telegram (analog Hotmart) |
| 8 | Duplicate Detection (Supabase) | https://n8n.io/workflows/13534 | Pattern de log Supabase |
| 9 | AI Job Crawler + Scoring | https://n8n.io/workflows/15412 | InfluencerScout (scoring de criadores) |
| 10 | Scrape & Summarize Webpages | https://n8n.io/workflows/1951 | Spy de concorrentes |

## Workflows que vamos construir do zero (Fase 1+)

- **Hotmart webhook → Supabase + Telegram** — captura venda/carrinho abandonado
- **Cron 6h → CEO agent → Metricool** — pipeline diário de publicação
- **WhatsApp Trigger (Evolution) → Claude → resposta** — atendimento
- **Brevo webhook → tag/evento → ação** — automação email

## Native nodes já disponíveis no n8n

- WhatsApp Trigger (Evolution API) ✅
- Supabase (CRUD) ✅
- Anthropic/Claude ✅
- Schedule Trigger (cron) ✅
- Webhook (recebe POST de qualquer sistema) ✅
- HTTP Request (chama qualquer API) ✅
