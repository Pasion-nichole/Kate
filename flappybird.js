// Board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// Bird
let birdWidth = 50;
let birdHeight = 44;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg = new Image();
let selectedSkin = "flappybird.png"; // Default skin
let bird = { x: birdX, y: birdY, width: birdWidth, height: birdHeight };

// Pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;
let topPipeImg;
let bottomPipeImg;

// Physics
let velocityX = -2;
let velocityY = 0;
let gravity = 0.4;
let gameOver = false;
let score = 0;
let animationFrameId;
let pipeInterval;

// Sounds
let wingSound = new Audio("./sfx_wing.wav");
let hitSound = new Audio("./sfx_hit.wav");
let bgmMusic = new Audio("./bgm_mario.mp3");
bgmMusic.loop = true;
bgmMusic.volume = 0.5;

// Load the game properly
window.onload = function () {
    document.getElementById("skinSelection").style.display = "block";
    document.getElementById("board").style.display = "none";
};

// Function para piliin ang skin
function selectSkin(skinSrc) {
    selectedSkin = skinSrc;
    document.getElementById("skinSelection").style.display = "none"; // Hide skin selection
    document.getElementById("board").style.display = "block"; // Show game canvas

    // Maghintay bago simulan ang opening scene
    setTimeout(startOpeningScene, 500);
}

// Function para sa opening scene
function startOpeningScene() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    let openingSceneImg = new Image();
    openingSceneImg.src = "bg.png";

    openingSceneImg.onload = function () {
        context.drawImage(openingSceneImg, 0, 0, boardWidth, boardHeight);
        context.fillStyle = "yellow";
        context.font = "25px sans-serif";
        context.textAlign = "center";
        context.fillText("Tap to start", boardWidth / 2, boardHeight / 2 + 60);
    };

    // Hintayin ang user input bago magsimula
    document.addEventListener("touchstart", startGame, { once: true });
}

// Start game
function startGame() {
    document.removeEventListener("touchstart", startGame);
    document.addEventListener("touchstart", moveBird);

    birdImg.src = selectedSkin; // Apply selected skin

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    playBackgroundMusic(); // Start music

    animationFrameId = requestAnimationFrame(update);
    pipeInterval = setInterval(placePipes, 1500);
}

// Play background music
function playBackgroundMusic() {
    if (bgmMusic.paused) {
        bgmMusic.play().catch(error => {
            document.addEventListener("touchstart", function retryPlay() {
                bgmMusic.play();
                document.removeEventListener("touchstart", retryPlay);
            }, { once: true });
        });
    }
}

// Update game loop
function update() {
    if (gameOver) return;

    animationFrameId = requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    // Bird movement
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);

    // Draw the bird with selected skin
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    // Pipes movement
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            hitSound.play();
            gameOver = true;
        }
    }

    // Remove off-screen pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    // Display score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 180, 35);

    if (gameOver) {
        context.fillText("GAME OVER", 175, 245);
        bgmMusic.pause(); // Stop the background music
        bgmMusic.currentTime = 0; // Reset music
        cancelAnimationFrame(animationFrameId);
        document.getElementById("resetButton").style.display = "block";
    }
}

// Place pipes
function placePipes() {
    if (gameOver) return;

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = { img: topPipeImg, x: pipeX, y: randomPipeY, width: pipeWidth, height: pipeHeight, passed: false };
    pipeArray.push(topPipe);

    let bottomPipe = { img: bottomPipeImg, x: pipeX, y: randomPipeY + pipeHeight + openingSpace, width: pipeWidth, height: pipeHeight, passed: false };
    pipeArray.push(bottomPipe);
}

// Move bird on tap
function moveBird(e) {
    if (!gameOver) {
        wingSound.play();
        velocityY = -6;
    }
}
function resetGame() {
    console.log("Reset button clicked!"); // Debugging (hindi mo kita sa phone pero safe ito)

    // I-reset ang bird position at physics
    bird.y = birdY;
    velocityY = 0;

    // I-reset ang pipes at score
    pipeArray = [];
    score = 0;
    gameOver = false;

    // Itago ulit ang reset button
    let resetButton = document.getElementById("resetButton");
    if (resetButton) {
        resetButton.style.display = "none";
    }

    // I-restart ang background music
    bgmMusic.currentTime = 0;
    bgmMusic.play();

    // Simulan ulit ang game loop at pipes
    animationFrameId = requestAnimationFrame(update);
    clearInterval(pipeInterval);
    pipeInterval = setInterval(placePipes, 1500);

    // Ibalik ang event listener para sa touch input
    document.addEventListener("touchstart", moveBird);
}



// Detect collision
function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
      }
