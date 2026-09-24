type LocationLabelParts = {
  district?: string | null;
  city?: string | null;
  country?: string | null;
};

export const formatLocationLabel = ({ district, city, country }: LocationLabelParts): string =>
  [district, city === district ? null : city, country].filter(Boolean).join(', ');

type Point = {
  x: number;
  y: number;
};

export const isSamePlace = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y;
