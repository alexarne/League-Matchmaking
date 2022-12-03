const URL = window.location.href.slice(0, -1)   // Remove last '/'

document.getElementById("title").innerHTML = "title revised"
// const code = fetch("localhost:3000/getCode")
// document.getElementById("content").innerHTML = code

function updateRows() {
    let currentRows = document.querySelectorAll(".config-allowedNames-row").length
    let e = document.getElementById("config-teamSize");
    let newRows = Number(e.options[e.selectedIndex].text);
    
    if (currentRows < newRows) {
        // Add rows
        for (let i = currentRows+1; i <= newRows; i++) {
            const original = document.getElementById("config-allowedNames-row1")
            let clone = original.cloneNode(true)

            // Clear text fields
            let inputs = clone.getElementsByTagName('input');
            for (index = 0; index < inputs.length; ++index) {
                if(inputs[index].type =="text")
                inputs[index].value = '';
            }

            clone.id = "config-allowedNames-row" + i
            original.parentNode.appendChild(clone)
        }
    } else if (currentRows > newRows) {
        // Remove rows
        for (let i = newRows+1; i <= currentRows; i++) {
            document.getElementById("config-allowedNames-row" + i).remove()
        }
    }
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

    if (document.getElementById("config-closedLobbyChoiceYes").checked) {
        let arr = []
        document.querySelectorAll(".player").forEach(e => arr.push(e.value))
        config["allowedSummonerIds"] = arr
    }

    console.log(config)
    return [server, useCallback, config]
}

function displayCode() {
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