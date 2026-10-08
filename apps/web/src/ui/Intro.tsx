"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { live, set, state, useStore } from "../store";

// Steps follow blueprint section 2: 0 painting appears, 1 close on fibers, 2 through layers, 3 UV then infrared, 4 underdrawing, 5 reconstruction, 6 pull back to navigation.
export default function Intro({ onDone }: { onDone: () => void }) {
  const s = useStore();
  const [caption, setCaption] = useState("");
  const mask = useRef<HTMLDivElement>(null), root = useRef<HTMLDivElement>(null), tl = useRef<gsap.core.Timeline | null>(null);

  const finish = (instant: boolean) => {
    tl.current?.kill(); document.documentElement.style.setProperty("--mask", "200%"); live.zoom = 0;
    set({ introDone: true, introStep: 99, t: 0 });
    if (instant && root.current) root.current.style.display = "none";
    onDone();
  };

  useEffect(() => {
    if (s.reduced) return;
    gsap.ticker.lagSmoothing(0);
    const t = gsap.timeline({ defaults: { ease: "power1.inOut" }, onComplete: () => finish(false) });
    tl.current = t;
    const zoom = { v: 0 };
    t.call(() => { set({ introStep: 0, t: 0 }); setCaption("A painting, slowly, in candle-like light."); }, [], 0)
      .call(() => { set({ introStep: 1 }); setCaption("Closer, until the canvas fibers resolve."); }, [], 2.2)
      .to(zoom, { v: 1, duration: 3, onUpdate: () => { live.zoom = zoom.v; } }, 2.2)
      .call(() => { set({ introStep: 2 }); setCaption("Through varnish, paint, ground, canvas."); }, [], 5.4)
      .call(() => { set({ introStep: 3, t: 2 }); setCaption("Switching to UV."); }, [], 7.4)
      .call(() => { set({ introStep: 3, t: 3 }); setCaption("Then infrared."); }, [], 9.4)
      .call(() => { set({ introStep: 4 }); setCaption("The underdrawing appears."); }, [], 11)
      .call(() => { set({ introStep: 5, t: 6 }); setCaption("A missing region reconstructs."); }, [], 12.6)
      .call(() => { set({ introStep: 6 }); setCaption(""); }, [], 14.6)
      .to({ v: 0 }, { v: 160, duration: 1.8, ease: "power2.inOut", onUpdate: function () { document.documentElement.style.setProperty("--mask", `${this.targets()[0].v}%`); } }, 14.6);
    return () => { t.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.reduced]);

  if (s.introDone && !s.reduced) return null;
  if (s.reduced) {
    const frames = [["Surface", "A painting resolves in candle-like light down to its canvas fibers."], ["Imaging", "UV then infrared reveal a later varnish and the hidden underdrawing."], ["Laboratory", "A missing region reconstructs; the scientific layers flatten into navigation."]];
    return (
      <div className="intro intro-static" ref={root} role="dialog" aria-label="Opening story" data-testid="intro">
        <ol>{frames.map(([d, c], i) => <li key={i}><b>{d}</b> {c}</li>)}</ol>
        <button className="btn primary" onClick={() => finish(true)} data-testid="skip-intro">Enter the laboratory</button>
      </div>
    );
  }
  return (
    <div className="intro" ref={root} data-testid="intro" data-step={s.introStep}>
      <div className="intro-dark" style={{ opacity: s.introStep === 0 ? 1 : 0 }} />
      <p className="caption" role="status">{caption}</p>
      <button className="btn skip" onClick={() => { const t = tl.current; if (t && t.time() < 14.6) { live.zoom = 1; set({ t: 0 }); t.seek(14.6); } else finish(false); }} data-testid="skip-intro" autoFocus>Skip intro</button>
      <div className="light-mask" ref={mask} aria-hidden />
    </div>
  );
}
