import type { Position } from 'geojson';
import { readPointCoordinates } from './utils.js';

export const calculateDistanceKm = (pointA: Position, pointB: Position): number => {
  const [longitudeA, latitudeA] = readPointCoordinates(pointA);
  const [longitudeB, latitudeB] = readPointCoordinates(pointB);

  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  const earthRadiusKm = 6371.0088;

  const latitudeARadians = toRadians(latitudeA);
  const latitudeBRadians = toRadians(latitudeB);
  const deltaLatitude = toRadians(latitudeB - latitudeA);
  const deltaLongitude = toRadians(longitudeB - longitudeA);

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(latitudeARadians) * Math.cos(latitudeBRadians) * Math.sin(deltaLongitude / 2) ** 2;

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};
