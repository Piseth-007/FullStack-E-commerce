# 🌿 Botaniq — Full-Stack Skincare E-Commerce Platform

A production-ready, luxury botanical skincare e-commerce application built with a modern **Laravel REST API** backend and a **React 19 + Vite** frontend.

Designed with an editorial skincare aesthetic (*Fraunces* serif typography, organic moss & warm paper palette, fluid micro-interactions) and equipped with enterprise-grade features: Google OAuth, Bakong KHQR payments, ABA PayWay, Cloudinary CDN, Telegram order notifications, and a comprehensive admin analytics dashboard.

---

## 📑 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
  - [Customer Storefront](#customer-storefront)
  - [Authentication & Security](#authentication--security)
  - [Payment Gateways](#payment-gateways)
  - [Admin Management Portal](#admin-management-portal)
- [Project Directory Structure](#project-directory-structure)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Installation & Setup](#installation--setup)
  - [Backend Setup](#1-backend-setup-laravel)
  - [Frontend Setup](#2-frontend-setup-react--vite)
- [API Endpoints Reference](#api-endpoints-reference)
- [Google OAuth Configuration Guide](#google-oauth-configuration-guide)
- [License](#license)

---

## 🏗️ Architecture Overview

The platform uses a decoupled client-server architecture:

```text
[ Browser / Client ]
        │
        ▼
[ React 19 + Vite Frontend ] ──(Tailwind CSS v4 + Framer Motion)
        │
        │  HTTPS / REST API (JSON + Sanctum Bearer Tokens)
        ▼
[ Laravel 10/11 Backend API ]
        │
        ├─► [ MySQL Database ] (Users, Orders, Products, Reviews, Addresses)
        ├─► [ Google Identity Services ] (OAuth ID Token Verification)
        ├─► [ Bakong KHQR & ABA PayWay ] (Payment Gateway APIs)
        ├─► [ Cloudinary CDN ] (Product & Profile Image Management)
        └─► [ Telegram Bot API ] (Real-time Instant Admin Order Alerts)
```

---

## 💻 Tech Stack

### Frontend (`/e-commerce-frontend`)
- **Core**: React 19, Vite, React Router v7
- **Styling**: Tailwind CSS v4, Custom CSS Variables, Dark/Light Mode Engine
- **Typography**: Fraunces (Display serif), Inter (Body sans-serif), IBM Plex Mono (Kicker/Eyebrows)
- **Animations**: Framer Motion (page transitions, modal animations, auth card transitions)
- **Icons**: Lucide React
- **Data & Charts**: Axios HTTP client, Recharts (Admin analytics)
- **QR Generation**: `qrcode.react` (for dynamic KHQR payments)

### Backend (`/e-commerce-backend`)
- **Framework**: Laravel 10/11 (PHP 8.2+)
- **Database**: MySQL with Eloquent ORM
- **Authentication**: Laravel Sanctum (Stateful & API Bearer Tokens), `google/apiclient` (JWT ID Token validation)
- **Media Storage**: Cloudinary SDK for Laravel (`cloudinary-labs/cloudinary-laravel`)
- **Payments**: Bakong KHQR integration, ABA PayWay Sandbox
- **Notifications**: Telegram Bot API for real-time order alerts, SMTP Gmail for password recovery links

---

## ✨ Key Features

### Customer Storefront
- **Editorial Skincare Catalog**: Dynamic product grid with category filtering, brand filtering, search, and price ranges.
- **Product Details Page**: High-resolution image galleries, ingredient details, skin-type suitability tags, customer reviews, stock indicators, and related product recommendations.
- **Cart & Wishlist**: Persistent shopping cart with real-time item count badges and wishlist management.
- **Interactive Checkout**: Multi-step checkout with saved address management, shipping fee calculation, and order review.
- **Order History & Tracking**: Detailed customer order timeline, order status badges (Pending, Paid, Processing, Shipped, Delivered, Cancelled), and printable receipt tickets.
- **Theme Switcher**: Fluid light & dark mode toggle with persistent local storage.

### Authentication & Security
- **Dual Authentication**:
  - **Traditional Auth**: Full name, email, and password registration with confirmation matching.
  - **Google OAuth**: Instant 1-click Sign-in / Sign-up via Google Identity Services (GIS).
- **Responsive AuthShell**:
  - Balanced 50/50 split layout with high-resolution botanical photography.
  - Floating glassmorphism customer testimonials & editorial trust badges.
  - Built-in show/hide password toggles on all password fields.
  - Real-time password match indicators on registration.
  - Auto-scrolling form panel preventing any content clipping across mobile, tablet, and desktop screens.
- **Account Recovery**:
  - Email-based password reset link with token verification.
  - **Instant Google Recovery**: Direct 1-click login on `/forgot-password` for users registered with Google.

### Payment Gateways
- **Bakong KHQR (Cambodia)**:
  - Generates dynamic, standard-compliant EMVCo KHQR codes in KHR and USD.
  - Automated background polling to verify payment completion in real time.
- **ABA PayWay**:
  - Sandbox checkout flow for credit/debit cards and QR transactions.

### Admin Management Portal (`/admin`)
- **Analytics Dashboard**: Real-time sales metrics, revenue curves, order counts, and customer growth trends powered by Recharts.
- **Product Management**: Full CRUD with multi-image uploads to Cloudinary, category assignment, stock levels, and pricing.
- **Order Processing**: Live order timeline, status update workflows, customer shipping address inspection, and receipt generation.
- **Telegram Notifications**: Real-time push messages sent to a designated Telegram channel/chat immediately upon customer order placement.
- **Store Settings**: Control store name, logo, contact emails, phone numbers, and operational hours dynamically without touching code.

---

## 📁 Project Directory Structure

```text
e-commerce/
├── e-commerce-backend/              # Laravel API Server
│   ├── app/
│   │   ├── Http/Controllers/        # Auth, Product, Order, Payment, Admin controllers
│   │   ├── Models/                  # User, Product, Category, Brand, Order, Cart models
│   │   └── Services/                # Payment (Bakong, ABA), Cloudinary, Telegram services
│   ├── config/                      # services.php, cors.php, sanctum.php
│   ├── database/                    # Migrations, seeders, and factories
│   ├── routes/
│   │   └── api.php                  # RESTful API route definitions
│   └── composer.json
│
└── e-commerce-frontend/             # React 19 Single Page App
    ├── public/                      # Favicon and static assets
    ├── src/
    │   ├── api/                     # Axios instance & interceptors
    │   ├── components/
    │   │   ├── admin/               # Admin layout, sidebar, tables, modal forms
    │   │   ├── auth/                # AuthShell, AuthField, AuthInput components
    │   │   └── storefront/          # Navbar, Footer, ProductCard, MegaMenu, CartDrawer
    │   ├── context/                 # AuthContext, CartContext, StoreSettingsContext, ToastContext
    │   ├── pages/
    │   │   ├── admin/               # Dashboard, Products, Orders, Categories, Brands, Settings
    │   │   ├── auth/                # Login, Register, ForgotPassword, ResetPassword, AdminLogin
    │   │   └── shop/                # Home, ProductList, ProductDetail, Cart, Checkout, Profile
    │   ├── index.css                # Tailwind CSS v4 configuration & theme tokens
    │   └── App.jsx                  # Application router and layout providers
    ├── package.json
    └── vite.config.js
```

---

## ⚙️ Prerequisites

Ensure you have the following installed on your development machine:
- **PHP** >= 8.2 (with `pdo_mysql`, `curl`, `mbstring`, `openssl` extensions enabled)
- **Composer** >= 2.5
- **Node.js** >= 18.0 & **npm** >= 9.0
- **MySQL** >= 8.0 (or MariaDB via XAMPP / Laragon)

---

## 🔑 Environment Configuration

### 1. Backend `.env` (`/e-commerce-backend/.env`)

```env
APP_NAME=Botaniq
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=backend-ecommerce
DB_USERNAME=root
DB_PASSWORD=

# Mail (Gmail SMTP for Password Resets)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="care@botaniq.com"
MAIL_FROM_NAME="Botaniq Skincare"

# Cloudinary (Image Uploads)
CLOUDINARY_URL=cloudinary://<key>:<secret>@<cloud_name>

# Telegram Bot (Order Alerts)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# Google Authentication
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Bakong KHQR Payments
BAKONG_TOKEN=your-bakong-token
BAKONG_ACCOUNT_ID=merchant_id@bkrt
BAKONG_MERCHANT_NAME="Botaniq"
BAKONG_MERCHANT_CITY="Phnom Penh"

# ABA PayWay (Optional)
ABA_PAYWAY_ENV=sandbox
ABA_PAYWAY_MERCHANT_ID=your-merchant-id
ABA_PAYWAY_API_KEY=your-api-key
```

### 2. Frontend `.env` (`/e-commerce-frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## 🚀 Installation & Setup

### 1. Backend Setup (Laravel)

```bash
# Navigate to backend directory
cd e-commerce-backend

# Install PHP dependencies
composer install

# Copy environment file and generate key
cp .env.example .env
php artisan key:generate

# Run database migrations and seeders
php artisan migrate --seed

# Start the Laravel development server
php artisan serve
# Server will run at: http://localhost:8000
```

### 2. Frontend Setup (React + Vite)

```bash
# Navigate to frontend directory
cd e-commerce-frontend

# Install JavaScript dependencies
npm install

# Start the Vite development server
npm run dev
# Application will run at: http://localhost:5173
```

---

## 📡 API Endpoints Reference

### Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/register` | Register customer account |
| `POST` | `/api/login` | Email + password login |
| `POST` | `/api/auth/google` | Verify Google ID Token and login/register |
| `POST` | `/api/forgot-password` | Send password reset email |
| `POST` | `/api/reset-password` | Reset password via token |
| `POST` | `/api/logout` | Revoke Sanctum bearer token *(Auth required)* |
| `GET` | `/api/me` | Fetch authenticated user profile *(Auth required)* |

### Storefront & Catalog
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/products` | Browse paginated products with filters |
| `GET` | `/api/products/{id}` | View single product details |
| `GET` | `/api/categories` | List all product categories |
| `GET` | `/api/brands` | List all skincare brands |
| `GET` | `/api/reviews/{product}` | Fetch reviews for a product |
| `GET` | `/api/settings/store` | Fetch public store profile details |

### Checkout & Payments
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/orders` | Create customer order |
| `GET` | `/api/orders` | View user order history *(Auth required)* |
| `POST` | `/api/payments/bakong/qr` | Generate dynamic KHQR payment string |
| `POST` | `/api/payments/bakong/check` | Check status of KHQR payment |

### Administration *(Admin Role Required)*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Aggregated analytics & revenue statistics |
| `CRUD` | `/api/admin/products` | Manage product catalog & inventory |
| `CRUD` | `/api/admin/orders` | Update order processing status |
| `PUT` | `/api/admin/settings` | Update store details & configuration |

---

## 🛡️ Google OAuth Configuration Guide

To enable **Google Sign-In** without receiving `Error 401: invalid_client` (`no registered origin`):

1. Open [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Select your project and click on your **OAuth 2.0 Client ID** (Application type must be **Web application**).
3. Under **Authorized JavaScript origins**, add:
   ```text
   http://localhost:5173
   http://localhost
   ```
4. Under **Authorized redirect URIs**, add:
   ```text
   http://localhost:5173
   ```
5. If the OAuth consent screen is in **Testing** mode, navigate to [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent) and add your tester email addresses under **Test users**.
6. Click **Save** and wait 1–2 minutes for Google's edge cache to propagate.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).

