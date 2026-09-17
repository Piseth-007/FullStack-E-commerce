#!/bin/sh
set -e

# Render binds services to $PORT (usually 10000)
PORT=${PORT:-80}

echo "Configuring Apache to listen on port ${PORT}..."
sed -i "s/:80/:${PORT}/g" /etc/apache2/sites-available/000-default.conf
sed -i "s/Listen 80/Listen ${PORT}/g" /etc/apache2/ports.conf

# Cache configuration, routes, and views using runtime environment variables
echo "Optimizing Laravel for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Execute database migrations if database connection is available
echo "Running database migrations..."
php artisan migrate --force || echo "Warning: Migration failed or database not reachable yet. Proceeding with startup."

echo "Starting Apache on port ${PORT}..."
exec apache2-foreground
