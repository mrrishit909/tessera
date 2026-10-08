"use client";
import dynamic from "next/dynamic";
const App = dynamic(() => import("../src/App"), { ssr: false, loading: () => <div className="boot" role="status">Lighting the examination table...</div> });
export default function Page() { return <App />; }
