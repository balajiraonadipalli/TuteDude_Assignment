import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectSocket } from '../socket/socket';
import { useCosmosStore } from '../store/cosmosStore';
import { TILE_SIZE } from '../map/officeMap';

const AVATAR_OPTIONS = [
  { emoji: '🧑', label: 'Person' },
  { emoji: '👩', label: 'Woman' },
  { emoji: '👨', label: 'Man' },
  { emoji: '🧙', label: 'Wizard' },
  { emoji: '🧜', label: 'Mermaid' },
  { emoji: '🦸', label: 'Hero' },
  { emoji: '🤖', label: 'Robot' },
  { emoji: '👾', label: 'Alien' },
];

const COLOR_OPTIONS = [
  '#7c3aed', '#2563eb', '#dc2626', '#16a34a',
  '#d97706', '#db2777', '#0891b2', '#65a30d',
];

export default function JoinScreen() {
  const [username, setUsername] = useState('');
  const [selectedEmoji, setEmoji] = useState('🧑');
  const [selectedColor, setColor] = useState('#7c3aed');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const sessionStarted = useRef(false);

  // ── Register join-flow socket handlers ──────────────────────────────────
  // NOTE: world-state handlers (user_joined, user_moved, chat:*, etc.)
  // are registered in useSocketEvents (CosmosScreen) so they survive navigation.
  useEffect(() => {
    const socket = connectSocket();

    const onConnect = () => {
      useCosmosStore.getState().setConnected(true);
    };

    const onConnectError = () => {
      setLoading(false);
      setError('Cannot connect to server. Is the backend running?');
      sessionStarted.current = false;
    };

    const onWorldState = ({ me, users }) => {
      const store = useCosmosStore.getState();
      store.setMyUser(me);
      store.setWorldUsers(users);
      store.setUserCount(users.length + 1);
      navigate('/cosmos');
    };

    const onDisconnect = () => {
      useCosmosStore.getState().setConnected(false);
      sessionStarted.current = false;
    };

    socket.off('connect',       onConnect);
    socket.off('connect_error', onConnectError);
    socket.off('world_state',   onWorldState);
    socket.off('disconnect',    onDisconnect);

    socket.on('connect',       onConnect);
    socket.on('connect_error', onConnectError);
    socket.on('world_state',   onWorldState);
    socket.on('disconnect',    onDisconnect);

    return () => {
      socket.off('connect',       onConnect);
      socket.off('connect_error', onConnectError);
      socket.off('world_state',   onWorldState);
      socket.off('disconnect',    onDisconnect);
    };
  }, [navigate]); // eslint-disable-line

  const handleJoin = () => {
    const name = username.trim();
    if (!name) { setError('Please enter a username'); return; }
    if (name.length > 20) { setError('Username too long (max 20)'); return; }
    if (sessionStarted.current) return;

    setLoading(true);
    setError('');
    sessionStarted.current = true;

    const startX = 9 * TILE_SIZE + 24;
    const startY = 9 * TILE_SIZE + 24;
    const socket = connectSocket();

    const emitJoin = () => {
      socket.emit('join', {
        username: name,
        avatarColor: selectedColor,
        avatarEmoji: selectedEmoji,
        position: { x: startX, y: startY },
      });
    };

    if (socket.connected) {
      emitJoin();
    } else {
      socket.once('connect', emitJoin);
      socket.connect();
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow blobs */}
      <div style={{
        position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.25), transparent)',
        top: '5%', left: '10%', filter: 'blur(60px)', animation: 'float 6s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.2), transparent)',
        bottom: '10%', right: '10%', filter: 'blur(60px)', animation: 'float 8s ease-in-out infinite reverse',
      }} />

      {/* Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '440px',
          margin: '0 16px',
          background: 'rgba(22,22,42,0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: '20px',
          padding: '0',
          overflow: 'hidden',
          animation: 'fadeIn 0.4s ease forwards',
        }}
      >
        {/* Top accent bar */}
        <div style={{
          height: '3px',
          background: 'linear-gradient(90deg, #7c3aed, #a855f7, #2563eb)',
        }} />

        <div style={{ padding: '32px 32px 28px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '64px', height: '64px',
              background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
              borderRadius: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '30px',
              margin: '0 auto 14px',
              boxShadow: '0 8px 32px rgba(124,58,237,0.45)',
            }}>
              🌌
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px' }}>
              Virtual Cosmos
            </h1>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
              Move close to others to start chatting
            </p>
          </div>

          {/* Username */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: 600,
              color: '#64748b', letterSpacing: '0.08em', marginBottom: '8px',
            }}>
              YOUR NAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder="Enter your name..."
              maxLength={20}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(30,30,53,0.8)',
                border: `1.5px solid ${error ? '#ef4444' : 'rgba(124,58,237,0.35)'}`,
                color: '#f1f5f9',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'Inter, sans-serif',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
              onBlur={e => e.target.style.borderColor = error ? '#ef4444' : 'rgba(124,58,237,0.35)'}
            />
            {error && (
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#ef4444' }}>{error}</p>
            )}
          </div>

          {/* Avatar Picker */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: 600,
              color: '#64748b', letterSpacing: '0.08em', marginBottom: '8px',
            }}>
              CHOOSE AVATAR
            </label>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px',
            }}>
              {AVATAR_OPTIONS.map((a) => (
                <button
                  key={a.emoji}
                  onClick={() => setEmoji(a.emoji)}
                  title={a.label}
                  style={{
                    padding: '10px 4px',
                    borderRadius: '12px',
                    fontSize: '24px',
                    cursor: 'pointer',
                    background: selectedEmoji === a.emoji ? `${selectedColor}28` : 'rgba(30,30,53,0.6)',
                    border: `2px solid ${selectedEmoji === a.emoji ? selectedColor : 'rgba(255,255,255,0.06)'}`,
                    transform: selectedEmoji === a.emoji ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.15s',
                  }}
                >
                  {a.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: 600,
              color: '#64748b', letterSpacing: '0.08em', marginBottom: '10px',
            }}>
              AVATAR COLOR
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: '32px', height: '32px',
                    borderRadius: '50%',
                    background: c,
                    border: selectedColor === c ? '2.5px solid #ffffff' : '2.5px solid transparent',
                    outline: selectedColor === c ? `3px solid ${c}` : 'none',
                    outlineOffset: '1px',
                    cursor: 'pointer',
                    transform: selectedColor === c ? 'scale(1.18)' : 'scale(1)',
                    transition: 'all 0.15s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '12px 16px',
            borderRadius: '14px',
            background: 'rgba(30,30,53,0.5)',
            border: '1px solid rgba(124,58,237,0.15)',
            marginBottom: '22px',
          }}>
            <div style={{
              width: '48px', height: '48px',
              borderRadius: '14px',
              background: `${selectedColor}28`,
              border: `2px solid ${selectedColor}60`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0,
            }}>
              {selectedEmoji}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
              <span style={{
                fontSize: '14px', fontWeight: 600, color: '#f1f5f9',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {username || 'Your Name'}
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Preview
              </span>
            </div>
            <div style={{
              marginLeft: 'auto',
              width: '10px', height: '10px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
              flexShrink: 0,
            }} />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleJoin}
            disabled={loading || !username.trim()}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              fontWeight: 700,
              fontSize: '15px',
              fontFamily: 'Inter, sans-serif',
              cursor: loading || !username.trim() ? 'not-allowed' : 'pointer',
              background: username.trim()
                ? `linear-gradient(135deg, ${selectedColor}, ${selectedColor}bb)`
                : 'rgba(30,30,53,0.6)',
              color: username.trim() ? '#fff' : '#475569',
              border: 'none',
              boxShadow: username.trim() ? `0 6px 24px ${selectedColor}44` : 'none',
              transition: 'all 0.2s',
              letterSpacing: '0.01em',
            }}
          >
            {loading ? '✨ Connecting...' : '🚀 Enter Cosmos'}
          </button>

          <p style={{
            textAlign: 'center', margin: '14px 0 0',
            fontSize: '12px', color: '#475569', lineHeight: 1.5,
          }}>
            Use <span style={{ color: '#7c3aed', fontWeight: 600 }}>WASD</span> or arrow keys to move around
          </p>
        </div>
      </div>
    </div>
  );
}
