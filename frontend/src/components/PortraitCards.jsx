import { useCosmosStore } from '../store/cosmosStore';

export default function PortraitCards() {
  const myUser           = useCosmosStore((s) => s.myUser);
  const nearbyUsers      = useCosmosStore((s) => s.nearbyUsers);
  const openChat         = useCosmosStore((s) => s.openChat);
  const activeChatUserId = useCosmosStore((s) => s.activeChatUserId);

  if (!myUser) return null;

  const all = [{ ...myUser, isSelf: true }, ...nearbyUsers];

  return (
    <div style={{
      position: 'absolute', top: '60px', left: '12px',
      zIndex: 40, display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      {all.map((user) => (
        <PortraitCard
          key={user.id}
          user={user}
          isSelf={user.isSelf}
          isActive={activeChatUserId === user.id}
          onClick={() => !user.isSelf && openChat(user.id)}
        />
      ))}
    </div>
  );
}

function PortraitCard({ user, isSelf, isActive, onClick }) {
  const borderColor = isSelf
    ? '#10b981'
    : isActive
    ? '#7c3aed'
    : 'rgba(124,58,237,0.3)';

  return (
    <div
      onClick={onClick}
      title={isSelf ? 'You' : `Chat with ${user.username}`}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '5px', padding: '8px 6px', width: '68px',
        borderRadius: '14px', cursor: isSelf ? 'default' : 'pointer',
        background: isActive ? 'rgba(124,58,237,0.18)' : 'rgba(13,13,26,0.92)',
        border: `1.5px solid ${borderColor}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: 'all 0.15s',
        boxShadow: isActive ? `0 0 14px rgba(124,58,237,0.25)` : 'none',
      }}
    >
      {/* Avatar */}
      <div style={{
        position: 'relative',
        width: '44px', height: '44px', borderRadius: '12px',
        background: `${user.avatarColor || '#7c3aed'}28`,
        border: `2px solid ${user.avatarColor || '#7c3aed'}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '22px',
      }}>
        {user.avatarEmoji || '🧑'}
        {/* Status dot */}
        <div style={{
          position: 'absolute', bottom: '-1px', right: '-1px',
          width: '11px', height: '11px', borderRadius: '50%',
          background: isSelf ? '#10b981' : '#f59e0b',
          border: '2px solid #0d0d1a',
        }} />
      </div>

      {/* Name */}
      <span style={{
        fontSize: '10px', fontWeight: 600, textAlign: 'center',
        color: isSelf ? '#10b981' : '#e2e8f0',
        maxWidth: '56px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        lineHeight: 1,
      }}>
        {isSelf ? 'You' : user.username}
      </span>

      {/* Nearby badge */}
      {!isSelf && (
        <span style={{
          padding: '2px 5px', borderRadius: '6px',
          background: 'rgba(16,185,129,0.15)',
          color: '#34d399', fontSize: '9px', fontWeight: 700,
          letterSpacing: '0.02em',
        }}>
          nearby
        </span>
      )}
    </div>
  );
}
