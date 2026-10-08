# Architecture

```
model/build.py ──Blender──> source.blend + exports/{frame,easel}.glb + renders/poster.png
model/validate.py ─fresh-scene re-import─> exports/validation.json
data/simulators/generate.ts ──> data/generated/{regions,log}.json (seeded, synthetic)
        │                              │
scripts/copy-assets.ts ──────────> apps/web/public/{data,models,posters}
                                       │
apps/web (Next.js 16 static export) ───┘      apps/api (node:http + ws) serves the same JSON on the book's /v1 contract
   App ─ store (external, useSyncExternalStore) ─ Panels (labels in the conservation frame, no top bar) + Scene (R3F canvas) + Intro (GSAP)
packages/domain: conservation (deterministic craquelure field, damage score, a toy century estimate) - pure, tested
packages/schemas: shared types + runtime validators
```

**Every imaging modality is one shader, branching on an integer uniform.** `normal`, `raking-light`, `uv`, `infrared`, `xray`, `microscopic` and `reconstruction` are all computed analytically in `paintingFrag` from the same UV coordinates; there is no scanned painting texture anywhere, which is also why the "painting" is a procedural generative still life rather than a specific artwork.

**No top bar; labels live in the conservation frame**, per the book's explicit brief. The brand mark and pause toggle sit in the corners, the modality rail runs down the left edge, the readout and comparison lens run down the right edge, and the damage-region list and log sit along the bottom, all absolutely positioned directly over the canvas rather than inside a bordered panel component (there is no `.panel` class in this blueprint, the third in the volume after LUCENT to drop it).

**The comparison lens is a slider, not a drag gesture.** The book calls for "a draggable comparison lens"; this slice implements the same effect (a hard split between the current and restored states) with a range input instead of pointer-drag interaction, documented here as a deliberate simplification for testability, not a silent omission.

**WebGPU.** Ships WebGL2, same reasoning as the rest of the volume.

**Stack substitutions.** The book names a high-resolution texture pipeline, image pyramids/tiles, and PostgreSQL/object storage. None are used: there is no real scanned image to pyramid-tile, and the generated dataset (5 damage regions, 7 log entries) is small enough that JSON files replace a database, same as every other blueprint in this volume.

**Budgets** (asserted in `tests/e2e/performance.spec.ts`): frame GLB < 15 KB, easel GLB < 15 KB, gzipped JS < 750 KB, draw calls < 40, triangles < 30,000.

**Not built.** A real scanned-painting texture pipeline, image pyramids/tiles, PostgreSQL/object storage, true pointer-drag for the comparison lens, auth.
