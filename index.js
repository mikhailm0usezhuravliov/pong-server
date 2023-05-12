const express = require("express")
const cors = require('cors');
const game = require('./app')
const events = require('./common/events')
const config = require('./config')

// const 
const app = express();
app.use(cors())
app.get("/", async (req, res) => { //when the user is on the home directory,
    console.log("User is on home page"); //log out this message to the console
    res.send("Hello World!"); //send response to client to prevent timeout errors
});

const server = app.listen(3000, () => console.log(`started on port:3000`))
const socketIO = require('socket.io')
const socketIo = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});
game.initOrReset(config);
let gameProcess;
let usersCounter = 0;

socketIo.on('connection', function (socket) {

    console.log(`A user connected ${socket.id}`);
    usersCounter++;
    let currentPlayer;

    socket.on('connected', () => {
        console.log(123);
    })
    setTimeout(() => {
        socket.emit(events.loadConfig, game.config);
        socket.emit(events.status, {
            status: game.status,
            playerL: game.playerL,
            playerR: game.playerR
        });
    }, 500)

    socket.on(events.move, function (changes) {
        game.movePaddle(changes.player, changes.direction);
        socket.broadcast.emit('move', {
            player: changes.player,
            paddleL: game.paddleL,
            paddleR: game.paddleR
        })
    })
    socket.on(events.setPlayer, function (data) {

        currentPlayer = data.name ? data.player : '';
        console.log(`A user ${socket.id}, name ${data.name} is ${currentPlayer}`);

        game[data.player].name = data.name ? data.name : '';
        socket.broadcast.emit(events.setPlayer, {
            player: data.player,
            [data.player]: game[data.player]
        });
        game.playerR.name && game.playerL.name ? game.status = 'ready' : game.status = 'not ready'
        socket.broadcast.emit(events.status, {
            status: game.status,
            playerL: game.playerL,
            playerR: game.playerR
        });
    });
    socket.on(events.start, function () {
        startGame()
    });
    socket.on(events.pause, function () {
        pauseGame()
    });
    socket.on(events.reset, function () {
        game.initOrReset();
        pauseGame();
        socketIo.sockets.emit('game', {
            ball: game.ball
        });
        socketIo.sockets.emit('score', { goal: '', playerL: game.playerL, playerR: game.playerR });
    });
    socket.on(events.disconnect, function () {
        //preventing memory leak
        usersCounter--;
        game[currentPlayer] ? game[currentPlayer].name = '' : null;
        currentPlayer = '';

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
            ball: game.ball
        });
        if (goal) socketIo.sockets.emit(events.score, { goal: goal, playerL: game.playerL, playerR: game.playerR });
    }, 30);

    socketIo.sockets.emit(events.status, {
        status: game.status,
        playerL: game.playerL,
        playerR: game.playerR
    });
}
pauseGame = function () {
    console.log('game paused');
    game.status = 'pause';
    clearInterval(gameProcess);
    gameProcess = null;
    socketIo.sockets.emit(events.status, {
        status: game.status,
        playerL: game.playerL,
        playerR: game.playerR
    });
}