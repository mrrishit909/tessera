# Performance report

Hardware: Apple M3 Pro laptop, Chrome stable, **software WebGL (SwiftShader)**, 1280 x 800. Command: `node scripts/measure.mjs` after `npm run build` and `node scripts/serve.ts`.

| Measure | Value | Budget |
|---|---|---|
| Transfer (18 requests, uncompressed local server) | 578 KB | n/a |
| JS gzipped (all chunks) | 565 KB | 750 KB |
| frame GLB / easel GLB | 7.7 KB / 7.7 KB | 15 / 15 KB |
| Draw calls / triangles / geometries | 9 / 136 / 9 | 40 / 30,000 |
| LCP | 1.9 s | none set |
| CLS | 0 | 0.1 |
| Long-task total during load | 2.1 s | none set |
| Median / p95 frame time | 16.7 / 16.8 ms (60 fps, software) | none set |

A small scene by design: the painting is one flat plane, and the whole cost of the seven imaging modalities lives in shader branching, not in extra geometry.

Degradation: frame loop pauses when the tab is hidden; `?gfx=off` and WebGL context loss swap to the poster; reduced motion removes the intro timeline and snaps the camera instead of lerping.
