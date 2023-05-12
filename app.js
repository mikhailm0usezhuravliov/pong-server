const randomNumberInRange = require('./common/functions')

const game = {

    status: 'not ready',

    // score 
    playerL: { score: 0, name: '' },
    playerR: { score: 0, name: '' },

    //containerconfig
    config: {},

    //ball position
    ball: { x: 0, y: 0 },

    //paddle
    paddleL: { x: 0, y: 0 },
    paddleR: { x: 0, y: 0 },

    //start velosity & direction
    velosityX: 0,
    directionX: 0,
    velosityY: 0,
    directionY: 0,


    initOrReset(cgf) {

        this.config = cgf ? { ...cgf } : this.config;
        this.playerL.score = 0;
        this.playerR.score = 0;

        this.ball.x = this.config.boardHeight / 2 - this.config.ballDiameter / 2;
        this.ball.y = this.config.boardWidth / 2 - this.config.ballDiameter / 2;

        this.paddleL.x = this.config.boardHeight / 2 - this.config.paddleHeight / 2;
        this.paddleR.x = this.config.boardHeight / 2 - this.config.paddleHeight / 2;

        this.velosityX = randomNumberInRange(this.config.velosityXmin, this.config.velosityXmax);
        this.directionX = (Math.random() > .5 ? 1 : -1);
        this.velosityY = randomNumberInRange(this.config.velosityYmin, this.config.velosityYmax);
        this.directionY = (Math.random() > .5 ? 1 : -1);
    },

    movePaddle: function (player, direction) {
        if (direction == 'ArrowUp') {
            if (player == 'playerL' && this.paddleL.x > 20) this.paddleL.x -= this.config.paddleSpeed;
            if (player == 'playerR' && this.paddleR.x > 20) this.paddleR.x -= this.config.paddleSpeed;
        } else {
            if (player == 'playerL' && this.paddleL.x < 480) this.paddleL.x += this.config.paddleSpeed;
            if (player == 'playerR' && this.paddleR.x < 480) this.paddleR.x += this.config.paddleSpeed;
        }
    },

    moveBall: function () {
        let goal = '';
        //update ball coordinates 
        let x = this.ball.x + this.velosityX * this.directionX;
        let y = this.ball.y + this.velosityY * this.directionY;
        // check if it bounce top or bottom
        if (x < 0) {
            x = 0;
            this.directionX = -this.directionX;
        } else {
            if (x + this.config.ballDiameter > this.config.boardHeight) {
                x = this.config.boardHeight - this.config.ballDiameter;
                this.directionX = -this.directionX;
            }
        }
        // check bounce from right paddle
        if (this.directionY > 0 &&
            y + this.config.ballDiameter >= (this.config.boardWidth - this.config.paddleWidth) &&
            x + this.config.ballDiameter >= (this.paddleR.x) &&
            x <= this.paddleR.x + this.config.paddleHeight) {

            this.directionY = -this.directionY;
            this.velosityX = randomNumberInRange(this.config.velosityXmin, this.config.velosityXmax);
            this.velosityY = randomNumberInRange(this.config.velosityYmin, this.config.velosityYmax);
            console.log(this.velosityY)
            console.log(this.velosityX)

        } else {
            //check for goal right
            if (y + this.config.ballDiameter >= this.config.boardWidth) {
                y = this.config.boardWidth - this.config.ballDiameter;
                this.directionY = -this.directionY;
                this.playerL.score++
                goal = 'goalL';
            }
        }
        // check bounce from left paddle
        if (this.directionY < 0
            && y <= this.config.paddleWidth &&
            x + this.config.ballDiameter >= this.paddleL.x &&
            x <= this.paddleL.x + this.config.paddleHeight) {
            this.directionY = -this.directionY;

            //randomize velosity
            this.velosityX = randomNumberInRange(this.config.velosityXmin, this.config.velosityXmax);
            this.velosityY = randomNumberInRange(this.config.velosityYmin, this.config.velosityYmax);
        } else {
            //check for goal left
            if (y <= 0) {
                this.directionY = -this.directionY;
                this.playerR.score++
                goal = 'goalR';
            }
        }

        //check for goal left

        this.ball.x = x;
        this.ball.y = y;
        return goal;
    },
}

module.exports = game;
