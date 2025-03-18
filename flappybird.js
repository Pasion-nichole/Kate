// Board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

// Bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;
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

let wingSound = new Audio("./sfx_wing.wav");
let hitSound = new Audio("./sfx_hit.wav");
let bgmMusic = new Audio("./bgm_mario.mp3"); // Background music file
bgmMusic.loop = true;
bgmMusic.volume = 0.5; // Adjust volume if needed

// Load the game
window.onload = function () {
  board = document.getElementById("board");
  let resetButton = document.getElementById("resetButton");
  if (board) {
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // Load the opening scene image
    let openingSceneImg = new Image();
    openingSceneImg.src = "bg.png"; // Replace with your image file

    // Draw opening scene
    openingSceneImg.onload = function () {
      context.drawImage(openingSceneImg, 0, 0, boardWidth, boardHeight);
      context.fillStyle = "yellow";
      context.font = "25px sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("Tap to start", boardWidth / 2, boardHeight / 2 + 60);
    };

    // Wait for tap to start game
    document.addEventListener("touchstart", startGame);

    birdImg = new Image();
    birdImg.src = "./flappybird.png";

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    resetButton.addEventListener("click", resetGame);
  } else {
    console.error("Canvas element with id 'board' not found!");
  }
};

// Start game on tap
function startGame() {
  document.removeEventListener("touchstart", startGame);
  document.addEventListener("touchstart", moveBird);

  // Play background music with autoplay fix
  playBackgroundMusic();

  // Start the game loop and pipe generation
  animationFrameId = requestAnimationFrame(update);
  pipeInterval = setInterval(placePipes, 1500);
}

// Function to handle background music play with autoplay fix
function playBackgroundMusic() {
  if (bgmMusic.paused) {
    bgmMusic.play().then(() => {
      console.log("Background music started");
    }).catch(error => {
      console.log("Autoplay blocked, retrying on user input:", error);
      
      // Retry playing music on the next user interaction
      document.addEventListener("touchstart", function retryPlay() {
        bgmMusic.play();
        document.removeEventListener("touchstart", retryPlay);
      }, { once: true });
    });
  }
}

// Update game loop
function update() {
  if (gameOver) {
    cancelAnimationFrame(animationFrameId); // Stop game loop
    document.getElementById("resetButton").style.display = "block"; // Show reset button
    return;
  }

  animationFrameId = requestAnimationFrame(update);
  context.clearRect(0, 0, board.width, board.height);

  // Bird movement
  velocityY += gravity;
  bird.y = Math.max(bird.y + velocityY, 0);
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
    bgmMusic.currentTime = 0; // Reset the music
    cancelAnimationFrame(animationFrameId); // Stop game loop
    document.getElementById("resetButton").style.display = "block"; // Show reset button
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

// Reset game
function resetGame() {
  bird.y = birdY;
  velocityY = 0;
  pipeArray = [];
  score = 0;
  gameOver = false;
  document.getElementById("resetButton").style.display = "none"; // Hide reset button
  
  // Restart music
  playBackgroundMusic();

  animationFrameId = requestAnimationFrame(update); // Restart game loop
  clearInterval(pipeInterval);
  pipeInterval = setInterval(placePipes, 1500); // Restart pipe generation
}

// Detect collision
function detectCollision(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}
