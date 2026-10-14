# Rides

A **ride** is the core of Loopra. An organiser creates a ride with a start point, a time and a ride contract. Other riders find it on a list or a map and join it.

The README has a short summary. This file has the full reasons for each decision. The words used here (Organiser, Capacity, Availability, Phase, …) are defined in [`CONTEXT.md`](../CONTEXT.md).

## How it works

| Endpoint                  | Who can call it     | What it does                                           |
| ------------------------- | ------------------- | ------------------------------------------------------ |
| `POST /rides`             | a verified rider    | Creates a ride. The organiser joins it at once.        |
| `GET /rides/:id`          | any logged-in rider | The ride with its organiser, route, participants.      |
| `PATCH /rides/:id`        | the organiser       | Changes the ride.                                      |
| `POST /rides/:id/cancel`  | the organiser       | Cancels the ride. This is final.                       |
| `POST /rides/:id/join`    | a verified rider    | Takes a seat.                                          |
| `DELETE /rides/:id/leave` | a verified rider    | Gives the seat back.                                   |
| `GET /rides`              | any logged-in rider | One page of ride cards, for the list.                  |
| `GET /rides/markers`      | any logged-in rider | Only the id and start point of each ride, for the map. |
| `GET /rides/mine`         | any logged-in rider | Rides the rider organises or has joined.               |

1. **Create.** The organiser fills the form. The API checks it with a Zod schema, saves the ride, and adds the organiser as the first participant. Both writes are in one transaction.
2. **Find.** Other riders see the ride on the list (rides around their Selected Location) or on the map (rides in the visible area).
3. **Join.** A rider presses "Join". The API locks the ride row, counts the seats and adds the rider.
4. **Leave or cancel.** A participant can leave. The organiser cannot leave, but can cancel the whole ride.
5. **Start time.** When the start time is behind the clock, the ride is past. Nobody can join, leave or cancel it any more.

## A ride stores decisions, not facts

**Problem:** a ride can be "full" and it can be "past". The easy way is to store these as a status: `open`, `full`, `completed`. But then each join, each leave and each change of Capacity must also update the status. And "completed" needs a cron job, which is always late. Every one of these writes is a place where the stored status and the truth can become different.

**Decision:** a ride stores only its **Ride Status**: `draft`, `published` or `cancelled`. Each value is a decision of the organiser. Two other values are calculated every time they are needed:

- **Availability** (`open` or `full`) comes from Capacity and the number of participants.
- **Phase** (`upcoming` or `past`) comes from the start time and the clock.

Two small pure functions in `packages/domain`, `rideAvailability` and `ridePhase`, hold these rules. The API uses them to refuse a join, and the web uses the same functions to show a "Full" badge or a past-ride page. So the two sides cannot disagree. See [ADR-0003](adr/0003-availability-and-phase-are-derived.md).

The price: the "only open rides" filter is not a simple indexed column. It counts the participants of each candidate ride. The list is already limited by the area and the time window, so the count runs on a small set.

## Two riders cannot take the last seat

**Problem:** one seat is left. Two riders press "Join" at the same moment. If both requests count the participants before either of them writes, both see one free seat, and both get in. This is a **race condition**: the result depends on which request is first.

**Decision:** `joinRide` runs in a transaction and reads the ride row with `SELECT ... FOR UPDATE`. This **row lock** makes the second request wait until the first one has finished. The second request then counts again, sees a full ride, and gets `400 MAX_PARTICIPANTS`.

The lock is on the ride row, not on the participants table. So the lock covers every check together: the ride is not cancelled, it is not past, the rider is not already in it, and a seat is free. `leaveRide`, `updateRide` and `cancelRide` take the same lock, so a cancel and a join at the same moment also happen one after the other.

## The organiser holds a seat

**Problem:** an organiser rides too. If the organiser is not a participant, every place that counts riders must remember to add one.

**Decision:** creating a ride also adds the organiser to `ride_participants`, in the same transaction. Capacity counts the organiser, so the minimum Capacity is 2: the organiser and one more rider. Because the organiser is a normal participant, the seat count, the participant list and "my rides" need no special case.

This brings one new rule: the organiser cannot leave their own ride (`CreatorCannotLeaveError`). Without it, the organiser could remove themselves and leave a ride with no organiser in it. To stop a ride, the organiser cancels it.

## Cancel, never delete

**Problem:** if an organiser deletes a ride, its participants lose it without any trace. They do not know what happened to their Saturday plan.

**Decision:** there is no delete endpoint. The organiser can only cancel. A cancelled ride stays in the database with its participants, so they can still open it and see that it was cancelled. Cancel is final: a cancelled ride cannot be joined, left, changed or published again. A past ride cannot be cancelled either, because it has already started.

## Only the organiser can change a ride

**Problem:** a rider who is not the organiser should not change or cancel a ride. But an answer like `403 Forbidden` also says "this ride exists, it is just not yours".

**Decision:** `updateRide` and `cancelRide` answer `404 RIDE_NOT_FOUND` when the rider is not the organiser — the same answer as for a ride that does not exist. This is the same idea as login, which gives one answer for every failure.

All ride actions that change something (create, update, cancel, join, leave) also need a verified email. The `requireVerifiedEmail` hook checks this before the service runs.

## Lead time: a ride must be created 5 hours ahead

**Problem:** a ride created 20 minutes before it starts is a "ghost ride". Nobody can find it in time, and it fills the list with rides nobody can join.

**Decision:** the start time must be at least `MIN_LEAD_HOURS` (5 hours) in the future. The schema checks it when a ride is created and when its start time is changed. It is a rule for creating only: a ride stays on the list until it starts, because riders can still join until then.

## The ride contract

**Problem:** "Saturday ride, 80 km" does not say what a new rider most wants to know. Will the group wait for me? Who decides the speed?

**Decision:** every ride has four policies, always set together and always shown together:

| Policy            | Question it answers                     | Values                                   |
| ----------------- | --------------------------------------- | ---------------------------------------- |
| Drop Policy       | What happens to a rider who falls back? | `no_drop`, `regroup`, `drop`             |
| Pace Policy       | Who decides the speed?                  | `slowest_rider`, `leader`, `group_split` |
| Formation Policy  | How does the group ride on the road?    | `free`, `leader`, `rotation`             |
| Experience Policy | Who is the ride for?                    | `first_timers`, `moderate`, `advanced`   |

The values are Postgres enums, and the same lists live in `packages/domain`. The order in the list is the order in the UI, and the first value is the default. When the pace is set by a leader, the ride must also say the average pace (`average_pace_kmh`) — the schema refuses the ride without it. The Experience Policy is a statement, not a gate: the API does not stop anyone from joining.

## Finding rides: list and map

The rides page has two views, and they search in two different ways.

- **The list** shows the rides around the rider's **Selected Location**. The web builds a 100 km box around that point (`bboxAround`) and asks `GET /rides`. The list does not move.
- **The map** shows the rides in the **Search Area**: whatever the map shows when it stops moving. The web sends the visible box to `GET /rides/markers` each time.

Both views send the same filters (bike type, ride type, date, availability) and a time window that starts "now". Both only see rides that are `published` and not private.

### Map search with PostGIS

**Problem:** the map must find the rides inside the visible area, and it must stay fast when there are many rides.

**Decision:** the web sends the box as `bbox=west,south,east,north`. The API compares it with the ride's start point using the PostGIS `&&` operator:

```sql
WHERE rides.start_location && ST_MakeEnvelope(west, south, east, north, 4326)
```

`&&` means "the boxes overlap", and it can use the **GiST index** on `start_location` (an index made for geometry). So the database does not have to check every ride.

The box has a maximum size, `SEARCH_AREA_MAX_KM` (100 km on its longest side). Nobody can ask for the whole world in one request. The check is one function, `fitsSearchArea`, in `packages/domain`: the API uses it to refuse a box that is too large, and the map uses it to stop zooming out too far. The box also cannot cross the antimeridian (the 180° line).

### The map loads points first, and cards later

**Problem:** the map can show hundreds of rides. Sending a full ride card (title, organiser, route, participant count) for each one is a lot of data, and the rider looks at only a few.

**Decision:** the map asks in two steps.

1. `GET /rides/markers` returns only `id`, `lng` and `lat` for each ride. The web groups rides that share one start point into one marker.
2. When the rider clicks a marker, the web asks `GET /rides?ids=...` for the cards of those rides only. One request takes at most 24 ids (`RIDE_IDS_MAX`), so the web splits a bigger group into several requests.

Markers are capped at 1000 (`RIDE_MARKERS_MAX`). The API asks the database for 1001. If it gets 1001, it answers `truncated: true`, and the map tells the rider to zoom in.

### The list uses a cursor, not page numbers

**Problem:** with `?page=3`, a new ride added while the rider scrolls moves every later ride by one place. The rider then sees one ride twice, or misses one.

**Decision:** the list uses **keyset pagination**. Rides are ordered by `(start_time, id)`. The cursor is the `id` and `start_time` of the last ride on the page, and the next page asks for rides "after" that pair:

```sql
WHERE (rides.start_time, rides.id) > (cursor_time, cursor_id)
ORDER BY rides.start_time, rides.id
```

The `id` breaks the tie when two rides start at the same minute. To know if there is a next page, the API asks for one more ride than the page size. If it gets it, it returns a `nextCursor`. "My rides" uses the same cursor, ordered the other way for past rides, so the newest past ride comes first.

## One query per level

A ride page shows the ride, its organiser, its route and its participants. The API builds this from two plain SQL queries, not from an ORM "include" feature:

1. The ride, joined with its organiser (`innerJoin`) and its route (`leftJoin`, because a route is optional).
2. The participants, joined with their usernames.

The service puts the two results together. Each query is easy to read and does exactly one thing. See `getRide.ts`.

## Known limits

- **Changing a ride does not check the seats.** An organiser can lower Capacity below the number of riders who already joined. The ride is then shown as full, and nobody is removed. Tracked in [#135](https://github.com/MMaciej0/loopra/issues/135).
- **A past ride can still be changed.** `updateRide` checks the organiser and the cancelled status, but not the Phase. The lead time rule stops a new start time in the past, but other fields (title, description, Capacity) can still change after the ride started. Tracked in [#135](https://github.com/MMaciej0/loopra/issues/135).
- **Nothing happens when a ride ends.** A ride becomes past because the clock moves, not because something writes to it. So there is no moment where a job can run "when the ride is over". A feature that needs this moment needs its own scheduler.
- **A past ride is not known to have happened.** The model has no way to say a ride was really ridden.
- **The availability filter counts participants for each ride.** This is fine while the area and the time window keep the set small. If it becomes slow, the next step is a stored participant counter on the ride, not a stored status.
- **Private rides are not built yet.** The `is_private` column exists, and a private ride does not appear on the list or the map. But it is hidden, not protected: any logged-in rider with its link can open it and join it. The web has no control to make a ride private. Private rides are planned after the alert or messaging system between riders, because the organiser needs a way to invite riders first. See [#157](https://github.com/MMaciej0/loopra/issues/157) and [#134](https://github.com/MMaciej0/loopra/issues/134).
