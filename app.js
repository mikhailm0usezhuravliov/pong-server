const config = require('./config')
const randomNumberInRange = require('./common/functions')

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
    velosityX: randomNumberInRange(config.startVelosityXmin, config.startVelosityXmax),
    directionX: (Math.random() > .5 ? 1 : -1),
    velosityY: randomNumberInRange(config.startVelosityYmin, config.startVelosityYmax),
    directionY: (Math.random() > .5 ? 1 : -1),

    //paddle
    paddleHeight: config.paddleHeight,
    paddleWidth: 28,
    paddleL: { x: config.paddleLx, y: 0 },
    paddleR: { x: config.paddleRx, y: 0 },

    reset: function () {
        this.ballX = config.ballStartX;
        this.ballY = config.ballStartY;
        this.paddleLx = config.paddleLx;
        this.paddleRx = config.paddleRx;
        this.playerL.score = 0;
        this.playerR.score = 0;
        this.directionX = (Math.random() > .5 ? 1 : -1);
        this.directionY = (Math.random() > .5 ? 1 : -1);
    },
    movePaddle: function (player, direction) {
        if (direction == 'ArrowUp') {
            if (player == 'playerL' && this.paddleL.x > 20) this.paddleL.x -= config.paddleSpeed;
            if (player == 'playerR' && this.paddleR.x > 20) this.paddleR.x -= config.paddleSpeed;
        } else {
            if (player == 'playerL' && this.paddleL.x < 480) this.paddleL.x += config.paddleSpeed;
            if (player == 'playerR' && this.paddleR.x < 480) this.paddleR.x += config.paddleSpeed;
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
            this.velosityX = randomNumberInRange(config.startVelosityXmin, config.startVelosityXmax);
            this.velosityY = randomNumberInRange(config.startVelosityYmin, config.startVelosityYmax);

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
            x + this.ballDiameter >= this.paddleL.x &&
            x <= this.paddleL.x + this.paddleHeight) {
            this.directionY = -this.directionY;

            //randomize velosity
            this.velosityX = randomNumberInRange(config.startVelosityXmin, config.startVelosityXmax);
            this.velosityY = randomNumberInRange(config.startVelosityYmin, config.startVelosityYmax);
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
    },
}

module.exports = game;
