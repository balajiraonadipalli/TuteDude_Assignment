const User = require('../models/User');
const { checkProximity } = require('../utils/proximity');

// In-memory map for fast lookups: socketId -> User document
const onlineUsers = new Map();

// Throttle move events per socket (ms) — 100ms is smooth enough & reduces save collisions
const MOVE_THROTTLE = 100;
const lastMoveTime = new Map();

function setupSocketManager(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─── JOIN ───────────────────────────────────────────────────────────────
    socket.on('join', async ({ username, avatarColor, avatarEmoji, position }) => {
      try {
        // Remove any stale doc for this socket
        await User.deleteOne({ socketId: socket.id });

        const startPos = position || {
          x: 200 + Math.random() * 600,
          y: 200 + Math.random() * 400,
        };

        const user = new User({
          socketId: socket.id,
          username: username || 'Anonymous',
          avatarColor: avatarColor || '#7c3aed',
          avatarEmoji: avatarEmoji || '🧑',
          position: startPos,
          nearbyUsers: [],
          isOnline: true,
        });

        await user.save();
        onlineUsers.set(socket.id, user);

        // Send the joining user the current world state
        const worldState = [...onlineUsers.values()]
          .filter((u) => u.socketId !== socket.id)
          .map((u) => u.toPublic());

        socket.emit('world_state', {
          me: user.toPublic(),
          users: worldState,
        });

        // Broadcast new user to everyone else
        socket.broadcast.emit('user_joined', user.toPublic());

        // Run proximity check immediately on join (handle case where
        // users are already standing near each other)
        await checkProximity(io, user, onlineUsers);

        console.log(`👤 ${username} joined at (${startPos.x.toFixed(0)}, ${startPos.y.toFixed(0)})`);
      } catch (err) {
        console.error('join error:', err);
        socket.emit('error', { message: 'Failed to join' });
      }
    });

    // ─── MOVE ────────────────────────────────────────────────────────────────
    socket.on('move', async ({ x, y }) => {
      // Throttle
      const now = Date.now();
      const last = lastMoveTime.get(socket.id) || 0;
      if (now - last < MOVE_THROTTLE) return;
      lastMoveTime.set(socket.id, now);

      const user = onlineUsers.get(socket.id);
      if (!user) return;

      // Update position IN MEMORY immediately (never blocked by DB)
      user.position = { x, y };
      user.lastSeen = new Date();

      // Broadcast and proximity check right away — no await on save
      socket.broadcast.emit('user_moved', { id: socket.id, x, y });

      // Run proximity check (must succeed even if DB save fails)
      try {
        await checkProximity(io, user, onlineUsers);
      } catch (err) {
        console.error('proximity error:', err);
      }

      // Persist position to DB with updateOne (no document locking, no ParallelSaveError)
      User.updateOne(
        { socketId: socket.id },
        { $set: { position: { x, y }, lastSeen: user.lastSeen } }
      ).catch((err) => console.error('position save error:', err));
    });

    // ─── CHAT MESSAGE ────────────────────────────────────────────────────────
    socket.on('chat:message', ({ toUserId, text }) => {
      if (!text || !text.trim() || !toUserId) return;

      const sender = onlineUsers.get(socket.id);
      if (!sender) return;

      // Check target user exists
      const target = onlineUsers.get(toUserId);
      if (!target) {
        socket.emit('chat:error', { message: 'User not found or offline' });
        return;
      }

      console.log(`💬 ${sender.username} → ${target.username}: "${text.trim()}"`); 

      const payload = {
        fromUserId: socket.id,
        fromUsername: sender.username,
        avatarColor: sender.avatarColor,
        avatarEmoji: sender.avatarEmoji,
        text: text.trim(),
        timestamp: Date.now(),
        toUserId,
      };

      // Send to target
      io.to(toUserId).emit('chat:message', payload);
      // Echo back to sender with isSelf flag
      socket.emit('chat:message', { ...payload, isSelf: true });
    });

    // ─── DISCONNECT ───────────────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      try {
        const user = onlineUsers.get(socket.id);
        if (!user) return;

        console.log(`👋 ${user.username} disconnected`);

        // Notify all users who were nearby
        for (const nearId of user.nearbyUsers) {
          const nearUser = onlineUsers.get(nearId);
          if (nearUser) {
            nearUser.nearbyUsers = nearUser.nearbyUsers.filter(
              (id) => id !== socket.id
            );
            await nearUser.save();
          }
          io.to(nearId).emit('chat:disconnect', { userId: socket.id });
        }

        onlineUsers.delete(socket.id);
        lastMoveTime.delete(socket.id);
        await User.deleteOne({ socketId: socket.id });

        // Broadcast user left
        io.emit('user_left', { id: socket.id });
      } catch (err) {
        console.error('disconnect error:', err);
      }
    });

    // ─── PING (keep-alive) ───────────────────────────────────────────────────
    socket.on('ping_server', () => {
      socket.emit('pong_server', { time: Date.now() });
    });
  });
}

module.exports = { setupSocketManager };
