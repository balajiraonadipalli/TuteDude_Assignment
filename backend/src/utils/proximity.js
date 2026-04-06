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
 * Check proximity for a given user against all other users.
 * Returns { newlyNear: [], newlyFar: [] } relative to previous state.
 */
async function checkProximity(io, movedUser, allUsers) {
  const previousNearby = new Set(movedUser.nearbyUsers);
  const currentNearby = new Set();

  for (const [, otherUser] of allUsers) {
    if (otherUser.socketId === movedUser.socketId) continue;
    const dist = getDistance(movedUser.position, otherUser.position);
    if (dist < PROXIMITY_RADIUS) {
      currentNearby.add(otherUser.socketId);
    }
  }

  // Find newly entered proximity
  const newlyNear = [...currentNearby].filter((id) => !previousNearby.has(id));
  // Find newly left proximity
  const newlyFar = [...previousNearby].filter((id) => !currentNearby.has(id));

  // Update DB
  movedUser.nearbyUsers = [...currentNearby];
  await movedUser.save();

  // Emit chat:connect for newly close users (both sides)
  for (const nearId of newlyNear) {
    const nearUser = allUsers.get(nearId);
    if (!nearUser) continue;

    // Update the other user's nearbyUsers too if not already there
    if (!nearUser.nearbyUsers.includes(movedUser.socketId)) {
      nearUser.nearbyUsers.push(movedUser.socketId);
      await nearUser.save();
    }

    // Notify moved user
    io.to(movedUser.socketId).emit('chat:connect', {
      userId: nearId,
      username: nearUser.username,
      avatarColor: nearUser.avatarColor,
      avatarEmoji: nearUser.avatarEmoji,
    });

    // Notify the other user
    io.to(nearId).emit('chat:connect', {
      userId: movedUser.socketId,
      username: movedUser.username,
      avatarColor: movedUser.avatarColor,
      avatarEmoji: movedUser.avatarEmoji,
    });

    console.log(`📡 Proximity: ${movedUser.username} ↔ ${nearUser.username} CONNECTED`);
  }

  // Emit chat:disconnect for users who moved away (both sides)
  for (const farId of newlyFar) {
    const farUser = allUsers.get(farId);
    if (farUser) {
      farUser.nearbyUsers = farUser.nearbyUsers.filter(
        (id) => id !== movedUser.socketId
      );
      await farUser.save();
    }

    io.to(movedUser.socketId).emit('chat:disconnect', { userId: farId });
    io.to(farId).emit('chat:disconnect', { userId: movedUser.socketId });
  }

  return { newlyNear, newlyFar };
}

module.exports = { checkProximity, PROXIMITY_RADIUS };
