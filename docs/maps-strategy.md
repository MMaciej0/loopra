# Maps Strategy

## The Two Distinct Map Needs

### 1. Meetup point (simple)
A single pin — "where we meet". Just latitude + longitude. Easy.

### 2. Ride route (complex)
The actual path the group will ride. This is where decisions matter.

---

## Why Not Build a Route Planner

Drawing cycling routes from scratch requires:
- Cycling-aware routing engine (roads, bike paths, surface type)
- Turn-by-turn awareness
- Elevation profile data
- Maintenance of routing data

Cyclists already do this well in dedicated tools. **Komoot** (free for basic route planning) is extremely popular globally, especially in Europe. Strava has a route builder but Premium-only. Ride with GPS is another alternative.

**The right approach**: let cyclists plan routes in tools they already use, then bring the route into Loopra via GPX (the universal cycling format). Every platform exports GPX.

---

## Decision: Mapbox for Display + GPX Upload for Routes

### Map display: **Mapbox GL JS**

- Free tier: 50,000 map loads/month — enough to grow significantly before paying
- Beautiful cycling-specific map styles available (e.g. `outdoors` style shows elevation and trails)
- `react-map-gl` wrapper works cleanly in Next.js
- Supports rendering GPX polylines natively
- Used by many cycling apps (AllTrails, komoot web, etc.)

Alternative considered: **Leaflet.js + OpenStreetMap** — completely free, slightly less polished, still fine for a v1.

### Route input: **GPX upload**

GPX is the universal cycling format. Any platform exports it:
- Komoot → Export GPX (free)
- Strava → Export GPX (free, even without Premium)
- Garmin Connect → Export GPX
- RideWithGPS → Export GPX

When a user attaches a GPX to a ride event:
1. Parse the GPX server-side → extract distance, elevation gain, encoded polyline
2. Store raw GPX in S3 (for download by participants)
3. Store encoded polyline in DB (for fast map rendering)
4. Display on Mapbox map with elevation profile

### Phase 2 addition: Route link parsing

Accept a Komoot or Strava URL pasted into the event form:
- Fetch route metadata via their public APIs (or scrape public route pages)
- Extract GPX automatically
- Same processing pipeline as manual upload

---

## Stack Summary

| Need | Solution | Cost |
|------|----------|------|
| Map tiles & display | Mapbox GL JS (`react-map-gl`) | Free up to 50k loads/mo |
| Meetup pin | Mapbox marker | Included |
| Route display | Parse GPX → polyline on Mapbox | Included |
| Route input | GPX file upload | Free |
| Routing engine | None needed (users bring their own routes) | — |
| Geocoding (city search) | Mapbox Geocoding API | Free tier: 100k requests/mo |
| Server-side GPX parsing | `@tmcw/togeojson` or `gpxparser` | Open source |

---

## GPX Processing Pipeline

```
User uploads .gpx
       ↓
API receives file (multipart)
       ↓
Parse with gpxparser:
  - Extract trackpoints (lat/lng array)
  - Calculate total distance
  - Calculate elevation gain
  - Encode polyline (Google Polyline Algorithm)
       ↓
Store raw .gpx in S3
Store encoded polyline + stats in DB (routes table)
       ↓
API returns: { polyline, distance_km, elevation_gain_m, gpx_url }
       ↓
Frontend decodes polyline → renders on Mapbox map
```
