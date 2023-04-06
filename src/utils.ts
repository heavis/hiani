export function assert(condition: any, err: string) {
    if (!condition) {
        throw new Error(err);
    }
}

export function lli4(p1: [number, number], p2: [number, number], p3: [number, number], p4: [number, number]) {
    const x1 = p1[0],
      y1 = p1[1],
      x2 = p2[0],
      y2 = p2[1],
      x3 = p3[0],
      y3 = p3[1],
      x4 = p4[0],
      y4 = p4[1];
    return lli8(x1, y1, x2, y2, x3, y3, x4, y4);
}

export function lli8(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
    const nx =
        (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
      ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
      d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (d == 0) {
      return false;
    }
    return { x: nx / d, y: ny / d };
}