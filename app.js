const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const app = express();

const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.resolve("./public")));

app.get("/", (req, res) => {
  return res.sendFile(path.resolve("./public/index.html"));
});

let players = [];
let currentPlayer = 'X'; // Track the current player on the server

io.on("connection", (socket) => {
  console.log("A new user has connected:", socket.id);

  socket.on('newGame', () => {
    if (players.length < 2) {
      players.push(socket.id);
      const symbol = players.length === 1 ? 'O' : 'X';
      socket.emit('start', symbol);
      if (players.length === 2) {
        io.emit('Gamestart', { currentPlayer }); // Notify both players the game has started
      }
    } else {
      socket.emit('full'); // Notify the client that the game room is full
    }
  });

  socket.on('reset', () => {
    players = [];
    currentPlayer = 'X';
    io.emit('reset');
  });

  socket.on('move', (data) => {
    currentPlayer = currentPlayer === 'O' ? 'X' : 'O';
    io.emit('move', { ...data, currentPlayer }); // Include current player in the move data
    // Toggle current player
  });

  socket.on('disconnect', () => {
    players = players.filter(player => player !== socket.id);
    io.emit('reset1');
  
  });
});

server.listen(9000, () => console.log("server started at Port 9000"));
