import { useEffect, useRef, useState } from 'react';
import { useCosmosStore } from '../store/cosmosStore';
import { getSocket } from '../socket/socket';

export default function ChatPanel() {
  const isChatOpen       = useCosmosStore((s) => s.isChatOpen);
  const activeChatUserId = useCosmosStore((s) => s.activeChatUserId);
  const nearbyUsers      = useCosmosStore((s) => s.nearbyUsers);
  const chatMessages     = useCosmosStore((s) => s.chatMessages);
  const closeChat        = useCosmosStore((s) => s.closeChat);
  const myUser           = useCosmosStore((s) => s.myUser);

  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  const activeUser = nearbyUsers.find((u) => u.id === activeChatUserId);
  const messages   = chatMessages[activeChatUserId] || [];

  // Auto scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Auto open & switch chat target when nearby user arrives
  useEffect(() => {
    const store = useCosmosStore.getState();
    if (nearbyUsers.length > 0) {
      if (!store.activeChatUserId || !nearbyUsers.find(u => u.id === store.activeChatUserId)) {
        store.openChat(nearbyUsers[0].id);
      } else if (!store.isChatOpen) {
        store.openChat(store.activeChatUserId);
      }
    }
  }, [nearbyUsers.length, nearbyUsers]); // eslint-disable-line

  const sendMessage = () => {
    if (!input.trim() || !activeChatUserId) return;
    getSocket().emit('chat:message', { toUserId: activeChatUserId, text: input.trim() });
    setInput('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isChatOpen) return null;

  // ── Shared panel wrapper style ────────────────────────────────────────────
  const panelStyle = {
    position: 'absolute',
    right: 0,
    top: '52px',
    bottom: '60px',
    width: '300px',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(13,13,26,0.98)',
    borderLeft: '1px solid rgba(124,58,237,0.2)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    overflow: 'hidden',
  };

  // ── No one nearby ─────────────────────────────────────────────────────────
  if (!activeChatUserId && nearbyUsers.length === 0) {
    return (
      <div style={panelStyle}>
        <PanelHeader title="Chat" onClose={closeChat} />
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '24px 20px', textAlign: 'center', gap: '12px',
        }}>
          <div style={{ fontSize: '40px', opacity: 0.35, lineHeight: 1 }}>💬</div>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>
            No one nearby
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
            Move your avatar close to another user to start chatting.
          </p>
          <div style={{
            marginTop: '4px', padding: '8px 14px', borderRadius: '10px',
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
            fontSize: '12px', color: '#a855f7',
          }}>
            Use <strong>WASD</strong> or arrow keys to move
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      {/* ── Header ── */}
      <PanelHeader
        title={activeUser ? `Chat · ${activeUser.username}` : 'Chat'}
        subtitle={activeUser?.avatarEmoji}
        avatarColor={activeUser?.avatarColor}
        onClose={closeChat}
      />

      {/* ── User tabs (multiple nearby) ── */}
      {nearbyUsers.length > 1 && (
        <div style={{
          display: 'flex', gap: '6px', padding: '8px 12px', overflowX: 'auto',
          borderBottom: '1px solid rgba(124,58,237,0.12)', flexShrink: 0,
        }}>
          {nearbyUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => useCosmosStore.getState().openChat(u.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '5px 10px', borderRadius: '8px', fontSize: '12px',
                whiteSpace: 'nowrap', cursor: 'pointer', border: 'none',
                background: activeChatUserId === u.id ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
                color: activeChatUserId === u.id ? '#d4c5f9' : '#94a3b8',
                outline: activeChatUserId === u.id ? '1px solid rgba(124,58,237,0.4)' : 'none',
              }}
            >
              <span>{u.avatarEmoji}</span>
              <span style={{ fontWeight: 500 }}>{u.username}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Message list ── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px 14px',
        display: 'flex', flexDirection: 'column', gap: '10px',
      }}>
        {/* Chat intro */}
        {activeUser && (
          <div style={{ textAlign: 'center', padding: '12px 0 8px', flexShrink: 0 }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '16px',
              background: `${activeUser.avatarColor || '#7c3aed'}28`,
              border: `2px solid ${activeUser.avatarColor || '#7c3aed'}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px', margin: '0 auto 10px',
            }}>
              {activeUser.avatarEmoji || '🧑'}
            </div>
            <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
              {activeUser.username}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: 1.5 }}>
              This is the beginning of your chat with{' '}
              <span style={{ color: '#a855f7' }}>@{activeUser.username}</span>.
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} myUser={myUser} />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div style={{
        flexShrink: 0, padding: '10px 12px 12px',
        borderTop: '1px solid rgba(124,58,237,0.12)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(30,30,55,0.9)', border: '1.5px solid rgba(124,58,237,0.25)',
          borderRadius: '14px', padding: '8px 10px 8px 14px',
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={activeChatUserId ? 'Type a message…' : 'Get closer to chat'}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontSize: '13px', color: '#f1f5f9', fontFamily: 'Inter, sans-serif',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !activeChatUserId}
            style={{
              width: '30px', height: '30px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: input.trim() && activeChatUserId ? 'pointer' : 'not-allowed',
              background: input.trim() && activeChatUserId
                ? 'linear-gradient(135deg,#7c3aed,#a855f7)'
                : 'rgba(124,58,237,0.15)',
              color: input.trim() && activeChatUserId ? '#fff' : '#6b7280',
              fontSize: '16px', flexShrink: 0,
              transition: 'all 0.15s',
            }}
          >
            ↑
          </button>
        </div>

        {/* Formatting hints */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '6px 4px 0', opacity: 0.5,
        }}>
          {['😊', '📎', 'B', 'I'].map((icon, i) => (
            <button
              key={i}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '13px', color: '#64748b', padding: '2px 4px',
              }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function PanelHeader({ title, subtitle, avatarColor, onClose }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 14px', flexShrink: 0,
      borderBottom: '1px solid rgba(124,58,237,0.15)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        {subtitle && (
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
            background: `${avatarColor || '#7c3aed'}30`,
            border: `1px solid ${avatarColor || '#7c3aed'}50`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '15px',
          }}>
            {subtitle}
          </div>
        )}
        <span style={{
          fontSize: '13px', fontWeight: 600, color: '#f1f5f9',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {title}
        </span>
      </div>
      <button
        onClick={onClose}
        style={{
          width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0,
          background: 'rgba(148,163,184,0.1)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#94a3b8', fontSize: '13px',
        }}
      >
        ✕
      </button>
    </div>
  );
}

function MessageBubble({ msg, myUser }) {
  const isSelf = msg.isSelf || msg.fromUserId === myUser?.id;
  const time = new Date(msg.timestamp).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: isSelf ? 'flex-end' : 'flex-start',
      gap: '3px',
    }}>
      {/* Sender label for received messages */}
      {!isSelf && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', paddingLeft: '2px' }}>
          <span style={{ fontSize: '13px' }}>{msg.avatarEmoji || '🧑'}</span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#a855f7' }}>
            {msg.fromUsername}
          </span>
        </div>
      )}

      {/* Bubble */}
      <div style={{
        maxWidth: '220px', padding: '9px 13px',
        borderRadius: isSelf ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        fontSize: '13px', lineHeight: '1.5', wordBreak: 'break-word',
        background: isSelf
          ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
          : 'rgba(40,40,65,0.95)',
        color: '#f1f5f9',
        border: isSelf ? 'none' : '1px solid rgba(124,58,237,0.2)',
        boxShadow: isSelf
          ? '0 2px 12px rgba(124,58,237,0.3)'
          : '0 1px 4px rgba(0,0,0,0.2)',
      }}>
        {msg.text}
      </div>

      {/* Timestamp */}
      <span style={{
        fontSize: '10px', color: '#475569',
        paddingLeft: isSelf ? 0 : '4px',
        paddingRight: isSelf ? '4px' : 0,
      }}>
        {time}
      </span>
    </div>
  );
}
