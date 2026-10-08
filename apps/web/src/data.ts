import type { DamageRegion, LogEntry } from "@tessera/schemas";
export type Data = { regions: DamageRegion[]; log: LogEntry[] };
export const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export async function loadData(): Promise<Data> {
  const g = async <T,>(n: string) => (await fetch(`${base}/data/${n}.json`)).json() as Promise<T>;
  const [regions, log] = await Promise.all([g<DamageRegion[]>("regions"), g<LogEntry[]>("log")]);
  return { regions, log };
}
