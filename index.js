const fetch = (...args) =>
    import("node-fetch").then(({ default: fetch }) => fetch(...args));

const express = require("express")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT
const URL = process.env.URL + ":" + PORT
const API_KEY = process.env.API_KEY

app.listen(PORT, () => {
    console.log("Starting server at port " + PORT)
})
app.use(express.static("public"))

app.get("/getCode", async (req, res) => {
    // console.log(req)
    // const code = await fetch(

    // )
    
    const data = {
        weather: 2,
        air_quality: 4
    };
    res.json(data);
})

fetch(URL + "/getCode").then(response => response.json()).then(data => console.log(data))
console.log("fetched")

// Required for creating codes/games
var providerID
var tournamentID
setVars()

async function setVars() {
    await setProviderID()
    await setTournamentID()
}

async function setProviderID() {
    await fetch(
        "https://americas.api.riotgames.com/lol/tournament-stub/v4/providers?api_key=" + API_KEY, 
        requestParams("POST", {
            region: "EUW",
            url: "https://example.com"
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