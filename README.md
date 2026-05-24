# Allo Inventory Reservation System

A full-stack inventory reservation system built using Next.js, Prisma, PostgreSQL (Supabase), and Tailwind CSS.

The system prevents overselling by temporarily reserving inventory during checkout.

---

# Live Demo

Vercel Deployment:

https://allo-inventory-nine-lyart.vercel.app

---

# Features

- Product listing page
- Warehouse-wise inventory tracking
- Reserve inventory for checkout
- 10-minute reservation hold
- Checkout page with live countdown timer
- Confirm reservation
- Cancel reservation
- Automatic release of expired reservations
- Dynamic frontend updates

---

# Tech Stack

- Next.js 16
- React
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- Tailwind CSS

---

# How to Run Locally

## 1. Clone Repository

```bash
git clone https://github.com/Santhoshkumar0913/Allo-inventory.git

cd Allo-inventory
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Setup Environment Variables

Create a `.env` file:

```env
DATABASE_URL="your_database_url"

DIRECT_URL="your_direct_database_url"
```

## 4. Run Prisma Migration

```bash
npx prisma migrate dev
```

## 5. Seed Database

```bash
npx prisma db seed
```

## 6. Start App

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

# Reservation Flow

## Reserve Product

- `reservedUnits` increases
- available stock decreases
- reservation expires after 10 minutes

## Confirm Purchase

- stock is permanently decremented
- reserved hold is released

## Cancel Reservation

- reserved stock is released
- total stock remains unchanged

---

# Expiry Mechanism

Reservations contain an `expiresAt` field.

Expired reservations are released using:

```txt
/api/cleanup
```

In production, this should run automatically using cron jobs (example: Vercel Cron Jobs).

---

# API Routes

| Route | Description |
|---|---|
| `/api/products` | Get inventory |
| `/api/reservations` | Create reservation |
| `/api/reservations/[id]` | Get reservation details |
| `/api/reservations/confirm` | Confirm reservation |
| `/api/reservations/cancel` | Cancel reservation |
| `/api/cleanup` | Release expired reservations |

---

# Getting Started

First, run the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

You can start editing the page by modifying:

```txt
app/page.tsx
```

---

# Learn More

- https://nextjs.org/docs
- https://nextjs.org/learn

---

# Deploy on Vercel

Deployment Docs:

https://nextjs.org/docs/app/building-your-application/deploying

---

# Author

P Santhoshkumar
