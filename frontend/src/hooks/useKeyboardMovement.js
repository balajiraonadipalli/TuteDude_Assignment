import { useEffect, useRef } from 'react';
import { useCosmosStore } from '../store/cosmosStore';
import { getSocket } from '../socket/socket';
import { isWalkable, MAP_WIDTH, MAP_HEIGHT } from '../map/officeMap';

const SPEED = 4;
const KEYS  = new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D']);

export function useKeyboardMovement(enabled = true) {
  const pressed = useRef(new Set());
  const rafRef  = useRef(null);
  const heartbeatRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e) => {
      if (KEYS.has(e.key)) {
        pressed.current.add(e.key);
        e.preventDefault();
      }
    };
    const onKeyUp = (e) => pressed.current.delete(e.key);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);

    // ── Movement loop ──────────────────────────────────────────────────────
    const loop = () => {
      const p = pressed.current;
      if (p.size > 0) {
        const store  = useCosmosStore.getState();
        const myUser = store.myUser;
        if (!myUser) { rafRef.current = requestAnimationFrame(loop); return; }

        let { x, y } = myUser.position;
        let moved = false;

        if (p.has('ArrowUp')    || p.has('w') || p.has('W')) { y -= SPEED; moved = true; }
        if (p.has('ArrowDown')  || p.has('s') || p.has('S')) { y += SPEED; moved = true; }
        if (p.has('ArrowLeft')  || p.has('a') || p.has('A')) { x -= SPEED; moved = true; }
        if (p.has('ArrowRight') || p.has('d') || p.has('D')) { x += SPEED; moved = true; }

        if (moved) {
          const R = 20;
          x = Math.max(R, Math.min(MAP_WIDTH  - R, x));
          y = Math.max(R, Math.min(MAP_HEIGHT - R, y));

          // Axis-sliding collision detection
          if (!isWalkable(x, y)) {
            const ox = myUser.position.x;
            const oy = myUser.position.y;
            if (isWalkable(x, oy))  { y = oy; }
            else if (isWalkable(ox, y)) { x = ox; }
            else { x = ox; y = oy; }
          }

          store.updateMyPosition(x, y);
          getSocket().emit('move', { x, y });
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    // ── Proximity heartbeat ─────────────────────────────────────────────────
    // Re-emit position every 1.5s even when stationary so the server can
    // detect proximity if two users are standing still next to each other.
    heartbeatRef.current = setInterval(() => {
      const myUser = useCosmosStore.getState().myUser;
      if (myUser) {
        getSocket().emit('move', { x: myUser.position.x, y: myUser.position.y });
      }
    }, 1500);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      pressed.current.clear();
    };
  }, [enabled]);
}
