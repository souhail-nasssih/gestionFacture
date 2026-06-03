#!/usr/bin/env sh
set -e

PORT="${PORT:-8080}"

# Render injecte PORT; on génère la conf Nginx à l'exécution.
envsubst '${PORT}' < /etc/nginx/http.d/default.conf.template > /etc/nginx/http.d/default.conf

exec /usr/bin/supervisord -c /etc/supervisord.conf

