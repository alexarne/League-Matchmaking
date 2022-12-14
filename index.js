const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

const express = require("express")
require("dotenv").config()
const PORT = process.env.PORT
const API_KEY = process.env.API_KEY

const app = express()
app.use(express.json())

app.listen(PORT, () => {
    console.log("Starting server at port " + PORT)
})
app.use(express.static("public"))

/**
 * @Requires server and same body for code request, see Riot Games' API's documentation.
 * @Returns A tournament code
 */
app.post("/getCode", async (req, res) => {
    const [data, fault, status] = await getTournamentID(req.body.server)
    if (status != 200) {
        res.status(status)
        res.json("Error " + fault + " API - " + status + ", " + data.status.message + "... Try again")
        return
    }
    const tid = data

    const response = await fetch(
        `https://americas.api.riotgames.com/lol/tournament-stub/v4/codes?count=1&tournamentId=${tid}&api_key=` + API_KEY,
        requestParams("POST", req.body.body)
    )
    const json = await response.json()

    if (response.status === 200) {
        res.json(json[0]);
    } else {
        res.status(response.status)
        res.json("Error getCode API - " + response.status + ", " + json.status.message + "... Try again")
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
        const [left_win, right_win] = await getWinningTeam(server, puuid)
        winner_info.left_winner = left_win
        winner_info.right_winner = right_win
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

async function getWinningTeam(server, puuid) {
    let response = await fetch(`https://${routes[server]}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=1&api_key=` + API_KEY)
    let lastGame = await response.json()
    if (lastGame.length == 0) return [false, false]

    // If there is one, check it
    response = await fetch(`https://${routes[server]}.api.riotgames.com/lol/match/v5/matches/${lastGame}?api_key=` + API_KEY)
    lastGame = await response.json()
    if (lastGame.tournamentCode !== code) return [false, false]

    // If same code, game has been completed, confirm teams
    const team100 = [], team200 = []
    const participants = lastGame.info.participants
    for (let i = 0; i < participants.length; i++) {
        if (participants[i].teamId === 100) team100.push(participants[i].summonerId)
        if (participants[i].teamId === 200) team200.push(participants[i].summonerId)
    }
    if (team100.length !== team_left.length || team200.length !== team_right.length || team100.length !== team200.length) return [false, false]

    team100.sort()
    team200.sort()
    team_left.sort()
    team_right.sort()

    // Side selection is optional
    let swapped = false
    if (team100[0] !== team_left[0]) {
        [team_left, team_right] = [team_right, team_left]
        swapped = true
    }

    let valid = true
    for (let i = 0; i < team100.length; i++) {
        if (team100[i] !== team_left[i] || team200[i] !== team_right[i]) {
            valid = false
            break
        }
    }
    if (!valid) return [false, false]
    
    let left_win = lastGame.info.teams[0].win
    let right_win = lastGame.info.teams[1].win
    if (swapped) [left_win, right_win] = [right_win, left_win]
    return [left_win, right_win]
}

app.get("/get", (req, res) => {
    console.log("gotten")
    res.write("gotten")
    res.end()
})

// fetch(URL + "/getCode",
//     requestParams("POST", {
//         server: "EUW",
//         body: {
//             mapType: "SUMMONERS_RIFT",
//             pickType: "BLIND_PICK",
//             spectatorType: "NONE",
//             teamSize: 1
//         }
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

async function getTournamentID(server) {
    const [pid_data, pid_status] = await setProviderID(server)
    if (pid_status != 200) return [pid_data, "ProviderID", pid_status]

    const [tid_data, tid_status] = await setTournamentID(pid_data)
    if (tid_status != 200) return [tid_data, "TournamentID", tid_status]

    return [tid_data, "None", 200]
}

/**
 * 
 * @param {String} server Legal values: "BR", "EUNE", "EUW", "JP", "LAN", "LAS", "NA", "OCE", "PBE", "RU", "TR"
 */
async function setProviderID(server) {
    console.log(`Fetching providerID for ${server}...`)
    const response = await fetch(
        "https://americas.api.riotgames.com/lol/tournament-stub/v4/providers?api_key=" + API_KEY, 
        requestParams("POST", {
            region: server,
            url: "https://example.com"
        })
    )
    const data = await response.json()

    if (response.status === 200) {
        console.log("Received providerID:", data)
    } else {
        console.log("providerID failed: Error", data.status.status_code, data.status.message)
    }
    return [data, response.status]
}

async function setTournamentID(providerID) {
    console.log("Fetching tournamentID...")
    const response = await fetch("https://americas.api.riotgames.com/lol/tournament-stub/v4/tournaments?api_key=" + API_KEY, 
        requestParams("POST", {
            name: "League Matchmaking",
            providerId: providerID
        })
    )
    const data = await response.json()
    
    if (response.status === 200) {
        console.log("Received tournamentID:", data)
    } else {
        console.log("tournamentID failed: Error", data.status.status_code, data.status.message)
    }
    return [data, response.status]
}

function requestParams(type, body) {
    return {
        method: type,
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify(body),
    }
}





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