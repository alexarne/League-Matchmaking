const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

const express = require("express")
require("dotenv").config()
const PORT = process.env.PORT
const URL = process.env.URL
const API_KEY = process.env.API_KEY

const app = express()
app.use(express.json())

app.listen(443, () => {
    console.log("Starting server at port " + PORT)
})
app.use(express.static("public"))

app.post("/getCode", async (req, res) => {
    console.log("CALL RECEIVED")
    const response = await fetch(
        `https://americas.api.riotgames.com/lol/tournament-stub/v4/codes?count=1&tournamentId=${tournamentID}&api_key=` + API_KEY,
        requestParams("POST", req.body)
    )
    const code = await response.json()
    res.json(code[0]);
})

// Required for creating codes/games, static for server
var providerID
var tournamentID
setVars()

async function setVars() {
    await setProviderID()
    await setTournamentID()

    fetch(URL + "/getCode",
        requestParams("POST", {
            mapType: "SUMMONERS_RIFT",
            pickType: "BLIND_PICK",
            spectatorType: "NONE",
            teamSize: 1
        })
    ).then(response => response.json()).then(data => console.log("received:", data))
    console.log("fetched")
}

async function setProviderID() {
    await fetch(
        "https://americas.api.riotgames.com/lol/tournament-stub/v4/providers?api_key=" + API_KEY, 
        requestParams("POST", {
            region: "EUW",
            url: URL + "/getCode"
        })
    )
        .then((response) => response.json())
        .then((data) => {
            providerID = data
            console.log("Set providerID to:", providerID)
        })
}

async function setTournamentID() {
    await fetch("https://americas.api.riotgames.com/lol/tournament-stub/v4/tournaments?api_key=" + API_KEY, 
        requestParams("POST", {
            name: "League Matchmaking",
            providerId: providerID
        })
    )
        .then((response) => response.json())
        .then((data) => {
            tournamentID = data
            console.log("Set tournamentID to:", tournamentID)
        })
}

function requestParams(type, body) {
    return {
        method: type,
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify(body),
    }
}


// const server = http.createServer(async function(req, res) {
//     res.writeHead(200, { "Content-Type": "text/html" })
//     fs.readFile("public/index.html", function(error, data) {
//         if (error) {
//             res.writeHead(404)
//             res.write("Error: File Not Found")
//         } else {
//             res.write(data)
//         }
//         res.end()
//     })
//     // res.writeHead(200, { "Content-Type": "text/css" })
//     // fs.readFile("public/styles.css", function(error, data) {
//     //     if (error) {
//     //         res.writeHead(404)
//     //         res.write("Error: File Not Found")
//     //     } else {
//     //         res.write(data)
//     //     }
//     // })


//     // res.write("Hello Node")
//     // res.end()
//     // const API_KEY = process.env.API_KEY
    
//     // const response = await fetch("https://euw1.api.riotgames.com/lol/platform/v3/champion-rotations?api_key=" + API_KEY)
//     // const data = await response.text()
//     // res.write(data)
    
// })

// server.listen(port, function(error) {
//     if (error) {
//         console.log("Something went wrong", error)
//     } else {
//         console.log("Server listening on port " + port)
//     }
// })


// // import fetch from "node-fetch"

// const API_KEY = process.env.API_KEY
// console.log(API_KEY)
// fetch("https://euw1.api.riotgames.com/lol/platform/v3/champion-rotations?api_key=" + API_KEY)
//     .then(response => response.text())
//     .then(data => document.getElementById("content").innerHTML = data)
//     .catch(err => document.getElementById("content").innerHTML = err)


// console.log("print");