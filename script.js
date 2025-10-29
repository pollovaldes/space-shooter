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
// FEATURE: Game Over
let gameOver = false;

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
    // FEATURE: Reiniciar juego con Enter
    if (e.key === 'Enter' && gameOver) {
        restartGame();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') player.moveLeft = false;
    if (e.key === 'ArrowRight') player.moveRight = false;
});

// ============================================
// DISPARAR BALA
// ============================================
function shootBullet() {
    if (gameOver) return;
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
// FEATURE: VERIFICAR GAME OVER
// ============================================
function checkGameOver() {
    enemies.forEach(enemy => {
        if (enemy.alive && enemy.y + enemy.height >= player.y) {
            gameOver = true;
            gameRunning = false;
        }
    });
    
    // Victoria si todos muertos
    const allDead = enemies.every(enemy => !enemy.alive);
    if (allDead) {
        gameOver = true;
        gameRunning = false;
    }
}

// ============================================
// FEATURE: REINICIAR JUEGO
// ============================================
function restartGame() {
    score = 0;
    gameOver = false;
    gameRunning = true;
    bullets = [];
    player.x = canvas.width / 2 - 25;
    createEnemies();
    gameLoop();
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
// FEATURE: DIBUJAR GAME OVER
// ============================================
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '60px Arial';
    ctx.textAlign = 'center';
    
    const allDead = enemies.every(enemy => !enemy.alive);
    if (allDead) {
        ctx.fillText('YOU WIN!', canvas.width / 2, canvas.height / 2 - 40);
    } else {
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
    }
    
    ctx.font = '30px Arial';
    ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 20);
    ctx.font = '20px Arial';
    ctx.fillText('Press ENTER to restart', canvas.width / 2, canvas.height / 2 + 70);
    ctx.textAlign = 'left';
}

// ============================================
// GAME LOOP
// ============================================
function gameLoop() {
    if (!gameRunning) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    updatePlayer();
    updateBullets();
    checkCollisions();
    checkGameOver(); // FEATURE: Verificar game over
    
    drawPlayer();
    drawEnemies();
    drawBullets();
    drawScore();
    
    if (gameOver) {
        drawGameOver(); // FEATURE: Mostrar pantalla de game over
    } else {
        requestAnimationFrame(gameLoop);
    }
}

// ============================================
// INICIAR JUEGO
// ============================================
createEnemies();
gameLoop();


