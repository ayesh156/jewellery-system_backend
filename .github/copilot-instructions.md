# Copilot Instructions — Onelka Jewellery Backend

> **IMPORTANT:** When making ANY changes to this project, always update this file (`copilot-instructions.md`) AND `README.md` to reflect the changes (new features, schema changes, route changes, etc.). Keep both files in sync with the actual codebase.

## Project Overview
This is the **backend API** of the Jewellery Management System for the Sri Lankan retail jewellery market. It serves the React SPA frontend with REST endpoints for inventory, sales invoicing, clearance sales, and business reporting with full authentication & user management.

**Business:** Onelka Jewellery | **Currency:** Sri Lankan Rupees (Rs.) | **Language:** English
**Frontend:** Separate repository — [jewellery-system-frontend]

---

## Tech Stack
- **Node.js + Express.js** — REST API
- **TypeScript** in strict mode
- **Drizzle ORM** — lightweight TypeScript-native ORM
- **MySQL** — local MySQL/MariaDB or MySQL-compatible hosted database
- **Zod** — request validation
- **bcrypt** — password hashing
- **jsonwebtoken (JWT)** — authentication tokens
- **npm** — package manager

---

## Project Structure

```
├── src/
│   ├── index.ts            # Express server entry point
│   ├── db/
│   │   ├── schema.ts       # Drizzle ORM schema (all tables)
│   │   └── index.ts        # DB connection
│   ├── routes/
│   │   ├── auth.ts         # POST /api/auth/login, GET /api/auth/me, PUT /api/auth/change-password
│   │   ├── users.ts        # CRUD /api/users (admin only)
│   │   ├── categories.ts   # CRUD /api/categories
│   │   ├── products.ts     # CRUD /api/products (search, pagination)
│   │   ├── gold.ts         # /api/gold/rates, /api/gold/types
│   │   ├── company.ts      # /api/company (single-row config, includes T&C)
│   │   ├── customers.ts    # CRUD /api/customers
│   │   ├── invoices.ts     # CRUD /api/invoices
│   │   ├── clearance.ts    # CRUD /api/clearance
│   │   └── counters.ts     # /api/counters (shop-scoped sequences)
│   ├── middleware/
│   │   ├── auth.ts         # JWT authentication middleware (authenticate function)
│   │   └── errorHandler.ts # AppError class + error middleware
│   └── seed/
│       ├── data.ts         # All seed data (categories, products, users, terms, etc.)
│       └── index.ts        # Seed runner script
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── .env.example
```

---

## Coding Conventions

### General Rules
- Always use **TypeScript** with explicit types — strict mode is enabled
- Use **Zod** for request body validation
- Use **Drizzle ORM** for all database queries — no raw SQL
- Use **`AppError`** class from `middleware/errorHandler.ts` for error responses
- Use **`authenticate`** middleware from `middleware/auth.ts` for protected routes
- **Always update `copilot-instructions.md` and `README.md`** when making changes

### Route Patterns
- All routes are registered in `src/index.ts`
- Each route file exports an Express Router
- Use Zod schemas for request validation
- Return consistent JSON responses: `{ data }` for success, `{ error, message }` for errors

---

## Authentication System

### Flow
1. `POST /api/auth/login` — validates credentials, returns JWT token
2. JWT token verified via `authenticate` middleware on protected routes
3. User info attached to `req.user` after authentication

### Roles
- `admin` — full access, can manage users
- `sales` — standard access, no user management

### Default Credentials (seeded)
- `onelka1` / `onelka123` (admin, shop M)
- `onelka2` / `onelka123` (admin, shop T)
- `onelka3` / `onelka123` (admin, shop D)

---

## Database Schema (src/db/schema.ts)

### Tables
- `users` — authentication & user management (username, password hash, role, shopCode)
- `companyInfo` — single-row company configuration (includes `invoiceTerms`, `clearanceTerms`)
- `categories` — product categories
- `goldTypeConfigs` — gold karat configurations
- `goldRates` — daily gold rates per karat
- `products` — jewellery inventory
- `productGemstones` — gemstone details for products
- `customers` — customer records
- `invoices` — sales invoices
- `invoiceItems` — invoice line items
- `payments` — invoice payments
- `clearances` — clearance sales (has `clearanceReason` field)
- `clearanceItems` — clearance line items
- `clearancePayments` — clearance payments
- `counters` — auto-increment sequences per shop

---

## API Endpoints

### Auth
- `POST /api/auth/login` — Login with username/password, returns JWT
- `GET /api/auth/me` — Get current user (requires auth)
- `PUT /api/auth/change-password` — Change password (requires auth)

### Users (admin only)
- `GET /api/users` — List all users
- `POST /api/users` — Create user
- `PUT /api/users/:id` — Update user
- `DELETE /api/users/:id` — Delete user

### Business
- `GET/PUT /api/company` — Company info (single-row)
- `CRUD /api/categories` — Categories
- `CRUD /api/products` — Products (search, pagination)
- `CRUD /api/customers` — Customers
- `CRUD /api/invoices` — Invoices (with items & payments)
- `CRUD /api/clearance` — Clearance sales (with items & payments)
- `GET/POST /api/gold/types` — Gold type configurations
- `GET/POST /api/gold/rates` — Gold rates
- `GET/POST /api/counters` — Counter sequences

---

## Terms & Conditions System
- Stored in `companyInfo` table as `invoice_terms` and `clearance_terms` (TEXT columns)
- Each term is one line; multiple terms separated by `\n`
- Default seeded terms: 3 invoice terms + 3 clearance terms

---

## Counter / Numbering System
- Each entity type has auto-increment counters per shop code
- Default prefixes: invoice=INV, clearance=CLR, product=PROD, category=CAT, customer=CUS
- ID format: `{shopCode}-{prefix}-{paddedNumber}` (e.g., `m-inv-0001`)
- Shop codes: 1-3 uppercase letters (A, B, HQ, M, T, D, etc.)

---

## Build & Run

```bash
npm install          # Install dependencies
npm run dev          # Dev server at http://localhost:3000 (tsx watch)
npm run build        # TypeScript compile → dist/
npm run start        # Run compiled dist/index.js
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with initial data
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run Drizzle migrations
npm run db:studio    # Open Drizzle Studio GUI
```

### Environment Variables (`.env`)
```env
DATABASE_URL=mysql://root:password@localhost:3306/onelka_jewellery
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173    # CORS origin (comma-separated for multiple)
```

---

## Seed Data (src/seed/data.ts)
The seed script (`npm run db:seed`) populates the database with:
- 1 company info record (Onelka Jewellery) with invoice & clearance terms
- 14 jewellery categories (Necklaces, Earrings, Rings, Bangles, etc.)
- 7 gold type configurations (24K–9K with purity & wastage %)
- 7 gold rates (buying/selling per gram in LKR)
- 10 jewellery products with pricing & stock
- 4 gemstone records linked to products
- 5 customers (1 VIP, 2 retail, 1 wholesale, 1 credit)
- 3 invoices with 5 line items and 2 payment records
- 7 clearance sales with 8 line items and 6 payment records
- 15 counter sequences (shop codes M, T, D)
- 3 users (admin accounts for shops M, T, D)
