# QA report

Run on Apple M3 Pro, Chrome (stable), Playwright 1.63, WebGL through SwiftShader. Last full run: 19 e2e passed, 10 unit/API tests passed.

| Matrix row | Covered by | Result |
|---|---|---|
| Intro: first load, skip, reduced motion | demo walk, "reduced motion" test | pass |
| Input: click, keyboard | modality rail, "keyboard-only" nav test (waits for HUD first) | pass |
| Input: range (comparison lens) | "comparison lens actually moves the split", "out-of-range clamps natively" | pass |
| Input: empty/invalid | idempotent notes POST tested in `apps/api/test/api.test.ts` | pass |
| Painting actually re-renders per modality, not just the label | pixel-sample check | pass |
| Comparison lens actually moves the pixel split, not just the slider value | pixel-sample check | pass |
| Responsive | 375 px: readout and region list stay usable in the no-top-bar layout | pass (one size) |
| Motion: reduced | static keyframe list, no GSAP timeline mounted | pass |
| Graphics: success | all WebGL e2e tests | pass |
| Graphics: failure | `?gfx=off` swaps to the poster with zero canvas elements | pass |
| Graphics: slow GPU | SwiftShader median frame 16.7 ms | pass as a bound |
| Visual regression | 7 modalities against the poster fallback | pass |
| Performance | `tests/e2e/performance.spec.ts` | pass |

**A real test-design bug found and fixed**: the first pixel-sample test for modality switching sampled the exact viewport center, which happened to land precisely on the comparison lens's default 50% boundary, where the "restored" (mode-independent) half of the shader always renders regardless of the active modality. The two samples were identical not because the modality switch failed, but because the test was accidentally sampling the one region guaranteed not to show it. Fixed by forcing the lens fully open (`lens=1`) for that specific test so the sampled pixel is always on the mode-dependent side.
