GAME_URL = "http://localhost:3000/games"
CARDS_URL = "http://localhost:3000/cards"

PLAYER_URL = "http://localhost:3000/players"


const scoreTag = document.querySelector("#score")

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
const mic = document.querySelector(".mic")

recognition.interimResults = false;


mic.addEventListener("click", event => {
  recognition.start();
  mic.innerText = "🗣️"
})



function fetchCards() {
  return fetch(CARDS_URL)
    .then(resp => resp.json())

}



const leadBoard = document.querySelector("#lead-board")
const gameContainer = document.querySelector(".container")
const img1 = document.querySelector(".image1")
const img2 = document.querySelector(".image2")
const startBtn = document.querySelector("#start-btn")
const questionContainer = document.querySelector("#question-container")
const nextBtn = document.querySelector("#next-btn")
const ul = document.querySelector(".letter-grid")
const form = document.querySelector(".player-form")
const playerNameDiv = document.querySelector(".player-name")
let round = 0
const originalBackG= document.body.style.background


let currentPlayer;

let score = 0





function createPlayer(player_name){

  const data = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    }, 
    body: JSON.stringify(
      {name: player_name}
    )
  }

 return fetch(PLAYER_URL, data)
  .then(resp => resp.json())

}





form.addEventListener("submit", event => {
event.preventDefault();
const player_name = event.target[0].value
createPlayer(player_name).then(playerObj => {
  currentPlayer = playerObj;

  startGame();
})
})



nextBtn.addEventListener("click", nextRound);



function startGame() {

  
  scoreTag.className = "scoreOn"
  scoreTag.innerText = `Score: ${score}`


  playerNameDiv.innerText = currentPlayer.name;
  
  form.setAttribute("class", "hide")
  startBtn.setAttribute("class", "hide")
  nextBtn.setAttribute("class", "next-btn btn")
  nextBtn.disabled = true;
  ul.setAttribute("class", "letter-grid")
  questionContainer.removeAttribute("class", "hide");

  fetchCards().then(cards => appendCards(cards))
  
   timer()
}


//timer
const timer=()=>{
  countdown.innerText = ""
  let timeLeft = 10;
  const downloadTimer = setInterval(function(){
  if(timeLeft <= 0){
    clearInterval(downloadTimer);
    document.getElementById("countdown").innerHTML = "Finished";
  } else {
    document.getElementById("countdown").innerHTML = timeLeft + " seconds remaining";
  }
  timeLeft -= 1;
}, 1000);
}


function getAllGames(){

  return fetch(GAME_URL)
  .then(resp => resp.json())
}


function endGame(){

  const data = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    }, 
    body: JSON.stringify({
      player_id: currentPlayer.id,
      score: score
    })
  }

   fetch(GAME_URL, data)
  .then(resp => resp.json())
  .then(gameObj => showResults(gameObj))

}


function showResults(gameObj) { 
  
gameContainer.innerText = `${gameObj.player.name}, you final score is ${gameObj.score}`
const boardBtn = document.createElement("button")
boardBtn.setAttribute("class", "btn")
boardBtn.innerText = "See Leader Board"
gameContainer.append(boardBtn);

boardBtn.addEventListener("click", () => {
 gameContainer.setAttribute("class", "hide");
 leadBoard.setAttribute("class", "leadboard-container")

  getAllGames().then(gamesObj => {
    gamesObj.forEach(appendGame)
  })
  

})


}










function appendGame(game, index){

  const divPlayer = document.createElement("div")
     divPlayer.innerText = `${index + 1}: ${game.player.name} score: ${game.score} `
     leadBoard.append(divPlayer)
}





function nextRound() {
  mic.innerText = "🎤"
  round += 1

  if (round > 1){

    nextBtn.innerText = "end game";
    nextBtn.addEventListener("click", endGame)


  }else{

  console.log(round)
  ul.innerText = ""
  img1.removeAttribute("src")
  img2.removeAttribute("src")
  document.body.style.background = originalBackG;
  setTimeout(() => {
    startGame();
  }, 1000)
   }
}


function appendCards(cards_array) {
   
  /// round is a variable that contain a number that start from 0
  let currentCard = cards_array[round]
   
   
  scoreTag.innerText = `Score: ${score}`

   appendImage(currentCard)
    
   appendOneCard(currentCard)
  
}

function appendImage(cards_Obj) {

  const image1 = cards_Obj.image1
  const image2 = cards_Obj.image2

  img1.setAttribute("src", image1)
  img2.setAttribute("src", image2)

}


function appendOneCard(card) {  
  cardRecog(card);
  letters_array = card.word.split("");
  displayEmptySquare(letters_array);
  timerLetter(letters_array);
}

let handler;

function cardRecog(card){
  handler = event => {
     
    guess = event.results[0][0].transcript.toLowerCase().trim().replace(/\s+/g, '')
     
    word = card.word.toLowerCase()
     debugger
    console.log(guess, word)
  
    if (guess == word) {
      displayAllLetters(true, word.split(""))
      nextBtn.disabled = false
      score ++;
      scoreTag.innerText = `Score: ${score}`
      recognition.removeEventListener("result", handler)
    } else {
      flashBackgroundRed()
    }
  }
recognition.addEventListener("result", handler)
}

function flashBackgroundRed() {
  const prevBgColor = document.body.style.background;
  document.body.style.background = "red";
  setTimeout(() => {
    document.body.style.background = prevBgColor
  }, 500)
}




 //current has a value of true or false
function displayAllLetters(correct, letters_array) {
  if (correct) {
    document.body.style.background = "green";

    appendAllLetters(letters_array)

  } else {
    document.body.style.background = "red";
    
  }

  appendAllLetters(letters_array)
 
}




///append all the letter once the time ends or the players guess the word
function appendAllLetters(letters_array){
  ul.innerText = ""
  letters_array.forEach(letter => {
  const li = document.createElement("li")
  li.setAttribute("class", "block")
  li.innerText = letter
  ul.append(li)
  clearTimeouts();
})

}


let timeouts = []

function clearTimeouts() {
  timeouts.forEach(timeout => clearTimeout(timeout))
  timeouts = []
}


function timerLetter(letters_array) {

  const letterIndexes = [0, 3, letters_array.length - 1]

  timeouts = letters_array
    .map((letter, i) => {
      if (letterIndexes.includes(i)) {
        return setTimeout(() => {
          const li = ul.getElementsByTagName("li")[i]

          li.innerText = letter
        }, 4000 + (letterIndexes.indexOf(i) * 1000))
      }
      return false
    })
    .filter(timeout => timeout !== false)


  const finalTimeout = setTimeout(() => {
    displayAllLetters(false, letters_array);
    nextBtn.disabled = false;
    if (handler){
    recognition.removeEventListener("result", handler)
    }
  }, 11000)

  timeouts.push(finalTimeout)

}


function displayEmptySquare(letters_array) {
  letters_array.forEach(letter => {
    const li = document.createElement("li")
    li.setAttribute("class", "block")
    ul.append(li)

  });
}






 