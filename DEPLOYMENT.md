# Production Deployment Guide

This repository contains a decoupled fullstack application:
- **Frontend:** React 19 + Vite SPA (located in `/frontend`)
- **Backend:** Laravel 10 REST API (located in `/backend`)

---

## 1. Frontend Deployment (Recommended: Vercel)

The React SPA is pre-configured with `vercel.json` and `_redirects` for clean client-side routing on page refresh.

### Steps on Vercel:
1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Select repository: `Piseth-007/FullStack-E-commerce`.
3. Configure Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click *Edit* and choose `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add **Environment Variables**:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://api.yourdomain.com/api` | Your live backend API URL |
   | `VITE_GOOGLE_CLIENT_ID` | `your-google-client-id...` | Google OAuth Client ID (Optional) |
5. Click **Deploy**.

---

## 2. Backend Deployment on Render

Because Render does not have a native PHP runtime, the backend is configured to deploy as a **Docker Web Service** using [`backend/Dockerfile`](file:///c:/xampp/htdocs/Laravel/e-commerce/backend/Dockerfile).

### Step 1: Provision a Free MySQL Database
> [!NOTE]
> Render only offers managed PostgreSQL natively. Because this application relies on MySQL, use a free cloud MySQL provider:
> - **[Aiven for MySQL](https://aiven.io)** (Recommended: Free tier, 5GB storage, SSL enabled)
> - or **[Railway](https://railway.app)** (Free MySQL instance)

Once your cloud database is created, note down:
- `DB_HOST`
- `DB_PORT` (usually `3306` or Aiven's custom port)
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`

---

### Step 2: Deploy Backend Web Service on Render

1. Go to [dashboard.render.com](https://dashboard.render.com) &rarr; click **New +** &rarr; **Web Service**.
2. Connect your GitHub repository: `Piseth-007/FullStack-E-commerce`.
3. Configure Service:
   - **Name:** `botaniq-backend`
   - **Region:** `Singapore` (or nearest to your audience)
   - **Root Directory:** `backend`
   - **Runtime:** `Docker`
   - **Dockerfile Path:** `./Dockerfile`
   - **Instance Type:** `Free`
4. Add **Environment Variables**:
   | Variable | Example Value | Description |
   | :--- | :--- | :--- |
   | `APP_NAME` | `Botaniq` | Application name |
   | `APP_ENV` | `production` | Environment mode |
   | `APP_DEBUG` | `false` | Disable debug stack traces |
   | `APP_KEY` | *(Click Generate or paste 32-char key)* | Encryption key |
   | `APP_URL` | `https://botaniq-backend.onrender.com` | Your Render service URL |
   | `FRONTEND_URL` | `https://your-store.vercel.app` | Your Vercel frontend URL |
   | `DB_CONNECTION` | `mysql` | Driver |
   | `DB_HOST` | `mysql-xxxxx.aivencloud.com` | Cloud DB host |
   | `DB_PORT` | `3306` (or Aiven port) | DB port |
   | `DB_DATABASE` | `defaultdb` | DB name |
   | `DB_USERNAME` | `avnadmin` | DB user |
   | `DB_PASSWORD` | `your_db_password` | DB password |
   | `SANCTUM_EXPIRATION` | `10080` | Token expiration (7 days) |
   | `CLOUDINARY_URL` | `cloudinary://key:secret@name` | Cloudinary credentials |
   | `BAKONG_TOKEN` | `your_bakong_token` | Bakong KHQR token |
   | `BAKONG_ACCOUNT_ID` | `account@bank` | Bakong account ID |
5. Click **Create Web Service**.
   - Render will build the Docker container, run migrations (`php artisan migrate --force`), and start Apache on `$PORT` automatically.

---

### Option B: Alternative - Ubuntu VPS (DigitalOcean / AWS EC2 / Hetzner)

#### 1. Server Packages Installation
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx mysql-server php8.2-fpm php8.2-cli php8.2-mysql php8.2-curl php8.2-mbstring php8.2-xml php8.2-zip php8.2-gd php8.2-bcmath git unzip composer
```

#### 2. Project Setup
```bash
cd /var/www
sudo git clone https://github.com/Piseth-007/FullStack-E-commerce.git
cd FullStack-E-commerce/backend
sudo composer install --no-dev --optimize-autoloader
sudo cp .env.example .env
sudo nano .env # Fill in production credentials
php artisan key:generate
php artisan migrate --force
```

#### 3. Set Permissions
```bash
sudo chown -R www-data:www-data /var/www/FullStack-E-commerce/backend/storage /var/www/FullStack-E-commerce/backend/bootstrap/cache
sudo chmod -R 775 /var/www/FullStack-E-commerce/backend/storage /var/www/FullStack-E-commerce/backend/bootstrap/cache
```

#### 4. Nginx Server Block (`/etc/nginx/sites-available/botaniq-api`)
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/FullStack-E-commerce/backend/public;

    index index.php index.html;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```
Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/botaniq-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. SSL with Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

#### 6. Laravel Task Scheduling (Cron)
```bash
sudo crontab -u www-data -e
# Add this entry:
* * * * * cd /var/www/FullStack-E-commerce/backend && php artisan schedule:run >> /dev/null 2>&1
```

---

## 3. Backend Environment Variables Reference

```ini
APP_NAME=Botaniq
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com
FRONTEND_URL=https://your-store.vercel.app

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ecommerce_db
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Sanctum Token Lifetime (10080 min = 7 days)
SANCTUM_EXPIRATION=10080

# Cloudinary (Media / Product Images)
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME

# Bakong KHQR (National Bank of Cambodia Payment)
BAKONG_TOKEN=your_token
BAKONG_ACCOUNT_ID=your_account@bank
BAKONG_MERCHANT_NAME="Botaniq"
BAKONG_MERCHANT_CITY="Phnom Penh"

# Mail Settings (SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="care@botaniq.com"
MAIL_FROM_NAME="${APP_NAME}"

# Telegram Alerts (Admin Notifications)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

# Google OAuth (Customer Sign-In)
GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 4. Post-Deployment Checklist

- [ ] **Run Database Seeders (Optional Initial Data):**
  ```bash
  php artisan db:seed
  ```
- [ ] **Google Console Origins:** In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), add your deployed frontend URL (e.g. `https://your-store.vercel.app`) to **Authorized JavaScript origins**.
- [ ] **Verify Bakong KHQR:** Ensure payment checkout creates valid QR codes on live transactions.
- [ ] **Verify Email Delivery:** Register a new test user to confirm the 6-digit OTP email is sent and received.

