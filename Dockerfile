FROM php:8.2-apache

# System deps + PHP extensions
RUN apt-get update && apt-get install -y \
  git unzip libpq-dev libzip-dev nodejs npm \
  && docker-php-ext-install pdo pdo_pgsql zip \
  && a2enmod rewrite

WORKDIR /var/www/html

# Copy project
COPY . .

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --optimize-autoloader

# Frontend build (Vite -> public/build)
RUN npm ci && npm run build

# Permissions
RUN chown -R www-data:www-data storage bootstrap/cache

# Point Apache to /public
RUN sed -i 's|DocumentRoot /var/www/html|DocumentRoot /var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

EXPOSE 80
CMD ["apache2-foreground"]