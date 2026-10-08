// TESSERA: shared types + runtime validators.
export const MODES = ["normal", "raking-light", "uv", "infrared", "xray", "microscopic", "reconstruction"] as const;
export type Mode = (typeof MODES)[number];
export type DamageRegion = { id: string; name: string; x: number; y: number; radius: number; severity: number; confidencePct: number };
export type LogEntry = { id: string; mode: Mode; text: string };

const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
export function validateDamageRegion(r: unknown): r is DamageRegion {
  const o = r as DamageRegion;
  return !!o && typeof o.id === "string" && [o.x, o.y, o.radius, o.severity, o.confidencePct].every(isNum) && o.severity >= 0 && o.severity <= 1;
}
export function validateLogEntry(r: unknown): r is LogEntry {
  const o = r as LogEntry;
  return !!o && typeof o.id === "string" && MODES.includes(o.mode) && typeof o.text === "string";
}
