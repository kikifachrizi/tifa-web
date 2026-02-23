# 🚀 TIFA Dashboard - Deployment Guide

> Panduan lengkap untuk deploy Next.js TIFA Dashboard ke production di `forgix.com`

---

## 📋 Pre-requisites

| Kebutuhan | Detail |
|-----------|--------|
| **Source code** | Push ke GitHub repository |
| **Domain** | Beli `forgix.com` di registrar (Namecheap, Cloudflare, GoDaddy) |
| **Database** | PostgreSQL accessible dari internet (bukan via cloudflared lokal) |

> [!IMPORTANT]
> Di production, database harus bisa diakses langsung oleh server deploy.
> Kalau sekarang pakai `cloudflared tunnel` di lokal, nanti di server production kamu perlu setup koneksi langsung ke `postgres.forgixrobotic.com` (tanpa tunnel).

---

## Opsi A: Deploy ke Vercel (Recommended) ⭐

Vercel adalah platform resmi Next.js — paling mudah dan gratis untuk project personal.

### Step 1: Push ke GitHub

```bash
cd tifa-dashboard
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/tifa-dashboard.git
git push -u origin main
```

> [!TIP]
> Pastikan `.env.local` sudah ada di `.gitignore` agar credentials tidak ikut ke-push.

### Step 2: Import ke Vercel

1. Buka [vercel.com](https://vercel.com) → **Sign up with GitHub**
2. Klik **"Add New Project"** → pilih repo `tifa-dashboard`
3. Framework Preset: otomatis terdeteksi **Next.js**
4. Klik **Deploy** (build pertama)

### Step 3: Setup Environment Variables

Di Vercel Dashboard → Project → **Settings** → **Environment Variables**, tambahkan:

```
DB_HOST     = postgres.forgixrobotic.com
DB_PORT     = 5432
DB_NAME     = tifa
DB_USER     = tifa
DB_PASS     = TifaBot2025@
```

> [!CAUTION]
> Gunakan host database yang **public-accessible**, bukan `localhost`.
> Port di production mungkin `5432` (default PostgreSQL), bukan `5002` (tunnel lokal).
> Tanyakan ke admin server database untuk detail koneksi production.

Setelah set env vars, klik **Redeploy** agar variabel terbaca.

### Step 4: Custom Domain `forgix.com`

1. Di Vercel Dashboard → **Settings** → **Domains**
2. Tambahkan `forgix.com` dan `www.forgix.com`
3. Vercel akan memberikan DNS records yang perlu kamu set:

| Type | Name | Value |
|------|------|-------|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

4. Login ke domain registrar kamu → DNS Settings → Tambahkan records di atas
5. Tunggu propagasi DNS (5 menit - 48 jam)
6. ✅ SSL/HTTPS otomatis aktif dari Vercel!

### Step 5: Verifikasi

- Buka `https://forgix.com` → harus muncul landing page
- Buka `https://forgix.com/login` → coba login
- Buka `https://forgix.com/dashboard` → pastikan data dari database tampil

### Auto-Deploy

Setiap kali kamu `git push` ke branch `main`, Vercel otomatis re-deploy! 🔄

---

## Opsi B: Deploy ke VPS (Kontrol Penuh)

Untuk yang mau database & app di satu server, misalnya **DigitalOcean Droplet** ($6/bulan).

### Step 1: Sewa & Setup Server

1. Buat Droplet di [digitalocean.com](https://digitalocean.com):
   - OS: **Ubuntu 22.04 LTS**
   - Plan: **Basic $6/bulan** (1 vCPU, 1GB RAM)
   - Pilih region terdekat (Singapore)

2. SSH ke server:
```bash
ssh root@YOUR_SERVER_IP
```

### Step 2: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager) & Nginx
npm install -g pm2
sudo apt install -y nginx

# Verify
node -v    # v20.x
npm -v     # 10.x
```

### Step 3: Clone & Build App

```bash
# Clone repository
cd /var/www
git clone https://github.com/USERNAME/tifa-dashboard.git
cd tifa-dashboard

# Install dependencies
npm install

# Create .env.local
nano .env.local
```

Isi `.env.local`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tifa
DB_USER=tifa
DB_PASS=TifaBot2025@
```

> Jika PostgreSQL ada di server yang sama, gunakan `localhost`.
> Jika di server lain, gunakan IP/hostname yang sesuai.

```bash
# Build production
npm run build
```

### Step 4: Jalankan dengan PM2

```bash
# Start app
pm2 start npm --name "tifa-dashboard" -- start

# Auto-restart saat server reboot
pm2 save
pm2 startup

# Cek status
pm2 status
pm2 logs tifa-dashboard
```

### Step 5: Setup Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/forgix.com
```

Isi:
```nginx
server {
    listen 80;
    server_name forgix.com www.forgix.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/forgix.com /etc/nginx/sites-enabled/

# Test config & restart
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: SSL dengan Certbot (HTTPS Gratis)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d forgix.com -d www.forgix.com
```

Ikuti wizard → pilih redirect HTTP ke HTTPS. SSL akan auto-renew.

### Step 7: DNS Pointing

Di domain registrar, set:

| Type | Name | Value |
|------|------|-------|
| `A` | `@` | `YOUR_SERVER_IP` |
| `A` | `www` | `YOUR_SERVER_IP` |

### Step 8: Update App (Future Deploys)

```bash
cd /var/www/tifa-dashboard
git pull origin main
npm install
npm run build
pm2 restart tifa-dashboard
```

---

## 🔒 Checklist Keamanan Production

Sebelum go-live, pastikan hal-hal berikut:

- [ ] **Password hashing** — Ganti plain-text password comparison di `auth.ts` pakai `bcrypt`
- [ ] **Session management** — Ganti in-memory session ke JWT atau cookie-based session
- [ ] **Environment variables** — Pastikan `.env.local` ada di `.gitignore`
- [ ] **Database access** — Batasi IP yang boleh akses PostgreSQL (firewall/pg_hba.conf)
- [ ] **HTTPS** — Pastikan SSL aktif sebelum handle login
- [ ] **Rate limiting** — Tambahkan rate limit di API routes untuk cegah brute-force
- [ ] **Error handling** — Pastikan error messages tidak expose info sensitif ke user

---

## 📊 Perbandingan Opsi

| Fitur | Vercel | VPS |
|-------|--------|-----|
| **Kesulitan** | ⭐ Sangat Mudah | ⭐⭐⭐ Perlu basic Linux |
| **Harga** | Gratis (hobby) | ~$6-12/bulan |
| **SSL** | ✅ Otomatis | ✅ Manual (Certbot) |
| **Auto Deploy** | ✅ Git push = deploy | ❌ Manual `git pull` + restart |
| **CDN Global** | ✅ Included | ❌ Perlu setup sendiri |
| **DB di server sama** | ❌ Terpisah | ✅ Bisa |
| **Kontrol server** | ❌ Terbatas | ✅ Full root access |
| **Scaling** | ✅ Auto | ❌ Manual |

---

## 💡 Rekomendasi

> Untuk **mulai cepat** → pakai **Vercel**. Gratis, 5 menit jadi.
>
> Untuk **production serius** dengan database di server sendiri → pakai **VPS + Nginx + PM2**.
>
> Untuk **kombinasi terbaik** → deploy app di Vercel + database di managed service (DigitalOcean Managed PostgreSQL, Supabase, atau Neon).
