<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## E-commerce Backend

Laravel API backend for the e-commerce application. It provides authentication, products, categories, carts, orders, reviews, contacts, admin tools, and KHQR payment processing through Bakong.

## Requirements

- PHP 8.1 or newer
- Composer
- MySQL
- Node.js and npm
- A Bakong account and API token for KHQR payments

## Installation

```bash
composer install
copy .env.example .env
php artisan key:generate
```

Create a MySQL database, then configure the database values in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=
```

Run the migrations and install frontend dependencies:

```bash
php artisan migrate
npm install
npm run build
```

For local development, start Laravel with:

```bash
php artisan serve
```

The API is available under `http://127.0.0.1:8000/api` unless `APP_URL` or the server configuration is changed.

## Bakong KHQR

Set these values in `.env` to enable QR generation and payment status checks:

```env
BAKONG_TOKEN=your_bakong_token
BAKONG_ACCOUNT_ID=your_bakong_account_id
BAKONG_MERCHANT_NAME="Your Store Name"
BAKONG_MERCHANT_CITY="Phnom Penh"
```

After changing environment values, clear the cached configuration:

```bash
php artisan config:clear
```

The payment flow is:

1. Create an order from the authenticated user's cart.
2. Generate a KHQR payment for the pending order.
3. Poll the payment status endpoint using the returned payment ID.
4. When Bakong confirms the transaction, both the payment and order are marked `paid`.

Important payment endpoints:

```text
POST /api/orders
POST /api/orders/{order}/payment
GET  /api/payments/{payment}/status
POST /api/payments/{payment}/cancel
```

All order and payment endpoints require a Sanctum-authenticated user. The payment belongs to the order owner and cannot be accessed by another user.

## Main API Areas

Public endpoints include products, categories, brands, skin types, locations, registration, login, and password reset.

Authenticated user endpoints include:

- Profile and address management
- Cart management
- Favorites
- Orders and payments
- Product reviews
- Contact messages

Admin endpoints include product, category, brand, skin type, order, review, settings, contact, dashboard, and notification management. Admin routes require both `auth:sanctum` and the `admin` middleware.

## Troubleshooting

Check migration status when the application reports a missing database column:

```bash
php artisan migrate:status
php artisan migrate
```

Clear Laravel caches after route, configuration, or environment changes:

```bash
php artisan config:clear
php artisan route:clear
php artisan cache:clear
```

Application errors are written to `storage/logs/laravel.log`.

For a payment that remains pending after the customer pays, check the payment status endpoint response and the Laravel log. The backend must be able to update `payments.status`, `orders.status`, `orders.payment_status`, and the paid timestamps.

## License

This project is based on the Laravel framework and follows the project's applicable license terms.
