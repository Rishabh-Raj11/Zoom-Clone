import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/database.js';
import { seedDatabase } from './db/seed.js';
import { authRouter } from './routes/auth.js';
import { meetingsRouter } from './routes/meetings.js';
import { usersRouter } from './routes/users.js';
import { recordingsRouter } from './routes/recordings.js';
import { aiRouter } from './routes/ai.js';
import { setupWebSocket } from './websocket/signaling.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// CORS configuration for local development & deployment
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Initialize SQLite database and seed sample data
initDatabase();
seedDatabase();

// Root Route & Service Dashboard
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Zoom Clone Backend API & Signaling Server</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0B0E14; color: #FFFFFF; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .card { background: #131722; border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; padding: 36px; max-width: 520px; width: 100%; box-shadow: 0 20px 50px rgba(0,0,0,0.6); text-align: center; }
        .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(16,185,129,0.15); color: #34D399; font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(16,185,129,0.3); margin-bottom: 20px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: #10B981; }
        h1 { font-size: 24px; font-weight: 800; margin: 0 0 10px; }
        p { color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #0E71EB 0%, #0056B3 100%); color: #FFF; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 20px rgba(14,113,235,0.4); }
        .endpoints { text-align: left; background: rgba(0,0,0,0.3); border-radius: 12px; padding: 14px 18px; margin-top: 24px; font-size: 12px; color: #94A3B8; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge"><span class="dot"></span> Backend & WebSocket Server Online</div>
        <h1>Zoom Clone Cloud API</h1>
        <p>Real-Time WebRTC signaling server, REST endpoints, and SQLite database running 24/7 on Render Cloud.</p>
        <a href="https://zoom-workplace-rishabh.vercel.app" class="btn">Open Zoom Workplace App ➔</a>
        <div class="endpoints">
          <div>• HTTP API: <code>/api/health</code>, <code>/api/meetings</code></div>
          <div>• WebSocket: <code>/ws</code> (Signaling & Mesh)</div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Zoom Clone Backend API & Signaling Server',
    timestamp: new Date().toISOString()
  });
});

// REST Routes
app.use('/api/auth', authRouter);
app.use('/api/meetings', meetingsRouter);
app.use('/api/users', usersRouter);
app.use('/api/recordings', recordingsRouter);
app.use('/api/ai', aiRouter);

// Attach WebSocket Signaling Server
setupWebSocket(server);

// Start HTTP + WS Server
server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 Zoom Clone Server is running on:`);
  console.log(`   - HTTP API:  http://localhost:${PORT}/api`);
  console.log(`   - WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`=================================================`);
});
