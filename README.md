# 🌿 Botaniq — Full-Stack Skincare E-Commerce Platform

A modern, production-grade botanical skincare e-commerce platform built with a decoupled architecture: a **Laravel REST API** backend and a **React 19 + Vite** frontend.

Designed with an editorial skincare aesthetic (*Fraunces* serif typography, organic earth & warm paper palette, fluid micro-interactions, sharp storefront geometry, and ergonomic rounded admin portals) and equipped with enterprise features: Google OAuth 2.0, Bakong KHQR payments, ABA PayWay sandbox, Cloudinary CDN, Telegram instant order alerts, and an admin analytics suite.

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
  - [Backend Environment (`backend/.env`)](#1-backend-environment-backendenv)
  - [Frontend Environment (`frontend/.env`)](#2-frontend-environment-frontendenv)
- [Installation & Setup](#installation--setup)
  - [1. Backend Setup (Laravel)](#1-backend-setup-laravel)
  - [2. Frontend Setup (React + Vite)](#2-frontend-setup-react--vite)
- [API Endpoints Reference](#api-endpoints-reference)
- [Google OAuth Configuration Guide](#google-oauth-configuration-guide)
- [Bakong KHQR & Payment Notes](#bakong-khqr--payment-notes)
- [License](#license)

---

## 🏗️ Architecture Overview

The platform uses a decoupled client-server architecture:

```text
[ Browser / Client ]
        │
        ▼
[ React 19 + Vite Frontend ] ── (Tailwind CSS v4 + Framer Motion)
        │
        │  HTTPS / REST API (JSON + Sanctum Bearer Tokens)
        ▼
[ Laravel 10/11 Backend API ]
        │
        ├─► [ MySQL Database ] (Users, Orders, Products, Reviews, Addresses)
        ├─► [ Google Identity Services ] (OAuth 2.0 ID Token Verification)
        ├─► [ Bakong KHQR & ABA PayWay ] (Payment Gateway APIs)
        ├─► [ Cloudinary CDN ] (Product & Profile Image Management)
        └─► [ Telegram Bot API ] (Real-time Instant Admin Order Alerts)
```

---

## 💻 Tech Stack

### Frontend (`frontend/`)
- **Framework**: React 19, Vite, React Router v7
- **Styling**: Tailwind CSS v4, Custom CSS Design Tokens, Theme Engine (Dark/Light mode)
- **Typography**: Fraunces (Editorial Display serif), Inter (Body sans-serif), IBM Plex Mono (Eyebrows & Receipt numbers)
- **Animations**: Framer Motion (page transitions, auth card morphing, interactive drawers)
- **Icons**: Lucide React
- **Data & Charts**: Axios HTTP client, Recharts (Admin analytics)
- **QR Generation**: `qrcode.react` (for dynamic KHQR payments)

### Backend (`backend/`)
- **Framework**: Laravel 10/11 (PHP 8.2+)
- **Database**: MySQL with Eloquent ORM
- **Authentication**: Laravel Sanctum (Bearer Tokens), `google/apiclient` (JWT ID Token verification)
- **Media Storage**: Cloudinary SDK for Laravel (`cloudinary-labs/cloudinary-laravel`)
- **Payments**: Bakong KHQR integration (`fidele007/bakong-khqr-php`), ABA PayWay Sandbox
- **Notifications**: Telegram Bot API for real-time order alerts, SMTP Gmail for password recovery links

---

## ✨ Key Features

### Customer Storefront
- **Editorial Skincare Catalog**: Dynamic product grid with category filtering, brand filtering, full-text search, and price range filters.
- **Dynamic Skeleton Reloading & Empty States**: Polished loading skeletons during category/brand filter transitions, with friendly "Not Found" recovery states when no products match.
- **Product Details Page**: High-resolution image galleries, ingredient details, skin-type suitability tags, customer reviews, stock indicators, and related product recommendations.
- **Cart & Wishlist**: Persistent shopping cart with real-time item count badges and wishlist management.
- **Interactive Checkout**: Multi-step checkout with saved address management, shipping fee calculation, and order review.
- **Order History & Printable Receipts**: Detailed customer order timeline, order status badges (Pending, Paid, Processing, Shipped, Delivered, Cancelled), and high-fidelity printable physical order receipts.
- **Theme Switcher**: Fluid light & dark mode toggle with persistent local storage.

### Authentication & Security
- **Dual Authentication**:
  - **Email & Password**: Registration with live validation and confirmation matching.
  - **Google OAuth 2.0**: Instant 1-click Sign-in / Sign-up via Google Identity Services (GIS).
- **Responsive AuthShell**:
  - Balanced 50/50 split layout with high-resolution botanical photography.
  - Floating customer testimonials & editorial trust badges.
  - Built-in show/hide password toggles on all password fields.
  - Auto-scrolling form panel preventing any content clipping across mobile, tablet, and desktop screens.
- **Account Recovery**:
  - Email-based password reset link with secure token verification.
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
- **Order Processing & Receipt Printing**: Live order timeline, status update workflows, customer shipping address inspection, and printable thermal/ticket-style receipts.
- **Telegram Notifications**: Real-time push messages sent to a designated Telegram channel/chat immediately upon customer order placement.
- **Store Settings**: Control store name, logo, contact emails, phone numbers, and operational hours dynamically without modifying code.

---

## 📁 Project Directory Structure

```text
e-commerce/
├── backend/                         # Laravel API Server
│   ├── app/
│   │   ├── Http/Controllers/        # Auth, Product, Order, Payment, Admin controllers
│   │   ├── Models/                  # User, Product, Category, Brand, Order, Cart models
│   │   └── Services/                # Payment (Bakong, ABA), Cloudinary, Telegram services
│   ├── config/                      # services.php, payway.php, cloudinary.php, sanctum.php
│   ├── database/                    # Migrations, seeders, and factories
│   ├── routes/
│   │   └── api.php                  # RESTful API route definitions
│   ├── .env.example                 # Backend environment template
│   └── composer.json
│
├── frontend/                        # React 19 Single Page App
│   ├── public/                      # Favicon and static assets
│   ├── src/
│   │   ├── api/                     # Axios instance & interceptors (supports VITE_API_BASE_URL)
│   │   ├── components/
│   │   │   ├── admin/               # Admin layout, sidebar, tables, order receipt, modal forms
│   │   │   ├── auth/                # AuthShell, AuthField, GoogleLoginButton components
│   │   │   └── storefront/          # Navbar, Footer, ProductCard, MegaMenu, CartDrawer
│   │   ├── context/                 # AuthContext, CartContext, StoreSettingsContext, ToastContext
│   │   ├── pages/
│   │   │   ├── admin/               # Dashboard, Products, Orders, Categories, Brands, Settings
│   │   │   ├── auth/                # Login, Register, ForgotPassword, ResetPassword, AdminLogin
│   │   │   └── shop/                # Home, ProductList, ProductDetail, Cart, Checkout, Profile
│   │   ├── index.css                # Tailwind CSS v4 configuration & design tokens
│   │   └── App.jsx                  # Application router and layout providers
│   ├── .env.example                 # Frontend environment template
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore                       # Repository-wide gitignore
└── README.md                        # Project documentation
```

---

## ⚙️ Prerequisites

Ensure you have the following installed on your development machine:
- **PHP** >= 8.2 (with `pdo_mysql`, `curl`, `mbstring`, `openssl`, `fileinfo` extensions enabled)
- **Composer** >= 2.5
- **Node.js** >= 18.0 & **npm** >= 9.0
- **MySQL** >= 8.0 (or MariaDB via XAMPP / Laragon / Docker)

---

## 🔑 Environment Configuration

### 1. Backend Environment (`backend/.env`)

Copy the template file to `.env`:
```bash
cd backend
cp .env.example .env
```

Key configuration options in `backend/.env`:

```env
APP_NAME=Botaniq
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# Database Connection
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=backend-ecommerce
DB_USERNAME=root
DB_PASSWORD=

# Mail Configuration (Gmail SMTP for Password Recovery)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="care@botaniq.com"
MAIL_FROM_NAME="${APP_NAME}"

# Cloudinary (Product Image Uploads)
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name

# Telegram Notification Bot (Admin Instant Order Alerts)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

# Google OAuth 2.0 Client ID (Token Verification)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Bakong KHQR Payment Gateway (National Bank of Cambodia)
BAKONG_TOKEN=your_bakong_developer_jwt_token
BAKONG_ACCOUNT_ID=your_merchant_account@bank_domain
BAKONG_MERCHANT_NAME="Botaniq"
BAKONG_MERCHANT_CITY="Phnom Penh"

# ABA PayWay Integration (Sandbox / Production)
ABA_PAYWAY_ENV=sandbox
ABA_PAYWAY_MERCHANT_ID=your_aba_merchant_id
ABA_PAYWAY_API_KEY=your_aba_api_key
```

### 2. Frontend Environment (`frontend/.env`)

Copy the template file to `.env`:
```bash
cd frontend
cp .env.example .env
```

Key configuration options in `frontend/.env`:

```env
# Backend REST API endpoint
VITE_API_BASE_URL=http://localhost:8000/api

# Google OAuth 2.0 Web Client ID
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## 🚀 Installation & Setup

### 1. Backend Setup (Laravel)

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install PHP dependencies
composer install

# 3. Create environment file
cp .env.example .env

# 4. Generate Laravel application key
php artisan key:generate

# 5. Configure your database in .env (DB_DATABASE, DB_USERNAME, DB_PASSWORD)
# Then run database migrations and seeders:
php artisan migrate --seed

# 6. Start the Laravel development server
php artisan serve
# The API will be accessible at: http://127.0.0.1:8000
```

### 2. Frontend Setup (React + Vite)

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install JavaScript dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Start the Vite development server
npm run dev
# The storefront will be accessible at: http://localhost:5173
```

---

## 📡 API Endpoints Reference

### Authentication
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/register` | Register new customer account | Public |
| `POST` | `/api/login` | Email & password login | Public |
| `POST` | `/api/auth/google` | Verify Google ID Token & log in / sign up | Public |
| `POST` | `/api/forgot-password` | Send password reset email link | Public |
| `POST` | `/api/reset-password` | Reset account password via token | Public |
| `POST` | `/api/logout` | Revoke Sanctum bearer token | Required |
| `GET` | `/api/me` | Fetch authenticated user profile | Required |

### Storefront & Catalog
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Browse products with filters & pagination | Public |
| `GET` | `/api/products/{id}` | View single product details | Public |
| `GET` | `/api/categories` | List all product categories | Public |
| `GET` | `/api/brands` | List all skincare brands | Public |
| `GET` | `/api/reviews/{product}` | Fetch customer reviews for a product | Public |
| `GET` | `/api/settings/store` | Fetch public store profile details | Public |

### Cart, Orders & Payments
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Get current user's shopping cart | Required |
| `POST` | `/api/cart` | Add item to cart | Required |
| `PUT` | `/api/cart/{id}` | Update cart item quantity | Required |
| `DELETE` | `/api/cart/{id}` | Remove item from cart | Required |
| `POST` | `/api/orders` | Create customer order | Required |
| `GET` | `/api/orders` | View customer order history | Required |
| `GET` | `/api/orders/{id}` | View detailed order receipt data | Required |
| `POST` | `/api/payments/bakong/qr` | Generate dynamic KHQR payment string | Required |
| `POST` | `/api/payments/bakong/check` | Check status of KHQR payment | Required |

### Administration *(Admin Role Required)*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Aggregated revenue statistics, order charts, & KPIs |
| `GET/POST` | `/api/admin/products` | List & create products with Cloudinary image uploads |
| `PUT/DELETE` | `/api/admin/products/{id}` | Update or delete products |
| `GET` | `/api/admin/orders` | List customer orders with status filters |
| `PUT` | `/api/admin/orders/{id}` | Update order processing status |
| `GET/PUT` | `/api/admin/settings` | Retrieve or update dynamic store settings |

---

## 🛡️ Google OAuth Configuration Guide

To enable **Google 1-Tap Sign-In / Sign-Up**:

1. Visit the [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Create or select your project.
3. Click **Create Credentials** > **OAuth 2.0 Client ID** (Application type: **Web application**).
4. Under **Authorized JavaScript origins**, add:
   ```text
   http://localhost:5173
   http://localhost
   ```
5. Under **Authorized redirect URIs**, add:
   ```text
   http://localhost:5173
   ```
6. Copy the generated **Client ID** and set it in:
   - `backend/.env` -> `GOOGLE_CLIENT_ID`
   - `frontend/.env` -> `VITE_GOOGLE_CLIENT_ID`
7. If your OAuth consent screen is in **Testing** mode, add your test Google email under **Test users** in [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent).

---

## 💳 Bakong KHQR & Payment Notes

- The Bakong KHQR integration generates standard EMVCo QR codes compatible with all Cambodian banking apps (ABA, ACLEDA, Canadia, Wing, etc.).
- For testing and development, you can register for developer sandbox credentials at [Bakong Developer Portal](https://bakong.nbc.org.kh/).
- The system automatically triggers real-time Telegram alerts to store managers when an order is completed.

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
