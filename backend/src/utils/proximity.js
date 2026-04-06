const User = require('../models/User');

// Proximity radius in world units (pixels at 1:1 scale)
const PROXIMITY_RADIUS = 200;

/**
 * Euclidean distance between two positions
 */
function getDistance(pos1, pos2) {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Persist nearbyUsers for a user using updateOne (no ParallelSaveError).
 * Operates at the query level — no document-level lock.
 */
function saveNearby(user) {
  User.updateOne(
    { socketId: user.socketId },
    { $set: { nearbyUsers: user.nearbyUsers } }
  ).catch((e) => console.error('saveNearby error:', e));
}

/**
 * Check proximity for a given user against all other users.
 * Emits chat:connect / chat:disconnect to affected sockets.
 * All DB writes are non-blocking updateOne calls.
 */
async function checkProximity(io, movedUser, allUsers) {
  const previousNearby = new Set(movedUser.nearbyUsers);
  const currentNearby  = new Set();

  for (const [, otherUser] of allUsers) {
    if (otherUser.socketId === movedUser.socketId) continue;
    const dist = getDistance(movedUser.position, otherUser.position);
    if (dist < PROXIMITY_RADIUS) {
      currentNearby.add(otherUser.socketId);
    }
  }

  // Diff
  const newlyNear = [...currentNearby].filter((id) => !previousNearby.has(id));
  const newlyFar  = [...previousNearby].filter((id) => !currentNearby.has(id));

  // Update in-memory state
  movedUser.nearbyUsers = [...currentNearby];
  // Persist non-blocking (no document lock)
  saveNearby(movedUser);

  // ── chat:connect for newly close users ────────────────────────────────────
  for (const nearId of newlyNear) {
    const nearUser = allUsers.get(nearId);
    if (!nearUser) continue;

    // Update the other user's nearbyUsers in memory
    if (!nearUser.nearbyUsers.includes(movedUser.socketId)) {
      nearUser.nearbyUsers.push(movedUser.socketId);
      saveNearby(nearUser);
    }

    io.to(movedUser.socketId).emit('chat:connect', {
      userId:      nearId,
      username:    nearUser.username,
      avatarColor: nearUser.avatarColor,
      avatarEmoji: nearUser.avatarEmoji,
    });

    io.to(nearId).emit('chat:connect', {
      userId:      movedUser.socketId,
      username:    movedUser.username,
      avatarColor: movedUser.avatarColor,
      avatarEmoji: movedUser.avatarEmoji,
    });

    console.log(`📡 CONNECTED: ${movedUser.username} ↔ ${nearUser.username}`);
  }

  // ── chat:disconnect for users who moved away ──────────────────────────────
  for (const farId of newlyFar) {
    const farUser = allUsers.get(farId);
    if (farUser) {
      farUser.nearbyUsers = farUser.nearbyUsers.filter(
        (id) => id !== movedUser.socketId
      );
      saveNearby(farUser);
    }

    // Emit disconnect to BOTH sides immediately
    io.to(movedUser.socketId).emit('chat:disconnect', { userId: farId });
    io.to(farId).emit('chat:disconnect', { userId: movedUser.socketId });

    const farName = farUser?.username || farId;
    console.log(`📡 DISCONNECTED: ${movedUser.username} ↔ ${farName}`);
  }

  return { newlyNear, newlyFar };
}

module.exports = { checkProximity, PROXIMITY_RADIUS };
