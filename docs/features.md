# Loopra — Feature Roadmap

## The Problem We're Solving

**Strava** is great for tracking and performance, but assumes you already know who to ride with. No proactive discovery, no open ride feed, no messaging.

**Facebook groups** have community and chat, but terrible UX for rides: no searchable rides, RSVP is just comments, no headcount, no map, no pace info.

**Loopra** = structured, searchable ride discovery with real RSVPs and per-ride chat. The dedicated tool for finding people to ride with.

---

## Phase 1 — Core (Build First)

The minimum to be useful to a cyclist in any city.

| Feature                      | Description                                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Email verification gate**  | Users can register and search rides immediately, but must verify email before creating rides, joining rides, chatting, or otherwise participating |
| **Structured rides**         | Title, date/time, meetup point (map pin), distance, estimated pace, discipline (road/mtb/gravel/cx), max spots, difficulty                        |
| **RSVP with real headcount** | Join / Leave / Waitlist. Participant count visible upfront — no counting comments                                                                 |
| **Searchable ride feed**     | Filter by location + radius, date range, discipline, pace, difficulty                                                                             |
| **Map view of nearby rides** | Pins on a map showing upcoming rides — the core killer feature vs Facebook                                                                        |
| **Ride chat**                | Per-ride discussion thread (chronological, proper chat UX)                                                                                        |
| **User profiles**            | Discipline preferences, avg pace range, city, short bio                                                                                           |
| **GPX route attachment**     | Attach a `.gpx` file to a ride; display the route on a map                                                                                        |
| **Recurring rides**          | "Every Sunday 8am" — auto-generates rides on a schedule                                                                                           |

## Phase 2 — Community

| Feature                  | Description                                                             |
| ------------------------ | ----------------------------------------------------------------------- |
| **Groups / Clubs**       | Club page, club-scoped ride feed, member management, admin roles        |
| **Follow riders**        | See upcoming rides from people you've ridden with                       |
| **Route library**        | Browse and save popular GPX routes near you                             |
| **Komoot / Strava link** | Paste a link from Komoot or Strava to attach a route without GPX export |

## Phase 3 — Discovery & Growth

| Feature                    | Description                                                             |
| -------------------------- | ----------------------------------------------------------------------- |
| **Nearby rider discovery** | "Find [gravel] riders in [Warsaw] at [20-25 km/h]"                      |
| **Strava import**          | Connect Strava to auto-fill avg speed/ride history (credibility signal) |
| **Push notifications**     | Ride reminder, new join, cancellation, chat message                     |
| **Direct messages**        | Coordinate with riders after a shared ride                              |

## Deliberately Out of Scope

These belong to Strava — no point competing:

- Live GPS tracking during rides
- Segments & KOM/QOM leaderboards
- Training load & fitness analytics
- Heart rate / power data analysis

---

## Maps Strategy

See [maps-strategy.md](./maps-strategy.md) for the full decision.

**Short version**: Mapbox for display + GPX upload for routes. No need to build a route planner — cyclists already use Komoot (free) or Strava. We display what they create there.
