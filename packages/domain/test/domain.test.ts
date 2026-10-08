import { describe, expect, it } from "vitest";
import { modeAt, craquelureDensityAt, damageScoreAt, estimatedCenturyRange, mulberry32 } from "../src/index.ts";
import { validateDamageRegion, validateLogEntry, MODES } from "@tessera/schemas";
import type { DamageRegion } from "@tessera/schemas";

describe("conservation", () => {
  it("modeAt steps through the ladder in order and clamps", () => {
    expect(MODES.map((_, i) => modeAt(i))).toEqual(MODES);
    expect(modeAt(-1)).toBe("normal"); expect(modeAt(99)).toBe("reconstruction");
  });
  it("craquelure density is deterministic and bounded", () => {
    expect(craquelureDensityAt(0.5, 0.5)).toBe(craquelureDensityAt(0.5, 0.5));
    expect(craquelureDensityAt(0.5, 0.5)).toBeGreaterThanOrEqual(0); expect(craquelureDensityAt(0.5, 0.5)).toBeLessThanOrEqual(1);
  });
  it("damage score is highest at a region's center and 0 far away", () => {
    const regions: DamageRegion[] = [{ id: "r1", name: "x", x: 0.5, y: 0.5, radius: 0.1, severity: 0.8, confidencePct: 70 }];
    expect(damageScoreAt(0.5, 0.5, regions)).toBeCloseTo(0.8);
    expect(damageScoreAt(0.9, 0.9, regions)).toBe(0);
  });
  it("estimatedCenturyRange maps low density to modern and high density to old", () => {
    expect(estimatedCenturyRange(0.05)).toBe("20th century");
    expect(estimatedCenturyRange(0.9)).toBe("15th-16th century");
  });
});
describe("schemas + rng", () => {
  it("validators reject bad records", () => {
    expect(validateDamageRegion({ id: "r1", name: "x", x: 0.5, y: 0.5, radius: 0.1, severity: 0.5, confidencePct: 70 })).toBe(true);
    expect(validateDamageRegion({ id: "r1", name: "x", x: 0.5, y: 0.5, radius: 0.1, severity: 2, confidencePct: 70 })).toBe(false);
    expect(validateLogEntry({ id: "l1", mode: "uv", text: "note" })).toBe(true);
    expect(validateLogEntry({ id: "l1", mode: "nope", text: "note" })).toBe(false);
  });
  it("rng repeats per seed", () => { const a = mulberry32(5), b = mulberry32(5); expect([a(), a()]).toEqual([b(), b()]); });
});
