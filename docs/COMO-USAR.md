# Como usar — agents-factory

## Setup inicial (primeira vez)

```powershell
cd C:\dev\agents-factory

# 1. instalar dependencias
npm install

# 2. configurar variaveis
Copy-Item .env.example .env
# Edite .env e preencha pelo menos: ANTHROPIC_API_KEY
```

## Comandos do dia a dia

| Comando | O que faz |
|---|---|
| `npm run smoke` | Roda smoke test ponta-a-ponta (CEO → Diretores) |
| `npm run new-product` | CLI interativa pra cadastrar produto novo |
| `npm run ceo "briefing"` | Roda CEO com briefing custom |
| `npm run telegram:dev` | Sobe servidor webhook do Telegram (porta 3001) |
| `npm run clone-skills` | Clona 7 skills de referência do GitHub |

## Cadastrar primeiro produto

```powershell
npm run new-product
```

A CLI pergunta:
- Tipo (ebook, planilha, curso, mentoria, saas, fisico, etc. — 14 opções)
- Nome comercial
- Slug (kebab-case)
- Preço
- Promessa em 1 frase
- Dor principal
- Plataforma de venda

Resultado: `products/<slug>/product.yaml` herdando o preset do tipo. Edite os campos restantes (avatar_cliente, brand, canais).

## Rodar o CEO com briefing

```powershell
# Geral (sem produto especifico)
npm run ceo "Pauta da semana foco em parcerias"

# Pra produto especifico
node agents/ceo/run.mjs "Pauta de lancamento" codigo-da-virada
```

Saída: plano JSON do CEO + execução dos diretores Marketing, Conteúdo, Parcerias.

## Aprovação via Telegram

Configure o bot ([docs/TELEGRAM-SETUP.md](TELEGRAM-SETUP.md)) e o CEO manda automaticamente:

```
🏭 Briefing executado
Decisão CEO: ...
KPI alvo: ...

Resultados:
• marketing: ...
• conteudo: ...
• parcerias: ...
```

## Como cadastrar mais produtos depois

Cada produto novo = `npm run new-product`. Os agentes leem `products/*/product.yaml` automaticamente — não precisa restartar nada.

Tipos suportados (cada um tem preset com cadência, framework de oferta e canais ideais):

`ebook | planilha | audiobook | curso | mentoria | comunidade | evento | saas | microsaas | fisico | bundle | freemium | afiliacao | b2b`

## Troubleshooting

### "ANTHROPIC_API_KEY faltando"
Edite `.env` e preencha. Pegue em https://console.anthropic.com

### "Telegram não envia"
Roda mesmo assim — só loga warning. Configure bot quando quiser ([guia](TELEGRAM-SETUP.md)).

### "Diretor X ainda não implementado"
Esperado. Fase 0 implementou só Marketing, Conteúdo, Parcerias. Os outros 5 são stubs até Fase 1+.

### Erro de path no Windows
Os scripts usam regex pra corrigir `file:///C:/...`. Se aparecer erro, rode com Node >= 20.
