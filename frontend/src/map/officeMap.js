// Tile types
export const TILE = {
  FLOOR: 0,
  WALL: 1,
  WALL_DARK: 2,
  DESK: 3,
  CHAIR: 4,
  PLANT: 5,
  EMPTY: 6,
  DOOR: 7,
};

export const TILE_SIZE = 48;

// 40x25 tile grid – office layout
// 0=floor, 1=outer wall, 2=inner wall/partition, 3=desk, 4=chair, 5=plant, 6=void, 7=door
export const MAP_COLS = 40;
export const MAP_ROWS = 25;

function row(...tiles) {
  return tiles;
}

// prettier-ignore
export const MAP_DATA = [
  // Row 0 – top border wall
  row(1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1),
  // Row 1
  row(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1),
  // Row 2 – Room 2 top
  row(1,0,0,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,1),
  // Row 3
  row(1,0,0,2,3,3,0,0,0,2,0,0,0,0,0,0,0,0,0,0,2,3,3,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,1),
  // Row 4
  row(1,0,0,2,4,4,0,0,0,2,0,0,0,0,0,0,0,0,0,0,2,4,4,0,0,0,0,0,2,0,0,5,0,0,0,0,0,0,0,1),
  // Row 5
  row(1,0,0,2,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,7,0,0,0,0,0,0,5,0,0,0,1),
  // Row 6 – Room 2 bottom
  row(1,0,0,2,2,2,2,7,2,2,0,0,0,0,0,0,0,0,0,0,2,2,2,2,7,2,2,2,2,0,0,0,0,0,0,0,0,0,0,1),
  // Row 7 – open floor
  row(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1),
  // Row 8
  row(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,1),
  // Row 9 – horizontal corridor divider
  row(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1),
  // Row 10
  row(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1),
  // Row 11 – Room 1 top
  row(1,0,0,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,0,1),
  // Row 12
  row(1,0,0,2,3,3,3,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,3,3,0,0,0,0,0,0,0,2,0,1),
  // Row 13
  row(1,0,0,2,4,4,4,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,2,4,4,4,0,0,0,0,0,0,0,2,0,1),
  // Row 14
  row(1,0,0,2,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,2,0,1),
  // Row 15
  row(1,0,0,2,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,2,0,1),
  // Row 16 – Room 1 bottom
  row(1,0,0,2,2,2,2,2,7,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,7,2,2,2,2,2,2,2,2,0,1),
  // Row 17
  row(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1),
  // Row 18
  row(1,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,1),
  // Row 19
  row(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1),
  // Row 20
  row(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1),
  // Row 21
  row(1,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1),
  // Row 22
  row(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,1),
  // Row 23
  row(1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1),
  // Row 24 – bottom wall
  row(1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1),
];

export const MAP_WIDTH  = MAP_COLS * TILE_SIZE; // 1920
export const MAP_HEIGHT = MAP_ROWS * TILE_SIZE; // 1200

// Named rooms – zones for labeling & proximity context
export const ROOMS = [
  { id: 'room1-left',  label: 'Room 1', x: 3,  y: 11, w: 10, h: 6 },
  { id: 'room1-right', label: 'Room 1', x: 26, y: 11, w: 12, h: 6 },
  { id: 'room2-left',  label: 'Room 2', x: 3,  y: 2,  w: 7,  h: 5 },
  { id: 'room2-right', label: 'Room 2', x: 20, y: 2,  w: 9,  h: 5 },
];

/**
 * Returns true if the pixel position (px,py) is a walkable tile
 */
export function isWalkable(px, py) {
  const col = Math.floor(px / TILE_SIZE);
  const row = Math.floor(py / TILE_SIZE);
  if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return false;
  const t = MAP_DATA[row][col];
  return t === TILE.FLOOR || t === TILE.DOOR;
}

/**
 * Get room name at pixel position
 */
export function getRoomAt(px, py) {
  const col = Math.floor(px / TILE_SIZE);
  const row = Math.floor(py / TILE_SIZE);
  for (const room of ROOMS) {
    if (col >= room.x && col < room.x + room.w && row >= room.y && row < room.y + room.h) {
      return room.label;
    }
  }
  return 'Open Space';
}
