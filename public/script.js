const URL = "http://localhost:3001"

document.getElementById("title").innerHTML = "title revised"
// const code = fetch("localhost:3000/getCode")
// document.getElementById("content").innerHTML = code

function displayCode() {
    const label = document.getElementById("codeDisplay")
    const button = document.getElementById("codeButton")
    label.innerHTML = "Loading..."
    button.disabled = true
    fetch(URL + "/getCode",
        requestParams("POST", 
            {
                server: "EUW",
                body: {
                    mapType: "SUMMONERS_RIFT",
                    pickType: "BLIND_PICK",
                    spectatorType: "NONE",
                    teamSize: 1
                }
            }
        )
    )
    .then(response => response.json())
    .then(data => {
        label.innerHTML = data
        button.disabled = false
    })
    .catch((error) => {
        console.log("Caught error", error)
        label.innerHTML = "Fetch failed"
        button.disabled = false
    })
}


function requestParams(type, body) {
    return {
        method: type,
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify(body),
    }
}