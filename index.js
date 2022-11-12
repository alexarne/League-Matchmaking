const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

const express = require("express")
require("dotenv").config()

const app = express()
const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log("Starting server at port " + port)
})
app.use(express.static("public"))


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