# Roadmap — agents-factory

## ✅ Fase 0 — Fundação (CONCLUÍDA — código no repo)
- Estrutura de pastas
- package.json + tsconfig + .env.example
- Schema product.yaml + 14 presets
- Script `new-product.mjs`
- Libs: claude-sdk, telegram, supabase, products
- CEO + 3 Diretores piloto (Marketing, Conteúdo, Parcerias) + 6 workers
- Configs MCPs (4)
- Script `clone-skills.mjs` (7 skills GitHub)
- Script `deploy-n8n.sh` (VPS + Cloudflare Tunnel)
- Servidor Telegram webhook
- Smoke test

## ⏳ Fase 0.3 — Setup local (você executa)
1. `cd C:\dev\agents-factory && npm install`
2. Copiar `.env.example` → `.env` e preencher pelo menos `ANTHROPIC_API_KEY`
3. Configurar Telegram bot — ver [docs/TELEGRAM-SETUP.md](TELEGRAM-SETUP.md)
4. `npm run smoke` para validar
5. `npm run clone-skills` (opcional — clona skills referência)

## ⏳ Fase 0.5 — Contas + warmup (manual, você executa)
- Criar IG, TikTok, YouTube com handles definidos
- 14 dias de uso humano antes de ligar automação (anti-shadowban)
- Conectar Hotmart webhook + WhatsApp Business + Brevo

## ⏳ Fase 0.7 — Cadastrar produtos (1-2h)
- Para cada produto: `npm run new-product` → preencher YAML

## ⏳ Fase 1 — Conteúdo orgânico (3-5 dias)
- Implementar workers restantes: video_maker, designer, publisher
- Pipeline diário com aprovação Telegram
- Integrar HeyGen + ElevenLabs + Metricool

## ⏳ Fase 2 — Vendas e recuperação (3-5 dias)
- Departamento Vendas completo: CartRecovery + LeadHunter + WhatsAppBot + CheckoutOptimizer
- Webhooks Hotmart

## ⏳ Fase 3 — Partner Engine 🔥 (5-7 dias)
- Plugar InfluencerScout em MCPs reais (firecrawl + youtube-data)
- KitBuilder white-label
- PartnerCRM em Google Sheets/Supabase
- PerformanceTracker

## ⏳ Fase 4 — Dashboard próprio (3-5 dias)
- Next.js em `dashboard/`
- Métricas em tempo real do Supabase

## ⏳ Fase 5 — Ads pagos (3-5 dias)
- AdsPlanner + Spy + retargeting 7 camadas

## ⏳ Fase 6 — Autonomia gradual (contínuo)

## ⏳ Fase 7 — Multi-produto em escala
