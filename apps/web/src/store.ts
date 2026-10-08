import { useSyncExternalStore } from "react";
import { MODES, type Mode } from "@tessera/schemas";
export { MODES };
export type State = { t: number; lensX: number; selLog: string | null; introDone: boolean; introStep: number; reduced: boolean; pauseMotion: boolean; gfx: "webgl" | "poster" };
export const state: State = { t: 0, lensX: 0.5, selLog: null, introDone: false, introStep: 0, reduced: false, pauseMotion: false, gfx: "webgl" };
export const live = { zoom: 0 };
let snap = { ...state };
const subs = new Set<() => void>();
export function set(p: Partial<State>) { Object.assign(state, p); snap = { ...state }; subs.forEach((f) => f()); }
export const useStore = () => useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => snap, () => snap);
export const modeIndex = (m: Mode) => MODES.indexOf(m);
