# Loopra Q&A

The knowledge of the Loopra help bot, and the source for the help pages later.
When the app changes, update this file in the same pull request.

The file has two parts:

- **Production** is true on both loopra.cc and staging.loopra.cc.
- **Staging** is true only on staging.loopra.cc, the demo site. Everything in Production is true there too.

The bot gets the whole file and is told where it runs, so it can answer questions about both sites.

Each `###` is one topic. Each `####` is one question a rider may ask. Answers are short and factual.

## Production

### Getting started

#### What is Loopra?

Loopra is a place to find group bike rides near you and join them. You can also organise your own ride and other riders join it.

#### How do I create an account?

Sign up with an email and a password, or with Google. After you sign up with an email, Loopra sends you a link to verify your address. Then you choose a username. Other riders see it on your rides. It does not have to be unique, so your first name is fine.

#### Why do I need to verify my email?

You need a verified email to join, leave or create a ride. You can still browse rides without it. If you did not get the email, open Settings and press "Send again" in the Email section.

#### What are the password rules?

At least 8 characters, with at least one uppercase letter and one special character (not a letter or a number).

#### I forgot my password. What do I do?

On the login page, press "Forgot?". Enter your email and Loopra sends you a reset link. If you sign in with Google, you have no Loopra password. Use "Continue with Google" instead.

### Finding rides

#### Where do I find rides?

Open "Rides" in the sidebar. You can see the rides as a list or on a map.

#### Why does the list show rides only in one area?

The list shows upcoming rides around your selected location, in an area about 100 km wide. The list does not move. To look somewhere else, change your location at the top of the list.

#### How does the map work?

The map shows the rides in the part of the map you can see. Move or zoom the map, and it shows the rides there. You cannot zoom out past about 100 km. Every time you open the map, it starts again at your selected location.

#### Why don't I see any rides?

- There may be no upcoming rides near your selected location yet. Try another location, or move the map.
- Your filters may hide the rides. Press "Clear all" to remove them.

#### What filters can I use?

When (any time, today, next 7 days), bike type, ride type, and availability (has free seats, or full).

#### What is a favourite location?

A place you save so you can switch to it in one tap. You can save up to 5. Pick an area, not an exact address. A rough area is fine.

#### What is the selected location?

The place the rides list starts from. You pick it from your favourite locations, or you search for a place without saving it. New riders can also use the default location: Nowa Huta, Kraków.

### Joining a ride

#### How do I join a ride?

Open the ride and press "Join this ride". You need a verified email. Then you see "You're in", and the other riders see you in "Who's coming".

#### Can I leave a ride?

Yes. Press "Leave ride" any time before the ride starts.

#### Why can't I join a ride?

- The ride is full: every seat is taken.
- The ride has already started.
- The ride was cancelled.
- Your email is not verified yet.

#### Where do I see my rides?

Open "My rides". "Upcoming" shows rides that have not started. "History" shows past rides. You can show only rides you organise, or only rides you joined.

#### What do I see on a ride page?

The start point and time, the route and the elevation profile (if the organiser added a GPX file), the distance, the pace, the ride contract, a note from the organiser, and who is coming. You can download the route.

### The ride contract

#### What is the ride contract?

Four promises the organiser makes about how the group rides: the drop policy, the pace rules, the ride organisation and the experience needed. Every ride has all four, so you know what to expect before you join.

#### What does "no drop", "regroup" or "drop" mean?

- **No drop:** nobody gets left behind. The group waits for everyone.
- **Regroup:** the group waits at the top of climbs or at set meeting points.
- **Drop:** hold the wheel or ride home alone. If you fall behind, the group does not wait.

#### Who decides the pace?

- **Slowest rider:** the group rides at the pace of the slowest rider.
- **Set by leader:** a leader holds an average pace. The ride shows this pace in km/h.
- **Group split:** the group splits into pace groups along the way.

#### How does the group ride on the road?

- **Free:** no set formation. Ride where you like, but stay predictable and safe.
- **Designated riders lead:** chosen riders stay at the front. Nobody passes them unless they call a change.
- **Rotation:** everyone takes a turn at the front, and riders swap at set intervals.

#### What experience do I need?

- **First timers welcome:** no experience needed. The group shows you how a group ride works.
- **Moderate:** you know group riding basics: hand signals, holding a wheel, riding a steady line.
- **Advanced:** high pace, tight formation, turns at the front.

This is a guide for riders. Loopra does not stop anyone from joining.

### Ride types and bikes

#### What kinds of rides are there?

- **Casual:** no particular goal, a relaxed ride.
- **Coffee ride:** a social ride with a café stop.
- **Sightseeing:** a ride to visit interesting places along the route.
- **Training:** a structured effort: intervals, pace work, zones.

#### What bike types are there?

Road, Gravel, MTB, Trekking, Urban, Cyclocross, TT / Triathlon and Electric. "Any" means every bike is welcome.

### Organising a ride

#### How do I organise a ride?

Press "Create ride" in the sidebar. Fill in:

- a title (5–50 characters)
- a start point on the map, and a name for the meeting spot, for example "by the fountain"
- a date and time
- a bike type and a ride type
- a route (optional) or a distance
- the ride contract
- a rider limit (2–500)
- extra info (optional)

Then press "Post ride". The live preview shows how riders will see your ride.

#### How early must I create a ride?

The ride must start at least 5 hours from now. This gives other riders time to find it.

#### How do I add a route?

Upload a GPX file (`.gpx`, up to 10 MB) in the Route part of the form. Loopra draws the route and measures the distance, the ascent, the descent and the elevation profile. A GPX file is a route file. Most bike apps and bike computers can export one.

#### Does the rider limit include me?

Yes. As the organiser, you have a seat on your ride. So the smallest limit is 2: you and one more rider.

#### Can I leave my own ride?

No. The organiser cannot leave. If you cannot ride, cancel the ride.

#### How do I cancel a ride?

Open the ride and press "Cancel ride". Cancelling is final. You cannot undo it. The ride is not deleted: the riders who joined still see it, with a note that it was cancelled. You cannot cancel a ride after it starts.

#### Can I edit a ride?

Not yet. This is not in the app now.

### Safety

#### What safety rules do riders agree to?

- Every rider takes responsibility for themselves and for the group.
- Know and follow the rules of the road. A group ride is in live traffic, not on a closed course.
- Come with your bike in full working order: brakes, tyres and lights checked.
- Riding in a helmet is strongly recommended.
- Riders under 18 need a guardian's consent and any cycling permit their country requires.

### Account and settings

#### What can I change in Settings?

Your username, your password, the theme (light or dark) and the language (English or Polish). You can also see whether your email is verified, and send the link again.

#### Can I change my password if I use Google?

No. If you sign in with Google, your account has no Loopra password.

#### How do I contact the Loopra team?

Open the account menu and press "Contact", or use the Contact link at the bottom of the home page. You can also write to loopra67@gmail.com.

## Staging

### The demo site

#### Why are all rides in Kraków?

You are on the demo site (staging). Its example rides are around Kraków, Poland, and they will not happen. Use "Show Kraków" or the default location to see them. Data on the demo site may be deleted at any time.

#### What is a guest account?

On the demo site only, you can try Loopra with one click, without an email or a password. A guest account works like a normal account: it can create and join rides.
