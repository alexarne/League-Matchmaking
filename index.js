// const fetch = require("node-fetch")
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const http = require("http")
const fs = require("fs")
require("dotenv").config()
const port = process.env.PORT || 3000


const server = http.createServer(async function(req, res) {
    res.writeHead(200, { "Content-Type": "text/html" })
    fs.readFile("index.html", function(error, data) {
        if (error) {
            res.writeHead(404)
            res.write("Error: File Not Found")
        } else {
            res.write(data)
        }
        res.end()
    })


    // res.write("Hello Node")

    // const API_KEY = process.env.API_KEY
    
    // const response = await fetch("https://euw1.api.riotgames.com/lol/platform/v3/champion-rotations?api_key=" + API_KEY)
    // const data = await response.text()
    // res.write(data)
    
})

server.listen(port, function(error) {
    if (error) {
        console.log("Something went wrong", error)
    } else {
        console.log("Server listening on port " + port)
    }
})


// // import fetch from "node-fetch"

// const API_KEY = process.env.API_KEY
// console.log(API_KEY)
// fetch("https://euw1.api.riotgames.com/lol/platform/v3/champion-rotations?api_key=" + API_KEY)
//     .then(response => response.text())
//     .then(data => document.getElementById("content").innerHTML = data)
//     .catch(err => document.getElementById("content").innerHTML = err)


// console.log("print");