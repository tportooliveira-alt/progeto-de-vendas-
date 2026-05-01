#!/usr/bin/env bash
# scripts/deploy-n8n.sh
# Sobe n8n self-hosted na VPS Hostinger via Docker + Cloudflare Tunnel.
# Pre-requisitos na VPS: Docker, docker-compose, dominio apontado pro Cloudflare.
#
# Uso (na VPS):
#   bash deploy-n8n.sh

set -e

DOMAIN="${N8N_DOMAIN:-automacoes.seudominio.com.br}"
N8N_USER="${N8N_USER:-admin}"
N8N_PASS="${N8N_PASS:-}"
TZ="America/Sao_Paulo"

if [ -z "$N8N_PASS" ]; then
  echo "❌ Defina N8N_PASS antes de rodar. Ex: N8N_PASS='supersenha' bash deploy-n8n.sh"
  exit 1
fi

mkdir -p ~/n8n-data
cd ~

cat > docker-compose-n8n.yml <<EOF
version: "3.8"
services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "127.0.0.1:5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASS}
      - N8N_HOST=${DOMAIN}
      - N8N_PROTOCOL=https
      - N8N_PORT=5678
      - WEBHOOK_URL=https://${DOMAIN}/
      - GENERIC_TIMEZONE=${TZ}
      - TZ=${TZ}
    volumes:
      - ~/n8n-data:/home/node/.n8n
EOF

docker compose -f docker-compose-n8n.yml up -d
echo ""
echo "✅ n8n subindo em http://127.0.0.1:5678"
echo ""
echo "🌐 Para acesso externo via HTTPS, configure Cloudflare Tunnel:"
echo "   1. Instale cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/install-and-setup/installation/"
echo "   2. cloudflared tunnel login"
echo "   3. cloudflared tunnel create n8n-tunnel"
echo "   4. Editar ~/.cloudflared/config.yml:"
echo ""
cat <<'CFGFILE'
tunnel: <UUID-DO-TUNNEL>
credentials-file: /root/.cloudflared/<UUID>.json
ingress:
  - hostname: automacoes.seudominio.com.br
    service: http://localhost:5678
  - service: http_status:404
CFGFILE
echo ""
echo "   5. cloudflared tunnel route dns n8n-tunnel ${DOMAIN}"
echo "   6. cloudflared tunnel run n8n-tunnel"
echo ""
echo "📋 Apos subir: acesse https://${DOMAIN} com user=${N8N_USER}"
