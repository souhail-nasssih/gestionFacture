#!/usr/bin/env sh
set -e

cd /var/www/html

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
fi

php artisan config:clear >/dev/null 2>&1 || true

if [ -z "${APP_KEY:-}" ]; then
  echo "ERREUR: APP_KEY manquant. Générez-le puis configurez-le sur Render (ex: php artisan key:generate --show)." >&2
  exit 1
fi

mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache || true

exec "$@"
