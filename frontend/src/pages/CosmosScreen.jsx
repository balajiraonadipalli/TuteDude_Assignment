import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCosmosStore } from '../store/cosmosStore';
import CosmosCanvas from '../components/CosmosCanvas';
import TopBar from '../components/TopBar';
import PortraitCards from '../components/PortraitCards';
import ChatPanel from '../components/ChatPanel';
import BottomToolbar from '../components/BottomToolbar';
import { useKeyboardMovement } from '../hooks/useKeyboardMovement';
import { useSocketEvents } from '../hooks/useSocketEvents';

export default function CosmosScreen() {
  const myUser = useCosmosStore((s) => s.myUser);
  const navigate = useNavigate();

  // Redirect to join if no user
  useEffect(() => {
    if (!myUser) navigate('/');
  }, [myUser, navigate]);

  // Enable keyboard movement
  useKeyboardMovement(!!myUser);

  // Register persistent socket handlers (chat, moves, proximity)
  useSocketEvents();

  if (!myUser) return null;

  return (
    <div className="w-full h-full relative flex flex-col overflow-hidden">
      {/* Canvas fills everything */}
      <div className="absolute inset-0">
        <CosmosCanvas />
      </div>

      {/* UI overlays */}
      <TopBar />
      <PortraitCards />
      <ChatPanel />
      <BottomToolbar />

      {/* WASD hint (fades after 5s via CSS) */}
      <WASDHint />
    </div>
  );
}

function WASDHint() {
  return (
    <div
      className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl text-xs text-center pointer-events-none"
      style={{
        background: 'rgba(15,15,26,0.8)',
        border: '1px solid rgba(124,58,237,0.2)',
        color: '#64748b',
        animation: 'fadeIn 0.5s ease 0.5s forwards, fadeIn 0.5s ease 5s reverse forwards',
      }}
    >
      Use <kbd className="px-1.5 py-0.5 rounded font-mono text-xs" style={{ background: 'rgba(124,58,237,0.2)', color: '#a855f7' }}>WASD</kbd> or arrow keys to move •
      Move close to others to chat
    </div>
  );
}
