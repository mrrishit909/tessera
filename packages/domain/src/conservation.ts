// TESSERA: a deterministic synthetic damage/restoration model. Not a real conservation assessment.
import { MODES, type DamageRegion, type Mode } from "@tessera/schemas";
import { mulberry32 } from "./rng.ts";

export function modeAt(t: number): Mode {
  return MODES[Math.max(0, Math.min(MODES.length - 1, Math.round(t)))];
}
/** Craquelure density (0..1) at a normalized point (x,y in 0..1): deterministic value noise, higher near the canvas edges where old paint flexes most. */
const N = 16, L = (() => { const r = mulberry32(909); return Float64Array.from({ length: N * N }, () => r()); })();
const sm = (t: number) => t * t * (3 - 2 * t);
function noise(x: number, y: number) {
  const xi = Math.floor(x), yi = Math.floor(y), fx = sm(x - xi), fy = sm(y - yi);
  const g = (i: number, j: number) => L[(((j % N) + N) % N) * N + (((i % N) + N) % N)];
  const a = g(xi, yi) + (g(xi + 1, yi) - g(xi, yi)) * fx, b = g(xi, yi + 1) + (g(xi + 1, yi + 1) - g(xi, yi + 1)) * fx;
  return a + (b - a) * fy;
}
export function craquelureDensityAt(x: number, y: number): number {
  const edge = Math.min(x, 1 - x, y, 1 - y);
  return Math.min(1, noise(x * 6, y * 6) * 0.6 + Math.max(0, 0.25 - edge) * 1.8);
}
/** Damage score (0..1) at a point: 1 inside a damage region's radius, falling off smoothly to its edge, 0 elsewhere (max across all regions). */
export function damageScoreAt(x: number, y: number, regions: DamageRegion[]): number {
  let best = 0;
  for (const r of regions) {
    const d = Math.hypot(x - r.x, y - r.y);
    const score = r.severity * Math.max(0, 1 - d / r.radius);
    if (score > best) best = score;
  }
  return best;
}
/** A toy estimated-century range from craquelure density (denser network reads as older in this synthetic model). */
export function estimatedCenturyRange(meanDensity: number): string {
  if (meanDensity < 0.2) return "20th century";
  if (meanDensity < 0.4) return "18th-19th century";
  if (meanDensity < 0.6) return "17th-18th century";
  return "15th-16th century";
}
