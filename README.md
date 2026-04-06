# Onelka Jewellery — Backend API

REST API for the **Onelka Jewellery Management System** — serves the frontend React SPA for Sri Lankan retail jewellery business management.

**Currency:** Sri Lankan Rupees (Rs.) | **Language:** English

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime |
| Express.js | 4.21.2 | HTTP framework |
| TypeScript | 5.7.3 | Type safety (strict mode) |
| Drizzle ORM | 0.38.3 | Lightweight TypeScript-native ORM |
| MySQL | — | Database (local or hosted) |
| Zod | 3.24.2 | Request validation |
| bcryptjs | 3.0.3 | Password hashing |
| jsonwebtoken | 9.0.3 | JWT authentication |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- Local MySQL / MariaDB or MySQL-compatible hosted database

### Setup
```bash
cp .env.example .env       # Configure DATABASE_URL and other settings
npm install
npm run db:push            # Create tables in the database
npm run db:seed            # Seed with sample data
npm run dev                # Start API at http://localhost:3000
```

### Environment Variables (`.env`)
```env
DATABASE_URL=mysql://root:password@localhost:3306/onelka_jewellery
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173    # CORS origin (comma-separated for multiple)
```

### Scripts
```bash
npm run dev          # Dev server with tsx watch
npm run build        # TypeScript compile → dist/
npm run start        # Run compiled dist/index.js
npm run db:push      # Push Drizzle schema to database
npm run db:seed      # Seed database with sample data
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run Drizzle migrations
npm run db:studio    # Open Drizzle Studio GUI
```

---

## Default Login Credentials (Seeded)

| Username | Password | Role | Shop |
|----------|----------|------|------|
| onelka1  | onelka123 | admin | M |
| onelka2  | onelka123 | admin | T |
| onelka3  | onelka123 | admin | D |

---

## API Endpoints

### Auth
- `POST /api/auth/login` — Login (returns JWT)
- `GET /api/auth/me` — Current user info
- `PUT /api/auth/change-password` — Change password

### Users (admin only)
- `GET /api/users` — List all users
- `POST /api/users` — Create user
- `PUT /api/users/:id` — Update user
- `DELETE /api/users/:id` — Delete user

### Business
- `GET/PUT /api/company` — Company info (includes terms & conditions)
- `CRUD /api/categories` — Categories
- `CRUD /api/products` — Products (search, pagination)
- `CRUD /api/customers` — Customers
- `CRUD /api/invoices` — Invoices (with items & payments)
- `CRUD /api/clearance` — Clearance sales (with items & payments)
- `GET/POST /api/gold/types` — Gold type configurations
- `GET/POST /api/gold/rates` — Gold rates
- `GET/POST /api/counters` — Counter sequences

---

## Database Schema

15 tables defined in `src/db/schema.ts`:

| Table | Description |
|-------|-------------|
| `users` | Authentication & user management |
| `companyInfo` | Single-row config (includes `invoiceTerms`, `clearanceTerms`) |
| `categories` | Product categories |
| `goldTypeConfigs` | Gold karat configurations |
| `goldRates` | Daily gold rates per karat |
| `products` | Jewellery inventory |
| `productGemstones` | Gemstone details for products |
| `customers` | Customer records |
| `invoices` | Sales invoices |
| `invoiceItems` | Invoice line items |
| `payments` | Invoice payments |
| `clearances` | Clearance sales |
| `clearanceItems` | Clearance line items |
| `clearancePayments` | Clearance payments |
| `counters` | Auto-increment sequences per shop |

---

## Seed Data

Running `npm run db:seed` populates:

| Entity | Count |
|--------|-------|
| Company Info | 1 |
| Categories | 14 |
| Gold Types | 7 |
| Gold Rates | 7 |
| Products | 10 |
| Gemstones | 4 |
| Customers | 5 |
| Invoices | 3 |
| Clearances | 7 |
| Counters | 15 |
| Users | 3 |

---

## Project Structure

```
├── src/
│   ├── index.ts            # Express entry point
│   ├── db/
│   │   ├── schema.ts       # Drizzle ORM schema (all tables)
│   │   └── index.ts        # Database connection
│   ├── routes/
│   │   ├── auth.ts          # Auth routes
│   │   ├── users.ts         # User management (admin)
│   │   ├── categories.ts    # Category CRUD
│   │   ├── products.ts      # Product CRUD
│   │   ├── gold.ts          # Gold types & rates
│   │   ├── company.ts       # Company config
│   │   ├── customers.ts     # Customer CRUD
│   │   ├── invoices.ts      # Invoice CRUD + payments
│   │   ├── clearance.ts     # Clearance CRUD + payments
│   │   └── counters.ts      # Auto-increment sequences
│   ├── middleware/
│   │   ├── auth.ts          # JWT authentication middleware
│   │   └── errorHandler.ts  # AppError class + error middleware
│   └── seed/
│       ├── data.ts          # Seed data
│       └── index.ts         # Seed runner
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── .env.example
```

---

## Authentication

- JWT-based authentication
- Login → `POST /api/auth/login` → returns JWT token
- Token sent via `Authorization: Bearer <token>` header
- Roles: `admin` (full access + user management), `sales` (standard access)
- Passwords hashed with bcryptjs

---

## Related

- **Frontend:** [jewellery-system-frontend](https://github.com/your-username/jewellery-system-frontend) — React SPA
