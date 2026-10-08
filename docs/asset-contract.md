# Asset contract

## frame.glb
Root empty `Frame`. `FrameCanvas`, `FrameTop`, `FrameBottom`, `FrameLeft`, `FrameRight` share one pivot. `FrameCanvas` is a plain placeholder plane; the actual painting surface shown in the product is a separate procedural `PlaneGeometry` driven entirely by `Scene.tsx`'s modality shader, not a texture on this asset.

## easel.glb
Root empty `Easel`. `Leg` (x2), `Crossbar` share one pivot. Shown once as a static set-dressing prop behind the painting.

Both assets are procedural primitive composition from `model/build.py`. There is no scanned painting image anywhere in this project; every imaging-mode appearance is generated analytically in GLSL (see `docs/architecture.md`).
