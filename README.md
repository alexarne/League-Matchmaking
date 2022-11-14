# League Matchmaking

Proof of concept for tournament matchmaking in League of Legends using Riot Games' API. 
The intended use case for Riot Games' API is to set up a callback URL through which the result 
is reported once the game has finished. However, this functionality has broken as of 
November 2022, leaving many platforms with dysfunctional systems. This project intends
to showcase a quick fix to this problem, which is to repeatedly request results until 
one can be delivered. I intend to implement the original functionality once the API has
been repaired.


## Demonstration

> First-time visits may take longer due to server starting from hibernation

https://league-matchmaking.herokuapp.com/


## Disclaimers

The server does not store any information about the matches (stateless) and only acts as
a proxy for the user's requests in order to, among other things, hide the API key. Therefore,
the requesting client may be tampered with and produce incorrect results or behaviour. It
is intended that parts of what's currently being done on the client should be moved to the
server for a more practical and secure implementation.

Furthermore, since in-game side selection can be blocked by uncooperative players, the 
check for which players have joined is only concerned with whether or not they have joined
at all, not that they are on the correct team.


## Technologies Used

* Node.js v18.12.1
    * Express v4.18.2
    * Node-fetch v3.3.0
    * Dotenv v16.0.3
* npm v9.1.1
