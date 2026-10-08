import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { WebSocket } from "ws";
import { build } from "../src/server.ts";

const api = build(); let base = "", port = 0;
beforeAll(async () => { port = await api.listen(0); base = `http://127.0.0.1:${port}`; });
afterAll(() => api.close());
const j = async (path: string, init?: RequestInit) => { const r = await fetch(base + path, init); return { status: r.status, body: await r.json() as any }; };

describe("contract", () => {
  it("publishes regions, log and OpenAPI 3.1", async () => {
    expect((await j("/v1/regions")).body).toHaveLength(5);
    expect((await j("/v1/log")).body).toHaveLength(7);
    expect((await j("/openapi.json")).body.openapi).toBe("3.1.0");
  });
  it("filters log by mode", async () => {
    const uv = (await j("/v1/log?mode=uv")).body as any[];
    expect(uv.every((l) => l.mode === "uv")).toBe(true); expect(uv.length).toBeGreaterThan(0);
  });
});
describe("idempotent notes", () => {
  const post = (key: string | null, text: unknown, id = "log-1") => j(`/v1/log/${id}/notes`, { method: "POST", headers: { "content-type": "application/json", ...(key ? { "idempotency-key": key } : {}) }, body: JSON.stringify({ text }) });
  it("requires the key, validates text, replays safely, 404s unknown entries", async () => {
    expect((await post(null, "hi")).status).toBe(400);
    expect((await post("k1", "")).status).toBe(422);
    expect((await post("k1", "x".repeat(501))).status).toBe(422);
    expect((await post("k1", "re-examined", "nope")).status).toBe(404);
    const a = await post("k2", "re-examined"), b = await post("k2", "re-examined");
    expect(a.status).toBe(201); expect(b.status).toBe(200); expect(b.body.id).toBe(a.body.id);
  });
});
describe("inspection socket", () => {
  it("streams frames and rejects a bad path", async () => {
    const frames = await new Promise<any[]>((res) => { const got: any[] = [], ws = new WebSocket(`ws://127.0.0.1:${port}/v1/inspection/live?speed=60`); ws.on("message", (m) => { got.push(JSON.parse(String(m))); if (got.length === 3) { ws.close(); res(got); } }); });
    expect(frames.every((f) => typeof f.mode === "string")).toBe(true);
    await new Promise<void>((res) => { const ws = new WebSocket(`ws://127.0.0.1:${port}/v1/nope`); ws.on("error", () => res()); });
  });
});
