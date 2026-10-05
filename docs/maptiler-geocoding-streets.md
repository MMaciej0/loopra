# MapTiler Geocoding: Why Street Search Returns Nothing

## Answer

Streets are the `address` feature type in MapTiler's geocoding API, and our forward call passes a `types` filter that does not include it. The filter is applied to the result set, so the three Kraków, Krotoszyn and Warsaw `address.*` features for "floriańska" are dropped and only weaker `place.*` matches survive — which is exactly the three unrelated results the symptom describes. "Osiedle Na Lotnisku" works because it is a `place` feature, which is on our allowed list.

Adding `address` to `types` fixes it. The label-building code already handles the result correctly, because a street's `context[]` still carries the full city/region/country hierarchy.

---

## 1. The feature types, and which one a street is

The authoritative enumeration is the MapTiler place-type table ([docs.maptiler.com/guides/location-services/geocoding-search/place-types-values](https://docs.maptiler.com/guides/location-services/geocoding-search/place-types-values/)). Seventeen values, sixteen enabled by default:

| type                    | default   | documented description                                                                                                    |
| ----------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------- |
| `continental_marine`    | true      | "Continents, oceans, seas and other forms of marine water bodies."                                                        |
| `country`               | true      | "A sovereign territory with defined borders, a permanent population, and its own government."                             |
| `major_landform`        | true      | "Major landforms."                                                                                                        |
| `region`                | true      | "Administrative units and settlements."                                                                                   |
| `subregion`             | true      | —                                                                                                                         |
| `county`                | true      | —                                                                                                                         |
| `joint_municipality`    | true      | —                                                                                                                         |
| `joint_submunicipality` | true      | —                                                                                                                         |
| `municipality`          | true      | —                                                                                                                         |
| `municipal_district`    | true      | —                                                                                                                         |
| `locality`              | true      | —                                                                                                                         |
| `neighbourhood`         | true      | —                                                                                                                         |
| `place`                 | true      | —                                                                                                                         |
| `postal_code`           | true      | "A series of letters, numbers, or both, assigned to specific geographic areas to help sort and deliver mail efficiently." |
| `address`               | true      | "Roof top address point or residential street names."                                                                     |
| `road`                  | true      | "Roads defined by their name or number. From highways to residential streets."                                            |
| `poi`                   | **false** | "Points of interests can be found by their name or other attributes."                                                     |

The same list, in the same order, is the `GeocodingPlaceType` union in the client we ship — `node_modules/@maptiler/client@3.0.2/dist/maptiler-client.d.ts:864` ([github.com/maptiler/maptiler-client-js](https://github.com/maptiler/maptiler-client-js/blob/main/src/services/geocoding.ts)):

```ts
type GeocodingPlaceType =
  | 'continental_marine'
  | 'country'
  | 'major_landform'
  | 'region'
  | 'subregion'
  | 'county'
  | 'joint_municipality'
  | 'joint_submunicipality'
  | 'municipality'
  | 'municipal_district'
  | 'locality'
  | 'neighbourhood'
  | 'place'
  | 'postal_code'
  | 'address'
  | 'road'
  | 'poi';
```

There is no `street` type. **A named street without a house number is `address`** — the docs say so ("residential street names"), and the live API confirms it: `ul. Floriańska` comes back as `address.4443496`, `place_type: ["address"]`, `properties.kind: "street"`, with no `address` (house-number) field on the feature.

`road` is a separate thing and does not cover urban named streets in practice, despite the "to residential streets" phrasing. Querying "floriańska" with `types=road` returns **zero** features; querying "A4" with `types=road&country=pl` returns `road.22271` / "Bundesautobahn 4, Poland" with `properties.kind: "road"`. So `road` is the named/numbered highway layer; the street layer is `address` with `kind: "street"`.

Note that `poi` is the one type **off** by default. Omitting `types` entirely gives you the other sixteen.

## 2. How `types` behaves, and the Floriańska / Na Lotnisku asymmetry

`types` is documented as "Filter types of which features to return. If not specified, default configuration of API is used" ([docs.maptiler.com/cloud/api/geocoding](https://docs.maptiler.com/cloud/api/geocoding/)). It restricts the returned set; it does not broaden or re-rank the search. `excludeTypes` "Set to `true` to use all available feature types except those specified in `types`", default `false`.

Empirically the filter is applied _before_ `limit` is honoured, not after — the filtered queries still return up to 5 features, they are just lower-relevance ones. That is what makes the failure look like "wrong results" rather than "no results".

Reproduced live (key redacted as `$MAPTILER_KEY`; a `Referer: http://localhost:3000/` header is required because the key is origin-restricted):

```
GET https://api.maptiler.com/geocoding/floria%C5%84ska.json
      ?key=$MAPTILER_KEY&language=en&limit=5
```

```
address.4443496   [address]  Floriańska, 31-020 Krakow, Poland      rel 1
address.12842791  [address]  Floriańska, 63-700 Krotoszyn, Poland   rel 1
address.14756691  [address]  Floriańska, 03-707 Warsaw, Poland      rel 1
place.1077300     [place]    Floriańska, Iwonicz, Poland            rel 1
address.9184015   [address]  Floriánska, 040 01 Košice I, Slovakia  rel 1
```

The same query with our current filter (`types=postal_code,municipality,municipal_district,place,locality,region`, the exact string the SDK builds):

```
place.1077300  [place]  Floriańska, Iwonicz, Poland      rel 1
place.136564   [place]  Florianka, Górecko Stare, Poland  rel 0.95
place.1077268  [place]  Florianka, Zakrzów, Poland        rel 0.95
```

Three results, none of them the Kraków street. That is the reported symptom, exactly.

"na lotnisku" survives the same filter because the feature we want is not a street:

```
types=postal_code,municipality,municipal_district,place,locality,region
place.4138333          [place]              Osiedle Na Lotnisku, Krakow, Poland  rel 0.8
municipal_district.130719 [municipal_district] NA, Kuwait                        rel 0.5
place.1610108          [place]              Na, Outhoumphone District, Laos      rel 0.5
```

`Osiedle Na Lotnisku` is `place.4138333`, `place_type: ["place"]`, `place_type_name: ["locality"]`, `properties.kind: "place"`. `place` is on our allowed list, so it passes. Without the filter the same query also surfaces two `address`/`kind: street` features ("Na Lotnisko" in Balice and Gierałtowiczki) that currently never reach the UI.

One trap worth recording: an **unrecognised** `types` value is silently ignored rather than rejected. `types=street` returns the full unfiltered result set with a 200, so a typo in the filter looks like it works.

## 3. Other forward parameters, and what the SDK forwards

From the REST docs ([docs.maptiler.com/cloud/api/geocoding](https://docs.maptiler.com/cloud/api/geocoding/)):

| param          | default              | documented semantics                                                                                                                                             |
| -------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `proximity`    | —                    | "A `[lon, lat]` array to use for biasing search results or the string `ip` to do server-side IP based geolocation."                                              |
| `bbox`         | —                    | "A `[w, s, e, n]` bounding box array to use for limiting search results. Only features inside the provided bounding box will be included."                       |
| `country`      | —                    | "Limit search to specific country/countries." (Alpha-2 ISO 3166-1)                                                                                               |
| `limit`        | 5 forward, 1 reverse | "Maximum number of results." Must be 1–10.                                                                                                                       |
| `language`     | Accept-Language      | "Prefer results in specific language specified as ISO 639-1 code. Only the first language code is used when prioritizing forward geocode results to be matched." |
| `fuzzyMatch`   | `true`               | "Set to `false` to disable fuzzy search."                                                                                                                        |
| `autocomplete` | `true`               | "Set to `true` to use autocomplete, `false` to disable autocomplete."                                                                                            |
| `excludeTypes` | `false`              | inverts `types`                                                                                                                                                  |
| `worldview`    | default              | aligns disputed borders and names with a chosen country's perspective                                                                                            |

`proximity` biases, it does not restrict — it moves the matching feature to relevance `1` and demotes the rest to `0.96`. Verified both ways on the same query:

```
…&types=address&proximity=19.94,50.06   → Krakow rel 1, Warsaw 0.96, Krotoszyn 0.96
…&types=address&proximity=21.01,52.23   → Warsaw rel 1, Krakow 0.96, Krotoszyn 0.96
```

The wrapper forwards all of them. `@maptiler/client@3.0.2` (`dist/maptiler-client.mjs`, mirroring [src/services/geocoding.ts](https://github.com/maptiler/maptiler-client-js/blob/main/src/services/geocoding.ts)) serializes:

```
searchParams.set("types", types.join(","))
searchParams.set("excludeTypes", String(excludeTypes))
searchParams.set("proximity", proximity === "ip" ? proximity : proximity.join(","))
searchParams.set("bbox", bbox.join(","))
searchParams.set("country", country.join(","))
searchParams.set("limit", String(limit))
searchParams.set("language", languages)
searchParams.set("fuzzyMatch", fuzzyMatch ? "true" : "false")
searchParams.set("autocomplete", autocomplete ? "true" : "false")
```

`GeocodingOptions` in the installed `.d.ts` covers `bbox`, `proximity`, `country`, `fuzzyMatch`, `autocomplete` on top of the shared `limit` / `types` / `excludeTypes` / `language` / `apiKey`. There is also an escape hatch, `adjustSearchParams?: (searchParams: URLSearchParams) => void` — "Callback function to adjust the target URL search params before fetching" — so nothing in the REST API is out of reach even if the typed surface lags. Note `worldview` is _not_ in the typed options; it would need `adjustSearchParams`.

Two SDK-only notes that are not in the REST docs:

- `types` in reverse geocoding: "In case of reverse geocoding if just a single type is specified, then multiple nearby features of the single type can be returned, otherwise single feature for every specified type (or default types) can be returned." Our reverse call passes no `types` and `limit: 1`, which is the safe combination.
- `language` accepts an array; when several are requested each feature gains `text_<lang>` / `place_name_<lang>` / `language_<lang>` keys alongside the primary ones.

## 4. What a street feature actually looks like

Real response, `GET /geocoding/floria%C5%84ska.json?key=$MAPTILER_KEY&language=en&limit=1&proximity=19.94,50.06&types=address`, geometry elided:

```json
{
  "type": "Feature",
  "id": "address.4443496",
  "text": "Floriańska",
  "place_name": "Floriańska, 31-020 Krakow, Poland",
  "place_type": ["address"],
  "place_type_name": ["address"],
  "relevance": 1,
  "center": [19.940432980656624, 50.06362677175881],
  "bbox": [19.9391927, 50.0620218, 19.9415004, 50.0652026],
  "properties": {
    "ref": "osm:w1013618099",
    "country_code": "pl",
    "wikidata": "Q9365137",
    "kind": "street",
    "place_type_name": ["address"]
  },
  "context": [
    { "id": "postal_code.3079230", "text": "31-020" },
    { "id": "place.4673564", "text": "Rynek Główny", "kind": "virtual_place" },
    {
      "id": "neighbourhood.3275",
      "text": "Old Town",
      "kind": "admin_area",
      "place_designation": "quarter"
    },
    {
      "id": "locality.7840",
      "text": "Old Town",
      "kind": "admin_area",
      "place_designation": "suburb"
    },
    {
      "id": "municipal_district.9605",
      "text": "Krakow",
      "kind": "admin_area",
      "place_designation": "city"
    },
    {
      "id": "municipality.90137",
      "text": "Krakow",
      "kind": "admin_area",
      "place_designation": "city"
    },
    { "id": "major_landform.2308191", "text": "Historic Centre of Kraków" },
    { "id": "county.283", "text": "Krakow", "kind": "admin_area", "place_designation": "city" },
    { "id": "region.183", "text": "Lesser Poland Voivodeship" },
    { "id": "country.167", "text": "Poland" },
    { "id": "continental_marine.1", "text": "Europe" }
  ]
}
```

Points that matter for `featureToLocation` in `apps/web/src/lib/geocoding.ts`:

- The `id` prefix is `address.`, which matches none of our `byPrefix` lookups. Nothing breaks; the self entry simply contributes only its `text`.
- `properties` carries **no** `place_designation` on a street, only `kind: "street"`. Our `self` Ctx therefore has `place_designation: undefined` and is skipped by the settlement scan — which is the behaviour we want.
- The settlement scan still lands correctly. Walking the hierarchy for the first `place_designation === "city"` after excluding `country.*` hits `municipal_district.9605` → **"Krakow"**.
- `district` is positional (self's `text` when it differs from the settlement), so it becomes **"Floriańska"**.
- `formatLocationLabel` is `[district, city, country].filter(Boolean).join(', ')` (`packages/domain/src/location.ts`), giving **"Floriańska, Krakow, Poland"**. That reads correctly for a street — no change needed.
- `region` → "Lesser Poland Voivodeship", `municipality` → "Krakow", `postal_code` → "31-020", `full_address` → "Floriańska, 31-020 Krakow, Poland", `center` → the street's midpoint.

The one semantic wrinkle: the `district` field ends up holding a street name rather than a district. The label reads fine and the DTO does not care, but any code that treats `district` as an administrative subdivision would now sometimes see a street.

Note also `place_type_name` is localized: with `language=pl` the same feature returns `place_type_name: ["adres"]`, `place_name: "Floriańska, 31-020 Kraków, Polska"`.

### A street outside a city

The settlement scan holds for rural streets, and beats MapTiler's own `place_name` on them. Live, `types=address,postal_code,municipality,municipal_district,place,locality,region` for "kwiatowa nowa huta":

| feature            | `place_name` says         | context entry the scan lands on                              | our label                          |
| ------------------ | ------------------------- | ------------------------------------------------------------ | ---------------------------------- |
| `address.10266098` | `gmina Dłutów`            | `place.26082` "Huta Dłutowska", `place_designation: village` | Kwiatowa, Huta Dłutowska, Poland   |
| `address.16083358` | `63-430 Tarchały Wielkie` | `municipal_district.28433` "Tarchały Wielkie", `village`     | Kwiatowa, Tarchały Wielkie, Poland |
| `address.12736563` | `28-362 Nagłowice`        | `municipal_district.44958` "Nagłowice", `village`            | Kwiatowa, Nagłowice, Poland        |

The first is the case that matters: `place_name` names the **commune** ("gmina Dłutów"), not the village the street is in, because no city/town sits above it. Walking to the first `village` designation recovers "Huta Dłutowska". The third also shows the `hamlet` exclusion earning its keep — `place.1052753` "Huta" is a hamlet and is skipped in favour of the village.

## 5. Diacritics and prefix matching

Both work; neither is the problem here.

Accent-insensitive matching is live. `GET /geocoding/florianska.json?...&proximity=19.94,50.06` returns `address.4443496` "Floriańska, 31-020 Krakow, Poland" at `relevance 1` — identical to the accented query. The API echoes a normalized, lowercased, tokenized query back: `"query": ["florianska"]`, and `"query": ["ul", "floriańska", "kraków"]` for a multi-word input.

Prefix matching works when `autocomplete` is on (the default). `types=address&country=pl&proximity=19.94,50.06` for the prefix "florian":

```
address.4443496  Floriańska, 31-020 Krakow, Poland              rel 1
address.6465973  Floriana Straszewskiego, 31-109 Krakow, Poland rel 1
address.6168495  Floriana Kotowskiego, 32-020 Krakow, Poland    rel 1
```

With `autocomplete=false` the same prefix stops prefix-expanding and returns whole-token matches only (US "Florian Avenue", Chilean "Florian"). Keep the default.

`fuzzyMatch` (typo tolerance, default `true`) is what lets "Florianka" score 0.95 against "floriańska". It also means a filtered query returns near-miss noise instead of nothing, which is why the bug presents as three wrong results.

## 6. Recommendation

> **What shipped is narrower than this section.** #52 took `address` and nothing else. `proximity`, `neighbourhood` in `types` and a larger `limit` were each evaluated against the live API and rejected: typing the city does the work a proximity point would ("kwiatowa warszawa" returns five Warsaw Kwiatowas unbiased), and Kraków's Kwiatowa is absent from the unbiased top ten at **any** limit, because MapTiler ranks thousands of equal-relevance matches by its own importance ordering — the city token is what reaches it, not a longer list. Read the rest of this section as the options considered, not as the shipped call. See ADR-0001 for the `district` consequence.

Add `address` to the forward call's `types`, and bias toward where the rider is:

```ts
const res = await maptilersdk.geocoding.forward(trimmed, {
  types: [
    'address',
    'place',
    'locality',
    'neighbourhood',
    'municipal_district',
    'municipality',
    'region',
    'postal_code',
  ],
  proximity: [x, y],
  language,
  limit: 5,
});
```

Verified against the live API — `types=address,place,locality,municipality,municipal_district,region,postal_code,neighbourhood&proximity=19.94,50.06&country=pl`:

```
floriańska  → address.4443496  Floriańska, 31-020 Krakow, Poland  rel 1   (first)
na lotnisku → address.6443426  Na Lotnisko, 30-241 Balice, Poland  rel 0.95
               place.4138333   Osiedle Na Lotnisku, Krakow, Poland rel 0.8 (still present)
```

Trade-offs:

- **`proximity` matters more than the type list.** There are Floriańska streets in Kraków, Krotoszyn, Warsaw, Poręba Żegoty and Szczekociny; without a bias the right one is a coin flip. The rider's selected location, or the map viewport, is the natural source. `bbox` would be too strict — it excludes rather than biases, and a rider searching a destination in the next voivodeship would get nothing.
- **`limit: 5` gets crowded.** Streets are numerous and score high, so adding `address` pushes settlements down. With `proximity` set this is fine; without it, city searches degrade. Consider `limit: 8` (max is 10).
- **`district` becomes overloaded.** `featureToLocation` puts the picked feature's own name there whenever it differs from the settlement, so a street lands in `district`. The label renders correctly ("Floriańska, Krakow, Poland") and `SelectedLocation.district` is nullable, so nothing breaks — but if a street should be distinguishable later, `feature.place_type[0] === 'address'` or `properties.kind === 'street'` is the discriminator to store.
- **`country` is optional.** Adding `country: ['pl']` sharpens Polish results but Loopra is a global platform; prefer `proximity` alone.
- **Do not add `road`.** It returns highways (`Bundesautobahn 4`), not the urban streets people name a meetup after, and a highway centroid is a useless meeting point.
- **`poi` is a separate decision.** It is off by default and would let riders search "Cafe Camelot" or a named bike shop as a meetup point. Worth a follow-up, not part of this fix — POI features carry `osm:tags` and `categories` that `featureToLocation` does not read.
- **Reverse geocoding needs no change.** It passes no `types`, so it already sees the default sixteen, and `limit: 1` keeps the single-feature behaviour the docs require when types are unconstrained.
