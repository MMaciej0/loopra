export function toSearchParams(query: Readonly<Record<string, string | number>>) {
  return new URLSearchParams(Object.entries(query).map(([key, value]) => [key, String(value)]));
}
