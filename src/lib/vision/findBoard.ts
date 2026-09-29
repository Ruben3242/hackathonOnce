export type BoardRect = {
  left: number;
  top: number;
  size: number;
  score: number;
};

function cellMean(
  gray: Uint8Array,
  w: number,
  left: number,
  top: number,
  size: number,
  file: number,
  rank: number,
): number {
  const cell = size / 8;
  const x0 = Math.floor(left + file * cell);
  const y0 = Math.floor(top + rank * cell);
  const x1 = Math.floor(left + (file + 1) * cell);
  const y1 = Math.floor(top + (rank + 1) * cell);
  let sum = 0;
  let n = 0;
  const step = Math.max(1, Math.floor((x1 - x0) / 4));
  for (let y = y0; y < y1; y += step) {
    const row = y * w;
    for (let x = x0; x < x1; x += step) {
      sum += gray[row + x];
      n += 1;
    }
  }
  return n ? sum / n : 0;
}

export function checkerboardScore(
  gray: Uint8Array,
  w: number,
  left: number,
  top: number,
  size: number,
): number {
  if (size < 32) return -1;
  const means: number[] = [];
  let even = 0;
  let odd = 0;
  let evenN = 0;
  let oddN = 0;
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const m = cellMean(gray, w, left, top, size, file, rank);
      means.push(m);
      if ((file + rank) % 2 === 0) {
        even += m;
        evenN += 1;
      } else {
        odd += m;
        oddN += 1;
      }
    }
  }
  const polarity = Math.abs(even / evenN - odd / oddN);
  let edges = 0;
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const i = rank * 8 + file;
      if (file < 7) edges += Math.abs(means[i] - means[i + 1]);
      if (rank < 7) edges += Math.abs(means[i] - means[i + 8]);
    }
  }
  return polarity * 8 + edges / 112;
}

export function findBoardRect(gray: Uint8Array, w: number, h: number): BoardRect {
  const minSide = Math.min(w, h);
  const centerLeft = Math.floor((w - minSide) / 2);
  const centerTop = Math.floor((h - minSide) / 2);
  let best: BoardRect = {
    left: centerLeft,
    top: centerTop,
    size: minSide,
    score: checkerboardScore(gray, w, centerLeft, centerTop, minSide),
  };

  const scales = [1, 0.92, 0.84, 0.76, 0.68, 0.58, 0.48, 0.4];
  for (const sc of scales) {
    const size = Math.max(40, Math.floor(minSide * sc));
    const maxX = w - size;
    const maxY = h - size;
    const steps = sc >= 0.9 ? 2 : 4;
    const stepX = Math.max(6, Math.ceil(maxX / steps) || 6);
    const stepY = Math.max(6, Math.ceil(maxY / steps) || 6);
    for (let y = 0; y <= maxY; y += stepY) {
      for (let x = 0; x <= maxX; x += stepX) {
        const score = checkerboardScore(gray, w, x, y, size);
        if (score > best.score) best = { left: x, top: y, size, score };
      }
    }
  }
  return best;
}
