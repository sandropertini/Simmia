const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve il frontend
app.use(express.static('public'));

// Carica personaggi
const characters = JSON.parse(fs.readFileSync('characters.json', 'utf8'));
let players = [];
let currentCharacterIndex = 0;
let timer = 30;
let results = [];

// Timer dell'asta
function startAuctionTimer() {
    timer = 30;
    const interval = setInterval(() => {
        timer--;
        if (timer <= 0) {
            clearInterval(interval);
            currentCharacterIndex++;
            if (currentCharacterIndex < characters.length) {
                startAuctionTimer();
            } else {
                io.emit('end', { results });
            }
        }
        io.emit('update', {
            characters,
            currentCharacterIndex,
            timer,
            results
        });
    }, 1000);
}

io.on('connection', (socket) => {
    console.log('Utente connesso:', socket.id);

    // Invia stato iniziale
    socket.emit('init', { characters, currentCharacterIndex });

    // Gestisci nuovo giocatore
    socket.on('join', (data) => {
        if (!players.find(p => p.name === data.name)) {
            players.push({ name: data.name, credits: data.credits, characters: [] });
        }
    });

    // Gestisci offerta
    socket.on('bid', (data) => {
        const { playerName, characterId, bid } = data;
        const character = characters[currentCharacterIndex];
        const player = players.find(p => p.name === playerName);

        if (!character || character.id !== characterId) return;
        if (!player || bid > player.credits || bid < character.total * 10) return;

        player.credits -= bid;
        player.characters.push({ name: character.name, bid, position: character.suggestedPosition });
        results.push({
            playerName,
            characterName: character.name,
            bid,
            position: character.suggestedPosition
        });

        // Rimuovi personaggio
        characters.splice(currentCharacterIndex, 1);

        // Passa al prossimo personaggio
        currentCharacterIndex = currentCharacterIndex < characters.length ? currentCharacterIndex : characters.length;
        timer = 30;

        io.emit('update', {
            characters,
            currentCharacterIndex,
            timer,
            results
        });

        if (currentCharacterIndex >= characters.length) {
            io.emit('end', { results });
        }
    });

    socket.on('disconnect', () => {
        console.log('Utente disconnesso:', socket.id);
    });
});

// Avvia la prima asta
startAuctionTimer();

server.listen(3000, () => {
    console.log('Server in ascolto su http://localhost:3000');
});
