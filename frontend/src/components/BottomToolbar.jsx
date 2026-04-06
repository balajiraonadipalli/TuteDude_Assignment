import { useCosmosStore } from '../store/cosmosStore';

const TOOLS = [
  { icon: '🔗', label: 'Share' },
  { icon: '👋', label: 'Invite' },
  { icon: '⏺️', label: 'Record' },
  { icon: '🚶', label: 'Move' },
  { icon: '✋', label: 'Hand' },
  { icon: '⚡', label: 'React' },
];

export default function BottomToolbar() {
  const isChatOpen  = useCosmosStore((s) => s.isChatOpen);
  const nearbyUsers = useCosmosStore((s) => s.nearbyUsers);
  const myUser      = useCosmosStore((s) => s.myUser);

  const handleChat = () => {
    const store = useCosmosStore.getState();
    if (store.isChatOpen) {
      store.closeChat();
    } else {
      if (store.nearbyUsers.length > 0) {
        store.openChat(store.nearbyUsers[0].id);
      } else {
        store.setState({ isChatOpen: true, activeChatUserId: null });
      }
    }
  };

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50,
      height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 14px',
      background: 'rgba(13,13,26,0.96)',
      borderTop: '1px solid rgba(124,58,237,0.18)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
    }}>
      {/* ── Left tools ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {TOOLS.map((t) => (
          <ToolBtn key={t.label} icon={t.icon} label={t.label} />
        ))}
      </div>

      {/* ── Center: current room ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '5px 12px', borderRadius: '10px',
        background: 'rgba(30,30,53,0.8)',
        border: '1px solid rgba(124,58,237,0.18)',
      }}>
        <span style={{ fontSize: '12px' }}>📍</span>
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#cbd5e1' }}>
          {myUser?.currentRoom || 'Open Space'}
        </span>
      </div>

      {/* ── Right tools ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        <ToolBtn
          icon="💬"
          label="Chat"
          active={isChatOpen}
          onClick={handleChat}
          badge={nearbyUsers.length > 0 && !isChatOpen ? nearbyUsers.length : 0}
        />
        <ToolBtn icon="🧩" label="Apps" />
        <ToolBtn icon="⚙️" label="Settings" />
      </div>
    </div>
  );
}

function ToolBtn({ icon, label, active = false, onClick, badge = 0 }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '2px',
        padding: '5px 8px', borderRadius: '10px', cursor: 'pointer',
        background: active ? 'rgba(124,58,237,0.2)' : 'transparent',
        border: active ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent',
        minWidth: '44px',
      }}
    >
      <span style={{ fontSize: '17px', lineHeight: 1 }}>{icon}</span>
      <span style={{
        fontSize: '10px', lineHeight: 1,
        color: active ? '#a855f7' : '#64748b',
        fontWeight: active ? 600 : 400,
      }}>
        {label}
      </span>
      {badge > 0 && (
        <span style={{
          position: 'absolute', top: '2px', right: '2px',
          width: '16px', height: '16px', borderRadius: '50%',
          background: '#7c3aed', color: '#fff',
          fontSize: '9px', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 8px rgba(124,58,237,0.6)',
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}
