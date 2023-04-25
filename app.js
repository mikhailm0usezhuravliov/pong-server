const config = require('./config')

const game = {

    status: 'not ready',
    // score 
    playerL: { score: 0, name: '' },
    playerR: { score: 0, name: '' },

    //container
    boardHeight: config.boardHeight,
    boardWidth: config.boardWidth,
    ballDiameter: config.ballDiameter,

    //ball start position
    startX: config.ballStartX,
    startY: config.ballStartY,

    //ball current position
    ballX: config.ballStartX,
    ballY: config.ballStartY,

    //start velosity 
    velosityX: 3,
    directionX: 1,
    velosityY: 5,
    directionY: 1,

    //paddle
    paddleHeight: config.paddleHeight,
    paddleWidth: 28,
    paddleLx: config.paddleLx,
    paddleRx: config.paddleRx,

    reset: function () {
        this.ballX = config.ballStartX;
        this.ballY = config.ballStartY;
        this.paddleLx = config.paddleLx;
        this.paddleRx = config.paddleRx;
        this.playerL.score = 0;
        this.playerR.score = 0;
    },
    movePaddle: function (player, direction) {
        if (direction == 'ArrowUp') {
            if (player == 'playerL' && this.paddleLx > 20) this.paddleLx -= 25;
            if (player == 'playerR' && this.paddleRx > 20) this.paddleRx -= 25;
        } else {
            if (player == 'playerL' && this.paddleLx < 480) this.paddleLx += 25;
            if (player == 'playerR' && this.paddleRx < 480) this.paddleRx += 25;
        }
    },

    moveBall: function () {
        let goal = '';
        //update ball coordinates 
        let x = this.ballX + this.velosityX * this.directionX;
        let y = this.ballY + this.velosityY * this.directionY;
        // check if it bounce top or bottom
        if (x < 0) {
            x = 0;
            this.directionX = -this.directionX;
        } else {
            if (x + this.ballDiameter > this.boardHeight) {
                x = this.boardHeight - this.ballDiameter;
                this.directionX = -this.directionX;
            }
        }
        // check bounce from right paddle
        if (this.directionY > 0 &&
            y + this.ballDiameter >= (this.boardWidth - this.paddleWidth) &&
            x + this.ballDiameter >= (this.paddleRx) &&
            x <= this.paddleRx + this.paddleHeight) {

            this.directionY = -this.directionY;
            this.velosityX = Math.floor(Math.random() * 4) + 2; // 3-5
            this.velosityY = Math.floor(Math.random() * 5) + 3; // 3-8

        } else {
            //check for goal right
            if (y + this.ballDiameter >= this.boardWidth) {
                y = this.boardWidth - this.ballDiameter;
                this.directionY = -this.directionY;
                this.playerL.score++
                goal = 'goalL';
            }
        }
        // check bounce from left paddle
        if (this.directionY < 0
            && y <= this.paddleWidth &&
            x + this.ballDiameter >= this.paddleLx &&
            x <= this.paddleLx + this.paddleHeight) {
            this.directionY = -this.directionY;

            //randomize velosity
            this.velosityX = Math.floor(Math.random() * 4) + 2;
            this.velosityY = Math.floor(Math.random() * 5) + 3;
        } else {
            //check for goal left
            if (y <= 0) {
                this.directionY = -this.directionY;
                this.playerR.score++
                goal = 'goalR';
            }
        }

        //check for goal left

        this.ballX = x;
        this.ballY = y;
        return goal;
    }
}

module.exports = game;
