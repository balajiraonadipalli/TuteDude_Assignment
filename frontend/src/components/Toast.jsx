import { useCosmosStore } from '../store/cosmosStore';

export default function Toast() {
  const toast = useCosmosStore((s) => s.toast);

  if (!toast) return null;

  const colors = {
    success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)', text: '#34d399' },
    info:    { bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.35)', text: '#a855f7' },
    error:   { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.35)',  text: '#f87171' },
  };
  const c = colors[toast.type] || colors.success;

  return (
    <div style={{
      position: 'absolute', bottom: '78px', left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 100, pointerEvents: 'none',
      padding: '9px 18px', borderRadius: '12px',
      background: c.bg, border: `1px solid ${c.border}`,
      backdropFilter: 'blur(12px)',
      color: c.text, fontSize: '13px', fontWeight: 600,
      whiteSpace: 'nowrap',
      animation: 'toastIn 0.25s ease forwards',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    }}>
      {toast.message}
    </div>
  );
}
