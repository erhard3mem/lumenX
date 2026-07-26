//import { random } from 'core-js/core/number';
//import { is } from 'core-js/core/object';
import readline from 'node:readline';

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

await input('"\x1b[37mHow many players are playing? (default is 3) ').then(answer => {
    if(answer && !isNaN(answer) && (parseInt(answer) < 3 || parseInt(answer) > 10)) {
        players = 3;
    } else if(answer && !isNaN(answer)) {
        players = parseInt(answer);
    } else {
        players = 3
    }
});

console.log(`"\x1b[37mStarting game with ${players} players...`);


function generateCards() {

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
    
   // console.log(cardsBasis)

    for ( let i = 0; i < players; i++) {
        for (let j = 0; j < 10; j++) {
            const randomIndex = randomInt(0, cardsBasis.length - 1);
            cardsPopulated.push({...cardsBasis[randomIndex],player : i});                        
            cardsBasis.splice(randomIndex, 1);
        }
    }

    // console.log(cardsPopulated);

    return cardsPopulated.sort((a, b) => a.player - b.player || a.color - b.color || a.value - b.value);
}


//let cards  = generateCards();

// order cards by player and then by value
let orderedCards = generateCards();//cards.sort((a, b) => a.player - b.player || a.color - b.color || a.value - b.value);


// player 0 is always human
// rest is computer players
const games = 4;
const rounds = 10; // 10 = default
const guesses = [];
console.log('"\x1b[37mYou are player 0.');
for (let g = 0; g < games; g++) 
{
    console.log("\x1b[37mGAME:",g,'STATS OVERVIEW:',playerPoints);
    let lastRoundWinner = -1;
    for (let i = 0; i < rounds; i++) {
        
        console.log(`\x1b[37mRound ${i + 1} of ${rounds}`);
        for (let j = 0; j < players; j++) {
            const playerCardsForRound = orderedCards.filter(card => card.player === j);
            console.log('\x1b[37m----------------------------------------');
            console.log(`\x1b[37mPlayer ${j} has the following cards:`);        
            for(let x = 0; x < playerCardsForRound.length; x++) {
                playerCardsForRound[x].index = x
                if(j === 0) {
                    console.log(`\x1b[37mCard ${x + 1}: Value: [hidden], Color: ${Object.keys(Color).find(key => Color[key] === playerCardsForRound[x].color)}`);
                } else {   
                    console.log(`\x1b[37mCard ${x + 1}: Value: ${playerCardsForRound[x].value}, Color: ${Object.keys(Color).find(key => Color[key] === playerCardsForRound[x].color)}`);
                }
            }
        }

        // ask for trick guesses only before the first game round
        if ( i == 0 ) {
            let humanGuess = 0;
        
            await input('\x1b[37mWhat is your guess for the amount of tricks you do in this round? (0-10) ').then(answer => {
                if(answer && !isNaN(answer) && (parseInt(answer) < 0 || parseInt(answer) > 10)) {
                    console.log('\x1b[37mInvalid guess. Please enter a number between 0 and 10.');            
                } else if(answer && !isNaN(answer)) {
                    console.log(`\x1b[37mYou guessed ${answer} tricks.`);
                    humanGuess = parseInt(answer);
                } else {
                    console.log('\x1b[37mInvalid guess. Please enter a number between 0 and 10.');
                }
            });

            guesses.push({ player: 0, guess: humanGuess });

            // This is the part where an algorithm is needed to calculate the guesses for the computer players based on their cards and the human player's guess. For now, we will just generate random guesses for the computer players.

            for (let j = 1; j < players; j++) {
                let computerGuess = randomInt(0, 5); 
                console.log(`\x1b[37mPlayer ${j} guessed ${computerGuess} tricks.`);
                guesses.push({ player: j, guess: computerGuess });
            }

           // console.log('\x1b[37m----------------------------------------');
          //  console.log('\x1b[37mGuesses for this round:');
          //  console.log(guesses);
        }

        //let winnerPlayer;
        
        console.log('\x1b[37m----------------------------------------');
        const playerStarts = lastRoundWinner > -1 ? lastRoundWinner : randomInt(0, players - 1);
        
       // console.log(lastRoundWinner,playerStarts);

        console.log(`\x1b[37mPlayer ${playerStarts} starts the round.`);

        let startCard = 0;
        if (playerStarts === 0) {
            console.log('\x1b[37mYou start the round.');        
            await input('\x1b[37mSelect a card to play: ').then(answer => {
                if(answer && !isNaN(answer) && (parseInt(answer) < 1 || parseInt(answer) > 10)) {
                    console.log('\x1b[37mInvalid card. Please enter a card between 1 and 10.');            
                } else if(answer && !isNaN(answer)) {
                    //console.log(`You played card ${answer}.`);
                    startCard = parseInt(answer);
                } else {
                    console.log('\x1b[37mInvalid card. Please enter a number between 1 and 10.');
                }
            });
        } else {        
            startCard = randomInt(1, orderedCards.filter(card => card.player === playerStarts).length);
        }

        // console.log(`Player ${playerStarts} played card ${startCard}.`);

        let initCardPlayed = orderedCards.filter((card, index) => card.player === playerStarts && card.index === startCard-1);
        // remove played card from orderedCards
        orderedCards.splice(orderedCards.indexOf(initCardPlayed[0]), 1);

        console.log(`\x1b[37mCard played has value ${initCardPlayed[0].value} and color ${Object.keys(Color).find(key => Color[key] === initCardPlayed[0].color)}.`);

        let winnerPlayer = playerStarts;
        let winnerValue = initCardPlayed[0].value;
        let winnerColor = initCardPlayed[0].color;
        let yellowPlayed = false;

        const playersArray = Array.from({ length: players }, (_, i) => i);
        playersArray.splice(playersArray.indexOf(playerStarts), 1);


        //console.log("\x1b[37mplayers to play: ",playersArray)


        for(let j of playersArray) {     
            let cardPlayed = -1;
            let cardPlayedCard;
            //console.log("\x1b[37mcurrent player selection:",j)
            if (j == 0) {  
                console.log('\x1b[37mIt`s your turn to play a card.');            
                const playerCardsForRound = orderedCards.filter(card => card.player === 0);
                /*await input('Select a card to play: ').then(answer => {                    
                    if(!isNaN(answer) && (parseInt(answer) < 1 || parseInt(answer) > playerCardsForRound.length)) {
                        console.log('Invalid card. Please enter a card between 1 and ' + playerCardsForRound.length + '.');            
                    } else if (playerCardsForRound[parseInt(answer) - 1] && playerCardsForRound[parseInt(answer) - 1].color !== winnerColor) {
                        
                        if ( playerCardsForRound.filter(x => x.color === winnerColor).length == 0 ) {
                            cardPlayed = parseInt(answer);                            
                        } else {
                            console.log(`Invalid card. You must play a card of the same color as the initial card played. Please enter a card between 1 and ${playerCardsForRound.length}.`);

                        }

                    } else if (playerCardsForRound[parseInt(answer) - 1]) {
                        cardPlayed = parseInt(answer);
                    }                     
                });*/
                while (cardPlayed === -1) {
                    const answer = await input('\x1b[37mSelect a card to play: ');
                    const num = parseInt(answer);

                    if (!isNaN(num) && (num < 1 || num > playerCardsForRound.length)) {
                        console.log('\x1b[37mInvalid card. Please enter a card between 1 and ' + playerCardsForRound.length + '.');
                        continue; // loop back to the top, re-prompt
                    }

                    const card = playerCardsForRound[num - 1];

                    if (!card) {
                        continue; // no such card, re-prompt
                    }

                    if (card.color !== winnerColor) {
                        const hasWinnerColor = playerCardsForRound.some(x => x.color === winnerColor);
                        if (!hasWinnerColor) {
                            cardPlayed = num;
                        } else {
                            console.log(`\x1b[37mInvalid card. You must play a card of the same color as the initial card played. Please enter a card between 1 and ${playerCardsForRound.length}.`);
                            continue; // this is your "here" — loop back instead
                        }
                    } else {
                        cardPlayed = num;
                    }
                    cardPlayedCard = playerCardsForRound[cardPlayed - 1];
                }

                console.log(`\x1b[37mYou played card ${cardPlayed} with value ${playerCardsForRound[cardPlayed - 1].value} and color ${Object.keys(Color).find(key => Color[key] === playerCardsForRound[cardPlayed - 1].color)}.`);              
                cardPlayed = structuredClone(cardPlayed);                
                orderedCards.splice(orderedCards.indexOf(playerCardsForRound[cardPlayed - 1]), 1);
                
            } else {            
                // select a card to play based on the initial card played and the player's cards
                const playerCardsForRound = orderedCards.filter(card => card.player == j);    
                //console.log(playerCardsForRound)        
                let usesYellow = initCardPlayed[0].color == 0 ? false : true;
                let noYellowGiven = false;
                for (let k = 0; k < playerCardsForRound.length; k++) {
                    if (playerCardsForRound[k].color == initCardPlayed[0].color) {                    
                        cardPlayed = playerCardsForRound[k].index + 1;
                        cardPlayedCard = playerCardsForRound[cardPlayed - 1];
                        cardPlayed = structuredClone(cardPlayed);
                        orderedCards.splice(orderedCards.indexOf(playerCardsForRound[k]), 1);  
                        console.log(`\x1b[37mPlayer ${j} played card ${cardPlayed} with value ${playerCardsForRound[k].value} and color ${Object.keys(Color).find(key => Color[key] === playerCardsForRound[k].color)}.`);                        
                        usesYellow = false;
                        break;                        
                    } else {
                        usesYellow = true;
                    }
                }
                if(usesYellow) {
                    for (let k = 0; k < playerCardsForRound.length; k++) {
                        if (playerCardsForRound[k].color == 0) {                    
                            cardPlayed = playerCardsForRound[k].index + 1;
                            cardPlayedCard = playerCardsForRound[cardPlayed - 1];
                            cardPlayed = structuredClone(cardPlayed);
                            orderedCards.splice(orderedCards.indexOf(playerCardsForRound[k]), 1);  
                            console.log(`\x1b[37mPlayer ${j} played card ${cardPlayed} with value ${playerCardsForRound[k].value} and color ${Object.keys(Color).find(key => Color[key] === playerCardsForRound[k].color)}.`);                                                    
                            noYellowGiven = false;
                            break;                        
                        } else {
                            noYellowGiven = true;
                        }
                    }
                } 
                if(noYellowGiven) {
                    cardPlayed = randomInt(0,playerCardsForRound.length-1);
                    cardPlayedCard = playerCardsForRound[cardPlayed];                    
                    orderedCards.splice(orderedCards.indexOf(cardPlayedCard), 1);  
                    console.log(`\x1b[37mPlayer ${j} played card ${cardPlayed} with value ${cardPlayedCard.value} and color ${Object.keys(Color).find(key => Color[key] === cardPlayedCard.color)}.`);                                                                                
                }
            } 

     //       console.log("\x1b[37mcardPlayed =",cardPlayed);
      //      console.log(cardPlayedCard);

            if( yellowPlayed == false && (winnerValue < cardPlayedCard.value && winnerColor == cardPlayedCard.color)) {
            //   winnerColor = cardPlayedCard.color;
                winnerValue = cardPlayedCard.value;
                winnerPlayer = structuredClone(j);
            } else if (winnerValue < cardPlayedCard.value && cardPlayedCard.color == 0)   {
                winnerValue = cardPlayedCard.value;
                winnerPlayer = structuredClone(j);  
                yellowPlayed = true;  
            } else {
                //
            }
            
        }
        console.log(`\x1b[37mWinner in this round is Player ${winnerPlayer}.`);

        lastRoundWinner = winnerPlayer;
        
        const pw = playerTricks.find((x) => x.player === winnerPlayer);
        console.log(pw);
        if (!pw) {
            playerTricks.push({ player: winnerPlayer, tricks: 1 });
            console.log('WINNER PUSHED');
        } else {
            console.log('WINNER COUNTED');
            pw.tricks += 1;
        }

        console.log(playerTricks);

        //roundIndex += 1;
    }

    //cards  = generateCards();
    orderedCards = generateCards();

    // logic for calculating points
    for (let gu of guesses) {
        const p = playerTricks.find((x) => x.player === gu.player);
        if(p) {
            const diff = gu.guess - p.tricks;
            console.log(diff)
            let m = 10;
            if(g == 1)
                m = 20;
            if(g == 2)
                m = 30;
            if(g == 3)
                m = 40;
            let points = 0;
            if(diff == 0) {
                points = p.tricks * m;
            } else if(diff < 0) {
                points = p.tricks * m - (diff*(-1)*5);
            } else if(diff > 0) {
                points = p.tricks * m - (diff*5);
            }
            console.log("\x1b[37mPlayer "+gu.player + " collected "+points +" points!");       
            
            const pp = playerPoints.find((x) => x.player === gu.player);
            if (!pp) {
                playerPoints.push({ player: gu.player, points: points });
            } else {
                pp.points += points;
            }                        
        } else {
            const diff = gu.guess;
            console.log(diff)           
            let points = 0;
            if(diff == 0) {
                //points = gu.guess * m;
            } else if(diff < 0) {
                points = (diff*(-1)*5);
            } else if(diff > 0) {
                points = -(diff*5);
            }
            console.log("\x1b[37mPlayer "+gu.player + " collected "+points +" points!");       
            
            const pp = playerPoints.find((x) => x.player === gu.player);
            if (!pp) {
                playerPoints.push({ player: gu.player, points: points });
            } else {
                pp.points += points;
            }                        
        }
    }
}

console.log("\x1b[37mFINAL RESULTS:",playerPoints);       



