### Build frontend assets (Vite)
FROM node:20-alpine AS node_build
WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  else npm i; \
  fi

COPY . .
RUN npm run build


### Install PHP dependencies (Composer)
FROM composer:2 AS composer_deps
WORKDIR /app
COPY composer.json composer.lock* ./
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress --no-scripts

COPY . .
RUN composer dump-autoload --no-dev --classmap-authoritative --no-interaction


### Runtime image (PHP-FPM)
FROM php:8.2-fpm-alpine AS runtime
WORKDIR /var/www/html

RUN apk add --no-cache \
    bash \
    icu-libs icu-data-full \
    libpng libjpeg-turbo freetype \
    libzip \
    oniguruma \
    nginx \
    supervisor \
    gettext \
    tzdata \
    && apk add --no-cache --virtual .build-deps \
    $PHPIZE_DEPS \
    icu-dev \
    libpng-dev libjpeg-turbo-dev freetype-dev \
    libzip-dev \
    oniguruma-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
      pdo_pgsql \
      pgsql \
      mbstring \
      bcmath \
      intl \
      zip \
      gd \
      opcache \
    && apk del .build-deps

COPY --from=composer_deps /app /var/www/html
COPY --from=node_build /app/public/build /var/www/html/public/build

COPY docker/php/php.ini /usr/local/etc/php/conf.d/zz-app.ini
COPY docker/entrypoint.sh /entrypoint.sh
COPY docker/start.sh /start.sh
COPY docker/nginx/default.conf.template /etc/nginx/http.d/default.conf.template
COPY docker/supervisord.conf /etc/supervisord.conf

RUN chmod +x /entrypoint.sh /start.sh \
  && mkdir -p /run/nginx \
  && chown -R www-data:www-data /var/www/html \
  && rm -f /etc/nginx/http.d/default.conf

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
CMD ["/start.sh"]
