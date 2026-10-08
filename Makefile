# TESSERA: ports web 8811, API 8810, Postgres 55630 (reserved for the PostGIS build, not used by the demo).
.PHONY: dev model seed test e2e build serve perf
model:  ; npm run model
seed:   ; node data/simulators/generate.ts
test:   ; npx vitest run
build:  ; node scripts/copy-assets.ts && NEXT_PUBLIC_BASE_PATH= npm run build -w @tessera/web
serve:  ; node scripts/serve.ts 8811
e2e: build ; npx playwright test
perf:   ; node scripts/measure.mjs
dev:    ; node scripts/copy-assets.ts && npm run dev -w @tessera/web & node apps/api/src/server.ts
