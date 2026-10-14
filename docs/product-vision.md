# Loopra Product Vision

Loopra is for cyclists who want company, not bureaucracy.

The core problem is not activity tracking. Cyclists already have Strava, Garmin, Komoot, and other tools for recording rides, planning routes, and measuring performance. The unsolved problem is social access: finding the right people to ride with before the ride happens.

Many cycling communities are hard to enter from the outside. They often live in friend groups, clubs, WhatsApp chats, Strava circles, or Facebook groups. New riders, people new to a city, riders returning after a break, and less confident cyclists may see many people riding alone but still not know how to join the local scene.

Loopra should make this simple:

> Log in. Create a ride in one minute. Or find one and join.

## Positioning

Loopra is not "another Strava." Strava is centered around recording, performance, history, proof, and clubs. Loopra should be centered around matching riders to rides that actually fit them.

The clearest product promise:

> Loopra helps cyclists find rides they actually belong on.

Another useful framing:

> An open ride calendar for cyclists.

## Product Wedge

Strava supports club events, but event creation is tied to clubs and club admins/owners. Loopra's opening is to be ride-first and individual-first:

- Any rider can create a public or approval-based ride.
- A club is optional, not required.
- A rider does not need to already know the right people.
- Nearby riders can discover rides by fit, not by existing social circle.

This matters especially in cities like Krakow, where many cyclists ride alone and existing groups can feel closed, intimidating, or mismatched by pace and expectations.

## Core Loop

The first product experience should stay very simple:

1. I want to ride.
2. I create a ride, or browse nearby rides.
3. I understand if a ride fits my level, pace, discipline, and social intent.
4. I join or request to join.
5. The ride chat opens for coordination.
6. We ride.

## Trust Gate

Loopra should let people discover value before asking too much from them, but participating in the community should require a verified email address.

Account states:

- Anonymous: can see public marketing pages; public ride browsing can be considered later.
- Registered but unverified: can log in, search rides, view ride details, edit basic profile, and resend the verification email.
- Verified: can create rides, join/request to join rides, write in ride chat, and later create groups, upload routes, or send direct messages.

The rule:

> Reading is allowed. Participating requires verified email.

If an unverified user tries to create or join a ride, the UI should not feel like a dead error. It should explain the next step: "Verify your email to join this ride." After verification, the app should return them to the ride or creation flow where possible.

## Ride Contract

Loopra should make expectations explicit before someone joins. This reduces fear for newer riders and prevents frustration for stronger riders.

The ride contract is four promises, always set together and always shown together:

- **Drop Policy:** what happens to a rider who falls back.
- **Pace Policy:** who decides the speed.
- **Formation Policy:** how the group rides on the road.
- **Experience Policy:** who the ride is for.

Next to the contract, a ride says its Ride Type, Bike Type, Capacity, Start Point and start time, and it can have a Route. The full list of values is in [`docs/rides.md`](rides.md).

The ride contract should be honest, not judgmental. A beginner-friendly no-drop ride and a 34 km/h drop training ride are both valid. The product should help each rider find the right room.

## Creation Principle

Creating a ride should feel almost as easy as posting a message, but structured enough that people know what they are joining.

The create-ride form shows a live preview of the ride card, so the organiser sees what other riders will see.

## What To Avoid Early

Do not overbuild around social network features before the ride loop works. Clubs, follows, route libraries, Strava import, achievements, and deep profiles can be useful later, but the first version should protect the simple promise:

> I want to ride. I create a ride. People who fit can join. Or I find a ride that fits me.
