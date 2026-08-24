export interface RouteMetadata {
  id: string;
  name: string;
  distance_km: string;
  ascent_m: string;
  descent_m: string;
  point_count: number;
  simplified_track: number[][][];
}
