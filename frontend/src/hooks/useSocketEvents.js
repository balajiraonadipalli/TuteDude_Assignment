import { useEffect } from 'react';
import { useCosmosStore } from '../store/cosmosStore';
import { getSocket } from '../socket/socket';

/**
 * Registers all persistent socket event handlers for the cosmos world.
 * Lives inside CosmosScreen so it stays alive for the full session,
 * unlike JoinScreen handlers which are torn down on navigation.
 */
export function useSocketEvents() {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onUserJoined = (user) => {
      const store = useCosmosStore.getState();
      store.addUser(user);
      store.setUserCount(store.otherUsers.size + 1);
    };

    const onUserMoved = ({ id, x, y }) => {
      useCosmosStore.getState().updateUserPosition(id, x, y);
    };

    const onUserLeft = ({ id }) => {
      const store = useCosmosStore.getState();
      store.removeUser(id);
      store.removeNearbyUser(id);
      store.setUserCount(store.otherUsers.size + 1);
    };

    const onChatConnect = (payload) => {
      // payload = { userId, username, avatarColor, avatarEmoji }
      useCosmosStore.getState().addNearbyUser(payload);
    };

    const onChatDisconnect = ({ userId }) => {
      useCosmosStore.getState().removeNearbyUser(userId);
    };

    const onChatMessage = (msg) => {
      const store = useCosmosStore.getState();
      const storeKey = msg.isSelf
        ? (msg.toUserId || store.activeChatUserId)
        : msg.fromUserId;
      if (storeKey) {
        store.addMessage(storeKey, msg);
        // If panel isn't open yet, open it for this user
        if (!store.isChatOpen) {
          store.openChat(storeKey);
        }
      }
    };

    // Register — remove first to prevent duplicates on HMR
    socket.off('user_joined',     onUserJoined);
    socket.off('user_moved',      onUserMoved);
    socket.off('user_left',       onUserLeft);
    socket.off('chat:connect',    onChatConnect);
    socket.off('chat:disconnect', onChatDisconnect);
    socket.off('chat:message',    onChatMessage);

    socket.on('user_joined',     onUserJoined);
    socket.on('user_moved',      onUserMoved);
    socket.on('user_left',       onUserLeft);
    socket.on('chat:connect',    onChatConnect);
    socket.on('chat:disconnect', onChatDisconnect);
    socket.on('chat:message',    onChatMessage);

    // ── Client-side proximity safety net ─────────────────────────────────
    // If backend chat:disconnect is missed for any reason, auto-disconnect
    // locally when a nearbyUser is clearly outside the radius.
    const CLIENT_RADIUS = 220; // slightly larger than server (200) for tolerance
    const proximityGuard = setInterval(() => {
      const store = useCosmosStore.getState();
      const myUser = store.myUser;
      if (!myUser || !myUser.position) return;

      store.nearbyUsers.forEach((nearUser) => {
        const other = store.otherUsers.get(nearUser.id);
        if (!other || !other.position) return;
        const dx = myUser.position.x - other.position.x;
        const dy = myUser.position.y - other.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > CLIENT_RADIUS) {
          console.log(`[client guard] ${nearUser.username} out of range (${dist.toFixed(0)}px) — disconnecting`);
          store.removeNearbyUser(nearUser.id);
        }
      });
    }, 2000);

    return () => {
      clearInterval(proximityGuard);
      socket.off('user_joined',     onUserJoined);
      socket.off('user_moved',      onUserMoved);
      socket.off('user_left',       onUserLeft);
      socket.off('chat:connect',    onChatConnect);
      socket.off('chat:disconnect', onChatDisconnect);
      socket.off('chat:message',    onChatMessage);
    };
  }, []);
}
