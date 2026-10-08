import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "TESSERA", description: "TESSERA: digital art conservation, restoration and provenance laboratory. All data is synthetic." };
export const viewport: Viewport = { themeColor: "#0a0d1a", width: "device-width", initialScale: 1 };
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
