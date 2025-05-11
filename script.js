// Dati dei personaggi (sottoinsieme per brevità, vedi JSON completo sotto)
const characters = [
    { id: 297, name: "Rupert", speed: 7, kickPower: 8, heading: 8, sliding: 8, technique: 9, stamina: 8, strength: 7, catching: 7, total: 62, outfieldNoCNoSta: 47, outfieldNoC: 55, keeper: 14, suggestedPosition: "Defender" },
    { id: 282, name: "Manuel", speed: 8, kickPower: 8, heading: 8, sliding: 7, technique: 9, stamina: 7, strength: 7, catching: 7, total: 61, outfieldNoCNoSta: 47, outfieldNoC: 54, keeper: 14, suggestedPosition: "Midfield" },
    { id: 103, name: "Chris", speed: 7, kickPower: 7, heading: 7, sliding: 8, technique: 7, stamina: 9, strength: 7, catching: 8, total: 60, outfieldNoCNoSta: 43, outfieldNoC: 52, keeper: 15, suggestedPosition: "" },
    { id: 81, name: "Ledski", speed: 9, kickPower: 7, heading: 9, sliding: 7, technique: 5, stamina: 9, strength: 6, catching: 8, total: 60, outfieldNoCNoSta: 43, outfieldNoC: 52, keeper: 14, suggestedPosition: "Striker" },
    { id: 288, name: "Boxer", speed: 6, kickPower: 7, heading: 6, sliding: 6, technique: 9, stamina: 9, strength: 9, catching: 7, total: 59, outfieldNoCNoSta: 43, outfieldNoC: 52, keeper: 16, suggestedPosition: "" },
    { id: 283, name: "Luis", speed: 8, kickPower: 8, heading: 7, sliding: 8, technique: 8, stamina: 6, strength: 8, catching: 6, total: 59, outfieldNoCNoSta: 47, outfieldNoC: 53, keeper: 14, suggestedPosition: "Midfield" },
    { id: 295, name: "Anthony", speed: 7, kickPower: 7, heading: 8, sliding: 7, technique: 8, stamina: 7, strength: 6, catching: 8, total: 58, outfieldNoCNoSta: 43, outfieldNoC: 50, keeper: 14, suggestedPosition: "" },
    { id: 267, name: "APE-01", speed: 8, kickPower: 9, heading: 7, sliding: 6, technique: 5, stamina: 7, strength: 9, catching: 7, total: 58, outfieldNoCNoSta: 44, outfieldNoC: 51, keeper: 16, suggestedPosition: "Defender" },
    { id: 158, name: "Sphinx", speed: 6, kickPower: 6, heading: 7, sliding: 9, technique: 7, stamina: 7, strength: 8, catching: 8, total: 58, outfieldNoCNoSta: 43, outfieldNoC: 50, keeper: 16, suggestedPosition: "" },
    { id: 296, name: "Lee", speed: 5, kickPower: 9, heading: 6, sliding: 7, technique: 6, stamina: 7, strength: 8, catching: 9, total: 57, outfieldNoCNoSta: 41, outfieldNoC: 48, keeper: 17, suggestedPosition: "Keeper" }
];

// Stato dei giocatori
const players = [
    { name: "Giocatore 1", credits: 5000, characters: [] },
    { name: "Giocatore 2", credits: 5000, characters: [] }
];
let currentPlayerIndex = 0;
let currentCharacterIndex = 0;
let timer = 30;
let interval;

// Inizializza la pagina
document.addEventListener("DOMContentLoaded", () => {
    updatePlayerInfo();
    updateCharacterList();
    startAuction();
});

// Aggiorna informazioni giocatore
function updatePlayerInfo() {
    const currentPlayer = players[currentPlayerIndex];
    document.getElementById("player-name").textContent = currentPlayer.name;
    document.getElementById("credits").textContent = currentPlayer.credits;
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

// Avvia l'asta per il personaggio corrente
function startAuction() {
    if (currentCharacterIndex >= characters.length) {
        endAuction();
        return;
    }

    const character = characters[currentCharacterIndex];
    document.getElementById("current-character").textContent = `${character.name} (Total: ${character.total}, Posizione: ${character.suggestedPosition || "Nessuna"})`;
    document.getElementById("min-bid").textContent = character.total * 10; // Offerta minima
    timer = 30;
    document.getElementById("timer").textContent = timer;
    
    interval = setInterval(() => {
        timer--;
        document.getElementById("timer").textContent = timer;
        if (timer <= 0) {
            clearInterval(interval);
            currentCharacterIndex++;
            startAuction();
        }
    }, 1000);
}

// Gestisci offerta
function placeBid() {
    const bidInput = document.getElementById("bid-input");
    const bid = parseInt(bidInput.value);
    const currentPlayer = players[currentPlayerIndex];
    const character = characters[currentCharacterIndex];
    const minBid = character.total * 10;

    if (isNaN(bid) || bid < minBid) {
        alert(`Inserisci un'offerta valida (minimo ${minBid} crediti)!`);
        return;
    }

    if (bid > currentPlayer.credits) {
        alert("Non hai abbastanza crediti!");
        return;
    }

    // Assegna personaggio
    currentPlayer.credits -= bid;
    currentPlayer.characters.push({ name: character.name, bid: bid, position: character.suggestedPosition });

    // Aggiorna UI
    updatePlayerInfo();
    const resultsList = document.getElementById("auction-results");
    const li = document.createElement("li");
    li.textContent = `${currentPlayer.name} ha preso ${character.name} (${character.suggestedPosition || "Nessuna"}) per ${bid} crediti`;
    resultsList.appendChild(li);

    // Rimuovi personaggio
    characters.splice(currentCharacterIndex, 1);
    updateCharacterList();

    // Passa al prossimo giocatore
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    clearInterval(interval);
    bidInput.value = "";
    startAuction();
}

// Termina l'asta
function endAuction() {
    document.getElementById("auction").innerHTML = "<h2>Asta Terminata!</h2>";
    document.getElementById("characters").innerHTML = "<p>Nessun personaggio rimasto.</p>";
    const resultsList = document.getElementById("auction-results");
    const summary = document.createElement("li");
    summary.innerHTML = "<strong>Riepilogo Squadre:</strong><br>";
    players.forEach(player => {
        summary.innerHTML += `${player.name}: ${player.characters.map(c => `${c.name} (${c.bid} crediti)`).join(", ")}<br>`;
    });
    resultsList.appendChild(summary);
}
