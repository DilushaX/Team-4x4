# Team 4x4 — 4X4 Defender Parts

Next.js storefront and admin portal for Defender parts, restoration, and off-road upgrades.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4**
- **Prisma 5** + **MySQL** (`team4x4` database)
- **Auth.js (NextAuth v5)** — admin/customer roles

## Quick Start

### 1. Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="mysql://root:@127.0.0.1:3306/team4x4"
AUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
APP_ENV="development"
```

### 2. Database

**Docker (recommended):**

```bash
npm run db:setup
```

**Local MySQL:**

```bash
mysql -u root < database/team4x4.sql
```

### 3. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Admin Login
- **Email:** `upulprajath@gmail.com` *(හෝ `admin@team4x4.lk`)*
- **Password:** `upulprajath` *(හෝ `upul123`)*

## Production

```bash
npm run build
npm start
```
