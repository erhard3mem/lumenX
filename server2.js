//import { random } from 'core-js/core/number';
//import { is } from 'core-js/core/object';
import readline from 'node:readline';

import express from 'express';
import cors from 'cors';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
 
// --- Middleware ---
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
 
// simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});
 
let playerCount = 0;
let playerGuesses = 0;
let orderedCards;

app.post('/init', (req, res) => {
  playerCount = Number(req.body.playerCount);

  if (!Number.isInteger(playerCount) || playerCount < 1) {
    return res.status(400).json({ status: 'error', message: 'playerCount must be a positive integer' });
  }

  //res.json({ status: 'ok', message: `Game starts with ${playerCount} players!` });
  orderedCards = generateCards(playerCount);
  res.json({ status: 'ok', message: JSON.stringify(orderedCards) });
});

app.post('/setPlayerGuesses', (req, res) => {
    if(orderedCards == undefined || !orderedCards) 
        return res.status(400).json({ status: 'error', message: 'game not initialized' });

  playerGuesses = Number(req.body.guesses);

  if (!Number.isInteger(playerGuesses) || playerGuesses < 1 || playerCount == 0) {
    return res.status(400).json({ status: 'error', message: 'playerGuesses must be a positive integer' });
  }

  const playerStartsOrStartingCard = playGame(playerCount);

  console.log(playerStartsOrStartingCard)
   
  res.json({ status: 'ok', message: JSON.stringify({playerStartsOrStartingCard:playerStartsOrStartingCard}) });
});


// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});
 
// --- Error handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});
 
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});





console.log('Welcome to LUMEN!');
let players = 3;
const playerCards = [];
const playerPoints = [];
const playerTricks = [];
const Color = { "\x1b[33mYellow": 0, "\x1b[32mGreen": 1, "\x1b[34mBlue": 2, "\x1b[31mRed": 3, "\x1b[35mPurple": 4 };

/*FgBlack = "\x1b[30m"
FgRed = "\x1b[31m"
FgGreen = "\x1b[32m"
FgYellow = "\x1b[33m"
FgBlue = "\x1b[34m"
FgMagenta = "\x1b[35m"
FgCyan = "\x1b[36m"
FgWhite = "\x1b[37m"
FgGray = "\x1b[90m"*/


function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function input(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

function getRandomElementOfEnum(e) {
    var keys = Object.keys(e),
        index = Math.floor(Math.random() * keys.length),
        k = keys[index];
    if (typeof e[k] === 'number')
        return e[k];
    return parseInt(k, 10);
}

/*******************************************************************************************************/

function generateCards(players) {
    const maximumCardsCount = 60
    const cardsBasis = [maximumCardsCount];
    const cardsPopulated = [];    
    for ( let i = 0; i < maximumCardsCount; i++) {
        cardsBasis[i] = { value: randomInt(1, 12), color: getRandomElementOfEnum(Color) }; // Random card value between 1 and 100        
        for (let j = 0; j < cardsBasis.length; j++) {
            if ((cardsBasis[i].value === cardsBasis[j].value && cardsBasis[i].color === cardsBasis[j].color && i !== j)) {                
                cardsBasis[i] = { value: randomInt(1, 12), color: getRandomElementOfEnum(Color) }; // Random card value between 1 and 100
                j = -1;
            }             
        }
    }
    for ( let i = 0; i < players; i++) {
        for (let j = 0; j < 10; j++) {
            const randomIndex = randomInt(0, cardsBasis.length - 1);
            cardsPopulated.push({...cardsBasis[randomIndex],player : i});                        
            cardsBasis.splice(randomIndex, 1);
        }
    }
    return cardsPopulated.sort((a, b) => a.player - b.player || a.color - b.color || a.value - b.value);
}