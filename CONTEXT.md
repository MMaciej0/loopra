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
The minimum gap between publishing a ride and its start. Stops rides nobody can discover in time.

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

**Club** / **Group** — *undecided*:
A named set of riders who ride together and can publish rides collectively. The word is deliberately unresolved until this is built; note that "group" already means the riders on a single ride (see Pace Policy `group_split`).
_Avoid_: Team

**Nearby**:
Within a rider's chosen radius of a point, measured geographically rather than by administrative area.
