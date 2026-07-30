import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
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
// 2. HEADER DE-DUPLICATION GUARD
// ===================================
app.use((_req, res, next) => {
  const originalWriteHead = res.writeHead.bind(res);
  res.writeHead = function (this: typeof res, statusCode: number, ...args: any[]) {
    const dedupe = (name: string) => {
      const val = res.getHeader(name);
      if (val) {
        const first = Array.isArray(val)
          ? String(val[0])
          : String(val).split(',')[0];
        res.setHeader(name, first.trim());
      }
    };
    dedupe('Access-Control-Allow-Origin');
    dedupe('Vary');
    return originalWriteHead.call(this, statusCode, ...args);
  } as typeof res.writeHead;
  next();
});

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
// 5. CUSTOM CORS FIX
// ===================================
function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true; // Postman / server-to-server requests allow කිරීමට

  // Localhost / Dev origins
  if (/^https?:\/\/localhost(:\d+)?$/i.test(origin)) return true;
  if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/i.test(origin)) return true;

  // Environment වලින් එන Frontend URL එක
  const frontendUrl = process.env.FRONTEND_URL || '';
  if (frontendUrl && origin.toLowerCase() === frontendUrl.toLowerCase()) return true;

  // Production domains (ecosystemlk.app, onelka.app, etc.)
  if (/(onelka|ecosystemlk)\.(app|lk|com)$/i.test(origin)) return true;
  if (/^https?:\/\/([a-z0-9-]+\.)*(ecosystemlk\.app|onelka\.app)$/i.test(origin)) return true;

  return false;
}

function setHeaderClean(res: express.Response, name: string, value: string): void {
  res.removeHeader(name);
  res.setHeader(name, value);
}

app.use((req, res, next) => {
  const origin = req.headers.origin;

  setHeaderClean(res, 'Vary', 'Origin');

  if (origin && isOriginAllowed(origin)) {
    setHeaderClean(res, 'Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    setHeaderClean(res, 'Access-Control-Allow-Origin', '*');
  }

  setHeaderClean(res, 'Access-Control-Allow-Credentials', 'true');
  setHeaderClean(res, 'Access-Control-Expose-Headers', 'Set-Cookie, X-Request-ID');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    setHeaderClean(res, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    setHeaderClean(res, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID, Cache-Control, Pragma, Expires');
    setHeaderClean(res, 'Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }

  next();
});

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
// 10. HEALTH CHECK
// ===================================
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Onelka Jewellery API is running',
    timestamp: new Date().toISOString(),
  });
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

// ===================================
// 14. Start Server
// ===================================
app.listen(PORT, () => {
  console.log(`🚀 Onelka Jewellery API running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;