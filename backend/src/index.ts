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
