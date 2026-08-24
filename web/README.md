# Team 4x4 — Next.js App

Modern Next.js storefront and admin portal for **4X4 Defender Parts**, converted from the original PHP application.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** — dark industrial UI
- **Prisma 5** + **MySQL** (`team4x4` database)
- **Auth.js (NextAuth v5)** — credentials login with admin/customer roles
- Guest cart via **localStorage** (same behavior as PHP app)

## Quick Start

### 1. Database

Ensure MySQL is running and the `team4x4` database exists with seed data.

**Option A — Docker (recommended):**

```bash
npm run db:setup
```

**Option B — Local MySQL:**

```bash
mysql -u root < database/team4x4.sql
```

If Homebrew MySQL is installed but won't start, initialize it once:

```bash
brew services stop mysql@8.0
mysqld --initialize-insecure --datadir="$(brew --prefix)/var/mysql" --user=$(whoami)
brew services start mysql@8.0
mysql -u root < database/team4x4.sql
```

### 2. Environment

```bash
cd web
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="mysql://root:@127.0.0.1:3306/team4x4"
AUTH_SECRET="your-secret-here"   # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
APP_ENV="development"
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Default Admin Login

- **Email:** `admin@team4x4.lk`
- **Password:** `admin`

(Password hash is compatible — existing PHP bcrypt `$2y$` hashes work with Auth.js.)

## Routes

### Storefront
| Route | Description |
|-------|-------------|
| `/` | Home + services |
| `/shop` | Product catalog |
| `/product/[slug]` | Product detail |
| `/cart` | Shopping cart |
| `/checkout` | Order checkout + WhatsApp |
| `/gallery` | Build gallery |
| `/project/[slug]` | Project detail |
| `/service/[slug]` | Service pages |
| `/contact` | Contact form |
| `/login` `/signup` | Auth |

### Admin (requires admin role)
| Route | Description |
|-------|-------------|
| `/admin/dashboard` | KPIs |
| `/admin/products` | Product CRUD |
| `/admin/categories` | Categories |
| `/admin/orders` | Order management |
| `/admin/customers` | Customers |
| `/admin/inventory` | Stock adjustments |
| `/admin/suppliers` | Suppliers |
| `/admin/gallery` | Projects/gallery |
| `/admin/services` | Service content |
| `/admin/quotations` | Quotes |
| `/admin/messages` | Contact messages |
| `/admin/reports` | Sales/inventory reports |
| `/admin/settings` | Site settings |
| `/admin/invoice?id=` | Printable invoice |

## Project Structure

```
web/
├── prisma/schema.prisma    # MySQL schema (matches team4x4.sql)
├── public/
│   ├── assets/             # Static images (copied from PHP app)
│   └── uploads/            # User uploads
├── src/
│   ├── app/
│   │   ├── (storefront)/   # Public pages
│   │   ├── admin/          # Admin portal
│   │   └── api/            # Route handlers (Node.js API)
│   ├── components/         # React components
│   └── lib/                # prisma, auth, cart, utils
```

## Production Build

```bash
npm run build
npm start
```

## Cutover Notes

- Point your web server to the Next.js app (`npm start` or Vercel/Node hosting).
- Ensure `public/uploads/` is writable for admin image uploads.
- Set `AUTH_SECRET` and `NEXTAUTH_URL` for production.
- MySQL connection string must match your production database.

## Features Preserved from PHP

- Guest cart (localStorage)
- Checkout with district delivery fees
- Server-side price/stock validation
- WhatsApp order handoff
- Contact form + newsletter
- Password reset (dev mode shows reset link)
- Full admin CRUD for products, orders, inventory, gallery, services, etc.
