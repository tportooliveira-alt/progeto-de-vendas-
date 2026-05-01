# 🏭 agents-factory

Fábrica autônoma de marketing + vendas + parcerias com agentes Claude.

**Vende qualquer produto** (ebook, planilha, curso, audiobook, mentoria, SaaS, físico, evento, etc.) através de:
1. Conteúdo orgânico diário (IG, TikTok, YouTube, Email)
2. Recuperação de vendas (carrinho, retargeting, leads)
3. **Partner Engine** — caça criadores de alto engajamento + oferta irresistível + kit pronto

## Stack

- **Orquestração:** Claude Agent SDK (Sonnet/Haiku)
- **Workflows visuais:** n8n self-hosted (Docker + Cloudflare Tunnel)
- **Banco:** Supabase
- **Avatar/voz:** HeyGen + ElevenLabs
- **Publicação:** Metricool API
- **Email:** Brevo
- **WhatsApp:** Evolution API self-hosted
- **Vendas:** Hotmart
- **Aprovação humana:** Telegram Bot

## Interfaces do usuário

| Interface | Pra que |
|---|---|
| 📱 Telegram | 99% do uso — aprovações, comandos rápidos |
| 🔧 n8n visual | Auditoria de workflows (agentes administram) |
| 🖥️ Dashboard próprio | Métricas de negócio (vendas, parceiros, ROI) |

## Como começar

```powershell
# 1. instalar deps
npm install

# 2. configurar .env (copiar de .env.example)
cp .env.example .env

# 3. clonar skills GitHub
node scripts/clone-skills.mjs

# 4. cadastrar primeiro produto
node scripts/new-product.mjs

# 5. smoke test
node scripts/smoke-test.mjs
```

## Estrutura

Veja [docs/ARQUITETURA.md](docs/ARQUITETURA.md).

## Roadmap

Veja [docs/ROADMAP.md](docs/ROADMAP.md).
