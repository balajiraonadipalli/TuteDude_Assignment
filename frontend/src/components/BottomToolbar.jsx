import { useState, useEffect } from 'react';
import { useCosmosStore } from '../store/cosmosStore';
import { getSocket } from '../socket/socket';

// ── Emoji reactions list ────────────────────────────────────────────────────
const REACTIONS = ['👍', '❤️', '😂', '😮', '🎉', '👏', '🔥', '😢', '🤔', '💯'];

export default function BottomToolbar() {
  const isChatOpen     = useCosmosStore((s) => s.isChatOpen);
  const nearbyUsers    = useCosmosStore((s) => s.nearbyUsers);
  const myUser         = useCosmosStore((s) => s.myUser);
  const isRecording    = useCosmosStore((s) => s.isRecording);
  const handRaised     = useCosmosStore((s) => s.handRaised);
  const activePanel    = useCosmosStore((s) => s.activePanel);
  const toggleRecording = useCosmosStore((s) => s.toggleRecording);
  const toggleHand     = useCosmosStore((s) => s.toggleHand);
  const setReaction    = useCosmosStore((s) => s.setReaction);
  const setActivePanel = useCosmosStore((s) => s.setActivePanel);
  const showToast      = useCosmosStore((s) => s.showToast);

  // ── Button handlers ───────────────────────────────────────────────────────

  const handleShare = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url)
      .then(() => showToast('🔗 Room link copied to clipboard!'))
      .catch(() => showToast('❌ Could not copy link', 'error'));
  };

  const handleInvite = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(`Join me in Virtual Cosmos! ${url}`)
      .then(() => showToast('👋 Invite link copied!'))
      .catch(() => showToast('❌ Could not copy link', 'error'));
  };

  const handleRecord = () => {
    toggleRecording();
    showToast(isRecording ? '⏹ Recording stopped' : '⏺ Recording started', 'info');
  };

  const handleHand = () => {
    const newState = !handRaised;
    toggleHand();
    if (myUser) {
      getSocket().emit('hand:raise', { raised: newState });
    }
    showToast(newState ? '✋ Hand raised!' : '✋ Hand lowered', 'info');
  };

  const handleReaction = (emoji) => {
    if (!myUser) return;
    setReaction(myUser.id, emoji);
    getSocket().emit('react:emoji', { emoji });
    setActivePanel(null);
    showToast(`${emoji} Reaction sent!`, 'info');
  };

  const handleChat = () => {
    const store = useCosmosStore.getState();
    if (store.isChatOpen) {
      store.closeChat();
    } else if (store.nearbyUsers.length > 0) {
      store.openChat(store.nearbyUsers[0].id);
    } else {
      store.setState({ isChatOpen: true, activeChatUserId: null });
    }
    setActivePanel(null);
  };

  return (
    <>
      {/* ── Overlay panels (above toolbar) ── */}
      {activePanel === 'reactions' && (
        <ReactionsPanel onReact={handleReaction} onClose={() => setActivePanel(null)} />
      )}
      {activePanel === 'apps' && (
        <AppsPanel onClose={() => setActivePanel(null)} myUser={myUser} />
      )}
      {activePanel === 'settings' && (
        <SettingsPanel onClose={() => setActivePanel(null)} myUser={myUser} />
      )}

      {/* ── Toolbar ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50,
        height: '62px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
        padding: '0 16px',
        background: 'rgba(13,13,26,0.97)',
        borderTop: '1px solid rgba(124,58,237,0.2)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        <ToolBtn icon="🔗" label="Share"  onClick={handleShare} />
        <ToolBtn icon="👋" label="Invite" onClick={handleInvite} />
        <ToolBtn
          icon={isRecording ? '⏹' : '⏺'}
          label={isRecording ? 'Stop' : 'Record'}
          onClick={handleRecord}
          active={isRecording}
          activeColor="#ef4444"
          pulse={isRecording}
        />
        <ToolBtn icon="✋" label="Hand"   onClick={handleHand}  active={handRaised} />
        <ToolBtn
          icon="⚡" label="React"
          onClick={() => setActivePanel('reactions')}
          active={activePanel === 'reactions'}
        />

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', background: 'rgba(124,58,237,0.25)', margin: '0 8px', flexShrink: 0 }} />

        <ToolBtn
          icon="💬" label="Chat"
          active={isChatOpen}
          onClick={handleChat}
          badge={nearbyUsers.length > 0 && !isChatOpen ? nearbyUsers.length : 0}
        />
        <ToolBtn
          icon="🧩" label="Apps"
          onClick={() => setActivePanel('apps')}
          active={activePanel === 'apps'}
        />
        <ToolBtn
          icon="⚙️" label="Settings"
          onClick={() => setActivePanel('settings')}
          active={activePanel === 'settings'}
        />
      </div>
    </>
  );
}

// ── ToolBtn ──────────────────────────────────────────────────────────────────
function ToolBtn({ icon, label, active = false, onClick, badge = 0, activeColor = '#a855f7', pulse = false }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '2px',
        padding: '6px 10px', borderRadius: '10px', cursor: 'pointer',
        background: active ? `${activeColor}22` : 'transparent',
        border: `1px solid ${active ? activeColor + '55' : 'transparent'}`,
        minWidth: '48px', transition: 'all 0.15s',
      }}
    >
      <span style={{
        fontSize: '17px', lineHeight: 1,
        animation: pulse ? 'pulseScale 1s ease-in-out infinite' : 'none',
      }}>
        {icon}
      </span>
      <span style={{
        fontSize: '10px', lineHeight: 1,
        color: active ? activeColor : '#64748b',
        fontWeight: active ? 700 : 400,
      }}>
        {label}
      </span>
      {badge > 0 && (
        <span style={{
          position: 'absolute', top: '3px', right: '3px',
          width: '15px', height: '15px', borderRadius: '50%',
          background: '#7c3aed', color: '#fff', fontSize: '9px', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 8px rgba(124,58,237,0.6)',
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

// ── Reactions Panel ───────────────────────────────────────────────────────────
function ReactionsPanel({ onReact, onClose }) {
  return (
    <div style={{
      position: 'absolute', bottom: '70px', left: '14px', zIndex: 60,
      background: 'rgba(18,18,36,0.98)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(124,58,237,0.25)', borderRadius: '16px',
      padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px',
      boxShadow: '0 -4px 30px rgba(0,0,0,0.4)',
      animation: 'slideUp 0.2s ease forwards',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>REACT</span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#64748b', fontSize: '13px',
        }}>✕</button>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxWidth: '220px' }}>
        {REACTIONS.map((e) => (
          <button
            key={e}
            onClick={() => onReact(e)}
            style={{
              fontSize: '24px', padding: '6px 8px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', transition: 'transform 0.1s',
            }}
            onMouseEnter={ev => ev.currentTarget.style.transform = 'scale(1.3)'}
            onMouseLeave={ev => ev.currentTarget.style.transform = 'scale(1)'}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Apps Panel ────────────────────────────────────────────────────────────────
const APPS = [
  { icon: '⏱️', name: 'Timer', desc: 'Pomodoro timer' },
  { icon: '📋', name: 'Notes', desc: 'Quick scratch pad' },
  { icon: '🎵', name: 'Music', desc: 'Ambient sounds' },
  { icon: '📊', name: 'Poll', desc: 'Ask the room' },
  { icon: '🎲', name: 'Games', desc: 'Mini games' },
  { icon: '🖼️', name: 'Board', desc: 'Whiteboard' },
];

function AppsPanel({ onClose, myUser }) {
  const [timerSec, setTimerSec] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [note, setNote] = useState('');
  const [openApp, setOpenApp] = useState(null);
  const showToast = useCosmosStore((s) => s.showToast);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setTimerSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{
      position: 'absolute', bottom: '70px', right: '14px', zIndex: 60, width: '280px',
      background: 'rgba(18,18,36,0.98)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(124,58,237,0.25)', borderRadius: '18px',
      padding: '16px', boxShadow: '0 -4px 30px rgba(0,0,0,0.4)',
      animation: 'slideUp 0.2s ease forwards',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>🧩 Apps</span>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer',
          color: '#94a3b8', fontSize: '13px', width: '24px', height: '24px',
          borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>
      </div>

      {/* App grid */}
      {!openApp && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {APPS.map((app) => (
            <button
              key={app.name}
              onClick={() => setOpenApp(app.name)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                padding: '12px 6px', borderRadius: '12px', cursor: 'pointer',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(124,58,237,0.15)'}
              onMouseLeave={ev => ev.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <span style={{ fontSize: '22px' }}>{app.icon}</span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#e2e8f0' }}>{app.name}</span>
              <span style={{ fontSize: '9px', color: '#64748b', textAlign: 'center' }}>{app.desc}</span>
            </button>
          ))}
        </div>
      )}

      {/* Timer app */}
      {openApp === 'Timer' && (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <button onClick={() => setOpenApp(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '12px', marginBottom: '10px', display: 'block' }}>← Back</button>
          <div style={{ fontSize: '48px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '2px', fontFamily: 'monospace' }}>{fmt(timerSec)}</div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '14px' }}>
            <button onClick={() => setTimerRunning(r => !r)} style={{
              padding: '8px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '13px',
              background: timerRunning ? '#ef4444' : '#7c3aed', color: '#fff', border: 'none',
            }}>{timerRunning ? 'Pause' : 'Start'}</button>
            <button onClick={() => { setTimerSec(0); setTimerRunning(false); }} style={{
              padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px',
              background: 'rgba(255,255,255,0.08)', color: '#94a3b8', border: 'none',
            }}>Reset</button>
          </div>
        </div>
      )}

      {/* Notes app */}
      {openApp === 'Notes' && (
        <div>
          <button onClick={() => setOpenApp(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '12px', marginBottom: '8px', display: 'block' }}>← Back</button>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Jot something down..."
            style={{
              width: '100%', height: '100px', background: 'rgba(30,30,53,0.8)', border: '1px solid rgba(124,58,237,0.25)',
              borderRadius: '10px', padding: '10px', color: '#f1f5f9', fontSize: '13px',
              resize: 'none', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
            }}
          />
          <button onClick={() => { navigator.clipboard.writeText(note); showToast('📋 Notes copied!'); }} style={{
            marginTop: '8px', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
            background: 'rgba(124,58,237,0.2)', color: '#a855f7', border: '1px solid rgba(124,58,237,0.3)', width: '100%',
          }}>Copy to clipboard</button>
        </div>
      )}

      {/* Music app */}
      {openApp === 'Music' && (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <button onClick={() => setOpenApp(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '12px', marginBottom: '10px', display: 'block' }}>← Back</button>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>🎵 Ambient sounds</p>
          {['🌊 Ocean', '🌧️ Rain', '☕ Coffee Shop', '🌲 Forest'].map(s => (
            <button
              key={s}
              onClick={() => showToast(`${s} - ambient sound playing`, 'info')}
              style={{
                display: 'block', width: '100%', padding: '8px 12px', marginBottom: '6px',
                borderRadius: '10px', cursor: 'pointer', fontSize: '13px', textAlign: 'left',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#e2e8f0',
              }}
            >{s}</button>
          ))}
        </div>
      )}

      {/* Other apps placeholder */}
      {openApp && !['Timer', 'Notes', 'Music'].includes(openApp) && (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <button onClick={() => setOpenApp(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '12px', marginBottom: '10px', display: 'block' }}>← Back</button>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>{APPS.find(a => a.name === openApp)?.icon}</div>
          <p style={{ fontSize: '13px', color: '#64748b' }}>{openApp} — coming soon!</p>
        </div>
      )}
    </div>
  );
}

// ── Settings Panel ────────────────────────────────────────────────────────────
const EMOJI_OPTIONS = ['🧑','👩','👨','🧙','🧜','🦸','🤖','👾'];
const COLOR_OPTIONS = ['#7c3aed','#2563eb','#dc2626','#16a34a','#d97706','#db2777','#0891b2','#65a30d'];

function SettingsPanel({ onClose, myUser }) {
  const [emoji, setEmoji] = useState(myUser?.avatarEmoji || '🧑');
  const [color, setColor] = useState(myUser?.avatarColor || '#7c3aed');
  const showToast = useCosmosStore((s) => s.showToast);

  const apply = () => {
    const store = useCosmosStore.getState();
    if (store.myUser) {
      store.setMyUser({ ...store.myUser, avatarEmoji: emoji, avatarColor: color });
      getSocket().emit('update_avatar', { avatarEmoji: emoji, avatarColor: color });
      showToast('✅ Avatar updated!');
    }
    onClose();
  };

  return (
    <div style={{
      position: 'absolute', bottom: '70px', right: '14px', zIndex: 60, width: '270px',
      background: 'rgba(18,18,36,0.98)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(124,58,237,0.25)', borderRadius: '18px',
      padding: '16px', boxShadow: '0 -4px 30px rgba(0,0,0,0.4)',
      animation: 'slideUp 0.2s ease forwards',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9' }}>⚙️ Settings</span>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer',
          color: '#94a3b8', fontSize: '13px', width: '24px', height: '24px',
          borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>
      </div>

      {/* Preview */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
        borderRadius: '12px', background: 'rgba(30,30,53,0.6)',
        border: '1px solid rgba(124,58,237,0.15)', marginBottom: '14px',
      }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: `${color}28`, border: `2px solid ${color}55`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
        }}>{emoji}</div>
        <div>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#f1f5f9' }}>{myUser?.username}</p>
          <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Preview</p>
        </div>
      </div>

      {/* Avatar picker */}
      <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.06em' }}>AVATAR</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '14px' }}>
        {EMOJI_OPTIONS.map((e) => (
          <button key={e} onClick={() => setEmoji(e)} style={{
            padding: '8px 4px', borderRadius: '10px', fontSize: '20px', cursor: 'pointer',
            background: emoji === e ? `${color}28` : 'rgba(255,255,255,0.05)',
            border: `2px solid ${emoji === e ? color : 'transparent'}`,
            transform: emoji === e ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.12s',
          }}>{e}</button>
        ))}
      </div>

      {/* Color picker */}
      <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.06em' }}>COLOR</p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {COLOR_OPTIONS.map((c) => (
          <button key={c} onClick={() => setColor(c)} style={{
            width: '28px', height: '28px', borderRadius: '50%', background: c,
            border: color === c ? '2px solid white' : '2px solid transparent',
            outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: '1px',
            cursor: 'pointer', transform: color === c ? 'scale(1.18)' : 'scale(1)', transition: 'all 0.12s',
          }} />
        ))}
      </div>

      <button onClick={apply} style={{
        width: '100%', padding: '10px', borderRadius: '12px', cursor: 'pointer',
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        color: '#fff', fontWeight: 700, fontSize: '13px', border: 'none',
        boxShadow: `0 4px 16px ${color}44`,
      }}>Save Changes</button>
    </div>
  );
}
