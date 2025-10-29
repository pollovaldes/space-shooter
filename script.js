// ============================================
// CONFIGURACIÓN INICIAL
// ============================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// FEATURE: Sound Effects
const shootSound = new Audio('shoot.mp3');
const explosionSound = new Audio('explosion.mp3');
shootSound.volume = 0.3;
explosionSound.volume = 0.4;

// ============================================
// VARIABLES DEL JUEGO
// ============================================
let score = 0;
let gameRunning = true;
let gameOver = false;
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
let enemyDirection = 1;
let enemySpeed = 2;

// Balas
let bullets = [];
const bulletWidth = 4;
const bulletHeight = 15;
const bulletSpeed = 8;

// Enemy Bullets
let enemyBullets = [];
let enemyShootTimer = 0;

// Particles
let particles = [];

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
    shootSound.currentTime = 0;
    shootSound.play().catch(e => console.log('Audio play failed'));
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
// ACTUALIZAR ENEMIGOS
// ============================================
function updateEnemies() {
    let changeDirection = false;
    
    enemies.forEach(enemy => {
        if (enemy.alive) {
            enemy.x += enemySpeed * enemyDirection;
            
            if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
                changeDirection = true;
            }
        }
    });
    
    if (changeDirection) {
        enemyDirection *= -1;
        enemies.forEach(enemy => {
            if (enemy.alive) {
                enemy.y += 20;
            }
        });
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
// ENEMIGOS DISPARAN
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
// ACTUALIZAR BALAS ENEMIGAS
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
                gameOver = true;
                gameRunning = false;
            }
        }
    });
}

// ============================================
// CREAR PARTÍCULAS
// ============================================
function createParticles(x, y) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 1,
            size: Math.random() * 4 + 2
        });
    }
}

// ============================================
// ACTUALIZAR PARTÍCULAS
// ============================================
function updateParticles() {
    particles = particles.filter(p => p.life > 0);
    
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.vy += 0.2;
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
                createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                explosionSound.currentTime = 0;
                explosionSound.play().catch(e => console.log('Audio play failed'));
            }
        });
    });
}

// ============================================
// VERIFICAR GAME OVER
// ============================================
function checkGameOver() {
    enemies.forEach(enemy => {
        if (enemy.alive && enemy.y + enemy.height >= player.y) {
            gameOver = true;
            gameRunning = false;
        }
    });
    
    const allDead = enemies.every(enemy => !enemy.alive);
    if (allDead) {
        gameOver = true;
        gameRunning = false;
    }
}

// ============================================
// REINICIAR JUEGO
// ============================================
function restartGame() {
    score = 0;
    lives = 3;
    gameOver = false;
    gameRunning = true;
    bullets = [];
    enemyBullets = [];
    particles = [];
    enemyShootTimer = 0;
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
    
    ctx.fillStyle = '#ff00ff';
    enemyBullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// ============================================
// DIBUJAR PARTÍCULAS
// ============================================
function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1;
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
// DIBUJAR VIDAS
// ============================================
function drawLives() {
    ctx.fillStyle = '#ff0000';
    ctx.font = '20px Arial';
    ctx.fillText('Lives: ', canvas.width - 150, 30);
    
    for (let i = 0; i < lives; i++) {
        ctx.fillStyle = '#ff0000';
        ctx.font = '25px Arial';
        ctx.fillText('♥', canvas.width - 80 + (i * 25), 32);
    }
}

// ============================================
// DIBUJAR GAME OVER
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
    updateEnemies();
    updateBullets();
    enemyShoot();
    updateEnemyBullets();
    updateParticles();
    checkCollisions();
    checkGameOver();
    
    drawPlayer();
    drawEnemies();
    drawBullets();
    drawParticles();
    drawScore();
    drawLives();
    
    if (gameOver) {
        drawGameOver();
    } else {
        requestAnimationFrame(gameLoop);
    }
}

// ============================================
// INICIAR JUEGO
// ============================================
createEnemies();
gameLoop();