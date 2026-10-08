# Storyboard

| t (wall-clock s) | Frame | Shared element forward |
|---|---|---|
| 0.0 | Pitch black, caption "A painting, slowly, in candle-like light" | the same `Painting` mesh used post-intro, at `normal` mode |
| 2.2-5.4 | `live.zoom` animates 0 to 1: the camera moves extremely close, caption "Closer, until the canvas fibers resolve" | the same camera |
| 5.4 | Caption: "Through varnish, paint, ground, canvas" | - |
| 7.4 | `state.t` jumps to `uv` (2), caption "Switching to UV" | the same `Painting` shader |
| 9.4 | `state.t` jumps to `infrared` (3), caption "Then infrared" | the same shader |
| 11.0 | Caption: "The underdrawing appears" | - |
| 12.6 | `state.t` jumps to `reconstruction` (6), caption "A missing region reconstructs" | the same shader, the same damage-region data |
| 14.6 | Light mask expands, revealing the conservation frame at `normal` mode | the same `--mask` mechanism as every blueprint in this volume |

**Reduced motion** replaces the above with three static captioned frames (Surface, Imaging, Laboratory).
