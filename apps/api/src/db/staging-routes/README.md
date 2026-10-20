# Staging seed routes

Real road routes around Kraków for the staging seed Rides (#169, #200).
`test/db/stagingRoutes.test.ts` checks that every file here parses with `@loopra/gpx`.

## Credit

Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors,
available under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/).
Routes made with [BRouter](https://brouter.de/brouter-web/), elevation included.
Each file carries the same credit in its `<metadata>`.

## Routes

| file                              | name                             |   km | climb | profile    | made for         |
| --------------------------------- | -------------------------------- | ---: | ----: | ---------- | ---------------- |
| `old-town-sightseeing.gpx`        | Old Town, Kazimierz and Podgórze | 13.6 |  122m | `trekking` | sightseeing      |
| `las-wolski-coffee-loop.gpx`      | Kościuszko Mound and Las Wolski  | 19.4 |  368m | `trekking` | coffee ride      |
| `nowa-huta-wanda-loop.gpx`        | Nowa Huta and Wanda Mound        | 24.9 |   87m | `trekking` | casual, coffee   |
| `vistula-tyniec-loop.gpx`         | Vistula loop to Tyniec           | 33.6 |  224m | `trekking` | casual           |
| `niepolomice-forest-loop.gpx`     | Niepołomice Forest               | 40.9 |  117m | `trekking` | casual, training |
| `wieliczka-hills-training.gpx`    | Wieliczka hills                  | 53.7 |  696m | `fastbike` | training         |
| `ojcow-training.gpx`              | Ojców and Pieskowa Skała         | 72.2 |  838m | `fastbike` | training         |
| `tenczynek-alwernia-training.gpx` | Tenczynek and Alwernia           | 78.4 |  567m | `fastbike` | training         |

Climb is the ascent `@loopra/gpx` reports, so it is a bit higher than the "filtered ascend" in each file's first comment.

## How they were made

Each file is one request to the public BRouter server. `lonlats` is the list of points the route must pass, as `lon,lat` joined with `|`. A loop ends where it starts.

```bash
curl -o vistula-tyniec-loop.gpx \
  'https://brouter.de/brouter?lonlats=19.9120,50.0605|19.9050,50.0520|19.8900,50.0330|19.8226,50.0198|19.8650,50.0150|19.9370,50.0240|19.9446,50.0516|19.9120,50.0605&profile=trekking&alternativeidx=0&format=gpx'
```

`trekking` prefers bike paths and quiet roads, `fastbike` prefers paved roads for road bikes.

After the download, two edits by hand: the track `<name>` (BRouter writes `brouter_trekking_0`) gets the name from the table, and a `<metadata>` block with the credit goes before `<trk>`.

The points of every route:

| file                              | profile    | lonlats                                                                                                                                  |
| --------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `vistula-tyniec-loop.gpx`         | `trekking` | `19.9120,50.0605\|19.9050,50.0520\|19.8900,50.0330\|19.8226,50.0198\|19.8650,50.0150\|19.9370,50.0240\|19.9446,50.0516\|19.9120,50.0605` |
| `nowa-huta-wanda-loop.gpx`        | `trekking` | `20.0377,50.0725\|20.0525,50.0657\|20.0681,50.0705\|20.0950,50.0500\|20.0500,50.0450\|20.0377,50.0725`                                   |
| `las-wolski-coffee-loop.gpx`      | `trekking` | `19.9373,50.0617\|19.9120,50.0605\|19.8935,50.0549\|19.8530,50.0540\|19.8600,50.0450\|19.9050,50.0520\|19.9373,50.0617`                  |
| `old-town-sightseeing.gpx`        | `trekking` | `19.9373,50.0617\|19.9355,50.0540\|19.9446,50.0516\|19.9530,50.0450\|19.9585,50.0381\|19.9615,50.0475\|19.9420,50.0700\|19.9373,50.0617` |
| `ojcow-training.gpx`              | `fastbike` | `19.9373,50.0617\|19.9200,50.1200\|19.8290,50.2110\|19.7800,50.2440\|19.8530,50.2270\|19.9850,50.1680\|19.9373,50.0617`                  |
| `wieliczka-hills-training.gpx`    | `fastbike` | `19.9530,50.0450\|20.0650,49.9870\|19.9780,49.9080\|19.8870,49.9400\|19.9530,50.0450`                                                    |
| `niepolomice-forest-loop.gpx`     | `trekking` | `20.0377,50.0725\|20.2180,50.0350\|20.1500,50.0150\|20.0377,50.0725`                                                                     |
| `tenczynek-alwernia-training.gpx` | `fastbike` | `19.9120,50.0605\|19.6330,50.1360\|19.5730,50.1100\|19.5390,50.0610\|19.6800,50.0450\|19.8226,50.0198\|19.9120,50.0605`                  |

Start points: Rynek Główny `19.9373,50.0617`, Błonia `19.9120,50.0605`, Plac Centralny in Nowa Huta `20.0377,50.0725`, Rynek Podgórski `19.9530,50.0450`.

To add a route: pick the points on [brouter.de/brouter-web](https://brouter.de/brouter-web/), run the request, make the two edits, add a row to both tables, and run the test.
