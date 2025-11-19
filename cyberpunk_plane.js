// 赛博朋克飞机大战游戏主逻辑
class CyberpunkPlaneGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu'; // menu, playing, gameOver
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.power = 100;
        
        // 游戏对象
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.powerUps = [];
        
        // 控制
        this.keys = {};
        this.lastShot = 0;
        this.shootCooldown = 200;
        
        // 敌机生成
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 2000;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createPlayer();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // 按钮事件
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('menuButton').addEventListener('click', () => {
            this.showMenu();
        });
    }
    
    createPlayer() {
        this.player = {
            x: this.canvas.width / 2 - 25,
            y: this.canvas.height - 80,
            width: 50,
            height: 60,
            speed: 5,
            color: '#00ffff',
            glowColor: '#00ffff'
        };
    }
    
    startGame() {
        this.gameState = 'playing';
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        this.resetGame();
    }
    
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.power = 100;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.powerUps = [];
        this.createPlayer();
        this.updateUI();
    }
    
    restartGame() {
        this.startGame();
    }
    
    showMenu() {
        this.gameState = 'menu';
        document.getElementById('startScreen').style.display = 'flex';
        document.getElementById('gameOverScreen').style.display = 'none';
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverScreen').style.display = 'flex';
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
        document.getElementById('powerFill').style.width = this.power + '%';
    }
    
    handleInput() {
        if (this.gameState !== 'playing' || !this.player) return;
        
        // 移动控制
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            this.player.y = Math.max(0, this.player.y - this.player.speed);
        }
        if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            this.player.y = Math.min(this.canvas.height - this.player.height, this.player.y + this.player.speed);
        }
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + this.player.speed);
        }
        
        // 射击控制
        if (this.keys['Space']) {
            this.shoot();
        }
    }
    
    shoot() {
        const now = Date.now();
        if (now - this.lastShot < this.shootCooldown) return;
        
        this.lastShot = now;
        
        // 创建子弹
        const bullet = {
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 15,
            speed: 10,
            color: '#00ffff',
            glowColor: '#00ffff'
        };
        
        this.bullets.push(bullet);
        
        // 创建射击特效
        this.createShootEffect(bullet.x, bullet.y);
    }
    
    createShootEffect(x, y) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x + Math.random() * 4 - 2,
                y: y,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * -2 - 1,
                size: Math.random() * 3 + 1,
                color: '#00ffff',
                life: 1,
                decay: 0.05
            });
        }
    }
    
    spawnEnemy() {
        const enemy = {
            x: Math.random() * (this.canvas.width - 40),
            y: -40,
            width: 40,
            height: 40,
            speed: Math.random() * 2 + 1,
            color: '#ff00ff',
            glowColor: '#ff00ff',
            health: 1,
            type: Math.random() > 0.8 ? 'strong' : 'normal'
        };
        
        if (enemy.type === 'strong') {
            enemy.health = 3;
            enemy.width = 60;
            enemy.height = 60;
            enemy.color = '#ff6600';
            enemy.glowColor = '#ff6600';
        }
        
        this.enemies.push(enemy);
    }
    
    updateBullets() {
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > -bullet.height;
        });
    }
    
    updateEnemies() {
        this.enemies = this.enemies.filter(enemy => {
            enemy.y += enemy.speed;
            
            // 检查是否撞到玩家
            if (this.checkCollision(enemy, this.player)) {
                this.lives--;
                this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                this.updateUI();
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
                return false;
            }
            
            return enemy.y < this.canvas.height + enemy.height;
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            particle.size *= 0.98;
            return particle.life > 0 && particle.size > 0.1;
        });
    }
    
    checkCollisions() {
        // 子弹与敌机碰撞
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.checkCollision(bullet, enemy)) {
                    // 移除子弹
                    this.bullets.splice(bulletIndex, 1);
                    
                    // 减少敌机血量
                    enemy.health--;
                    
                    if (enemy.health <= 0) {
                        // 移除敌机
                        this.enemies.splice(enemyIndex, 1);
                        
                        // 增加分数
                        this.score += enemy.type === 'strong' ? 50 : 10;
                        
                        // 创建爆炸效果
                        this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                        
                        this.updateUI();
                    } else {
                        // 创建击中效果
                        this.createHitEffect(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
                    }
                }
            });
        });
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 5 + 2,
                color: Math.random() > 0.5 ? '#ff6600' : '#ff00ff',
                life: 1,
                decay: 0.02
            });
        }
    }
    
    createHitEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: Math.random() * 3 + 1,
                color: '#ffff00',
                life: 0.5,
                decay: 0.1
            });
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.handleInput();
        this.updateBullets();
        this.updateEnemies();
        this.updateParticles();
        
        // 生成敌机
        this.enemySpawnTimer += 16; // 约60fps
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
            
            // 随着等级提升，增加敌机生成频率
            this.enemySpawnInterval = Math.max(500, 2000 - (this.level - 1) * 200);
        }
        
        // 检查碰撞
        this.checkCollisions();
        
        // 升级逻辑
        if (this.score > this.level * 100) {
            this.level++;
            this.updateUI();
        }
    }
    
    drawPlayer() {
        if (!this.player) return;
        
        const ctx = this.ctx;
        const p = this.player;
        
        // 绘制发光效果
        ctx.shadowColor = p.glowColor;
        ctx.shadowBlur = 20;
        
        // 绘制飞机主体
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(p.x + p.width/2, p.y);
        ctx.lineTo(p.x, p.y + p.height);
        ctx.lineTo(p.x + p.width/4, p.y + p.height * 0.8);
        ctx.lineTo(p.x + p.width * 0.75, p.y + p.height * 0.8);
        ctx.lineTo(p.x + p.width, p.y + p.height);
        ctx.closePath();
        ctx.fill();
        
        // 绘制引擎光效
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(p.x + p.width/4, p.y + p.height - 5, p.width/2, 5);
        
        ctx.shadowBlur = 0;
    }
    
    drawBullets() {
        const ctx = this.ctx;
        
        this.bullets.forEach(bullet => {
            ctx.shadowColor = bullet.glowColor;
            ctx.shadowBlur = 10;
            
            ctx.fillStyle = bullet.color;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            
            // 添加子弹光晕
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.fillRect(bullet.x - 2, bullet.y - 2, bullet.width + 4, bullet.height + 4);
            
            ctx.shadowBlur = 0;
        });
    }
    
    drawEnemies() {
        const ctx = this.ctx;
        
        this.enemies.forEach(enemy => {
            ctx.shadowColor = enemy.glowColor;
            ctx.shadowBlur = 15;
            
            ctx.fillStyle = enemy.color;
            
            if (enemy.type === 'strong') {
                // 绘制强化敌机
                ctx.beginPath();
                ctx.moveTo(enemy.x + enemy.width/2, enemy.y + enemy.height);
                ctx.lineTo(enemy.x, enemy.y);
                ctx.lineTo(enemy.x + enemy.width/4, enemy.y + enemy.height/3);
                ctx.lineTo(enemy.x + enemy.width * 0.75, enemy.y + enemy.height/3);
                ctx.lineTo(enemy.x + enemy.width, enemy.y);
                ctx.closePath();
                ctx.fill();
            } else {
                // 绘制普通敌机
                ctx.beginPath();
                ctx.moveTo(enemy.x + enemy.width/2, enemy.y);
                ctx.lineTo(enemy.x, enemy.y + enemy.height);
                ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height);
                ctx.closePath();
                ctx.fill();
            }
            
            ctx.shadowBlur = 0;
        });
    }
    
    drawParticles() {
        const ctx = this.ctx;
        
        this.particles.forEach(particle => {
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = 5;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        });
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === 'playing') {
            this.drawPlayer();
            this.drawBullets();
            this.drawEnemies();
            this.drawParticles();
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new CyberpunkPlaneGame();
});