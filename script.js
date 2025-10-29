
// ============================================
// CONFIGURACIÓN INICIAL
// ============================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// ============================================
// VARIABLES DEL JUEGO
// ============================================
let score = 0;
let gameRunning = true;
// FEATURE: Lives System
let lives = 3;

// Player
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    speed: 7,
    moveLeft: false,
    moveRight: false
};

// Enemigos
let enemies = [];
const enemyRows = 3;
const enemyCols = 6;
const enemyWidth = 40;
const enemyHeight = 40;
const enemyPadding = 20;
const enemyOffsetTop = 50;

// Balas
let bullets = [];
const bulletWidth = 4;
const bulletHeight = 15;
const bulletSpeed = 8;

// FEATURE: Enemy Bullets
let enemyBullets = [];
let enemyShootTimer = 0;

// ============================================
// INICIALIZAR ENEMIGOS
// ============================================
function createEnemies() {
    enemies = [];
    for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyCols; col++) {
            enemies.push({
                x: col * (enemyWidth + enemyPadding) + enemyPadding + 100,
                y: row * (enemyHeight + enemyPadding) + enemyOffsetTop,
                width: enemyWidth,
                height: enemyHeight,
                alive: true
            });
        }
    }
}

// ============================================
// CONTROLES
// ============================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') player.moveLeft = true;
    if (e.key === 'ArrowRight') player.moveRight = true;
    if (e.key === ' ') shootBullet();
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') player.moveLeft = false;
    if (e.key === 'ArrowRight') player.moveRight = false;
});

// ============================================
// DISPARAR BALA
// ============================================
function shootBullet() {
    bullets.push({
        x: player.x + player.width / 2 - bulletWidth / 2,
        y: player.y,
        width: bulletWidth,
        height: bulletHeight
    });
}

// ============================================
// ACTUALIZAR JUGADOR
// ============================================
function updatePlayer() {
    if (player.moveLeft && player.x > 0) {
        player.x -= player.speed;
    }
    if (player.moveRight && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

// ============================================
// ACTUALIZAR BALAS
// ============================================
function updateBullets() {
    bullets = bullets.filter(bullet => bullet.y > 0);
    
    bullets.forEach(bullet => {
        bullet.y -= bulletSpeed;
    });
}

// ============================================
// FEATURE: ENEMIGOS DISPARAN
// ============================================
function enemyShoot() {
    enemyShootTimer++;
    if (enemyShootTimer > 120) {
        const aliveEnemies = enemies.filter(e => e.alive);
        if (aliveEnemies.length > 0) {
            const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
            enemyBullets.push({
                x: shooter.x + shooter.width / 2 - 3,
                y: shooter.y + shooter.height,
                width: 6,
                height: 12
            });
        }
        enemyShootTimer = 0;
    }
}

// ============================================
// FEATURE: ACTUALIZAR BALAS ENEMIGAS
// ============================================
function updateEnemyBullets() {
    enemyBullets = enemyBullets.filter(b => b.y < canvas.height);
    
    enemyBullets.forEach(bullet => {
        bullet.y += 5;
        
        // Colisión con jugador
        if (bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y) {
            
            lives--;
            enemyBullets.splice(enemyBullets.indexOf(bullet), 1);
            
            if (lives <= 0) {
                gameRunning = false;
            }
        }
    });
}

// ============================================
// DETECTAR COLISIONES
// ============================================
function checkCollisions() {
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (enemy.alive &&
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                
                enemy.alive = false;
                bullets.splice(bIndex, 1);
                score += 10;
            }
        });
    });
}

// ============================================
// DIBUJAR JUGADOR
// ============================================
function drawPlayer() {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Detalle de nave
    ctx.fillStyle = '#00aa00';
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y - 10);
    ctx.lineTo(player.x, player.y);
    ctx.lineTo(player.x + player.width, player.y);
    ctx.fill();
}

// ============================================
// DIBUJAR ENEMIGOS
// ============================================
function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy.alive) {
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }
    });
}

// ============================================
// DIBUJAR BALAS
// ============================================
function drawBullets() {
    ctx.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
    
    // FEATURE: Balas enemigas
    ctx.fillStyle = '#ff00ff';
    enemyBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// ============================================
// DIBUJAR SCORE
// ============================================
function drawScore() {
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 20, 30);
}

// ============================================
// FEATURE: DIBUJAR VIDAS
// ============================================
function drawLives() {
    ctx.fillStyle = '#ff0000';
    ctx.font = '20px Arial';
    ctx.fillText('Lives: ', canvas.width - 150, 30);
    
    // Dibujar corazones
    for (let i = 0; i < lives; i++) {
        ctx.fillStyle = '#ff0000';
        ctx.font = '25px Arial';
        ctx.fillText('♥', canvas.width - 80 + (i * 25), 32);
    }
}

// ============================================
// GAME LOOP
// ============================================
function gameLoop() {
    if (!gameRunning) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer();
    updateBullets();
    enemyShoot(); // FEATURE: Enemigos disparan
    updateEnemyBullets(); // FEATURE: Actualizar balas enemigas
    checkCollisions();
    
    drawPlayer();
    drawEnemies();
    drawBullets();
    drawScore();
    drawLives(); // FEATURE: Mostrar vidas
    
    requestAnimationFrame(gameLoop);
}

// ============================================
// INICIAR JUEGO
// ============================================
createEnemies();
gameLoop();

