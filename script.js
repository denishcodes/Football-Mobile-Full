const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const scoreEl = document.getElementById("score");
const missesEl = document.getElementById("misses");
const shotsLeftEl = document.getElementById("shotsLeft");
const timeEl = document.getElementById("time");
const restartBtn = document.getElementById("restartBtn");

let score = 0;
let misses = 0;
let shotsLeft = 10;
let timer = 0;
let gameOver = false;

// Goal increased to 250px width
const goal = {
  x: WIDTH / 2 - 125,
  y: HEIGHT * 0.1,
  w: 250,
  h: 10
};

const ball = {
  x: WIDTH / 2,
  y: HEIGHT * 0.75,
  radius: 12,
  vx: 0,
  vy: 0,
  moving: false
};

const player = {
  x: ball.x - 20,
  y: ball.y + 60,
  w: 40,
  h: 80,
  color: "blue"
};

// Keeper now moves left-right across the goal
const keeper = {
  x: goal.x + 10,
  y: goal.y + 10,
  w: 50,
  h: 100,
  color: "red",
  speed: 3,
  dir: 1
};

let angle = -90;
let lastMoveTime = 0;
let shotReady = false;

function resetBall() {
  ball.x = WIDTH / 2;
  ball.y = HEIGHT * 0.75;
  ball.vx = 0;
  ball.vy = 0;
  ball.moving = false;
  shotReady = false;
  lastMoveTime = performance.now();
  angle = -90;
}

function shootBall() {
  if (ball.moving || gameOver) return;
  const rad = angle * (Math.PI / 180);
  ball.vx = Math.cos(rad) * 7;
  ball.vy = Math.sin(rad) * 7;
  ball.moving = true;
}

function updateBall() {
  if (!ball.moving) return;

  ball.x += ball.vx;
  ball.y += ball.vy;

  const goalTop = goal.y + goal.h;
  const postLeft = goal.x + 10;
  const postRight = goal.x + goal.w - 10;

  if (ball.y < goalTop && ball.x > postLeft && ball.x < postRight) {
    // Keeper block
    if (
      ball.x > keeper.x &&
      ball.x < keeper.x + keeper.w &&
      ball.y < keeper.y + keeper.h
    ) {
      misses++;
      alert("Keeper saved!");
    } else {
      score++;
      alert("GOAL!");
    }
    nextShot();
  } else if (
    ball.x < 0 || ball.x > WIDTH || ball.y < 0 || ball.y > HEIGHT
  ) {
    misses++;
    alert("Missed!");
    nextShot();
  }
}

function updateKeeper() {
  if (gameOver) return;
  keeper.x += keeper.speed * keeper.dir;

  const leftLimit = goal.x + 10;
  const rightLimit = goal.x + goal.w - keeper.w - 10;

  if (keeper.x <= leftLimit || keeper.x >= rightLimit) {
    keeper.dir *= -1;
  }
}

function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  drawGoal();
  drawAim();
  drawPlayer();
  drawKeeper();
  drawBall();
}

function drawGoal() {
  ctx.fillStyle = "white";
  ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
  ctx.fillRect(goal.x, goal.y, 10, 100);
  ctx.fillRect(goal.x + goal.w - 10, goal.y, 10, 100);
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.w, player.h);
}

function drawKeeper() {
  ctx.fillStyle = keeper.color;
  ctx.fillRect(keeper.x, keeper.y, keeper.w, keeper.h);
}

function drawBall() {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawAim() {
  if (ball.moving || gameOver) return;
  const rad = angle * (Math.PI / 180);
  const endX = ball.x + Math.cos(rad) * 70;
  const endY = ball.y + Math.sin(rad) * 70;

  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ball.x, ball.y);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(endX, endY, 6, 0, Math.PI * 2);
  ctx.fill();
}

function pointerMove(e) {
  if (ball.moving || gameOver) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

  angle = Math.atan2(y - ball.y, x - ball.x) * (180 / Math.PI);
  lastMoveTime = performance.now();
  shotReady = false;
}

function nextShot() {
  ball.moving = false;
  shotsLeft--;
  updateUI();
  if (shotsLeft <= 0) {
    gameOver = true;
    restartBtn.style.display = "inline-block";
    alert("Game Over!");
  }
  resetBall();
}

function updateUI() {
  scoreEl.textContent = score;
  missesEl.textContent = misses;
  shotsLeftEl.textContent = shotsLeft;
}

function gameLoop(timestamp) {
  if (!gameOver && !ball.moving && timestamp - lastMoveTime > 3000 && !shotReady) {
    shootBall();
    shotReady = true;
  }

  if (!gameOver) {
    timer += 1 / 60;
    timeEl.textContent = Math.floor(timer);
  }

  updateBall();
  updateKeeper();
  draw();
  requestAnimationFrame(gameLoop);
}

canvas.addEventListener("mousemove", pointerMove);
canvas.addEventListener("touchmove", pointerMove);
document.addEventListener("keydown", e => {
  if (e.key === "Enter") shootBall();
});

restartBtn.addEventListener("click", () => {
  score = 0;
  misses = 0;
  shotsLeft = 10;
  timer = 0;
  gameOver = false;
  restartBtn.style.display = "none";
  updateUI();
  resetBall();
});

resetBall();
updateUI();
requestAnimationFrame(gameLoop);

