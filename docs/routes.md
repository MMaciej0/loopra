# Routes

A **route** is the path of a ride, uploaded as a GPX file. Today a route has one job: an organiser attaches it to a ride, and the ride page shows it on the map with an elevation profile.

Routes are not developed further for now. The rides core comes first. After that, routes will grow into their own feature.

The README has a short summary. This file has the details.

## How it works

| Endpoint       | Who can call it  | What it does                                                   |
| -------------- | ---------------- | -------------------------------------------------------------- |
| `POST /routes` | a verified rider | Takes one GPX file, calculates its stats, and saves the route. |

There is no endpoint to list, read, change or delete a route. A route is read only as part of a ride.

1. **Upload.** On the create-ride form, the organiser drops a GPX file. The browser sends it to a Next.js route handler (`/api/routes`), which sends it to the API with the rider's token.
2. **Parse.** The API parses the file with `@loopra/gpx`. A file that is not valid GPX gets `400 INVALID_GPX`.
3. **Store.** The original file goes to S3-compatible storage. The calculated values go to the `routes` table.
4. **Preview.** The API answers with the stats and the elevation profile. The form shows the profile at once and fills the distance field.
5. **Attach.** The organiser saves the ride with the `route_id`. The API checks that the route belongs to this organiser. Another rider's route gets `404`, the same answer as a route that does not exist.
6. **Show.** The ride page loads the route with the ride and draws its path on the map.

## The `@loopra/gpx` package

GPX parsing lives in its own package, `packages/gpx`. It has no database, no Fastify and no network. It takes a GPX string and returns plain numbers and arrays:

```ts
parseGPX(gpxString) → {
  name, distanceKm, ascentM, descentM, pointCount,
  elevationProfile, maxElevationM, minElevationM, path
}
```

Because it is pure, it is easy to test. Its Vitest suite needs no Docker and runs on real GPX files from `packages/gpx/assets/`.

### Steps

1. **Read the file.** `@xmldom/xmldom` parses the XML, and `@tmcw/togeojson` turns it into GeoJSON.
2. **Split into segments.** A GPX track can have breaks, for example when the GPS device was paused. Each part is a **segment**. The package keeps segments apart, so a break is never drawn as a straight line.
3. **Distance.** The sum of the distances between neighbour points. Each distance uses the **haversine formula**, which measures distance on the surface of a sphere.
4. **Ascent and descent.** GPS elevation is noisy: it jumps up and down by small amounts even on flat ground. If every small jump is added, the total climb becomes too large. So a change is counted only when it is bigger than **1 m** (`ELEVATION_THRESHOLD_M`).
5. **Elevation profile.** A list of `[distance km, elevation m]` points, one list per segment. A long ride can have tens of thousands of points, so the profile is cut to at most **500 points** (`MAX_ELEVATION_POINTS`). The cut keeps the highest and lowest point of each part of the track, so peaks and valleys do not disappear from the chart.
6. **Path for the map.** The track points are simplified with the **Ramer–Douglas–Peucker** algorithm (through `simplify-js`). It removes points that lie almost on a straight line between their neighbours, with a tolerance of about **5 m** (`PATH_TOLERANCE_M`). A straight road becomes two points, and a sharp turn stays. Coordinates are rounded to **5 decimals**, which is about 1 m.

All limits are in `packages/gpx/src/config.ts`.

### Why a separate package

- The parser is a different kind of code from an API module: it is pure calculation, with its own dependencies and its own tests.
- It can be used in other places later, for example in the mobile app, without loading the API.

## Decisions

### The original file and the calculated data are stored apart

**Problem:** the map and the chart need small, ready data. But the original GPX file has all the details, and a future feature may need them.

**Decision:** the original file goes to S3-compatible storage under `routes/<user id>/<random uuid>.gpx`. The `routes` table keeps only what the website shows: the stats, the elevation profile and the simplified path, as `jsonb`. The website never downloads the GPX file. The original file is kept, so the route can be parsed again when the parser changes.

### Upload first, then insert, and clean up on failure

A file in storage and a row in the database cannot be in one transaction. So the order matters:

1. Parse the file. A bad file stops here, before anything is stored.
2. Upload the file to storage.
3. Insert the row. If the insert fails, delete the uploaded file, so no file is left without a row.

If the delete also fails, the API logs the key of the orphaned file and returns the original error.

### The path is not sent on upload

The upload answer has the stats and the elevation profile, because the form shows them at once. The path can be large, and the form does not draw a map of it, so it is left out. The ride page gets the path when it loads the ride.

### The name comes from the file

The route name is the `<name>` inside the GPX file. If the file has no name, the API uses the file name. Control characters are removed and the name is cut to 255 characters. If nothing is left, the name is `Route`.

### File limits

One file per request, at most **10 MB** (`MAX_GPX_FILE_SIZE_MB` in `packages/domain`). The browser checks the size before sending, and the multipart limits in the API check it again.

## Known limits

- **A route that is never attached stays forever.** The organiser can upload a file and then leave the form. The route row and the file stay, and nothing cleans them up.
- **A route cannot be reused.** Each ride with a route needs a new upload, even for the same route.
- **The route of a ride cannot change.** `PATCH /rides/:id` does not accept `route_id`. To change the route, the organiser would need a new ride.
- **No list, no delete.** A rider cannot see the routes they uploaded, or delete one.
- **Only the first track is read.** The parser takes the first track (`<trk>`) in the file, or the first planned route (`<rte>`) if there is no track. Other tracks in the same file are ignored. A file with only waypoints is rejected.

These limits are known and accepted while the rides core is being built.
