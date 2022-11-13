# League Matchmaking
Proof of concept for tournament matchmaking in League of Legends using Riot Games' API. 
The intended use case for Riot Games' API is to set up a callback URL through which the result 
is reported once the game has finished. However, this functionality has broken as of 
November 2022, leaving many platforms with dysfunctional systems. This project intends
to showcase a quick fix to this problem, which is to repeatedly request results until 
one can be delivered. I intend to implement the original functionality once the API has
been repaired.


## Demonstration

http://league-matchmaking.herokuapp.com/


## Technologies Used

* Node.js v18.12.1
    * Express v4.18.2
    * Node-fetch v3.3.0
    * Dotenv v16.0.3
* npm v9.1.1