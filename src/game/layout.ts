import { layout } from "../theme";

export interface BoardSize {
  width: number;
  height: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface BoardLayout {
  templateRowY: number;
  productRowY: number;
  trayRowY: number;
  slotPositions: Vec2[];
  trayPositions: Vec2[];
  templatePositions: Vec2[];
  tileSize: number;
}

export const computeBoardLayout = (
  size: BoardSize,
  slotCount: number,
  trayCount: number,
  options: { compact?: boolean } = {}
): BoardLayout => {
  const padding = 32;
  const usableWidth = size.width - padding * 2;
  const tileSize = Math.min(
    layout.tileSize,
    Math.floor(usableWidth / Math.max(slotCount, trayCount) - 14)
  );

  const slotSpan = Math.min(usableWidth, slotCount * (tileSize + 18));
  const slotStartX = (size.width - slotSpan) / 2 + (tileSize + 18) / 2;

  const traySpan = Math.min(usableWidth, trayCount * (tileSize + 18));
  const trayStartX = (size.width - traySpan) / 2 + (tileSize + 18) / 2;

  const top = options.compact ? 28 : 56;
  const templateRowY = top;
  const productRowY = templateRowY + tileSize + (options.compact ? 28 : 48);
  const trayRowY = size.height - tileSize - 36;

  const slotPositions: Vec2[] = [];
  const templatePositions: Vec2[] = [];
  const trayPositions: Vec2[] = [];

  for (let i = 0; i < slotCount; i++) {
    const x = slotStartX + i * (tileSize + 18) - tileSize / 2;
    slotPositions.push({ x, y: productRowY });
    templatePositions.push({ x, y: templateRowY });
  }
  for (let i = 0; i < trayCount; i++) {
    const x = trayStartX + i * (tileSize + 18) - tileSize / 2;
    trayPositions.push({ x, y: trayRowY });
  }

  return {
    templateRowY,
    productRowY,
    trayRowY,
    slotPositions,
    templatePositions,
    trayPositions,
    tileSize,
  };
};

export const distanceTo = (a: Vec2, b: Vec2): number =>
  Math.hypot(a.x - b.x, a.y - b.y);

export const findClosestSlot = (
  point: Vec2,
  slots: Vec2[],
  threshold: number
): number | null => {
  let bestIdx: number | null = null;
  let bestDist = Infinity;
  for (let i = 0; i < slots.length; i++) {
    const d = distanceTo(point, slots[i]);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  if (bestIdx !== null && bestDist <= threshold) {
    return bestIdx;
  }
  return null;
};
