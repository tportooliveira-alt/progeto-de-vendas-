# Arquitetura — agents-factory

## Hierarquia

```
            CEO-Claude (Sonnet)
                  │
   ┌─────────┬────┴────┬─────────┬─────────┬─────────┬─────────┬─────────┐
   ▼         ▼         ▼         ▼         ▼         ▼         ▼         ▼
Marketing Conteudo Parcerias⭐  Vendas   Growth  Atendim.   Ops    Análise
(Sonnet) (Sonnet)  (Sonnet)   (Sonnet) (Sonnet) (Sonnet) (Sonnet) (Sonnet)
   │         │         │
   ▼         ▼         ▼
Workers    Workers   Workers   ... (Haiku, ~70% mais barato)
```

## Estado atual (Fase 0 piloto)

Diretores implementados: `marketing`, `conteudo`, `parcerias`.
Workers implementados:
- marketing: `strategist`, `copywriter`
- conteudo: `pauta_maker`, `caption`
- parcerias: `influencer_scout`, `deal_maker`

## Fluxo de uma "execução de dia"

1. `executeDay({ briefing, productSlug })` em `agents/ceo/run.mjs`
2. CEO recebe briefing → decide quais diretores acionar (saída JSON)
3. Cada diretor decide quais workers acionar
4. Workers usam Claude Haiku (mais barato) → retornam texto
5. CEO consolida → manda resumo no Telegram

## Custo por execução (estimativa)

- CEO Sonnet: ~1500 tokens out / 500 in
- 3 diretores Sonnet: ~600 tokens × 3
- 4-6 workers Haiku: ~800 tokens × 5
- **Total estimado:** ~R$ 0,15–0,40 por execução de dia

## Onde adicionar mais agentes

```
agents/
  vendas/          ← criar director.mjs + workers/{cart-recovery,lead-hunter,whatsapp-bot,checkout}
  growth/          ← affiliate-recruiter, spy, experimenter, retention-bot
  atendimento/     ← dm-responder, comment-mod, support-bot
  ops/             ← account-factory, avatar-factory, platform-linker, health-monitor
  analise/         ← data-collector, report-bot, roi-calculator, opportunity-scout
```

Padrão: cada departamento tem 1 `director.mjs` que aciona workers via JSON.
