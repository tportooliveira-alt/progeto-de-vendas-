# MCPs (Model Context Protocol)

Os MCPs permitem que os agentes tenham acesso a dados externos (anúncios, scraping, YouTube) de forma padronizada.

## MCPs configurados

| MCP | Pra que | Custo |
|---|---|---|
| `meta-ads-ga4` | Meta Ads + Google Ads + GA4 (250+ tools) | API keys grátis |
| `fb-ads-library` | Spy de criativos dos concorrentes | Grátis |
| `firecrawl` | Scraping AI-friendly (IG/TikTok/sites) | Plano free 500 páginas/mês |
| `youtube-data` | Dados de canais YouTube | Grátis (10k req/dia) |

## Como instalar

1. Instale Node.js >= 20
2. Adicione `mcps/config.json` na config do seu cliente Claude:
   - **Claude Desktop:** `%APPDATA%/Claude/claude_desktop_config.json`
   - **Claude Code:** já lê de `mcps/config.json` na raiz do projeto
3. Preencha as keys no `.env`

## Como obter as keys

### Meta Ads
1. https://developers.facebook.com → criar app → Business → System User Token
2. Pegar `META_AD_ACCOUNT_ID` no Business Manager (formato `act_XXXX`)

### Google Ads / GA4
1. Console Google Cloud → criar projeto → habilitar GA4 API
2. Service Account → JSON → salvar em `data/ga4-credentials.json`
3. `GA4_PROPERTY_ID` em GA4 → admin → property settings

### Firecrawl
1. https://firecrawl.dev → criar conta → copiar API key

### YouTube Data
1. Console Google Cloud → habilitar YouTube Data API v3 → criar API Key
