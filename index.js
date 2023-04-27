const express = require("express")
const cors = require('cors');
const game = require('./app')
const events = require('./common/events')
// const 
const app = express();
app.use(cors())
app.get("/", async (req, res) => { //when the user is on the home directory,
    console.log("User is on home page"); //log out this message to the console
    res.send("Hello World!"); //send response to client to prevent timeout errors
});

const server = app.listen(3000, () => console.log(`started on port:3000`))

const socket = require('socket.io')
// const connections = require('./common/move')

const socketIo = socket(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

let gameProcess;
let usersCounter = 0;

socketIo.on('connection', (socket) => {
    console.log(`A user connected ${socket.id}`);
    usersCounter++;
    socket.emit('connected', usersCounter);

    socket.on(events.move, function (changes) {
        game.movePaddle(changes.player, changes.direction);
        socketIo.sockets.emit('move', {
            player: changes.player,
            paddleLx: game.paddleLx,
            paddleRx: game.paddleRx
        })
    })
    socket.on(events.setPlayer, function (data) {
        game[data.player].name = data.name ? data.name : '';
        socketIo.sockets.emit(events.setPlayer, { [data.player]: game[data.player] });
        game.playerR.name && game.playerL.name ? game.status = 'ready' : game.status = 'not ready'
        socketIo.sockets.emit(events.status, {
            status: game.status
        });
    });

    socket.on(events.start, function (changes) {
        startGame()
    });

    socket.on(events.pause, function (changes) {
        pauseGame()
    });
    socket.on(events.reset, function (changes) {
        game.reset();
        pauseGame();
        socketIo.sockets.emit('game', {
            ballX: game.ballX,
            ballY: game.ballY,
        });
        socketIo.sockets.emit('score', { goal: '', playerL: game.playerL, playerR: game.playerR });
    });

    // emit current game status
    socketIo.sockets.emit(events.status, {
        status: game.status
    });

    socket.on(events.disconnect, function () {
        //preventing memory leak
        usersCounter--;
        if (usersCounter < 2) {
            pauseGame();
        }
        console.log('A user disconnected');
    });
})

startGame = function () {

    if (gameProcess) return;
    game.status = 'action';
    gameProcess = setInterval(() => {
        let goal = game.moveBall();
        socketIo.sockets.emit(events.game, {
            ballX: game.ballX,
            ballY: game.ballY,
        });
        if (goal) socketIo.sockets.emit(events.score, { goal: goal, playerL: game.playerL, playerR: game.playerR });
    }, 30);

    socketIo.sockets.emit(events.status, {
        status: game.status
    });
}
pauseGame = function () {
    console.log('game paused');
    game.status = 'pause';
    clearInterval(gameProcess);
    gameProcess = null;
    socketIo.sockets.emit(events.status, {
        status: game.status
    });
}