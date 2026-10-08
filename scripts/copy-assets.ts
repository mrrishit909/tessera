// Copies the generated data and the validated GLBs + poster into the web app's public folder.
import { cpSync, mkdirSync } from "node:fs";
const root = new URL("../", import.meta.url).pathname, pub = root + "apps/web/public/";
mkdirSync(pub + "data", { recursive: true }); mkdirSync(pub + "models", { recursive: true }); mkdirSync(pub + "posters", { recursive: true });
cpSync(root + "data/generated", pub + "data", { recursive: true });
cpSync(root + "model/exports/frame.glb", pub + "models/frame.glb");
cpSync(root + "model/exports/easel.glb", pub + "models/easel.glb");
cpSync(root + "model/renders/poster.png", pub + "posters/frame.png");
console.log("assets copied");
