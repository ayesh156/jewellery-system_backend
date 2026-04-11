import 'dotenv/config';
import express from 'express';
import cors from 'cors';
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

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// ==========================================
// Middleware
// ==========================================

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim());

app.use(cors({
  origin: function(origin, callback) {
    // Force allow all, never throw an error
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());

// ==========================================
// Health Check
// ==========================================

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;
  const env = process.env.NODE_ENV || 'development';
  const host = req.hostname || 'localhost';

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Onelka Jewellery API</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0f;font-family:'Inter',sans-serif;overflow:hidden;position:relative}
body::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(ellipse at 30% 50%,rgba(212,175,55,0.04) 0%,transparent 50%),radial-gradient(ellipse at 70% 50%,rgba(212,175,55,0.03) 0%,transparent 50%);animation:shimmer 8s ease-in-out infinite alternate}
@keyframes shimmer{0%{transform:translateX(-5%) translateY(-2%)}100%{transform:translateX(5%) translateY(2%)}}
.container{position:relative;z-index:1}
.card{position:relative;width:480px;max-width:90vw;padding:48px 40px;border-radius:24px;background:linear-gradient(145deg,rgba(18,18,28,0.95),rgba(12,12,20,0.98));border:1px solid rgba(212,175,55,0.15);box-shadow:0 0 80px rgba(212,175,55,0.06),0 0 40px rgba(0,0,0,0.4),inset 0 1px 0 rgba(212,175,55,0.1);backdrop-filter:blur(20px)}
.card::before{content:'';position:absolute;inset:-1px;border-radius:24px;padding:1px;background:linear-gradient(145deg,rgba(212,175,55,0.3),rgba(212,175,55,0.05),rgba(212,175,55,0.2));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
.logo{font-size:48px;text-align:center;margin-bottom:8px;filter:drop-shadow(0 0 20px rgba(212,175,55,0.4))}
.title{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;text-align:center;background:linear-gradient(135deg,#d4af37,#f5e6a3,#d4af37);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:0.5px;margin-bottom:4px}
.subtitle{text-align:center;font-size:13px;font-weight:500;color:rgba(212,175,55,0.6);letter-spacing:3px;text-transform:uppercase;margin-bottom:32px}
.divider{height:1px;background:linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent);margin:0 20px 28px}
.info{display:flex;flex-direction:column;gap:16px;padding:0 8px}
.info-row{display:flex;align-items:center;gap:12px;padding:10px 16px;border-radius:12px;background:rgba(212,175,55,0.03);border:1px solid rgba(212,175,55,0.06);transition:all 0.3s ease}
.info-row:hover{background:rgba(212,175,55,0.06);border-color:rgba(212,175,55,0.12);transform:translateX(4px)}
.info-icon{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,rgba(212,175,55,0.15),rgba(212,175,55,0.05));display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.info-label{font-size:11px;font-weight:600;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:2px}
.info-value{font-size:14px;font-weight:500;color:rgba(255,255,255,0.85)}
.status-dot{width:8px;height:8px;border-radius:50%;background:#4ade80;box-shadow:0 0 12px rgba(74,222,128,0.5);animation:pulse 2s ease-in-out infinite;display:inline-block;margin-right:8px}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(0.85)}}
.badge{display:inline-flex;align-items:center;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:rgba(74,222,128,0.1);color:#4ade80;border:1px solid rgba(74,222,128,0.2)}
.footer{text-align:center;margin-top:28px;padding-top:20px;border-top:1px solid rgba(212,175,55,0.08)}
.footer-text{font-size:11px;color:rgba(255,255,255,0.2);letter-spacing:1px}
.particles{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden}
.particle{position:absolute;width:2px;height:2px;background:rgba(212,175,55,0.3);border-radius:50%;animation:float linear infinite}
@keyframes float{0%{transform:translateY(100vh) rotate(0deg);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(-10vh) rotate(720deg);opacity:0}}
</style>
</head>
<body>
<div class="particles">
${Array.from({length:15},(_)=>`<div class="particle" style="left:${Math.random()*100}%;animation-duration:${8+Math.random()*12}s;animation-delay:${Math.random()*8}s;width:${1+Math.random()*2}px;height:${1+Math.random()*2}px"></div>`).join('')}
</div>
<div class="container">
<div class="card">
<div class="logo">💎</div>
<div class="title">Onelka Jewellery API</div>
<div class="subtitle">Management System</div>
<div class="divider"></div>
<div class="info">
<div class="info-row">
<div class="info-icon">🌐</div>
<div><div class="info-label">Running On</div><div class="info-value">${host}</div></div>
</div>
<div class="info-row">
<div class="info-icon">⏱️</div>
<div><div class="info-label">Uptime</div><div class="info-value">${uptimeStr}</div></div>
</div>
<div class="info-row">
<div class="info-icon">🔌</div>
<div><div class="info-label">Port &bull; Environment</div><div class="info-value">${PORT} &bull; ${env}</div></div>
</div>
<div class="info-row">
<div class="info-icon">📡</div>
<div><div class="info-label">Status</div><div class="info-value"><span class="badge"><span class="status-dot"></span>Operational</span></div></div>
</div>
</div>
<div class="footer">
<div class="footer-text">&copy; ${new Date().getFullYear()} Onelka Jewellery &bull; v1.0.0</div>
</div>
</div>
</div>
</body>
</html>`);
});

// ==========================================
// API Routes
// ==========================================

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

// ==========================================
// Error Handling
// ==========================================

app.use(notFound);
app.use(errorHandler);

// ==========================================
// Start Server
// ==========================================

app.listen(PORT, () => {
  console.log(`\n🚀 Onelka Jewellery API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

export default app;
