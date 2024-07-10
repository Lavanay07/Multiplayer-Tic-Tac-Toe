const socket = io(); // Connect to the Socket.IO server
const boxes = document.querySelectorAll('.box');
const resetBtn = document.querySelector('#reset-btn');
const newGameBtn = document.querySelector('#new-btn');
const msgContainer = document.querySelector('.msg-container');
const msg = document.querySelector('#msg');

let mySymbol = ''; // Symbol assigned to the current player ('O' or 'X')
let gameStarted = false; // Flag to track if the game has started
let gameEnded = false; // Flag to track if the game has ended
let currentPlayer = ''; // Current player (received from server)

// Event listener for new game button
newGameBtn.addEventListener('click', () => {
  socket.emit('newGame');
});

// Event listener for reset button
resetBtn.addEventListener('click', () => {
  resetGame();
  socket.emit('reset');
});

// Socket.IO event: Receive move from server
socket.on('move', (data) => {

  const { index, symbol, currentPlayer: serverCurrentPlayer } = data;
  boxes[index].innerText = symbol;
  boxes[index].className = 'box ' + symbol.toLowerCase();
  currentPlayer = serverCurrentPlayer; // Update current player based on server data
  msg.innerText = `Game started! Current Turn: ${currentPlayer}`;
  checkGameStatus();
});

// Socket.IO event: Reset game
socket.on('reset1', () => {
  alert("The other player left")
  resetGame();
});
socket.on('reset', () => {
  resetGame();
});

// Socket.IO event: Start game
socket.on('start', (symbol) => {
  const p = document.createElement("p");
  mySymbol = symbol; // Assign 'O' or 'X' to the current player
  p.innerText = `You are ${mySymbol}`
  msg.innerText = `Waiting for other player to join`;
  msgContainer.classList.remove('hide');
  msgContainer.appendChild(p);
});


// Socket.IO event: Game start
socket.on('Gamestart', (data) => {
  gameStarted = true;
  currentPlayer = data.currentPlayer; // Initialize current player from server
  msg.innerText = `Game started! Current player: ${currentPlayer}`;
  msgContainer.classList.remove('hide');
});

// Socket.IO event: Full game room
socket.on('full', () => {
  alert('The game room is full. Please try again later.');
});

// Event listener for clicking on a box
boxes.forEach((box, index) => {
  box.addEventListener('click', () => {
    if(mySymbol != currentPlayer)
      alert("Its the opponents turn")
    if (gameStarted && !gameEnded && mySymbol === currentPlayer && !box.innerText) { // Check if it's the player's turn and box is empty
      box.innerText = mySymbol;
      console.log("Move made by",mySymbol)
      socket.emit('move', { index, symbol: mySymbol });
      // checkGameStatus();
    }
  });
});

// Utility function: Reset the game state
const resetGame = () => {
  mySymbol = '';
  gameStarted = false;
  gameEnded = false;
  boxes.forEach(box => {
    box.innerText = '';
  });
  msgContainer.classList.add('hide');
};

// Utility function: Check the game status (win/draw)
const checkGameStatus = () => {
  if (checkWinner()) {
    gameEnded = true;
    showWinner(currentPlayer === 'O' ? 'X' : 'O'); // Winner is the previous player
  } else if (isDraw()) {
    gameEnded = true;
    gameDraw();
  }
};

// Utility function: Check if there's a winner
const checkWinner = () => {
  const winPatterns = [
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6],
    [3, 4, 5],
    [6, 7, 8],
  ];

  for (let pattern of winPatterns) {
    const [pos1, pos2, pos3] = pattern.map(index => boxes[index].innerText);
    if (pos1 && pos1 === pos2 && pos2 === pos3) {
      return true;
    }
  }

  return false;
};

// Utility function: Check if the game is a draw
const isDraw = () => {
  return [...boxes].every(box => box.innerText !== '');
};

// Utility function: Display a draw message
const gameDraw = () => {
  alert("Game has ended,Please start new game");
  msg.innerText = 'Game was a Draw.';
  msgContainer.classList.remove('hide');
};

// Utility function: Display the winner
const showWinner = (winner) => {
  alert("Game has ended,Please start new game");
  msg.innerText = `Congratulations, Winner is ${winner}`;
  msgContainer.classList.remove('hide');
};
