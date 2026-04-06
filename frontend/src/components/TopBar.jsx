import { useCosmosStore } from '../store/cosmosStore';

export default function TopBar() {
  const myUser      = useCosmosStore((s) => s.myUser);
  const userCount   = useCosmosStore((s) => s.userCount);
  const nearbyUsers = useCosmosStore((s) => s.nearbyUsers);
  const isConnected = useCosmosStore((s) => s.isConnected);

  return (
    <div
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50,
        height: '52px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
        background: 'rgba(13,13,26,0.95)',
        borderBottom: '1px solid rgba(124,58,237,0.18)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
    >
      {/* ── Left: Logo + Space name ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
          background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px',
        }}>
          🌌
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.01em' }}>
          Virtual Cosmos
        </span>
        <div style={{
          height: '16px', width: '1px',
          background: 'rgba(124,58,237,0.3)', margin: '0 2px',
        }} />
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          {myUser?.currentRoom || 'Open Space'}
        </span>
      </div>

      {/* ── Center: Call controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <ControlBtn label="🎤 Mute" />
        <ControlBtn label="📹 Camera" />
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '5px 12px', borderRadius: '8px',
          background: nearbyUsers.length > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${nearbyUsers.length > 0 ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)'}`,
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: nearbyUsers.length > 0 ? '#10b981' : '#6b7280',
            boxShadow: nearbyUsers.length > 0 ? '0 0 6px #10b981' : 'none',
          }} />
          <span style={{
            fontSize: '12px', fontWeight: 600,
            color: nearbyUsers.length > 0 ? '#10b981' : '#6b7280',
          }}>
            {nearbyUsers.length > 0 ? 'In Call' : 'Call'}
          </span>
        </div>
      </div>

      {/* ── Right: User info ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {myUser && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '8px',
            background: 'rgba(124,58,237,0.12)',
            border: '1px solid rgba(124,58,237,0.25)',
          }}>
            <span style={{ fontSize: '14px' }}>{myUser.avatarEmoji}</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#d4c5f9' }}>
              {myUser.username}
            </span>
          </div>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '4px 10px', borderRadius: '8px',
          background: 'rgba(30,30,53,0.8)',
          border: '1px solid rgba(124,58,237,0.2)',
        }}>
          <span style={{ fontSize: '12px' }}>👥</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>
            {userCount}
          </span>
        </div>

        {/* Connection dot */}
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: isConnected ? '#10b981' : '#ef4444',
          boxShadow: isConnected ? '0 0 7px #10b981' : '0 0 7px #ef4444',
        }} title={isConnected ? 'Connected' : 'Disconnected'} />
      </div>
    </div>
  );
}

function ControlBtn({ label }) {
  return (
    <button style={{
      display: 'flex', alignItems: 'center', gap: '4px',
      padding: '5px 10px', borderRadius: '8px', cursor: 'pointer',
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
      color: '#94a3b8', fontSize: '12px', fontFamily: 'Inter, sans-serif',
    }}>
      {label}
    </button>
  );
}
