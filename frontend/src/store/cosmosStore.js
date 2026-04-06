import { create } from 'zustand';

export const useCosmosStore = create((set, get) => ({
  // ── My user ────────────────────────────────────────────────────────────────
  myUser: null, // { id, username, avatarColor, avatarEmoji, position, currentRoom }
  setMyUser: (user) => set({ myUser: user }),
  updateMyPosition: (x, y) =>
    set((s) => ({
      myUser: s.myUser ? { ...s.myUser, position: { x, y } } : s.myUser,
    })),

  // ── Other users ────────────────────────────────────────────────────────────
  otherUsers: new Map(), // socketId -> user object
  addUser: (user) =>
    set((s) => {
      const m = new Map(s.otherUsers);
      m.set(user.id, user);
      return { otherUsers: m };
    }),
  removeUser: (id) =>
    set((s) => {
      const m = new Map(s.otherUsers);
      m.delete(id);
      return { otherUsers: m };
    }),
  updateUserPosition: (id, x, y) =>
    set((s) => {
      const m = new Map(s.otherUsers);
      const u = m.get(id);
      if (u) m.set(id, { ...u, position: { x, y } });
      return { otherUsers: m };
    }),
  setWorldUsers: (users) =>
    set(() => {
      const m = new Map();
      users.forEach((u) => m.set(u.id, u));
      return { otherUsers: m };
    }),

  // ── Nearby / proximity ─────────────────────────────────────────────────────
  nearbyUsers: [], // [{ id, username, avatarColor, avatarEmoji }]
  addNearbyUser: (user) =>
    set((s) => {
      if (s.nearbyUsers.find((u) => u.id === user.userId)) return {};
      return {
        nearbyUsers: [
          ...s.nearbyUsers,
          {
            id: user.userId,
            username: user.username,
            avatarColor: user.avatarColor,
            avatarEmoji: user.avatarEmoji,
          },
        ],
      };
    }),
  removeNearbyUser: (userId) =>
    set((s) => ({
      nearbyUsers: s.nearbyUsers.filter((u) => u.id !== userId),
      chatMessages: (() => {
        // don't wipe messages - keep history
        return s.chatMessages;
      })(),
      activeChatUserId:
        s.activeChatUserId === userId ? null : s.activeChatUserId,
      isChatOpen: s.activeChatUserId === userId ? false : s.isChatOpen,
    })),

  // ── Chat ───────────────────────────────────────────────────────────────────
  chatMessages: {}, // { [userId]: Message[] }
  activeChatUserId: null,
  isChatOpen: false,

  openChat: (userId) => set({ activeChatUserId: userId, isChatOpen: true }),
  closeChat: () => set({ isChatOpen: false, activeChatUserId: null }),

  addMessage: (userId, message) =>
    set((s) => ({
      chatMessages: {
        ...s.chatMessages,
        [userId]: [...(s.chatMessages[userId] || []), message],
      },
    })),

  // ── UI state ───────────────────────────────────────────────────────────────
  userCount: 0,
  setUserCount: (n) => set({ userCount: n }),

  isConnected: false,
  setConnected: (v) => set({ isConnected: v }),

  // ── Toolbar features ───────────────────────────────────────────────────────
  isRecording: false,
  toggleRecording: () => set((s) => ({ isRecording: !s.isRecording })),

  handRaised: false,
  toggleHand: () => set((s) => ({ handRaised: !s.handRaised })),

  // { [userId]: emoji } – reactions floating above avatars on canvas
  reactions: {},
  setReaction: (userId, emoji) => {
    set((s) => ({ reactions: { ...s.reactions, [userId]: emoji } }));
    setTimeout(() => {
      set((s) => {
        const r = { ...s.reactions };
        if (r[userId] === emoji) delete r[userId];
        return { reactions: r };
      });
    }, 3000);
  },

  // Active overlay panel: null | 'reactions' | 'apps' | 'settings'
  activePanel: null,
  setActivePanel: (p) => set((s) => ({ activePanel: s.activePanel === p ? null : p })),

  // Toast notifications { message, type }
  toast: null,
  showToast: (message, type = 'success') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 2500);
  },
}));
