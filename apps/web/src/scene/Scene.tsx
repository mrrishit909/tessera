"use client";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { useEffect, useMemo } from "react";
import type { Data } from "../data";
import { base } from "../data";
import { live, state, useStore } from "../store";

const MAX_REGIONS = 6;
// Palette: Ultramarine #153B73, Gilded Gold #C6A15B, Parchment #DED1B7, Varnish Brown #4D3324, Conservation Green #587061, Infrared Red #922F39.
const paintingVert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const paintingFrag = `
uniform int uMode; uniform float uLensX; uniform int uRegionCount; uniform vec4 uRegions[${MAX_REGIONS}];
varying vec2 vUv;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float damageAt(vec2 uv){
  float best = 0.0;
  for(int i=0;i<${MAX_REGIONS};i++){ if(i>=uRegionCount) break; vec4 r = uRegions[i];
    float d = distance(uv, r.xy); float score = r.z <= 0.0 ? 0.0 : r.w * max(0.0, 1.0 - d / r.z);
    best = max(best, score); }
  return best;
}
vec3 compose(vec2 uv){
  // A simple generative "old master" still life: warm ground, a dark vessel ellipse, a highlight.
  vec3 ground = mix(vec3(0.54,0.39,0.2), vec3(0.3,0.2,0.14), uv.y);
  float vessel = smoothstep(0.26, 0.24, distance(uv*vec2(1.0,1.6), vec2(0.5,0.85)));
  vec3 col = mix(ground, vec3(0.1,0.08,0.06), vessel);
  float highlight = smoothstep(0.05,0.0, distance(uv, vec2(0.42,0.62)));
  col += highlight * vec3(0.78,0.63,0.36) * 0.6;
  return col;
}
void main(){
  vec2 uv = vUv;
  vec3 col;
  if(uMode==0){ col = compose(uv); }
  else if(uMode==1){ float relief = sin(uv.x*40.0)*sin(uv.y*55.0)*0.08 + hash(floor(uv*80.0))*0.05; float v = clamp(0.55+relief,0.0,1.0); col = vec3(v); }
  else if(uMode==2){ col = vec3(0.02,0.03,0.05); for(int i=0;i<${MAX_REGIONS};i++){ if(i>=uRegionCount) break; vec4 r=uRegions[i]; float d=distance(uv,r.xy); float g=smoothstep(r.z,0.0,d); col += g*vec3(0.35,0.78,0.6)*0.9; } }
  else if(uMode==3){ float sketch = smoothstep(0.015,0.0, abs(sin(uv.x*25.0+uv.y*4.0))-0.02); col = mix(vec3(0.72), vec3(0.2), sketch); }
  else if(uMode==4){ float density = hash(floor(uv*40.0))*0.3 + (1.0-distance(uv,vec2(0.5,0.85))*1.4); col = vec3(clamp(density,0.0,1.0)); }
  else if(uMode==5){ float weave = step(0.5, fract(uv.x*120.0)) * step(0.5, fract(uv.y*120.0)); col = mix(vec3(0.62,0.56,0.46), vec3(0.7,0.64,0.54), weave); }
  else { col = compose(uv); }
  vec3 restored = compose(uv);
  float d = damageAt(uv);
  vec3 current = (uMode==0 || uMode==6) ? mix(col, vec3(0.08,0.07,0.09), d*0.85) : col;
  vec3 finalCol = uv.x < uLensX ? current : restored;
  gl_FragColor = vec4(finalCol, 1.0);
}`;

function Painting({ data }: { data: Data }) {
  const geo = useMemo(() => new THREE.PlaneGeometry(0.9, 1.2, 1, 1), []);
  const regionArr = useMemo(() => { const a = new Float32Array(MAX_REGIONS * 4); data.regions.slice(0, MAX_REGIONS).forEach((r, i) => { a[i * 4] = r.x; a[i * 4 + 1] = r.y; a[i * 4 + 2] = r.radius; a[i * 4 + 3] = r.severity; }); return a; }, [data]);
  const mat = useMemo(() => new THREE.ShaderMaterial({ vertexShader: paintingVert, fragmentShader: paintingFrag, uniforms: { uMode: { value: 0 }, uLensX: { value: 0.5 }, uRegionCount: { value: data.regions.length }, uRegions: { value: Array.from({ length: MAX_REGIONS }, (_, i) => new THREE.Vector4(regionArr[i * 4], regionArr[i * 4 + 1], regionArr[i * 4 + 2], regionArr[i * 4 + 3])) } } }), [data, regionArr]);
  useFrame(() => { mat.uniforms.uMode.value = Math.round(state.t); mat.uniforms.uLensX.value = state.lensX; });
  return <mesh geometry={geo} material={mat} />;
}

function Frame() {
  const gltf = useLoader(GLTFLoader, `${base}/models/frame.glb`);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf]);
  return <primitive object={scene} />;
}
function Easel() {
  const gltf = useLoader(GLTFLoader, `${base}/models/easel.glb`);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf]);
  return <primitive object={scene} position={[0, -0.8, -0.05]} />;
}

function Rig() {
  const { camera } = useThree(), want = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    const s = state;
    if (!s.introDone) want.set(0, 0, 1.6 - live.zoom * 1.1);
    else want.set(0, 0, 1.7);
    const k = s.reduced ? 1 : 1 - Math.exp(-dt * 2.6);
    camera.position.lerp(want, k); (camera as THREE.PerspectiveCamera).lookAt(0, 0, 0);
  });
  return null;
}

function Lifecycle() {
  const { setFrameloop, gl } = useThree();
  useEffect(() => {
    const vis = () => setFrameloop(document.hidden ? "never" : "always");
    const lost = (e: Event) => e.preventDefault();
    document.addEventListener("visibilitychange", vis); gl.domElement.addEventListener("webglcontextlost", lost);
    return () => { document.removeEventListener("visibilitychange", vis); gl.domElement.removeEventListener("webglcontextlost", lost); };
  }, [setFrameloop, gl]);
  return null;
}

declare global { interface Window { __tesseraData?: Data; __tesseraStats?: () => unknown } }
function Stats() {
  const gl = useThree((s) => s.gl);
  useEffect(() => { window.__tesseraStats = () => ({ calls: gl.info.render.calls, triangles: gl.info.render.triangles, geometries: gl.info.memory.geometries, textures: gl.info.memory.textures }); }, [gl]);
  return null;
}

export default function Scene({ data }: { data: Data }) {
  useStore();
  window.__tesseraData = data;
  return (
    <Canvas className="stage" data-testid="stage" dpr={[1, 1.5]} camera={{ fov: 40, near: 0.1, far: 10, position: [0, 0, 1.7] }} gl={{ antialias: false, powerPreference: "high-performance" }} onCreated={({ gl }) => gl.setClearColor("#0a0d1a")}>
      <ambientLight intensity={0.7} color="#DED1B7" /><directionalLight position={[1, 1, 2]} intensity={1} color="#C6A15B" />
      <Rig /><Painting data={data} /><Frame /><Easel /><Lifecycle /><Stats />
    </Canvas>
  );
}
