import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import crypto from 'crypto';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import goldRoutes from './routes/gold.js';
import companyRoutes from './routes/company.js';
import customerRoutes from './routes/customers.js';
import invoiceRoutes from './routes/invoices.js';
import clearanceRoutes from './routes/clearance.js';
import counterRoutes from './routes/counters.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import pawningTermsRoutes from './routes/pawningTerms.js';

// ===================================
// ROBUST ENVIRONMENT LOADING
// ===================================
const envPaths = [
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), 'backend', '.env'),
  path.resolve(process.cwd(), 'backend', '.env'),
  path.resolve(process.cwd(), '../.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

// ===================================
// 1. TRUST PROXY
// ===================================
app.set('trust proxy', 1);

// ===================================
// 2. BULLETPROOF CORS INTEGRATION & HEADER DE-DUPLICATION GUARD
// Official cors package එක භාවිත කරමින් OpenLiteSpeed / lsnode හි duplicate header issues වළක්වයි
// ===================================
const allowedOrigins = [
  'https://onelka.ecosystemlk.app',
  'https://api.onelka.ecosystemlk.app',
  process.env.FRONTEND_URL || '',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
].filter(Boolean);

// ✅ LITESPEED HEADER DE-DUPLICATION: LiteSpeed සහ Express එකතු කරන duplicate headers එකකට collapse කිරීම
app.use((_req, res, next) => {
  const originalWriteHead = res.writeHead.bind(res);
  res.writeHead = function (this: typeof res, statusCode: number, ...args: any[]) {
    const originHeader = res.getHeader('Access-Control-Allow-Origin');
    if (originHeader) {
      const raw = Array.isArray(originHeader) ? String(originHeader[0]) : String(originHeader);
      res.setHeader('Access-Control-Allow-Origin', raw.split(',')[0].trim());
    }
    const varyHeader = res.getHeader('Vary');
    if (varyHeader) {
      const rawVary = Array.isArray(varyHeader) ? String(varyHeader[0]) : String(varyHeader);
      res.setHeader('Vary', rawVary.split(',')[0].trim());
    }
    return originalWriteHead.call(this, statusCode, ...args);
  } as typeof res.writeHead;
  next();
});

// ✅ OFFICIAL CORS MIDDLEWARE: Standard cors package එක මගින් origin validation සහ credentials හැසිරවීම
app.use(cors({
  origin: (origin, callback) => {
    // Mobile apps, postman, curl, හෝ same-origin requests allow කිරීම
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');
    const isAllowed = allowedOrigins.some(item => cleanOrigin === item.replace(/\/+$/, '')) ||
                      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin) ||
                      /(onelka|ecosystemlk)\.(app|lk|com)$/i.test(cleanOrigin);

    if (isAllowed) {
      return callback(null, cleanOrigin);
    }

    return callback(null, 'https://onelka.ecosystemlk.app');
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept', 'X-Request-ID'],
  exposedHeaders: ['Set-Cookie', 'X-Request-ID'],
  maxAge: 86400
}));

// ✅ PREFLIGHT OPTIONS HANDLER: OPTIONS preflight requests cors middleware එක හරහාම 204 ලෙස terminate කිරීම
app.options('*', cors());

// ===================================
// 3. REQUEST ID FOR TRACING
// ===================================
app.use((req, _res, next) => {
  (req as any).requestId = req.headers['x-request-id'] || crypto.randomUUID();
  next();
});

// ===================================
// 4. SECURITY HEADERS (HELMET)
// ===================================
app.use(helmet({
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["*"], // Cross-origin API calls සඳහා allow කිරීම
    },
  } : false,
  crossOriginEmbedderPolicy: false,
  hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
}));

// ===================================
// 6. COMPRESSION (GZIP)
// ===================================
app.use(compression({ threshold: 1024 }));

// ===================================
// 7. BODY PARSERS
// ===================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===================================
// 8. COOKIE PARSER
// ===================================
app.use(cookieParser());

// ===================================
// 9. ADDITIONAL SECURITY RESPONSE HEADERS
// ===================================
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (isProduction) {
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  }
  next();
});

// ===================================
// 10. ROBUST HEALTH CHECK (Database Pool & Latency Check)
// ===================================
app.get('/api/health', async (_req, res) => {
  const start = Date.now();
  try {
    // MariaDB pool එක හරහා සැබෑ connection latency එක මැනීම
    await poolConnection.query('SELECT 1');
    const latency = `${Date.now() - start}ms`;

    res.status(200).json({
      success: true,
      service: 'onelka-jewellery-api',
      status: 'healthy',
      latency,
      timestamp: new Date().toISOString(),
      pool: {
        connectionLimit: 5,
        target: 'production-vps'
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      service: 'onelka-jewellery-api',
      status: 'unhealthy',
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ===================================
// 11. API STATUS LANDING PAGE (/api/test)
// ===================================
function renderStatusPage(): string {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;

  const currentTime = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Colombo',
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Onelka Jewellery API - Status</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0a0a0f;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #e2e8f0;
      overflow: hidden;
      padding: 1rem;
      position: relative;
    }
    .container { position: relative; z-index: 1; width: 100%; max-width: 560px; }
    .status-card {
      background: linear-gradient(145deg, rgba(18, 18, 28, 0.95), rgba(12, 12, 20, 0.98));
      backdrop-filter: blur(20px);
      border: 1px solid rgba(212, 175, 55, 0.15);
      border-radius: 24px;
      padding: 3rem 2.5rem;
      text-align: center;
    }
    h1 { font-family: 'Playfair Display', serif; color: #d4af37; font-size: 2rem; margin-bottom: 0.75rem; }
    .status-text { font-size: 1.25rem; font-weight: 700; color: #d4af37; }
  </style>
</head>
<body>
  <div class="container">
    <div class="status-card">
      <h1>Onelka Jewellery API</h1>
      <div class="status-text">API is Operational</div>
      <p style="margin-top: 1rem; color: #94a3b8;">Uptime: ${uptimeStr}</p>
      <p style="margin-top: 0.5rem; color: #64748b; font-size: 0.85rem;">${currentTime}</p>
    </div>
  </div>
</body>
</html>`;
}

app.get('/api/test', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(renderStatusPage());
});

// ===================================
// 12. API Routes
// ===================================
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/gold', goldRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/clearance', clearanceRoutes);
app.use('/api/counters', counterRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pawning-terms', pawningTermsRoutes);

// ===================================
// 13. Error Handling
// ===================================
app.use(notFound);
app.use(errorHandler);

import { poolConnection } from './db/index.js';

// ===================================
// 14. Start Server & LSNODE Bridge
// ===================================
const isLSNode = Boolean(process.env.LSAPI_CHILDREN || process.env.LSNODE || process.env.PASSENGER_APP_ENV);
let server: any;

if (!isLSNode) {
  server = app.listen(PORT, () => {
    console.log(`🚀 Onelka Jewellery API running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 MariaDB Pool Connection Limit: 5 per instance`);
  });
} else {
  server = app.listen(() => {
    console.log('⚡ Running under LiteSpeed lsnode pipe engine (Pool Limit: 5)');
  });
}

// ===================================
// 15. GRACEFUL SHUTDOWN (Prevent MariaDB connection leaks)
// ===================================
let isShuttingDown = false;
const handleShutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n[Onelka lsnode] Received ${signal}. Closing HTTP server and MySQL pool...`);

  if (server) {
    server.close(async () => {
      try {
        await poolConnection.end();
        console.log('[Onelka lsnode] MySQL Pool closed cleanly.');
        process.exit(0);
      } catch (err) {
        console.error('[Onelka lsnode] Error during pool close:', err);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }

  setTimeout(() => {
    console.error('[Onelka lsnode] Force exiting after 5s timeout.');
    process.exit(1);
  }, 5000).unref();
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default app;