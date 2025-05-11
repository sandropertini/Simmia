// Connessione al backend
const socket = io('https://your-render-backend.onrender.com'); // Sostituisci con l'URL del tuo backend

// Stato locale
let player = { name: '', credits: 5000, characters: [] };
let characters = [];
let currentCharacterIndex = 0;
let timer = 30;
let interval;

// Inizializza la pagina
document.addEventListener("DOMContentLoaded", () => {
    updatePlayerInfo();
    updateCharacterList();
    // Aspetta che il server invii lo stato iniziale
    socket.on('init', (data) => {
        characters = data.characters;
        currentCharacterIndex = data.currentCharacterIndex;
        updateCharacterList();
        startAuction();
    });
    // Gestisci aggiornamenti in tempo reale
    socket.on('update', (data) => {
        characters = data.characters;
        currentCharacterIndex = data.currentCharacterIndex;
        timer = data.timer;
        document.getElementById("timer").textContent = timer;
        updateCharacterList();
        updateAuction(data.currentCharacter);
        updateResults(data.results);
    });
    // Gestisci fine asta
    socket.on('end', (data) => {
        endAuction(data.results);
    });
});

// Imposta nome del giocatore
function setPlayerName() {
    const nameInput = document.getElementById("player-name-input").value.trim();
    if (nameInput) {
        player.name = nameInput;
        socket.emit('join', { name: player.name, credits: player.credits });
        updatePlayerInfo();
        document.getElementById("player-name-input").disabled = true;
        document.querySelector("button[onclick='setPlayerName()']").disabled = true;
    } else {
        alert("Inserisci un nome valido!");
    }
}

// Aggiorna informazioni giocatore
function updatePlayerInfo() {
    document.getElementById("player-name").textContent = player.name || "Nessuno";
    document.getElementById("credits").textContent = player.credits;
}

// Aggiorna lista personaggi
function updateCharacterList() {
    const characterList = document.getElementById("characters");
    characterList.innerHTML = "";
    characters.forEach(character => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${character.name}</td>
            <td>${character.suggestedPosition || "Nessuna"}</td>
            <td>${character.total}</td>
            <td>${character.speed}</td>
            <td>${character.kickPower}</td>
            <td>${character.heading}</td>
            <td>${character.sliding}</td>
            <td>${character.technique}</td>
            <td>${character.stamina}</td>
            <td>${character.strength}</td>
            <td>${character.catching}</td>
        `;
        characterList.appendChild(tr);
    });
}

// Aggiorna stato asta
function updateAuction(character) {
    if (character) {
        document.getElementById("current-character").textContent = `${character.name} (Total: ${character.total}, Posizione: ${character.suggestedPosition || "Nessuna"})`;
        document.getElementById("min-bid").textContent = character.total * 10;
    } else {
        document.getElementById("current-character").textContent = "Nessuno";
        document.getElementById("min-bid").textContent = 0;
    }
}

// Avvia timer locale (sincronizzato con il server)
function startAuction() {
    clearInterval(interval);
    interval = setInterval(() => {
        if (timer > 0) {
            timer--;
            document.getElementById("timer").textContent = timer;
        }
    }, 1000);
}

// Gestisci offerta
function placeBid() {
    if (!player.name) {
        alert("Inserisci prima il tuo nome!");
        return;
    }
    const bidInput = document.getElementById("bid-input");
    const bid = parseInt(bidInput.value);
    const character = characters[currentCharacterIndex];
    const minBid = character ? character.total * 10 : 0;

    if (isNaN(bid) || bid < minBid) {
        alert(`Inserisci un'offerta valida (minimo ${minBid} crediti)!`);
        return;
    }

    if (bid > player.credits) {
        alert("Non hai abbastanza crediti!");
        return;
    }

    socket.emit('bid', { playerName: player.name, characterId: character.id, bid });
    bidInput.value = "";
}

// Aggiorna risultati
function updateResults(results) {
    const resultsList = document.getElementById("auction-results");
    resultsList.innerHTML = "";
    results.forEach(result => {
        const li = document.createElement("li");
        li.textContent = `${result.playerName} ha preso ${result.characterName} (${result.position || "Nessuna"}) per ${result.bid} crediti`;
        resultsList.appendChild(li);
    });
}

// Termina l'asta
function endAuction(results) {
    clearInterval(interval);
    document.getElementById("auction").innerHTML = "<h2>Asta Terminata!</h2>";
    document.getElementById("characters").innerHTML = "<p>Nessun personaggio rimasto.</p>";
    const resultsList = document.getElementById("auction-results");
    const summary = document.createElement("li");
    summary.innerHTML = "<strong>Riepilogo Squadre:</strong><br>";
    const playerSummary = {};
    results.forEach(result => {
        if (!playerSummary[result.playerName]) {
            playerSummary[result.playerName] = [];
        }
        playerSummary[result.playerName].push(`${result.characterName} (${result.bid} crediti)`);
    });
    for (const [name, chars] of Object.entries(playerSummary)) {
        summary.innerHTML += `${name}: ${chars.join(", ")}<br>`;
    }
    resultsList.appendChild(summary);
}
