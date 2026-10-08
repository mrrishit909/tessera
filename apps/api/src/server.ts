// TESSERA API: the book's section 7 contract over the generated dataset. Plain node:http + ws, no framework.
import { createServer, type IncomingMessage, type ServerResponse, type Server } from "node:http";
import { readFileSync } from "node:fs";
import { WebSocketServer } from "ws";
import { modeAt } from "../../../packages/domain/src/index.ts";
import type { DamageRegion, LogEntry } from "../../../packages/schemas/src/index.ts";

const load = <T,>(n: string) => JSON.parse(readFileSync(new URL(`../../../data/generated/${n}.json`, import.meta.url), "utf8")) as T;
export const openapi = {
  openapi: "3.1.0", info: { title: "TESSERA API", version: "1.0.0", description: "Synthetic conservation-lab demo data." },
  paths: {
    "/v1/regions": { get: { summary: "Damage regions" } }, "/v1/log": { get: { summary: "Conservation log, filter by ?mode=" } },
    "/v1/log/{id}/notes": { post: { summary: "Add a note; requires Idempotency-Key" } },
    "/v1/inspection/live": { get: { summary: "WebSocket: replays the seven-modality sequence (query speed=1..60)" } },
  },
};

export function build(opts: { port?: number } = {}) {
  const regions = load<DamageRegion[]>("regions"), log = load<LogEntry[]>("log");
  const notes = new Map<string, { id: string; logId: string; text: string }>();
  const send = (res: ServerResponse, code: number, body: unknown) => { res.writeHead(code, { "content-type": "application/json", "access-control-allow-origin": "*", "access-control-allow-headers": "content-type,idempotency-key" }); res.end(JSON.stringify(body)); };
  const err = (res: ServerResponse, code: number, message: string) => send(res, code, { error: message });
  async function body(req: IncomingMessage) { let s = ""; for await (const c of req) { s += c; if (s.length > 10_000) throw new RangeError("body too large"); } return s ? JSON.parse(s) : {}; }

  const server: Server = createServer(async (req, res) => {
    try {
      const u = new URL(req.url ?? "/", "http://x"), p = u.pathname.replace(/\/+$/, "") || "/", m = req.method ?? "GET";
      if (m === "OPTIONS") return send(res, 204, {});
      if (p === "/openapi.json") return send(res, 200, openapi);
      if (p === "/healthz") return send(res, 200, { ok: true });
      if (p === "/v1/regions" && m === "GET") return send(res, 200, regions);
      if (p === "/v1/log" && m === "GET") {
        const mode = u.searchParams.get("mode");
        return send(res, 200, mode ? log.filter((l) => l.mode === mode) : log);
      }
      let g: RegExpMatchArray | null;
      if ((g = p.match(/^\/v1\/log\/([\w-]+)\/notes$/)) && m === "POST") {
        const key = req.headers["idempotency-key"]; if (typeof key !== "string" || !key) return err(res, 400, "Idempotency-Key header required");
        if (!log.some((l) => l.id === g![1])) return err(res, 404, "no such log entry");
        const b = await body(req); if (typeof b.text !== "string" || !b.text.trim() || b.text.length > 500) return err(res, 422, "text must be 1..500 characters");
        const prior = notes.get(key); if (prior) return send(res, 200, prior);
        const note = { id: `note-${notes.size + 1}`, logId: g[1], text: b.text.trim() }; notes.set(key, note);
        return send(res, 201, note);
      }
      return err(res, 404, "not found");
    } catch (e) { return err(res, e instanceof SyntaxError || e instanceof RangeError ? 400 : 500, e instanceof Error ? e.message : "error"); }
  });

  const wss = new WebSocketServer({ noServer: true });
  server.on("upgrade", (req, socket, head) => {
    const u = new URL(req.url ?? "/", "http://x");
    if (u.pathname !== "/v1/inspection/live") { socket.destroy(); return; }
    const speed = Math.min(60, Math.max(1, Number(u.searchParams.get("speed") ?? 8)));
    wss.handleUpgrade(req, socket, head, (ws) => {
      let t = 0;
      const tick = setInterval(() => { if (t > 6) { ws.send(JSON.stringify({ done: true })); ws.close(); return; } ws.send(JSON.stringify({ t, mode: modeAt(t) })); t += 0.25; }, Math.max(16, 1000 / speed));
      ws.on("close", () => clearInterval(tick));
    });
  });
  return { server, listen: (port = opts.port ?? 8810) => new Promise<number>((r) => server.listen(port, () => r((server.address() as { port: number }).port))), close: () => { wss.close(); return new Promise<void>((r) => { server.closeAllConnections(); server.close(() => r()); }); } };
}
if (import.meta.url === `file://${process.argv[1]}`) build().listen().then((p) => console.log(`TESSERA API on :${p}`));
