# A replaced refresh token has a reuse window

For 10 seconds after a rotation, the refresh token that was just replaced still answers `200`. It gets a new access token and no refresh token. After those 10 seconds it is read as theft, as before: all token families of the user are deleted.

The reason is two refreshes at the same moment (#145). Two browser tabs, or one page that starts several requests after the access token expired, all send the same refresh token. Rotation was three separate Redis steps, so several requests could pass the comparison and each write a new token. The browser could then keep a token Redis no longer held, and the next refresh, 15 minutes later, logged the rider out on every device.

Two parts fix this, and each needs the other. Rotation is one Lua script, so exactly one request rotates a family. The family remembers the hash of the token it replaced, in a second key (`family:<uuid>:replaced`) with a 10-second TTL, so the requests that lose are not read as theft. Atomic rotation alone would be worse than the bug: the request that loses always holds a replaced token, so every parallel refresh would log the rider out at once.

## Considered options

Giving the request that loses the same new refresh token as the winner was the alternative. It also covers a winner whose response never reaches the browser. It was rejected because a replaced token would then give out a refresh token: a thief who holds one could keep a session alive by using it inside the window. With the chosen design a replaced token is worth one 15-minute access token at most.

Switching theft detection off for the whole family during the window was rejected. The window belongs to one token, the one just replaced. A token that matches neither the current hash nor the remembered one is theft at any time. The wider rule would not save the rider's own device, because that request must still answer `401`, and it would hide a thief who tries an old token just after the rider refreshes.

Keeping the replaced hash inside the family JSON with an expiry time was rejected. A Redis TTL belongs to a whole key, so the script would have to read the time and compare it itself. With a second key Redis ends the window, and the script only asks whether the key exists and matches.

Remembering more than one replaced hash was rejected. It makes the script bigger for a case that needs two rotations within 10 seconds.

## Consequences

Someone who holds a replaced refresh token can get one access token during the 10 seconds. They cannot get a refresh token, and using the token after the window closes all sessions of the user.

A request inside the window never writes to Redis. It does not make the window longer.

Two cases still log the rider out everywhere, and both are accepted:

- The response of the request that rotated never reaches the browser: an aborted prefetch, a closed tab, a lost connection. Redis holds the new token and the browser holds the replaced one. Its next refresh after the window is read as theft.
- Two rotations inside 10 seconds. Only the last replaced hash is remembered, so a slow request that still carries the token from before both rotations matches nothing. This needs a second refresh within 10 seconds, while an access token lives 15 minutes.

Logout, a password change and a password reset delete the remembered hash together with the family, so the window is no way around them.

The script takes both keys of a family. On a single Redis this needs nothing more. On Redis Cluster both keys would have to land on the same node, which the current key names do not promise.
