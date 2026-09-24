# District holds a street when a rider picks one

Riders can now search for a street and save it as a Favourite Location. A street's name is stored in the `district` column, because that field already holds whatever the rider picked when it is narrower than the settlement containing it, and the resulting label reads correctly: "Floriańska, Kraków, Poland".

## Considered options

A dedicated `street` column, with `district` reserved for administrative subdivisions, was the alternative. It was rejected to keep the change small: MapTiler returns a street as an `address` feature whose own name lands in the same positional slot as a quarter's, so a separate column would mean a migration, a discriminator read from `properties.kind === 'street'`, a wider `LocationBody`, a wider response schema, and a label builder that joins two optional fields instead of one. None of that buys a rider anything today — nothing in the product asks whether a favourite is a street.

## Consequences

`district` now holds two kinds of thing: an administrative part of a settlement, and a street inside one. Code that reads it as an administrative subdivision — a future "riders in your district" query, or anything grouping favourites by area — will be wrong for street favourites. `CONTEXT.md` defines the field in those widened terms.

Two streets in one city can share a name, so a label is no longer a place's identity. Favourite Locations are deduplicated by exact coordinate equality instead (`isSamePlace` in `packages/domain/src/location.ts`), on the server and in the location modal. No tolerance: streets meeting at a junction sit metres apart, and the same feature always geocodes to the same centroid, so a radius would invent duplicates that a strict comparison never sees.

The exit, if a street ever needs to be distinguishable, is the dedicated column: the discriminator is `feature.place_type[0] === 'address'` (equivalently `properties.kind === 'street'`), and the migration backfills `street` from `district` only for rows that came from an address feature — which the existing rows do not record, so they would have to be re-resolved or left alone.
