export function toSearchParams(query: Readonly<Record<string, string | number | undefined>>) {
  return new URLSearchParams(
    Object.entries(query).flatMap(([key, value]) =>
      value === undefined ? [] : [[key, String(value)]],
    ),
  );
}
