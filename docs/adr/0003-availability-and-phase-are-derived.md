# Availability and Phase are derived, not stored

A ride stores only its Ride Status — `draft`, `published` or `cancelled` — and each value is a decision of the organiser. Whether a ride is full and whether it is past are not stored anywhere. Availability is worked out from Capacity and the participant count, and Phase from the start time, every time they are needed. Two pure functions in `packages/domain` hold the rules, and the API and the web both call them.

This reverses #27, which kept `full` as a stored status so that `GET /rides?status=open` stayed a plain indexed filter. The old enum was `draft, open, full, cancelled, completed`, and only the column default ever wrote it: every ride was `open` forever.

The reason is that a stored copy of a fact can be wrong, and the fact itself cannot. Keeping `full` true needs a write on join, on leave and on every Capacity edit. Keeping `completed` true needs a cron, which is late by its own interval at best. Each of those is a place where the status and the truth can part, and `joinRide` never read the column anyway — it counts participants under a row lock and compares the start time with the clock.

## Considered options

Storing all five values and keeping them in sync was the plan of #27. It was rejected for the reason above: four writers and a cron to maintain two values the database can already answer.

Storing `full` but deriving `past` was rejected because it keeps most of the sync work and leaves one word, `status`, meaning two kinds of thing: a decision and a count.

Adding `availability` and `phase` fields to every ride response was rejected in favour of the shared functions. A `phase` field is out of date a second after it is sent, and the response already carries the participant count, the Capacity and the start time.

## Consequences

The Availability filter on the rides list is no longer an indexed equality. It compares a participant count with Capacity for each candidate row. The rides list is already bounded by the Search Area and a time window, so the count runs over a small set. If that stops being true, a stored participant counter on the ride is the next step — not a stored status.

`open` no longer exists as a stored value. It means "has a free seat" and nothing else. Code that wants "visible to other riders" asks for `published`.

Nothing moves a ride to past. A ride is past because its start time is behind the clock, so there is no moment at which a job, a hook or an alert can fire "on completion". A feature that needs that moment needs its own scheduler.

A past ride is not known to have happened. The model has no way to say a ride was ridden, and "completed" was dropped as a word for that reason.
