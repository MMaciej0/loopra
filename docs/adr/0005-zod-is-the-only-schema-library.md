# Zod is the only schema library

Every schema in the repo is Zod: request body, query and params, every response, the env config, and the web forms. Fastify validates requests and serializes responses through `fastify-type-provider-zod`, with its compilers set once in the app factory. TypeBox is gone (#148).

Before this, the repo had two schema libraries, split by direction. Requests were Zod, parsed by hand in each controller with `parseBody` / `parseSearchParams`. Responses were TypeBox schemas in `packages/domain`, serialized by `fast-json-stringify`. The reasons to end the split:

- **TypeBox is hard to read.** It has no `Type.Composite`, and `Type.Intersect` emits `allOf`, which `fast-json-stringify` handles poorly. So every shared shape was a property map spread into `Type.Object`. A Zod schema reads like the type it describes, and `.shape` spreads the same way.
- **One library.** One way to write a schema, one set of gotchas, one error format. The hand-written parse helpers and their casts (`request.params as { id: string }`) are gone: the route's schema types `request.body`, `request.query` and `request.params`, and `reply.send()` is typed by the response schema.
- **One shared contract.** A schema that both the API and the web use lives once in `@loopra/domain/schemas`. The API validates a body with it, and a web form extends the same schema. The web request helpers parse each response with the route's real response schema, so a reply that does not match is caught on the Next.js server and logged.
- **Dates are `Date` on both sides.** One `IsoDateTime` codec encodes a `Date` to an ISO string in the API and decodes it back to a `Date` in the web. The hand-written `new Date(...)` and `Date.parse(...)` in the web are gone.

## Considered options

Keeping the split (Zod in, TypeBox out) was the state before. It was rejected for the reasons above, mainly that the web could not use the response schemas to parse, so every web call cast the JSON to a type with `<T>`.

TypeBox everywhere was rejected. The input side needs coercion (`z.coerce.date()`) and transforms (`distance_km` to a string for Drizzle's `numeric`) that JSON Schema cannot express, and web forms already used Zod through `@hookform/resolvers`.

## Consequences

- `packages/domain` declares `zod` as a peer dependency. The API and the web provide one copy, so a schema made in the package is the same class the type provider checks for.
- Fastify validation runs before `preHandler` hooks. An unverified rider who sends a bad body or a malformed id gets `400` or `404`, not the `403` of `requireVerifiedEmail`.
- A params error answers `404`. The params schema puts the resource's not-found code in the uuid rule's message, and the global error handler uses it as the `type`.
- A response that does not match its schema is logged and answers `500 INTERNAL_ERROR`, as it did with `fast-json-stringify`. Narrowing a query's columns still needs its response schema narrowed too.
- The multipart route upload has no body schema. The file is checked by `@loopra/gpx` and the multipart limits. Its response still has a Zod schema.
- `@fastify/swagger` is installed but not registered. Zod schemas can produce OpenAPI documents later.
