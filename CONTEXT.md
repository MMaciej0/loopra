# Loopra

A global cycling community platform. Riders publish rides, other riders join them, and riders find people nearby to ride with.

## Language

### The ride

**Ride**:
A planned cycling outing at a place and time that other riders can join.
_Avoid_: Event, trip, training — Ride is canonical everywhere: table, API path, schema, UI.

**Ride Type**:
What kind of outing a ride is: casual, coffee ride, sightseeing, or training. Every ride has exactly one.
_Avoid_: Category, event type

**Organiser**:
The rider who created a ride. Holds a seat in it and cannot leave it.
_Avoid_: Creator, owner, host, leader — "leader" means something else here (see Pace Policy, Formation Policy)

**Participant**:
A rider who has joined a ride, including the organiser.
_Avoid_: Attendee, member — "member" belongs to Clubs

**Start Point**:
Where a ride begins: coordinates plus the resolved place (city, region, country) and a rider-written name for the meeting spot.
_Avoid_: Location, meeting point

**Lead Time**:
The minimum gap between now and a ride's start for the ride to be created or rescheduled. Stops rides nobody can discover in time. It is a rule of ride creation only: a ride stays on the rides page until it starts, because riders can join until then.

### The ride contract

**Ride Contract**:
The four promises an organiser makes about how the group will ride: Drop Policy, Pace Policy, Formation Policy, Experience Policy. Always set together, always shown together.
_Avoid_: Rules, settings, preferences

**Drop Policy**:
What happens to a rider who falls behind: no drop, regroup, or drop.

**Pace Policy**:
How the group's speed is decided: by the slowest rider, by a leader at a stated pace, or by splitting into groups.

**Formation Policy**:
How the group arranges itself on the road: free, behind a leader, or rotating.

**Experience Policy**:
Who the ride is aimed at: first timers, moderate, or advanced. A statement of intent, not an enforced gate.

**Bike Type**:
The bike a ride is meant for. Every ride states one, and `any` is a real value meaning every bike is welcome — never the absence of an answer.
_Avoid_: "all" as a value

**Capacity**:
The maximum number of participants a ride accepts, organiser included. Every ride is capped; there is no uncapped ride.
_Avoid_: Limit, slots, spots

### The ride lifecycle

**Ride Status**:
What the organiser has decided about a ride: draft, published, or cancelled. Only the organiser changes it. It says nothing about seats or time.
_Avoid_: State — and never "open", "full" or "completed" as a status: those are Availability and Phase

**Cancelled**:
A Ride Status. The organiser has called the ride off, and that is final: a cancelled ride cannot be published again. Its participants stay on it, so they can see what happened. An organiser cannot delete a ride, only cancel it.
_Avoid_: Deleted, removed, closed

**Availability**:
Whether a published ride still has a free seat: open or full. Follows from Capacity and the number of participants, so it changes by itself when a rider joins or leaves.
_Avoid_: Status

**Phase**:
Where a ride is in time: upcoming until its start time, past from then on. A past ride is not known to have happened — only its start time is behind us.
_Avoid_: Completed, finished, in progress

### Routes

**Route**:
A GPX track uploaded by a rider, stored with its derived distance, ascent, descent and elevation profile. Exists independently of any ride and can be attached to many.
_Avoid_: Track, course, path, GPX — GPX is the file format, not the concept

**Elevation Profile**:
The height-over-distance shape derived from a Route, split into segments.

### People and groups

**Rider**:
A person on the platform. The domain word for a user.
_Avoid_: User — reserve for the auth/account record, not the person in cycling terms

**Guest**:
A rider whose account was created with one click on staging, without an email or a password, so a visitor can try Loopra. A real account in every other way: it goes through onboarding and can create and join rides. Exists only on staging.
_Avoid_: Anonymous user, demo user

**Club** / **Group** — _undecided_:
A named set of riders who ride together and can publish rides collectively. The word is deliberately unresolved until this is built; note that "group" already means the riders on a single ride (see Pace Policy `group_split`).
_Avoid_: Team

**Favourite Location**:
A place a rider has saved so they can return to it quickly: coordinates plus the resolved place, named by its resolved label — riders cannot rename it. Optional: a rider has up to five, and a new rider has none. A rider cannot save the same place twice — the same place being the same coordinates, so two streets sharing a label are two places: the modal highlights the one they already have, and the API refuses a duplicate. Distinct from Start Point, which belongs to a single ride.
_Avoid_: Home, base, hometown

**Selected Location**:
The point the rides views start from. The rides list always shows the rides around it, out to the Search Area's maximum size and ordered by start time. The rides map opens on it, but the rider can move the map anywhere from there. Either a place picked from the rider's Favourite Locations or one they searched for without saving. A rider has none until they pick one: new riders, and riders whose single favourite was retired by the move to this model, are asked to pick an area or accept the Nowa Huta, Kraków default before the rides list shows. Independent of Favourite Locations once picked: deleting the favourite it came from does not change it.
_Avoid_: Search origin, current location — "current" suggests the device's GPS position

**District**:
The named part of a city a rider rides out of, when the place they chose is smaller than the city that contains it — including the street itself, since a rider can search for and pick a street. Optional — rural and whole-town locations have none. Favourite and Selected Locations are named `District, Postal Code City, Country` — `Kwiatowa, 02-581 Warsaw, Poland` — collapsing to `City, Country` without a district and dropping the postal code where the place has none, which in practice is everything but a street. The map's screen-reader label is the exception and keeps the `District, City, Country` form. Two streets in one city can share a name, so this field does not identify a place: see ADR-0001.
_Avoid_: Neighbourhood, quarter, suburb, borough — all provider designations for the same thing

**Search Area**:
The part of the world the rides map shows rides for: whatever the map is showing once it stops moving. It starts at the Selected Location and follows the rider as they move and zoom. It is not kept between visits: every visit starts again at the Selected Location. It has a maximum size, so the map cannot zoom out past a region. Belongs to the map only — the rides list does not follow it.
_Avoid_: Nearby, radius — the rides shown are no longer a circle around a point
