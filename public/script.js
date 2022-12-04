const URL = window.location.href.slice(0, -1)   // Remove last '/'

function updateRows() {
    let currentRows = document.querySelectorAll(".config-allowedPlayers-row").length
    let e = document.getElementById("config-teamSize");
    let newRows = Number(e.options[e.selectedIndex].text);
    
    if (currentRows < newRows) {
        // Add rows
        for (let i = currentRows+1; i <= newRows; i++) {
            const original = document.getElementById("config-allowedPlayers-row1")
            let clone = original.cloneNode(true)

            // Clear text fields
            let inputs = clone.getElementsByTagName('input');
            for (index = 0; index < inputs.length; ++index) {
                if(inputs[index].type =="text") {
                    inputs[index].value = '';
                    inputs[index].classList.remove("empty")
                }
            }

            clone.id = "config-allowedPlayers-row" + i
            original.parentNode.appendChild(clone)
        }
    } else if (currentRows > newRows) {
        // Remove rows
        for (let i = newRows+1; i <= currentRows; i++) {
            document.getElementById("config-allowedPlayers-row" + i).remove()
        }
    }
}

const rows = document.getElementById("config-allowedPlayers");
function showRows() { rows.style.display = "block"; }
function hideRows() { rows.style.display = "none"; }

function filledRows() {
    if (!document.getElementById("config-lobbyRestrictionChoiceClosed").checked) return true

    let allFilled = true
    let playerFields = document.querySelectorAll(".player")
    playerFields.forEach(e => {
        e.classList.remove("empty")
        if (e.value === "") {
            e.classList.add("empty")
            allFilled = false
        }
    })

    return allFilled
}

function getFormConfig() {
    let e = document.getElementById("config-region");
    let server = e.options[e.selectedIndex].text;
    let useCallback = document.getElementById("config-resultMethodChoiceCallback").checked
    
    let config = {}
    e = document.getElementById("config-mapType");
    config["mapType"] = e.options[e.selectedIndex].text;
    e = document.getElementById("config-pickType");
    config["pickType"] = e.options[e.selectedIndex].text;
    e = document.getElementById("config-spectatorType");
    config["spectatorType"] = e.options[e.selectedIndex].text;
    e = document.getElementById("config-teamSize");
    config["teamSize"] = Number(e.options[e.selectedIndex].text);

    if (document.getElementById("config-lobbyRestrictionChoiceClosed").checked) {
        let arr = []
        document.querySelectorAll(".player").forEach(e => arr.push(e.value))
        config["allowedSummonerIds"] = arr
    }

    return [server, useCallback, config]
}

function displayCode() {
    if (!filledRows()) return

    const label = document.getElementById("codeDisplay")
    const button = document.getElementById("codeButton")
    label.innerHTML = "Loading..."
    button.disabled = true

    let [server, useCallback, config] = getFormConfig()
    fetch(URL + "/getCode",
        requestParams("POST", {
                server: server,
                body: config
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