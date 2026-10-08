"use client";
import { useEffect, useState } from "react";
import { loadData, type Data } from "./data";
import { set, useStore } from "./store";
import Intro from "./ui/Intro";
import Panels from "./ui/Panels";
import Scene from "./scene/Scene";
import { base } from "./data";

function webglOk() { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; } }

export default function App() {
  const s = useStore(); const [data, setData] = useState<Data | null>(null); const [err, setErr] = useState("");
  useEffect(() => {
    const q = new URLSearchParams(location.search), rm = matchMedia("(prefers-reduced-motion: reduce)").matches || q.get("motion") === "reduced";
    const gfx = q.get("gfx") === "off" || !webglOk() ? "poster" : "webgl";
    set({ reduced: rm, pauseMotion: rm, gfx, ...(q.get("t") ? { t: Number(q.get("t")) } : {}), ...(q.get("lens") ? { lensX: Number(q.get("lens")) } : {}), ...(q.get("skip") === "1" ? { introDone: true, introStep: 99 } : {}) });
    if (q.get("skip") === "1") document.documentElement.style.setProperty("--mask", "200%");
    loadData().then(setData).catch((e) => setErr(String(e)));
  }, []);
  if (err) return <div className="boot" role="alert">Could not load data: {err}</div>;
  if (!data) return <div className="boot" role="status">Lighting the examination table...</div>;
  return (
    <div className="app" data-step={s.introStep} data-intro={s.introDone ? "done" : "running"} data-gfx={s.gfx}>
      {s.gfx === "webgl" ? <Scene data={data} /> : <div className="poster" style={{ backgroundImage: `url(${base}/posters/frame.png)` }} role="img" aria-label="Still of the TESSERA gilded frame" data-testid="poster" />}
      <Panels data={data} />
      {!s.introDone && <Intro onDone={() => {}} />}
    </div>
  );
}
