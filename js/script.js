const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext('2d');

canvas.width = 1200;
canvas.height = 650;


const blueImage = new Image();
blueImage.src = './assets/imgs/bluecar.png'; 

const redImage = new Image();
redImage.src = './assets/imgs/redcar.png'; 

const spriteWidth = 196
const spriteHeight = 260



let gameFrame = 0; 
const staggerFrames = 10; 
const jumpForce = -22; 
const gravity = 1.2; 
const floorY = 560;

let blueScore = 0;
let redScore = 0;

const gameDuration = 90; 
let timeLeft = gameDuration;
let gameOver = false;

let lastTime = 0;
let timerAccumulator = 0;

const goal = {
    width: 18,     
    height: 230,   
    topOffset: 160, 
    color: 'limegreen'
};

const ball = new Ball(600, 100, 35, floorY);

const player1 = {
    playerX : 100,
    playerY : floorY - spriteHeight,
    speed : 5, 
    playerState : 'idle',
    isActionLocked : false, 
    facing : 'right',
    velocityY : 0, 
    isGrounded : true, 
    keys : { right: false , left: false},
    image: blueImage
};

const player2 = {
    playerX : 1000,
    playerY : floorY - spriteHeight,
    speed : 5, 
    playerState : 'idle',
    isActionLocked : false, 
    facing : 'right',
    velocityY : 0, 
    isGrounded : true, 
    keys : { right: false , left: false},
    image: redImage
};



const spriteAnimations = {
    idle: { row: 0, frames: 4 },
    jump: { row: 1, frames: 4 },
    run:  { row: 2, frames: 8 }, 
    kick: { row: 4, frames: 4 }
};

function updatePlayer(player) {
    if (player.keys.right) {
        player.playerX += player.speed;
        player.facing = 'right';
    }
    if (player.keys.left) {
        player.playerX -= player.speed;
        player.facing = 'left';
    }

    if (!player.isGrounded) {
        player.velocityY +=gravity;
        player.playerY += player.velocityY;

        if (player.playerY >= floorY - spriteHeight) {
            player.playerY = floorY - spriteHeight;
            player.velocityY = 0;
            player.isGrounded = true;
            player.isActionLocked = false;
        }
    }

    if (!player.isActionLocked) {
        if (!player.isGrounded) {
            player.playerState = 'jump';
        } else if (player.keys.left || player.keys.right) {
            player.playerState = 'run';
        } else {
            player.playerState = 'idle';
        }
    }

}

function drawPlayer(player) {
    const animation = spriteAnimations[player.playerState];                                
    const frameIndex = Math.floor(gameFrame / staggerFrames) % animation.frames     
    
    if (player.isActionLocked && frameIndex === animation.frames - 1) {
        if(gameFrame % staggerFrames === staggerFrames - 1) {
            player.isActionLocked = false;
            player.playerState = 'idle';
        }
    }

    const col = frameIndex % 4; 
     const rowOffset = Math.floor(frameIndex / 4); 
     const currentRow = animation.row + rowOffset;
 
     const sx = col * spriteWidth;
     const sy = currentRow * (spriteHeight + 21); 

     ctx.save(); 

    if(player.facing === 'left') {
        ctx.translate(player.playerX + spriteWidth /2 , player.playerY + spriteHeight/2);
        ctx.scale(-1 , 1);
        ctx.translate(-(player.playerX + spriteWidth/2),-(player.playerY + spriteHeight/2));
    }

    ctx.drawImage(player.image, sx, sy, spriteWidth, spriteHeight, player.playerX, player.playerY, spriteWidth, spriteHeight);     

    ctx.restore();
}

function checkBallPlayerCollision(ball, player) {
    const playerWidth = spriteWidth;
    const playerHeight = spriteHeight;

    const playerLeft = player.playerX +60;
    const playerRight = player.playerX + playerWidth - 60;
    const playerTop = player.playerY + 90;
    const playerBottom = player.playerY + playerHeight;

    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;
    const ballTop = ball.y - ball.radius
    const ballBottom = ball.y + ball.radius

    const isColliding =
        ballRight > playerLeft &&
        ballLeft < playerRight &&
        ballBottom > playerTop &&
        ballTop < playerBottom;
    
    if (isColliding) {
        
        if (player.playerState === 'kick') {
            
            console.log("BOOM! چه شوتی!");
            
            
            const shootDirection = (player.facing === 'right') ? 1 : -1;
            
            ball.vx = 15 * shootDirection; 
            ball.vy = -12;                 
        } else {

            const side = (ball.x < player.playerX + spriteWidth / 2) ? -1 : 1;
            ball.vx = 5 * side; 
            ball.vy = -3;
        }
        
        
        
        ball.y -= 5; 
    }
}

function animate(timestamp = 0) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

     if (!gameOver) {
        timerAccumulator += deltaTime;

        if (timerAccumulator >= 1000) {
            timeLeft--;
            timerAccumulator = 0;

            if (timeLeft <= 0) {
                timeLeft = 0;
                gameOver = true;
            }
        }
    }

    if (!gameOver) {
        updatePlayer(player1);
        updatePlayer(player2);

        ball.update(canvas.width, canvas.height, goal);
        checkGoal(ball, canvas);

        checkBallPlayerCollision(ball, player1);
        checkBallPlayerCollision(ball, player2);
    }
    
    drawGoals(ctx, canvas);
    drawPlayer(player1);
    drawPlayer(player2);
    
    ball.draw(ctx);
    drawHUD(ctx, canvas);

    if (gameOver) {
        drawGameOver(ctx, canvas);
    }
    gameFrame++;
    requestAnimationFrame(animate);
}

function drawGoals(ctx, canvas) {
    const leftGoalX = 0;
    const rightGoalX = canvas.width - goal.width;
    const goalY = goal.topOffset;

    ctx.fillStyle = goal.color;

    ctx.fillRect(leftGoalX, goalY, goal.width, goal.height);

    ctx.fillRect(rightGoalX, goalY, goal.width, goal.height);
}

function checkGoal(ball, canvas) {
    const goalY = goal.topOffset;
    const goalBottom = goalY + goal.height;
    
    const ballWithinGoalHeight = 
        ball.y + ball.radius >= goal.topOffset &&
        ball.y - ball.radius <= goalBottom ;
    
    if (!ballWithinGoalHeight) return;

    if(ball.x - ball.radius <= goal.width) {
        redScore++;
        resetBall(ball, canvas);
        return;
    }
    if (ball.x + ball.radius >= canvas.width - goal.width) {
        blueScore++;
        resetBall(ball, canvas);
    }
}

function resetBall(ball, canvas) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height/ 2 ;
    ball.vx = 0;
    ball.vy = 0;
}

function drawHUD(ctx, canvas) {
    ctx.save;
    ctx.fillStyle = 'white';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';

    ctx.fillText(`BLUE ${blueScore}  -  ${redScore} RED`, canvas.width / 2, 40);

    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');
    ctx.fillText(`${minutes}:${seconds}`, canvas.width / 2, 75);

    ctx.restore();
}

function drawGameOver(ctx, canvas) {
    let message = 'DRAW!';

    if (redScore > blueScore) {
        message = 'RED WON!';
    } else if (blueScore > redScore) {
        message = 'BLUE WON!';
    }

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);

    ctx.font = 'bold 24px Arial';
    ctx.fillText(`BLUE ${blueScore} - ${redScore} RED`, canvas.width / 2, canvas.height / 2 + 50);

    ctx.restore();
}

blueImage.onload = () => {
    console.log("تصویر لود شد! بزن بریم.");
    animate();
};

window.addEventListener('keydown', (e) => {
    // Player 1
    if (e.code === 'ArrowRight') {player1.keys.right = true;}
    if (e.code === 'ArrowLeft') {player1.keys.left = true; }
    // Player 2
    if (e.code === 'KeyD') {player2.keys.right = true;}
    if (e.code === 'KeyA') {player2.keys.left = true; }


    if (e.code === 'KeyK' && !player1.isActionLocked) {
        player1.playerState = 'kick';
        player1.isActionLocked = true;
    } 
    if (e.code === 'ArrowUp' && player1.isGrounded) {
        
        player1.velocityY = jumpForce; 
        player1.isGrounded = false;
    }

    if (e.code === 'KeyF' && !player2.isActionLocked) {
        player2.playerState = 'kick';
        player2.isActionLocked = true;
    } 
    if (e.code === 'KeyW' && player2.isGrounded) {
        
        player2.velocityY = jumpForce; 
        player2.isGrounded = false;
    }

});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight') {player1.keys.right = false; } 
    if (e.code === 'ArrowLeft') {player1.keys.left = false; } 
    
    if (e.code === 'KeyD') {player2.keys.right = false; } 
    if (e.code === 'KeyA') {player2.keys.left = false; } 

});