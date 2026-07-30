# Onelka Jewellery — Backend API

REST API for the **Onelka Jewellery Management System** — serves the frontend React SPA for Sri Lankan retail jewellery business management.

**Currency:** Sri Lankan Rupees (Rs.) | **Language:** English

---

## Table of Contents

1. [Backend Architecture Overview](#backend-architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Directory Tree](#directory-tree)
4. [Environment Variables Configuration](#environment-variables-configuration)
5. [Getting Started](#getting-started)
6. [Scripts](#scripts)
7. [Default Login Credentials](#default-login-credentials)
8. [API Reference Table](#api-reference-table)
9. [Database Schema](#database-schema)
10. [Authentication & Authorization](#authentication--authorization)
11. [Contabo VPS / PM2 / Nginx Deployment Guide](#contabo-vps--pm2--nginx-deployment-guide)

---

## Backend Architecture Overview

The backend follows a **clean layered architecture** (MVC-inspired) with strict separation of concerns:

```
Routes (HTTP layer)
  ↕
Controllers (Request handling, response formatting)
  ↕
Services (Business logic, data orchestration)
  ↕
Drizzle ORM (Database queries, schema models)
  ↕
MySQL Database
```

### Key Design Decisions

| Pattern | Implementation |
|---------|---------------|
| **TypeScript (strict)** | Full type safety across the entire backend — schema, queries, controllers, services |
| **Drizzle ORM** | Lightweight TypeScript-native ORM with zero magic. Provides full type inference from schema definitions |
| **Zod Validation** | Request body/query/params validation at the controller level before reaching services |
| **Async Error Handling** | Higher-order `asyncHandler` wrapper eliminates try-catch boilerplate in route handlers |
| **JWT Authentication** | Bearer token middleware guards protected routes; role-based access (`admin` / `sales`) |
| **Layered Services** | Business logic extracted into service modules — controllers only handle HTTP concerns |
| **Manual CORS (No `cors()` package)** | Custom CORS handler with `setHeaderClean()` prevents duplicate `Access-Control-Allow-Origin` headers when behind Nginx reverse proxy |
| **Header De-duplication Guard** | Intercepts `res.writeHead` to collapse duplicate headers caused by Nginx + Express conflicts |
| **Robust .env Loading** | Multi-path detection handles `tsx`, production `dist/`, and PM2/VPS scenarios |

### Production-Grade Middleware Pipeline

The middleware stack in `src/index.ts` is ordered for maximum security and performance:

1. **Trust Proxy** — `app.set('trust proxy', 1)` for correct client IP behind Nginx
2. **Header De-duplication** — Prevents duplicate CORS/Vary headers
3. **Request ID** — `x-request-id` tracing for debugging across the stack
4. **Helmet** — Security headers with CSP, HSTS, X-Frame-Options
5. **Custom CORS** — Zero-duplicate CORS with origin whitelisting
6. **Compression** — Gzip responses > 1KB (registered before body parsers)
7. **Body Parsers** — JSON + URL-encoded with 10MB limit
8. **Cookie Parser** — For refresh token cookies (future-ready)
9. **Security Response Headers** — X-Content-Type-Options, X-Frame-Options, etc.
10. **Health Check** — `/api/health` (instant, no DB connection)
11. **Status Page** — `/api/test` (Gold-theme glassmorphism UI)
12. **API Routes** — All business routes registered after middleware
13. **Error Handler** — Global AppError handler + 404 handler

---

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime |
| Express.js | ^4.21.2 | HTTP framework |
| TypeScript | ^5.7.3 | Type safety (strict mode) |
| Drizzle ORM | ^0.38.3 | TypeScript-native ORM |
| MySQL | — | Database (via mysql2 driver) |
| Zod | ^3.24.2 | Request validation |
| bcryptjs | ^3.0.3 | Password hashing |
| jsonwebtoken | ^9.0.3 | JWT authentication |
| helmet | — | Security headers (CSP, HSTS) |
| compression | — | Gzip response compression |
| cookie-parser | — | Cookie parsing for tokens |
| dotenv | — | Environment variable loading |

---

## Directory Tree

```
backend/
├── src/
│   ├── index.ts                          # Express entry point — middleware, routes, server start
│   │
│   ├── config/
│   │   └── constants.ts                  # Application-wide constants
│   │
│   ├── db/
│   │   ├── schema.ts                     # Drizzle ORM schema — 15 tables
│   │   └── index.ts                      # Database connection (mysql2 + Drizzle)
│   │
│   ├── middleware/
│   │   ├── auth.ts                       # JWT authentication middleware
│   │   └── errorHandler.ts              # AppError class + global error/404 handlers
│   │
│   ├── routes/                           # Express Router definitions
│   │   ├── auth.ts                       # POST /login, GET /me, PUT /change-password, PUT /preferences
│   │   ├── users.ts                      # CRUD /api/users (admin only)
│   │   ├── categories.ts                 # CRUD /api/categories
│   │   ├── products.ts                   # CRUD /api/products (search, pagination)
│   │   ├── gold.ts                       # Gold types & rates
│   │   ├── company.ts                    # Company info (terms & conditions)
│   │   ├── customers.ts                  # Customer CRUD
│   │   ├── invoices.ts                   # Invoice CRUD + payments
│   │   ├── clearance.ts                  # Clearance sales CRUD + payments
│   │   ├── counters.ts                   # Auto-increment sequences
│   │   └── pawningTerms.ts              # Pawning terms configuration
│   │
│   ├── controllers/                      # HTTP request handlers
│   │   ├── auth.controller.ts            # Login, getMe, changePassword, updatePreferences
│   │   ├── users.controller.ts           # User management
│   │   ├── categories.controller.ts      # Category CRUD
│   │   ├── products.controller.ts        # Product CRUD with search/pagination
│   │   ├── gold.controller.ts            # Gold types & rates
│   │   ├── company.controller.ts         # Company info management
│   │   ├── customers.controller.ts       # Customer CRUD
│   │   ├── invoices.controller.ts        # Invoice lifecycle
│   │   ├── clearance.controller.ts       # Clearance sales lifecycle
│   │   ├── counters.controller.ts        # Counter sequences
│   │   └── pawningTerms.controller.ts    # Pawning terms management
│   │
│   ├── services/                         # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── users.service.ts
│   │   ├── categories.service.ts
│   │   ├── products.service.ts
│   │   ├── gold.service.ts
│   │   ├── company.service.ts
│   │   ├── customers.service.ts
│   │   ├── invoices.service.ts
│   │   ├── clearance.service.ts
│   │   ├── counters.service.ts
│   │   └── pawningTerms.service.ts
│   │
│   ├── validators/                       # Zod validation schemas
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── categories.ts
│   │   ├── products.ts
│   │   ├── customers.ts
│   │   ├── company.ts
│   │   ├── invoices.ts
│   │   ├── clearance.ts
│   │
│   ├── utils/
│   │   └── asyncHandler.ts              # Higher-order async error wrapper for routes
│   │
│   └── seed/                             # Database seed
│       ├── data.ts                       # Seed data definitions
│       └── index.ts                      # Seed runner script
│
├── dist/                                 # Compiled output (after `npm run build`)
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── .env.example
└── README.md
```

---

## Environment Variables Configuration

Create a `.env` file in the `backend/` directory (or copy from `.env.example`):

```env
# ===================================
# Database
# ===================================
DATABASE_URL=mysql://root:password@localhost:3306/onelka_jewellery

# ===================================
# Server
# ===================================
PORT=3000
NODE_ENV=development

# ===================================
# JWT Authentication
# ===================================
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# ===================================
# CORS — Frontend origin for API access
# ===================================
FRONTEND_URL=http://localhost:5173

# ===================================
# Session (future use)
# ===================================
SESSION_SECRET=your-session-secret-change-me
```

### Environment Variable Breakdown

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | **Yes** | — | MySQL connection string: `mysql://user:pass@host:port/db` |
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | `development`, `production`, or `test` |
| `JWT_SECRET` | **Yes** | — | Secret key for signing JWTs (min 32 chars recommended) |
| `JWT_EXPIRES_IN` | No | `7d` | JWT expiration duration |
| `FRONTEND_URL` | No | — | Frontend origin for CORS (e.g., `https://onelka-jewellery.vercel.app`) |
| `SESSION_SECRET` | No | — | Cookie signing secret |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- Local MySQL / MariaDB or MySQL-compatible hosted database

### Local Setup
```bash
cd backend
cp .env.example .env       # Configure DATABASE_URL, JWT_SECRET, and other settings
npm install
npm run db:push            # Create tables in the database
npm run db:seed            # Seed with sample data
npm run dev                # Start API at http://localhost:3000
```

### Verify Installation
```bash
# Health check (JSON)
curl http://localhost:3000/api/health

# Status page (HTML — Gold Theme Glassmorphism UI)
curl http://localhost:3000/api/test

# API test
curl http://localhost:3000/api/company
```

---

## Scripts

```bash
npm run dev              # Dev server with tsx watch (hot reload)
npm run build            # TypeScript compile → dist/
npm run start            # Run compiled dist/index.js (production)
npm run db:push          # Push Drizzle schema to database
npm run db:seed          # Seed database with sample data
npm run db:generate      # Generate Drizzle migrations
npm run db:migrate       # Run Drizzle migrations
npm run db:studio        # Open Drizzle Studio GUI
```

---

## Default Login Credentials (Seeded)

| Username | Password | Role | Shop |
|----------|----------|------|------|
| onelka1 | onelka123 | admin | M (Main) |
| onelka2 | onelka123 | admin | T (Branch T) |
| onelka3 | onelka123 | admin | D (Branch D) |

---

## API Reference Table

### Auth (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | No | Login — returns JWT token |
| `GET` | `/api/auth/me` | **Yes** | Get current authenticated user info |
| `PUT` | `/api/auth/change-password` | **Yes** | Change current user's password |
| `PUT` | `/api/auth/preferences` | **Yes** | Update user preferences (theme, etc.) |

### Users (`/api/users`) — Admin Only

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/users` | **Yes** | List all users |
| `POST` | `/api/users` | **Yes** | Create a new user |
| `PUT` | `/api/users/:id` | **Yes** | Update user by ID |
| `DELETE` | `/api/users/:id` | **Yes** | Delete user by ID |

### Company (`/api/company`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/company` | **Yes** | Get company info (name, address, terms & conditions) |
| `PUT` | `/api/company` | **Yes** | Update company info |

### Categories (`/api/categories`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/categories` | **Yes** | List all categories |
| `POST` | `/api/categories` | **Yes** | Create a new category |
| `GET` | `/api/categories/:id` | **Yes** | Get category by ID |
| `PUT` | `/api/categories/:id` | **Yes** | Update category by ID |
| `DELETE` | `/api/categories/:id` | **Yes** | Delete category by ID |

### Products (`/api/products`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | **Yes** | List products (with search & pagination) |
| `POST` | `/api/products` | **Yes** | Create a new product |
| `GET` | `/api/products/:id` | **Yes** | Get product by ID |
| `PUT` | `/api/products/:id` | **Yes** | Update product by ID |
| `DELETE` | `/api/products/:id` | **Yes** | Delete product by ID |

### Gold (`/api/gold`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/gold/types` | **Yes** | List gold type configurations (karats) |
| `POST` | `/api/gold/types` | **Yes** | Create a gold type |
| `GET` | `/api/gold/rates` | **Yes** | List daily gold rates |
| `POST` | `/api/gold/rates` | **Yes** | Create/update gold rate |

### Customers (`/api/customers`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/customers` | **Yes** | List customers (with search) |
| `POST` | `/api/customers` | **Yes** | Create a new customer |
| `GET` | `/api/customers/:id` | **Yes** | Get customer by ID |
| `PUT` | `/api/customers/:id` | **Yes** | Update customer by ID |
| `DELETE` | `/api/customers/:id` | **Yes** | Delete customer by ID |

### Invoices (`/api/invoices`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/invoices` | **Yes** | List invoices (with search & pagination) |
| `POST` | `/api/invoices` | **Yes** | Create invoice (with items & payments) |
| `GET` | `/api/invoices/:id` | **Yes** | Get invoice by ID (with items & payments) |
| `PUT` | `/api/invoices/:id` | **Yes** | Update invoice by ID |
| `DELETE` | `/api/invoices/:id` | **Yes** | Delete invoice by ID |

### Clearance Sales (`/api/clearance`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/clearance` | **Yes** | List clearance sales (with search & pagination) |
| `POST` | `/api/clearance` | **Yes** | Create clearance sale (with items & payments) |
| `GET` | `/api/clearance/:id` | **Yes** | Get clearance sale by ID (with items & payments) |
| `PUT` | `/api/clearance/:id` | **Yes** | Update clearance sale by ID |
| `DELETE` | `/api/clearance/:id` | **Yes** | Delete clearance sale by ID |

### Counters (`/api/counters`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/counters` | **Yes** | List counter sequences (per shop) |
| `POST` | `/api/counters` | **Yes** | Create/update counter |

### Pawning Terms (`/api/pawning-terms`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/pawning-terms` | **Yes** | Get pawning terms configuration |
| `PUT` | `/api/pawning-terms` | **Yes** | Update pawning terms |

---

## Database Schema

15 tables defined in `src/db/schema.ts`:

| Table | Description |
|-------|-------------|
| `users` | Authentication & user management (username, password hash, role, shop code) |
| `companyInfo` | Single-row configuration (name, address, phone, invoice/clearance terms) |
| `categories` | Product categories (name, description) |
| `goldTypeConfigs` | Gold karat configurations (24K, 22K, 18K, etc. with purity & wastage %) |
| `goldRates` | Daily gold rates per karat (buying/selling per gram in LKR) |
| `products` | Jewellery inventory (name, category, weight, purity, labor, gemstones, pricing, stock) |
| `productGemstones` | Gemstone details for products (type, weight, cost) |
| `customers` | Customer records (name, phone, type: retail/wholesale/vip/credit, credit limit) |
| `invoices` | Sales invoices (invoice number, customer, items total, payments, dates) |
| `invoiceItems` | Invoice line items (product, quantity, weight, price) |
| `payments` | Invoice payments (amount, method, date) |
| `clearances` | Clearance sales (clearance number, reason, items total, payments, dates) |
| `clearanceItems` | Clearance line items (product, quantity, weight, price) |
| `clearancePayments` | Clearance payments (amount, method, date) |
| `counters` | Auto-increment sequences per shop (invoice, clearance, customer numbers) |

---

## Authentication & Authorization

### JWT Flow
1. **Login:** `POST /api/auth/login` with `{ username, password }` → returns JWT token + user info
2. **Token Storage:** Client stores JWT in `localStorage` (or `httpOnly` cookie in future)
3. **Authenticated Requests:** Send `Authorization: Bearer <token>` header
4. **Verification:** `middleware/auth.ts` verifies token → attaches user to `req.user`
5. **Role Check:** `admin` role grants full access incl. user management; `sales` gets standard access

### Auth Middleware
```typescript
// Protect a route:
router.get('/me', authenticate, asyncHandler(controller));
```

### Error Handling
Custom `AppError` class for controlled error responses:
```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```
- `AppError(401, 'Invalid credentials')` → 401 JSON response
- Unhandled errors → 500 Internal Server Error (logged to console)

---

## Seed Data

Running `npm run db:seed` populates:

| Entity | Count | Details |
|--------|-------|---------|
| Company Info | 1 | Onelka Jewellery with invoice & clearance terms |
| Categories | 14 | Necklaces, Earrings, Rings, Bangles, Pendants, Chains, etc. |
| Gold Types | 7 | 24K–9K with purity & wastage percentages |
| Gold Rates | 7 | Buying/selling rates per gram in LKR |
| Products | 10 | Jewellery items with pricing & stock |
| Gemstones | 4 | Linked to diamond/ruby products |
| Customers | 5 | 1 VIP, 2 retail, 1 wholesale, 1 credit |
| Invoices | 3 | With 5 line items & 2 payments |
| Clearances | 7 | With 8 line items & 6 payments |
| Counters | 15 | Auto-increment sequences (shop codes M, T, D) |
| Users | 3 | Admin accounts for shops M, T, D |

---

## Contabo VPS / PM2 / Nginx Deployment Guide

### 1. Prerequisites on Contabo VPS
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+ (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# Verify
node --version
npm --version
```

### 2. Clone & Build the Backend
```bash
# Clone repository
git clone https://github.com/your-username/jewellery-system.git
cd jewellery-system/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
nano .env   # Configure DATABASE_URL, JWT_SECRET, FRONTEND_URL, NODE_ENV=production

# Build TypeScript
npm run build

# Run database migrations
npm run db:push

# Seed database (first time only)
npm run db:seed
```

### 3. Install & Configure PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start the backend
pm2 start dist/index.js --name "onelka-api" --env production

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd

# Check status
pm2 status
pm2 logs onelka-api
```

### 4. Configure Nginx Reverse Proxy
Create `/etc/nginx/sites-available/onelka-api`:

```nginx
server {
    listen 80;
    server_name api.onelka.lk your-server-ip;

    # Security headers (remove duplicates - Express handles these)
    proxy_hide_header Access-Control-Allow-Origin;
    proxy_hide_header Vary;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Origin $http_origin;

        # Important: pass through the original request headers
        proxy_pass_request_headers on;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Increase body size for API requests
    client_max_body_size 10m;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/onelka-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL with Certbot (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.onelka.lk
sudo systemctl restart nginx
```

### 6. Verify Deployment
```bash
# Health check
curl https://api.onelka.lk/api/health

# Status page
curl https://api.onelka.lk/api/test

# Test API
curl https://api.onelka.lk/api/company
```

### PM2 Useful Commands
```bash
pm2 status                    # List all processes
pm2 logs onelka-api           # View logs
pm2 restart onelka-api        # Restart
pm2 stop onelka-api           # Stop
pm2 delete onelka-api         # Remove from PM2
pm2 monit                     # Monitor CPU/memory
```

### Nginx Useful Commands
```bash
sudo nginx -t                 # Test configuration
sudo systemctl reload nginx   # Reload without dropping connections
sudo systemctl restart nginx  # Full restart
sudo journalctl -u nginx -f   # View Nginx logs
```

### Environment-Specific Notes

#### Development (.env)
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

#### Production (Contabo VPS .env)
```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://onelka-jewellery.vercel.app
JWT_SECRET=<long-random-secret>
DATABASE_URL=mysql://user:password@localhost:3306/onelka_jewellery
```

---

## Related

- **Frontend:** [jewellery-system-frontend](https://github.com/your-username/jewellery-system-frontend) — React SPA
- **Workspace Root:** `jewellery-system/README.md` — Full system documentation