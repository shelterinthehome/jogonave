var canvas, ctx;
var ship;
var blueEnemies = [];
var redEnemies = [];
var bullets = [];
var keys = {};
var bulletCooldown = 0;
var animationFrameId;
var enemyKillCount = 0;  // Nova variável para contar os inimigos abatidos

function startGame() {
    if (!canvas) {
        canvas = document.getElementById("gameCanvas");
        ctx = canvas.getContext("2d");
    }

    ship = {
        width: 50,
        height: 50,
        x: canvas.width / 2 - 25,
        y: canvas.height - 60,
        speed: 5,
        color: "black"
    };

    bullets = [];
    blueEnemies = [];
    redEnemies = [];
    createBlueEnemies(9);

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    enemyKillCount = 0;  // Reinicia o contador de inimigos abatidos

    update();
}

function createBlueEnemies(count) {
    for (let i = 0; i < count; i++) {
        let enemy = {
            width: 50,
            height: 50,
            x: Math.random() * (canvas.width - 70),
            y: Math.random() * -canvas.height - 70,
            color: "blue",
            speed: 2 + Math.random() * 3,
            transparency: 1 
        };
        blueEnemies.push(enemy);
    }
}

function drawShip() {
    ctx.fillStyle = ship.color;
    ctx.fillRect(ship.x, ship.y, ship.width, ship.height);
}

function drawBullets() {
    for (let bullet of bullets) {
        ctx.fillStyle = 'red';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

function drawEnemies() {
    for (let enemy of blueEnemies) {
        ctx.globalAlpha = enemy.transparency; 
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.globalAlpha = 1; 
    }
    for (let enemy of redEnemies) {
        ctx.globalAlpha = enemy.transparency; 
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.globalAlpha = 1;
    }
}

function updateBullets() {
    for (let bullet of bullets) {
        bullet.y -= bullet.speed;
        if (bullet.y < 0) {
            bullets.splice(bullets.indexOf(bullet), 1);
        }
    }
}

function updateEnemies() {
    for (let enemy of blueEnemies) {
        enemy.y += enemy.speed;
        if (enemy.y > canvas.height) {
            enemy.y = 0;
            enemy.x = Math.random() * (canvas.width - enemy.width);
        }
        if (isColliding(ship, enemy)) {
            resetGame();
            return;
        }
    }

    for (let enemy of redEnemies) {
        enemy.y += enemy.speed;
        if (enemy.y > canvas.height + 50) {
            // Remove the red enemy and create a new blue enemy
            redEnemies.splice(redEnemies.indexOf(enemy), 1);
            createBlueEnemies(1);
        }
    }
}

function checkCollisions() {
    for (let enemy of blueEnemies) {
        for (let bullet of bullets) {
            if (isColliding(bullet, enemy)) {
                // Transform the blue enemy into a red enemy
                enemy.color = "red";
                redEnemies.push(enemy);
                blueEnemies.splice(blueEnemies.indexOf(enemy), 1);
                bullets.splice(bullets.indexOf(bullet), 1);
                enemyKillCount++;  // Incrementa o contador de inimigos abatidos
                break;
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShip();
    drawBullets();
    drawEnemies();
    drawKillCount();  // Desenha o contador de inimigos abatidos
}

function drawKillCount() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText("Inimigos abatidos: " + enemyKillCount, 10, 30);
}

function update() {
    updateBullets();
    updateEnemies();
    updateShipPosition();
    updateCooldown();
    checkCollisions();
    draw();
    animationFrameId = requestAnimationFrame(update);
}

function keyDownHandler(event) {
    keys[event.key] = true;

    if (event.key === 'ArrowUp' && bulletCooldown <= 0) {
        shoot();
    }

    if (event.key === 'w' || event.key === 'W') {
        ship.color = "purple";
    }

    if (event.key === 'a' || event.key === 'A') {
        ship.color = "yellow";
    }
    if (event.key === 's' || event.key === 'S') {
        ship.color = "blue";
    }
    if (event.key === 'd' || event.key === 'D') {
        ship.color = "lightblue";
    }
}

function keyUpHandler(event) {
    keys[event.key] = false;

    if (event.key === 'w' || event.key === 'W') {
        ship.color = "black";
    }
    if (event.key === 'a' || event.key === 'A') {
        ship.color = "black";
    }
    if (event.key === 's' || event.key === 'S') {
        ship.color = "black";
    }
    if (event.key === 'd' || event.key === 'D') {
        ship.color = "black";
    }
}

function updateShipPosition() {
    if (keys['w'] || keys['W']) { ship.y -= ship.speed; }
    if (keys['s'] || keys['S']) { ship.y += ship.speed; }
    if (keys['a'] || keys['A']) { ship.x -= ship.speed; }
    if (keys['d'] || keys['D']) { ship.x += ship.speed; }
    
    ship.x = Math.max(0, Math.min(ship.x, canvas.width - ship.width));
    ship.y = Math.max(0, Math.min(ship.y, canvas.height - ship.height));   
}

function shoot() {
    if (bulletCooldown <= 0) {
        let bullet = {
            width: 5,
            height: 20,
            x: ship.x + ship.width / 2 - 2.5,
            y: ship.y,
            speed: 7,
            visible: true
        };
        bullets.push(bullet);
        bulletCooldown = 6;

        ship.color = "green";
        setTimeout(() => {
            ship.color = "black";
        }, 1000);
    }
}

function updateCooldown() {
    if (bulletCooldown > 0) {
        bulletCooldown--;
    }
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function resetGame() {
    cancelAnimationFrame(animationFrameId);
    startGame();
}