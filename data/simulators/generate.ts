// Synthetic TESSERA damage regions and conservation log. Deterministic. Not a real painting record.
import { mkdirSync, writeFileSync } from "node:fs";
import { mulberry32 } from "../../packages/domain/src/index.ts";
import type { DamageRegion, LogEntry } from "../../packages/schemas/src/index.ts";

const r = mulberry32(909);
const names = ["Craquelure cluster", "Varnish discoloration", "Flaking loss", "Overpaint patch", "Tear repair"];
const regions: DamageRegion[] = Array.from({ length: 5 }, (_, i) => ({
  id: `region-${i + 1}`, name: names[i],
  x: 0.2 + r() * 0.6, y: 0.2 + r() * 0.6, radius: 0.06 + r() * 0.08,
  severity: Math.round((0.3 + r() * 0.65) * 100) / 100, confidencePct: Math.round(55 + r() * 40),
}));
const log: LogEntry[] = [
  { id: "log-1", mode: "normal", text: "Baseline photography under even gallery lighting." },
  { id: "log-2", mode: "raking-light", text: "Grazing light reveals surface topology and craquelure." },
  { id: "log-3", mode: "uv", text: "UV fluorescence shows a later varnish layer and retouching." },
  { id: "log-4", mode: "infrared", text: "IR reflectography reveals the underdrawing beneath the paint." },
  { id: "log-5", mode: "xray", text: "X-radiography shows density changes, including a hidden pentimento." },
  { id: "log-6", mode: "microscopic", text: "Microscopy confirms pigment layering at the loss site." },
  { id: "log-7", mode: "reconstruction", text: "A digital reconstruction fills the loss using the surrounding pattern." },
];
mkdirSync(new URL("../generated", import.meta.url), { recursive: true });
const out = (n: string, v: unknown) => writeFileSync(new URL(`../generated/${n}.json`, import.meta.url), JSON.stringify(v));
out("regions", regions); out("log", log);
console.log(`TESSERA seeded: ${regions.length} damage regions, ${log.length} log entries`);
