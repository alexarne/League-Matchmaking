const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

const { json } = require("express");
const express = require("express")
require("dotenv").config()
const PORT = process.env.PORT
const URL = process.env.URL
const API_KEY = process.env.API_KEY

const app = express()
app.use(express.json())

app.listen(PORT, () => {
    console.log("Starting server at port " + PORT)
})
app.use(express.static("public"))

const routes = {
    BR1: "americas",
    EUN1: "europe",
    EUW1: "europe",
    JP1: "asia",
    KR: "asia",
    LA1: "americas",
    LA2: "americas",
    NA1: "americas",
    OC1: "sea",
    TR1: "europe",
    RU: "europe"
}

/**
 * @Requires same body for code request, see Riot Games' API's documentation.
 * @Returns A tournament code
 */
app.post("/getCode", async (req, res) => {
    if (!validProviderID || !validTournamentID) await setVars()
    if (!validProviderID || !validTournamentID) {
        res.status(501)
        res.json("Error 501, service unavailable")
        return
    }

    const response = await fetch(
        `https://americas.api.riotgames.com/lol/tournament-stub/v4/codes?count=1&tournamentId=${tournamentID}&api_key=` + API_KEY,
        requestParams("POST", req.body)
    )
    if (response.status === 200) {
        const code = await response.json()
        res.json(code[0]);
    } else {
        res.status(response.status)
        res.json("Error " + response.status + "... Try again")
    }
})

/**
 * @Requires tournament code, server, and an array of the players who are allowed to join, separated by teams
 * @Returns object containing status, winner, and who joined.
 */
app.post("/getWinner", async (req, res) => {
    const code = req.body.code
    const server = req.body.server
    let [team_left, puuid] = await getSummonerIDs(req.body.team1, server)
    let [team_right, _] = await getSummonerIDs(req.body.team2, server)
    const players = team_left.concat(team_right)

    // Get lobby events
    let response = await fetch(`https://americas.api.riotgames.com/lol/tournament-stub/v4/lobby-events/by-code/${code}?api_key=` + API_KEY)
    const lobby_events = (await response.json()).eventList

    const winner_info = {
        started: false,
        left_winner: false,
        right_winner: false
    }

    // Iterate through which players have joined, and if game has started
    const players_joined = {}
    for (let i = 0; i < players.length; i++) players_joined[players[i]] = false
    for (let i = 0; i < lobby_events.length; i++) {
        if (lobby_events[i].eventType === "ChampSelectStartedEvent") winner_info.started = true
        if (lobby_events[i].eventType === "PlayerJoinedGameEvent") players_joined[lobby_events[i].summonerId] = true
        if (lobby_events[i].eventType === "PlayerQuitGameEvent") {
            players_joined[lobby_events[i].summonerId] = false
            winner_info.started = false
        }
    }
    winner_info.players_joined = players_joined

    // Check latest game in match history to determine winner
    if (winner_info.started === true) {
        response = await fetch(`https://${routes[server]}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=1&api_key=` + API_KEY)
        let lastGame = await response.json()
        if (lastGame.length > 0) {
            // If there is one, check it
            response = await fetch(`https://${routes[server]}.api.riotgames.com/lol/match/v5/matches/${lastGame}?api_key=` + API_KEY)
            lastGame = await response.json()
            if (lastGame.tournamentCode !== code) {
                // If same code, game has been completed, confirm teams
                const team100 = [], team200 = []
                const participants = lastGame.info.participants
                for (let i = 0; i < participants.length; i++) {
                    if (participants[i].teamId === 100) team100.push(participants[i].summonerId)
                    if (participants[i].teamId === 200) team200.push(participants[i].summonerId)
                }
                if (team100.length === team_left.length && team200.length === team_right.length && team100.length === team200.length) {
                    team100.sort()
                    team200.sort()
                    team_left.sort()
                    team_right.sort()
                    // Side selection is optional
                    if (team100[0] !== team_left[0]) [team_left, team_right] = [team_right, team_left]
                    let valid = true
                    for (let i = 0; i < team100.length; i++) {
                        if (team100[i] !== team_left[i] || team200[i] !== team_right[i]) {
                            valid = false
                            break
                        }
                    }
                    if (valid) {
                        console.log(lastGame.info.teams[0].win, lastGame.info.teams[1].win)
                        winner_info.left_winner = lastGame.info.teams[0].win
                        winner_info.right_winner = lastGame.info.teams[1].win
                    }
                }
            }
        }
    }

    res.json(winner_info)
})

async function getSummonerIDs(names, server) {
    const fetches = []
    for (let i = 0; i < names.length; i++) {
        fetches[i] = fetch(`https://${server}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${names[i]}?api_key=` + API_KEY)
    }
    const responsesJSON = await Promise.all(fetches)
    const datas = await Promise.all(responsesJSON.map(r => r.json()))
    const puuid = datas[0].puuid
    for (let i = 0; i < datas.length; i++) datas[i] = datas[i].id
    return [datas, puuid]
}

app.get("/get", (req, res) => {
    console.log("gotten")
    res.write("gotten")
    res.end()
})

// Required for creating codes/games, static for server
var providerID
var tournamentID
var validProviderID = false
var validTournamentID = false

// fetch(URL + "/getCode",
//     requestParams("POST", {
//         mapType: "SUMMONERS_RIFT",
//         pickType: "BLIND_PICK",
//         spectatorType: "NONE",
//         teamSize: 1
//     })
// )
//     .then(response => { console.log("status:", response.status); return response.json() })
//     .then(data => console.log("received:", data))
// console.log("fetched")

// fetch(URL + "/getWinner",
//     requestParams("POST", {
//         code: "EUW9533-TOURNAMENTCODE0001",
//         server: "EUW1",
//         team1: [
//             "grand3k",
//             "cartoonguy"
//         ],
//         team2: [
//             "get racuched",
//             "int baul"
//         ]
//     })
// )
//     .then(response => { console.log("status:", response.status); return response.json() })
//     .then(data => console.log("received:", data))
// console.log("fetched")

async function setVars() {
    if (!validProviderID) await setProviderID()
    await setTournamentID()
}

async function setProviderID() {
    console.log("Fetching providerID...")
    const response = await fetch(
        "https://americas.api.riotgames.com/lol/tournament-stub/v4/providers?api_key=" + API_KEY, 
        requestParams("POST", {
            region: "EUW",
            url: "https://example.com"
        })
    )
    const data = await response.json()

    if (response.status === 200) {
        providerID = data
        validProviderID = true
        console.log("Set providerID to:", providerID)
    } else {
        console.log("providerID failed: Error", response.status)
    }
}

async function setTournamentID() {
    console.log("Fetching tournamentID...")
    const response = await fetch("https://americas.api.riotgames.com/lol/tournament-stub/v4/tournaments?api_key=" + API_KEY, 
        requestParams("POST", {
            name: "League Matchmaking",
            providerId: providerID
        })
    )
    const data = await response.json()

    if (response.status === 200) {
        tournamentID = data
        validTournamentID = true
        console.log("Set tournamentID to:", tournamentID)
    } else {
        console.log("tournamentID failed: Error", response.status)
    }
}

function requestParams(type, body) {
    return {
        method: type,
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify(body),
    }
}