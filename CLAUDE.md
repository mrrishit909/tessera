# TESSERA

Digital art conservation, restoration and provenance laboratory (blueprint 09, Advanced Engineering Build Book Vol. VIII). Old-master materiality meets conservation science. The public site is static; the Blender asset is scripted.

- Build the asset: `npm run model` (needs Blender 4.5 at ~/Applications). Then `node scripts/copy-assets.ts`.
- Data: `npm run seed` (deterministic, synthetic). Tests: `npm test` (domain + API), `npm run e2e` after `npm run build`.
- Each chapter changes imaging modality: normal, raking light, UV, infrared, X-ray, microscopic, reconstruction. A comparison lens (slider, not drag, documented simplification) reveals current vs restored.
- Multi-agent is the DEVELOPMENT process (see .claude/agents); the product contains no agents.
- Everything in the UI is a synthetic painting and damage model. Do not present it as a real conservation record.
