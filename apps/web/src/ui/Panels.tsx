"use client";
import { useEffect, useRef } from "react";
import { craquelureDensityAt, damageScoreAt, estimatedCenturyRange } from "@tessera/domain";
import type { Data } from "../data";
import { set, state, MODES, modeIndex, useStore } from "../store";

const LABELS: Record<string, string> = { normal: "Normal", "raking-light": "Raking Light", uv: "UV", infrared: "Infrared", xray: "X-Ray", microscopic: "Microscopic", reconstruction: "Reconstruction" };
const go = (t: number) => set({ t });

function Readout({ data }: { data: Data }) {
  const s = useStore(), mode = MODES[Math.round(s.t)];
  let mean = 0, n = 0;
  for (let x = 0.1; x < 1; x += 0.2) for (let y = 0.1; y < 1; y += 0.2) { mean += craquelureDensityAt(x, y); n++; }
  mean /= n;
  const centerDamage = data.regions.length ? damageScoreAt(data.regions[0].x, data.regions[0].y, data.regions) : 0;
  return (
    <div className="readout-frame" data-testid="readout">
      <div><span className="r-label">Mode</span><span className="r-value">{LABELS[mode]}</span></div>
      <div><span className="r-label">Estimated period</span><span className="r-value">{estimatedCenturyRange(mean)}</span></div>
      <div><span className="r-label">Primary region damage</span><span className="r-value" data-testid="damage-value">{Math.round(centerDamage * 100)}%</span></div>
    </div>
  );
}

function Regions({ data }: { data: Data }) {
  return (
    <ul className="region-list" data-testid="region-list">{data.regions.map((r) => <li key={r.id} data-testid={`region-${r.id}`}><b>{r.name}</b><span>{r.confidencePct}% confidence</span></li>)}</ul>
  );
}

function Logbook({ data }: { data: Data }) {
  const s = useStore(), mode = MODES[Math.round(s.t)], rows = data.log.filter((l) => l.mode === mode), sel = data.log.find((l) => l.id === s.selLog);
  return (
    <div className="conservation-log">
      <ul>{rows.map((l) => <li key={l.id}><button className={`log-item ${l.id === s.selLog ? "on" : ""}`} onClick={() => set({ selLog: l.id })} data-testid={`log-${l.id}`}>{l.text}</button></li>)}</ul>
      {sel && <p className="log-detail" data-testid="log-detail">{sel.text}</p>}
    </div>
  );
}

export default function Panels({ data }: { data: Data }) {
  const s = useStore(), mode = MODES[Math.round(s.t)];
  const lock = useRef(0);
  useEffect(() => {
    const onWheel = (e: WheelEvent) => { if ((e.target as Element).closest(".frame-rail,.intro,.lens-ctl")) return; const n = performance.now(); if (n - lock.current < 700 || Math.abs(e.deltaY) < 20 || !state.introDone) return; lock.current = n; const i = modeIndex(MODES[Math.round(state.t)]) + (e.deltaY > 0 ? 1 : -1); if (MODES[i]) go(i); };
    addEventListener("wheel", onWheel, { passive: true }); return () => removeEventListener("wheel", onWheel);
  }, []);
  return (
    <div className="hud" data-testid="hud">
      <span className="brand">TESSERA</span>
      <button className="btn ghost pause" aria-pressed={s.pauseMotion} onClick={() => set({ pauseMotion: !s.pauseMotion })} data-testid="pause-motion">{s.pauseMotion ? "Resume motion" : "Pause motion"}</button>
      <nav className="frame-rail" aria-label="Imaging modality">{MODES.map((m, i) => <button key={m} className={m === mode ? "on" : ""} aria-current={m === mode ? "page" : undefined} onClick={() => go(i)} data-testid={`nav-${m}`}>{LABELS[m]}</button>)}</nav>
      <Readout data={data} />
      <label className="lens-ctl"><span>Comparison lens</span><input type="range" min={0} max={1} step={0.01} value={s.lensX} onChange={(e) => set({ lensX: Number(e.target.value) })} aria-valuetext={`${Math.round(s.lensX * 100)}%`} data-testid="lens-scrub" /></label>
      <Regions data={data} />
      <Logbook data={data} />
    </div>
  );
}
