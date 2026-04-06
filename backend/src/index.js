require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const { setupSocketManager } = require('./socket/socketManager');

const app = express();
const server = http.createServer(app);

// ─── Socket.IO setup ───────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// ─── Express middleware ────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/users', userRoutes);
app.get('/', (req, res) => res.json({ message: '🌌 Virtual Cosmos API is running' }));

// ─── Socket setup ──────────────────────────────────────────────────────────
setupSocketManager(io);

// ─── Start ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`\n🚀 Virtual Cosmos Backend running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.IO ready`);
    console.log(`📦 MongoDB connected\n`);
  });
});
