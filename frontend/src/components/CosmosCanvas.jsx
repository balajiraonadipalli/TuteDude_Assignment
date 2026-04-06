import { useEffect, useRef } from 'react';
import { useCosmosStore } from '../store/cosmosStore';
import {
  MAP_DATA, TILE, TILE_SIZE, MAP_COLS, MAP_ROWS,
  MAP_WIDTH, MAP_HEIGHT, ROOMS,
} from '../map/officeMap';

const PROXIMITY_RADIUS = 200;
const AVATAR_RADIUS = 20;

// Tile colors (CSS hex strings)
const TILE_COLORS = {
  [TILE.FLOOR]:     '#f5e6c8',
  [TILE.WALL]:      '#8b5e3c',
  [TILE.WALL_DARK]: '#5a3e28',
  [TILE.DESK]:      '#c4a265',
  [TILE.CHAIR]:     '#6b8e6b',
  [TILE.PLANT]:     '#3d7a3d',
  [TILE.EMPTY]:     '#0f0f1a',
  [TILE.DOOR]:      '#e8c87a',
};

const FLOOR_A = '#eedad8';
const FLOOR_B = '#f0dfc4';

export default function CosmosCanvas() {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  // Initialize camera at spawn center (row 9, col 9 area) so the map center is visible immediately
  const SPAWN_X = 9 * 48 + 24; // ~456
  const SPAWN_Y = 9 * 48 + 24;
  const cameraRef = useRef({ x: SPAWN_X, y: SPAWN_Y });
  // Interpolated positions for smooth rendering
  const renderPosRef = useRef({}); // id -> { x, y }
  const myRenderRef  = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Size canvas to window
    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Pre-draw the static tile map onto an offscreen canvas (optimization)
    const offscreen = document.createElement('canvas');
    offscreen.width  = MAP_WIDTH;
    offscreen.height = MAP_HEIGHT;
    const offCtx = offscreen.getContext('2d');
    drawMapOffscreen(offCtx);

    // ── Main render loop ────────────────────────────────────────────────────
    function loop() {
      const state  = useCosmosStore.getState();
      const myUser = state.myUser;
      const others = state.otherUsers;
      const nearby = state.nearbyUsers;

      const W = canvas.width;
      const H = canvas.height;

      // Camera: center on my avatar (lerp for smoothness)
      if (myUser) {
        const targetCamX = myUser.position.x - W / 2;
        const targetCamY = myUser.position.y - H / 2;
        cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.12;
        cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.12;
      }

      // Clamp camera to world bounds (handle case where map < viewport)
      const maxCamX = Math.max(0, MAP_WIDTH  - W);
      const maxCamY = Math.max(0, MAP_HEIGHT - H);
      cameraRef.current.x = Math.max(0, Math.min(maxCamX, cameraRef.current.x));
      cameraRef.current.y = Math.max(0, Math.min(maxCamY, cameraRef.current.y));

      const camX = Math.round(cameraRef.current.x);
      const camY = Math.round(cameraRef.current.y);

      // Clear
      ctx.fillStyle = '#0f0f1a';
      ctx.fillRect(0, 0, W, H);

      // Draw tile map (from offscreen canvas)
      ctx.drawImage(offscreen, -camX, -camY);

      // Draw room labels
      drawRoomLabels(ctx, camX, camY);

      // Lerp & draw other avatars
      for (const [id, user] of others) {
        if (!renderPosRef.current[id]) {
          renderPosRef.current[id] = { ...user.position };
        }
        const rp = renderPosRef.current[id];
        rp.x += (user.position.x - rp.x) * 0.18;
        rp.y += (user.position.y - rp.y) * 0.18;

        const isNear = nearby.some((u) => u.id === id);
        drawAvatar(ctx, rp.x - camX, rp.y - camY, user, false, isNear);
      }

      // Clean up render positions for disconnected users
      for (const id of Object.keys(renderPosRef.current)) {
        if (!others.has(id)) delete renderPosRef.current[id];
      }

      // Lerp & draw my avatar
      if (myUser) {
        if (!myRenderRef.current) {
          myRenderRef.current = { ...myUser.position };
        }
        myRenderRef.current.x += (myUser.position.x - myRenderRef.current.x) * 0.25;
        myRenderRef.current.y += (myUser.position.y - myRenderRef.current.y) * 0.25;

        // Proximity radius ring
        const rx = myRenderRef.current.x - camX;
        const ry = myRenderRef.current.y - camY;
        const pulse = 0.15 + 0.05 * Math.sin(Date.now() / 300);
        ctx.beginPath();
        ctx.arc(rx, ry, PROXIMITY_RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(124,58,237,${pulse})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        drawAvatar(ctx, rx, ry, myUser, true, false);
      }

      // Nearby group box
      if (nearby.length > 0 && myUser) {
        drawNearbyBox(ctx, nearby, others, myUser, camX, camY);
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="cosmos-canvas"
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        cursor: 'default',
      }}
    />
  );
}

// ── Draw tile map onto offscreen canvas ──────────────────────────────────────
function drawMapOffscreen(ctx) {
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      const tile = MAP_DATA[row][col];
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;

      // Base fill
      ctx.fillStyle = TILE_COLORS[tile] ?? TILE_COLORS[TILE.FLOOR];
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

      if (tile === TILE.FLOOR || tile === TILE.DOOR) {
        // Checkerboard floor
        ctx.fillStyle = (row + col) % 2 === 0 ? FLOOR_A : FLOOR_B;
        ctx.fillRect(x, y, TILE_SIZE - 1, TILE_SIZE - 1);
      }

      if (tile === TILE.WALL || tile === TILE.WALL_DARK) {
        // Top highlight
        ctx.fillStyle = 'rgba(255,200,140,0.35)';
        ctx.fillRect(x, y, TILE_SIZE, 4);
        // Right shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x + TILE_SIZE - 3, y, 3, TILE_SIZE);
      }

      if (tile === TILE.DESK) {
        ctx.fillStyle = '#deb887';
        ctx.fillRect(x + 3, y + 3, TILE_SIZE - 6, TILE_SIZE - 6);
        ctx.fillStyle = '#c8a265';
        ctx.fillRect(x + 7, y + 7, TILE_SIZE - 14, TILE_SIZE - 14);
        // Laptop hint
        ctx.fillStyle = '#4a4a6a';
        ctx.fillRect(x + 10, y + 10, 20, 14);
        ctx.fillStyle = '#6a6aaa';
        ctx.fillRect(x + 11, y + 11, 18, 12);
      }

      if (tile === TILE.CHAIR) {
        ctx.fillStyle = '#4a6a4a';
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#6a9a6a';
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      if (tile === TILE.PLANT) {
        // Pot
        ctx.fillStyle = '#b87333';
        ctx.fillRect(x + 14, y + 30, 20, 14);
        // Leaves
        ctx.fillStyle = '#2d8a2d';
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE / 2, y + 20, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3aa83a';
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE / 2 - 9, y + 26, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE / 2 + 9, y + 26, 9, 0, Math.PI * 2);
        ctx.fill();
      }

      if (tile === TILE.DOOR) {
        ctx.fillStyle = '#d4a015';
        ctx.fillRect(x + 8, y + 4, TILE_SIZE - 16, TILE_SIZE - 8);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(x + TILE_SIZE - 15, y + TILE_SIZE / 2 - 4, 4, 8);
      }
    }
  }

  // Partition walls – inner dividers (draw borders on top)
  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      const tile = MAP_DATA[row][col];
      if (tile === TILE.WALL_DARK) {
        ctx.strokeStyle = 'rgba(100,60,30,0.7)';
        ctx.lineWidth = 1;
        ctx.strokeRect(col * TILE_SIZE + 0.5, row * TILE_SIZE + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
      }
    }
  }
}

// ── Draw room labels ──────────────────────────────────────────────────────────
const labeledSet = new Set();
function drawRoomLabels(ctx, camX, camY) {
  labeledSet.clear();
  for (const room of ROOMS) {
    const key = room.label + room.y;
    if (labeledSet.has(key)) continue;
    labeledSet.add(key);

    const cx = (room.x + room.w / 2) * TILE_SIZE - camX;
    const cy = (room.y + room.h + 0.5) * TILE_SIZE - camY;

    // Pill background
    ctx.fillStyle = 'rgba(30,30,53,0.88)';
    roundRect(ctx, cx - 44, cy - 12, 88, 24, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(124,58,237,0.7)';
    ctx.lineWidth = 1;
    roundRect(ctx, cx - 44, cy - 12, 88, 24, 8);
    ctx.stroke();

    // Icon + label text
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#d4c5f9';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`💬 ${room.label}`, cx, cy);
  }
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// ── Draw avatar ───────────────────────────────────────────────────────────────
function drawAvatar(ctx, x, y, user, isSelf, isNear) {
  const color   = user.avatarColor || '#7c3aed';
  const emoji   = user.avatarEmoji || '🧑';
  const name    = user.username || 'User';

  // Connection glow
  if (isNear) {
    ctx.beginPath();
    ctx.arc(x, y, AVATAR_RADIUS + 10, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(16,185,129,0.2)';
    ctx.fill();
  }

  // Shadow
  ctx.beginPath();
  ctx.ellipse(x, y + AVATAR_RADIUS + 3, AVATAR_RADIUS - 4, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fill();

  // Body circle
  ctx.beginPath();
  ctx.arc(x, y, AVATAR_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Highlight
  ctx.beginPath();
  ctx.arc(x - 6, y - 6, 7, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fill();

  // Border
  ctx.beginPath();
  ctx.arc(x, y, AVATAR_RADIUS, 0, Math.PI * 2);
  ctx.strokeStyle = isSelf ? '#10b981' : 'rgba(255,255,255,0.8)';
  ctx.lineWidth = isSelf ? 3 : 2;
  ctx.stroke();

  // Emoji
  ctx.font = `${AVATAR_RADIUS}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, x, y + 1);

  // Name label
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const nameW = ctx.measureText(name).width + 10;

  // Name pill bg
  ctx.fillStyle = 'rgba(15,15,26,0.75)';
  roundRect(ctx, x - nameW / 2, y + AVATAR_RADIUS + 5, nameW, 16, 5);
  ctx.fill();

  ctx.fillStyle = isSelf ? '#10b981' : '#ffffff';
  ctx.fillText(name, x, y + AVATAR_RADIUS + 8);

  // (You) tag
  if (isSelf) {
    ctx.font = '9px Inter, sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText('(You)', x, y + AVATAR_RADIUS + 24);
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// ── Draw nearby group highlight box ──────────────────────────────────────────
function drawNearbyBox(ctx, nearbyUsers, otherUsers, myUser, camX, camY) {
  const positions = [myUser.position];
  for (const nu of nearbyUsers) {
    const ou = otherUsers.get(nu.id);
    if (ou) positions.push(ou.position);
  }
  if (positions.length < 2) return;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of positions) {
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
  }

  const pad = 55;
  const bx = minX - camX - pad;
  const by = minY - camY - pad;
  const bw = (maxX - minX) + pad * 2;
  const bh = (maxY - minY) + pad * 2;

  ctx.fillStyle = 'rgba(124,58,237,0.07)';
  roundRect(ctx, bx, by, bw, bh, 16);
  ctx.fill();

  ctx.strokeStyle = 'rgba(168,85,247,0.5)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, bx, by, bw, bh, 16);
  ctx.stroke();
}

// ── Utility: rounded rect path ────────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
