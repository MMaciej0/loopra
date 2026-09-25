type LocationLabelParts = {
  district?: string | null;
  city?: string | null;
  country?: string | null;
  postal_code?: string | null;
};

export const formatLocationLabel = ({
  district,
  city,
  country,
  postal_code,
}: LocationLabelParts): string => {
  const settlement = city === district ? null : city;
  const code = postal_code && postal_code !== district ? postal_code : null;
  const settlementLine = settlement && code ? `${code} ${settlement}` : settlement;

  return [district, settlementLine, country].filter(Boolean).join(', ');
};

export type Point = {
  x: number;
  y: number;
};

export const isSamePlace = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y;
