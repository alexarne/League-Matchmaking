# League Matchmaking

Proof of concept for a tournament matchmaking system in League of Legends using [Riot Games' API](https://developer.riotgames.com/apis). 
The intended use case for Riot Games' API with regards to tournament games is to set up a callback URL through which the result 
is reported once the game has finished. However, this functionality broke between the months of September and 
November of 2022, leaving many platforms with dysfunctional systems. This project intends
to showcase a quick fix to this problem, which is to repeatedly request results until 
one can be delivered. Callbacks have since then been repaired and are therefore offered as an alternative 
way of getting the results. This demonstration also results the game with regards
to players not showing up after a set amount of time, which automates the process even further,
but is something that third party platforms do not.


## Demonstration

> The server goes into hibernate mode after 35 minutes of inactivity, which causes first-time 
visits to take a little longer

https://league-matchmaking.herokuapp.com/


## Disclaimers

The server does not store any information about the matches (stateless) and only acts as
a proxy for the user's requests in order to, among other things, hide the API key. Therefore,
the requesting client may be tampered with and produce incorrect results or behaviour. It
is intended that parts of what's currently being done on the client should be moved to the
server for a more practical and secure implementation.

Furthermore, since in-game side selection can be blocked by uncooperative players, the 
check for which players have joined is only concerned with whether or not they have joined
at all, not that they are on the correct team. However, that is only when checking the lobby.
When checking the result for a finished game, the players must be playing with their correct
teammates (although disregarding which team is playing on which side).


## Technologies Used

* Node.js v18.12.1
    * Express v4.18.2
    * Node-fetch v3.3.0
    * Dotenv v16.0.3
* npm v9.1.1
