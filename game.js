const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// IMAGES
const playerImg = new Image();
playerImg.src = "assets/player.png";

const enemyImg = new Image();
enemyImg.src = "assets/enemy.png";

const bossImg = new Image();
bossImg.src = "assets/boss.png";

// PLAYER
let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 50,
    speed: 5
};

// ARRAYS
let enemies = [];
let bullets = [];
let particles = [];

let health = 100;
let score = 0;
let gameOver = false;
let level = 1;
let autoShoot = true;

let keys = {};

// CONTROLS
window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

// AUTO SHOOT
setInterval(() => {
    if (gameOver) return;

    enemies.forEach(enemy => {
        let angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);

        bullets.push({
            x: player.x + player.size / 2,
            y: player.y + player.size / 2,
            size: 8,
            speed: 10,
            dx: Math.cos(angle),
            dy: Math.sin(angle)
        });
    });
}, 600);

// SPAWN ENEMY
function spawnEnemy() {
    let side = Math.floor(Math.random() * 4);
    let x, y;

    if (side === 0) { x = Math.random() * canvas.width; y = 0; }
    else if (side === 1) { x = canvas.width; y = Math.random() * canvas.height; }
    else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height; }
    else { x = 0; y = Math.random() * canvas.height; }

    enemies.push({
        x: x,
        y: y,
        size: 50,
        speed: 2 + level * 0.2,
        isBoss: level % 5 === 0
    });
}

setInterval(() => {
    if (!gameOver) spawnEnemy();
}, 1800);

// MOVE PLAYER
function movePlayer() {
    if (keys["w"]) player.y -= player.speed;
    if (keys["s"]) player.y += player.speed;
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;

    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x + player.size > canvas.width)
        player.x = canvas.width - player.size;
    if (player.y + player.size > canvas.height)
        player.y = canvas.height - player.size;
}

// MOVE ENEMIES
function moveEnemies() {
    enemies.forEach(enemy => {
        let dx = player.x - enemy.x;
        let dy = player.y - enemy.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        enemy.x += (dx / dist) * enemy.speed;
        enemy.y += (dy / dist) * enemy.speed;
    });
}

// MOVE BULLETS
function moveBullets() {
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.dx * bullet.speed;
        bullet.y += bullet.dy * bullet.speed;

        if (
            bullet.x < 0 ||
            bullet.x > canvas.width ||
            bullet.y < 0 ||
            bullet.y > canvas.height
        ) {
            bullets.splice(index, 1);
        }
    });
}

// PARTICLES (patlama efekti)
function createParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x,
            y,
            dx: (Math.random() - 0.5) * 4,
            dy: (Math.random() - 0.5) * 4,
            life: 30
        });
    }
}

function moveParticles() {
    particles.forEach((p, i) => {
        p.x += p.dx;
        p.y += p.dy;
        p.life--;

        if (p.life <= 0) particles.splice(i, 1);
    });
}

// COLLISION
function checkCollision() {
    enemies.forEach((enemy, eIndex) => {
        if (
            player.x < enemy.x + enemy.size &&
            player.x + player.size > enemy.x &&
            player.y < enemy.y + enemy.size &&
            player.y + player.size > enemy.y
        ) {
            health -= enemy.isBoss ? 2 : 1;
        }

        bullets.forEach((bullet, bIndex) => {
            if (
                bullet.x < enemy.x + enemy.size &&
                bullet.x + bullet.size > enemy.x &&
                bullet.y < enemy.y + enemy.size &&
                bullet.y + bullet.size > enemy.y
            ) {
                createParticles(enemy.x, enemy.y);
                enemies.splice(eIndex, 1);
                bullets.splice(bIndex, 1);
                score += enemy.isBoss ? 50 : 10;
            }
        });
    });
}

// LEVEL UP
function levelUp() {
    if (score > level * 200) {
        level++;
    }
}

// DRAW PLAYER (image)
function drawPlayer() {
    ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);
}

// DRAW ENEMIES (image)
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.drawImage(enemy.isBoss ? bossImg : enemyImg, enemy.x, enemy.y, enemy.size, enemy.size);
    });
}

// DRAW BULLETS
function drawBullets() {
    bullets.forEach(bullet => {
        ctx.fillStyle = "yellow";
        ctx.fillRect(bullet.x, bullet.y, bullet.size, bullet.size);
    });
}

// DRAW PARTICLES
function drawParticles() {
    particles.forEach(p => {
        ctx.fillStyle = "orange";
        ctx.fillRect(p.x, p.y, 4, 4);
    });
}

// HEALTH BAR
function drawHealth() {
    ctx.fillStyle = "red";
    ctx.fillRect(20, 20, 200, 20);

    ctx.fillStyle = "lime";
    ctx.fillRect(20, 20, 200 * (health / 100), 20);

    ctx.strokeStyle = "white";
    ctx.strokeRect(20, 20, 200, 20);
}

// UI
function drawUI() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 70);
    ctx.fillText("Level: " + level, 20, 100);
}

// GAME OVER
function drawGameOver() {
    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2 - 150, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText("Press R to Restart", canvas.width / 2 - 90, canvas.height / 2 + 40);
}

// RESTART
window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "r" && gameOver) {
        health = 100;
        score = 0;
        level = 1;
        enemies = [];
        bullets = [];
        particles = [];
        gameOver = false;
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
    }
});

// GAME LOOP
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        movePlayer();
        moveEnemies();
        moveBullets();
        moveParticles();
        checkCollision();
        levelUp();

        drawPlayer();
        drawEnemies();
        drawBullets();
        drawParticles();
        drawHealth();
        drawUI();

        if (health <= 0) gameOver = true;
    } else {
        drawGameOver();
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();