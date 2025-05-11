// Dati di esempio: personaggi e giocatore
const characters = [
    { name: "Mario", tier: "S", baseValue: 300 },
    { name: "Link", tier: "A", baseValue: 200 },
    { name: "Pikachu", tier: "B", baseValue: 100 }
];

let player = {
    name: "Giocatore 1",
    credits: 1000,
    characters: []
};

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
    document.getElementById("player-name").textContent = player.name;
    document.getElementById("credits").textContent = player.credits;
}

// Aggiorna lista personaggi
function updateCharacterList() {
    const characterList = document.getElementById("characters");
    characterList.innerHTML = "";
    characters.forEach(character => {
        const li = document.createElement("li");
        li.textContent = `${character.name} (Tier: ${character.tier}, Valore Base: ${character.baseValue})`;
        characterList.appendChild(li);
    });
}

// Avvia l'asta per il personaggio corrente
function startAuction() {
    if (currentCharacterIndex >= characters.length) {
        endAuction();
        return;
    }

    const character = characters[currentCharacterIndex];
    document.getElementById("current-character").textContent = character.name;
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

    if (isNaN(bid) || bid <= 0) {
        alert("Inserisci un'offerta valida!");
        return;
    }

    if (bid > player.credits) {
        alert("Non hai abbastanza crediti!");
        return;
    }

    const character = characters[currentCharacterIndex];
    player.credits -= bid;
    player.characters.push({ name: character.name, bid: bid });

    // Aggiorna UI
    updatePlayerInfo();
    const resultsList = document.getElementById("auction-results");
    const li = document.createElement("li");
    li.textContent = `${player.name} ha preso ${character.name} per ${bid} crediti`;
    resultsList.appendChild(li);

    // Passa al prossimo personaggio
    clearInterval(interval);
    currentCharacterIndex++;
    bidInput.value = "";
    startAuction();
}

// Termina l'asta
function endAuction() {
    document.getElementById("auction").innerHTML = "<h2>Asta Terminata!</h2>";
    document.getElementById("characters").innerHTML = "";
}
