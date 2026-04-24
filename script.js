// --- GAME CONFIGURATION ---
const GAME_CONFIG = {
    initialBalls: 100,
    pegRows: 16,           // Number of peg rows (more rows = better Gaussian curve)
    pegSize: 2,
    ballRadius: 3,
    gravity: 0.4,
    friction: 0.99,
    bounceDamping: 0.7,
    colors: {
        peg: '#ffffff',
        ball: '#00ffcc', // Neon green/cyan
        bucketBase: '#1a1a1a',
        bucketText: '#ffffff',
        premiumLeft: '#ff4444',   // Red (Low)
        premiumRight: '#ffff44',  // Yellow (High)
        normal: '#2e8b57'         // Green (Medium)
    }
};

// --- GAME STATE ---
let gameState = {
    ballsInPlay: [],      // Balls currently falling
    ballsOnBoard: [],     // Static balls in buckets (for visualization)
    currentBalls: GAME_CONFIG.initialBalls,
    isRunning: true,
    pegs: []              // Array to store peg coordinates
};

// --- DOM ELEMENTS ---
const canvas = document.getElementById('boardCanvas');
const ctx = canvas.getContext('2d');
const elBallCount = document.getElementById('ball-count');
const btnDrop = document.getElementById('btn-drop');
const btnRestart = document.getElementById('btn-restart');
const gameOverScreen = document.getElementById('game-over-screen');
const gameOverMsg = document.getElementById('game-over-msg');
const dropCountSelect = document.getElementById('drop-count');

// Adjust canvas to container size
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    if (typeof generatePegs === 'function') {
        generatePegs();
    }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- CLASSES AND LOGIC ---

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2; // Small initial horizontal variation
        this.vy = 0;
        this.radius = GAME_CONFIG.ballRadius;
        this.color = GAME_CONFIG.colors.ball;
        this.finished = false;
        this.id = Math.floor(Math.random() * 10000);
    }

    update(pegArray, width) {
        if (this.finished) return;

        // Gravity
        this.vy += GAME_CONFIG.gravity;
        this.x += this.vx;
        this.y += this.vy;

        // Collision with side walls
        if (this.x < 0) {
            this.x = 0;
            this.vx *= -GAME_CONFIG.bounceDamping;
        } else if (this.x > width) {
            this.x = width;
            this.vx *= -GAME_CONFIG.bounceDamping;
        }

        // Collision with pegs
        for (let peg of pegArray) {
            const dx = this.x - peg.x;
            const dy = this.y - peg.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < GAME_CONFIG.pegSize + this.radius) {
                // Move out of collision
                const overlap = (GAME_CONFIG.pegSize + this.radius) - dist;
                const angle = Math.atan2(dy, dx);
                
                this.x += Math.cos(angle) * overlap;
                this.y += Math.sin(angle) * overlap;

                // Bounce with damping and slight randomness
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                const randomBias = (Math.random() - 0.5) * 1.5;
                
                this.vx = Math.cos(angle) * speed * GAME_CONFIG.bounceDamping + randomBias;
                this.vy = Math.sin(angle) * speed * GAME_CONFIG.bounceDamping;
            }
        }

        // Check if it has passed the play area (fallen to the bottom)
        const bottomThreshold = canvas.height - 60;
        
        if (this.y > bottomThreshold && !this.finished) {
            this.finished = true;
            this.y = canvas.height - 30; // Adjust visually
            finalizeBall(this.x);
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.closePath();
        ctx.shadowBlur = 0;
    }
}

// --- DRAW STRUCTURE (PEGS AND BUCKETS) ---

function generatePegs() {
    gameState.pegs = [];
    const w = canvas.width;
    const h = canvas.height;
    const startY = 50;
    const spacingY = (h - 100) / GAME_CONFIG.pegRows;
    
    for (let row = 0; row < GAME_CONFIG.pegRows; row++) {
        const pegsInRow = row + 3; 
        const spacingX = w / (pegsInRow + 1);
        
        for (let col = 0; col < pegsInRow; col++) {
            const x = spacingX * (col + 1);
            const y = startY + (row * spacingY);
            gameState.pegs.push({ x, y });
        }
    }
}

function drawBoardLayout() {
    const w = canvas.width;
    const h = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    // Draw Pegs
    ctx.fillStyle = GAME_CONFIG.colors.peg;
    ctx.shadowBlur = 2;
    ctx.shadowColor = 'white';

    for (let peg of gameState.pegs) {
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, GAME_CONFIG.pegSize, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw Buckets
    drawBuckets(w, h);

    ctx.shadowBlur = 0; // Reset shadow
}

function drawBuckets(width, height) {
    const bucketCount = GAME_CONFIG.pegRows + 3; // Adjust buckets to peg rows
    const bucketWidth = width / bucketCount;
    const bucketHeight = 60;
    const startY = height - bucketHeight;

    ctx.font = "bold 14px Courier New";
    ctx.textAlign = "center";

    for (let i = 0; i < bucketCount; i++) {
        const x = i * bucketWidth + (bucketWidth / 2);
        
        // Define reward values
        const centerIndex = Math.floor(bucketCount / 2);
        const distFromCenter = Math.abs(i - centerIndex);
        const maxDist = Math.floor(bucketCount / 2);
        
        let rewardBalls = 0;
        let bucketColor = '#444';

        if (distFromCenter <= maxDist - 3) {
            rewardBalls = 0;
            bucketColor = '#444'; // Gray
        } else if (distFromCenter === maxDist - 2) {
            rewardBalls = 2;
            bucketColor = '#ffcc00'; // Yellow
        } else if (distFromCenter === maxDist - 1) {
            rewardBalls = 5;
            bucketColor = '#ff8800'; // Orange
        } else {
            rewardBalls = 10;
            bucketColor = '#ff4444'; // Red
        }
        
        const label = `x${rewardBalls}`;

        // Draw bucket background
        ctx.fillStyle = GAME_CONFIG.colors.bucketBase;
        ctx.fillRect(i * bucketWidth, startY, bucketWidth, bucketHeight);
        
        // Border
        ctx.strokeStyle = '#555';
        ctx.strokeRect(i * bucketWidth, startY, bucketWidth, bucketHeight);

        // Text
        ctx.fillStyle = bucketColor;
        ctx.fillText(label, x, startY + 20);
        // Draw empty bucket visually
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.arc(x, startY + 45, bucketWidth / 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// --- BALL FINALIZATION LOGIC ---

function finalizeBall(xPos) {
    const w = canvas.width;
    const bucketCount = GAME_CONFIG.pegRows + 3;
    const bucketWidth = w / bucketCount;

    let bucketIndex = Math.floor(xPos / bucketWidth);

    // Ensure index is within bounds
    if (bucketIndex < 0) bucketIndex = 0;
    if (bucketIndex >= bucketCount) bucketIndex = bucketCount - 1;

    // Calculate reward based on bucket index
    const centerIndex = Math.floor(bucketCount / 2);
    const distFromCenter = Math.abs(bucketIndex - centerIndex);
    const maxDist = Math.floor(bucketCount / 2);
    
    let rewardBalls = 0;
    if (distFromCenter <= maxDist - 3) rewardBalls = 0;
    else if (distFromCenter === maxDist - 2) rewardBalls = 2;
    else if (distFromCenter === maxDist - 1) rewardBalls = 5;
    else rewardBalls = 10;

    // Update state
    gameState.currentBalls += rewardBalls;

    // Add ball to visual array in the bucket
    const bucketCenter = (bucketIndex * bucketWidth) + (bucketWidth / 2);
    
    gameState.ballsOnBoard.push({
        x: bucketCenter,
        y: canvas.height - 30, // Final position
        color: rewardBalls > 0 ? '#fff' : '#aaa', // Winning balls glow
        size: rewardBalls > 1 ? 8 : 4
    });

    updateUI();
}

function updateUI() {
    elBallCount.innerText = gameState.currentBalls;
}

function dropBallsAction() {
    // Do nothing if there are no balls
    if (gameState.currentBalls <= 0) return;

    const amountSelected = parseInt(dropCountSelect.value);
    const ballsToDrop = Math.min(gameState.currentBalls, amountSelected);
    
    gameState.currentBalls -= ballsToDrop;
    
    for (let i = 0; i < ballsToDrop; i++) {
        // Drop from top, with a little random dispersion
        const startX = (canvas.width / 2) + (Math.random() * 40 - 20);
        gameState.ballsInPlay.push(new Ball(startX, 30));
    }

    updateUI();
}

function endGame() {
    gameState.isRunning = false;
    btnDrop.disabled = true;
    btnDrop.style.opacity = "0.5";
    
    let message = "You have run out of balls to play.";
    gameOverMsg.innerHTML = `Game Over.<br><span style="color:#ccc">${message}</span>`;
    gameOverScreen.classList.add('active'); // Use active class
}

function restartGame() {
    gameState.ballsInPlay = [];
    gameState.ballsOnBoard = [];
    gameState.currentBalls = GAME_CONFIG.initialBalls;
    gameState.isRunning = true;

    // Reset UI
    elBallCount.innerText = gameState.currentBalls;
    gameOverScreen.classList.remove('active'); // Remove active class
    btnDrop.disabled = false;
    btnDrop.style.opacity = "1";

    drawBoardLayout(); // Redraw clean
}

// --- MAIN GAME LOOP ---

function gameLoop() {
    if (!gameState.isRunning && gameState.ballsInPlay.length === 0) return;

    drawBoardLayout();

    // Draw static balls in buckets
    gameState.ballsOnBoard.forEach(ball => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.shadowBlur = 5;
        ctx.shadowColor = "white";
        ctx.closePath();
        ctx.shadowBlur = 0;
    });

    // Update and draw moving balls
    for (let i = gameState.ballsInPlay.length - 1; i >= 0; i--) {
        const ball = gameState.ballsInPlay[i];
        ball.update(gameState.pegs, canvas.width); // Usar gameState.pegs
        ball.draw();

        if (ball.finished) {
            gameState.ballsInPlay.splice(i, 1);
        }
    }

    // Check Game Over at the end of the frame
    if (gameState.ballsInPlay.length === 0 && gameState.currentBalls <= 0 && gameState.isRunning) {
        endGame();
    }

    requestAnimationFrame(gameLoop);
}

// --- EVENT LISTENERS ---
btnDrop.addEventListener('click', dropBallsAction);
btnRestart.addEventListener('click', restartGame);

// Initialize
resizeCanvas();
drawBoardLayout();
gameLoop();
