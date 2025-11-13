class BeeGame {
    constructor() {
        this.score = 0;
        this.honey = 0;
        this.timeLeft = 60;
        this.isPlaying = false;
        this.isPaused = false;
        this.flowers = [];
        this.beePosition = { x: 200, y: 200 };
        this.flowerTypes = ['🌻', '🌸', '🌺', '🌷', '🌹'];
        this.powerUps = [];

        this.initializeElements();
        this.initializeTelegram();
        this.bindEvents();
        this.loadHighScore();
    }

    initializeElements() {
        this.gameArea = document.getElementById('gameArea');
        this.bee = document.getElementById('bee');
        this.scoreElement = document.getElementById('score');
        this.honeyElement = document.getElementById('honey');
        this.timerElement = document.getElementById('timer');
        this.highScoreElement = document.getElementById('highScore');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');

        this.updateBeePosition();
    }

    initializeTelegram() {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();
            tg.setHeaderColor('#87CEEB');

            // Use Telegram user data if available
            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                this.username = tg.initDataUnsafe.user.first_name;
                console.log('Player:', this.username);
            }
        }
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());

        // Touch/Mouse controls
        this.gameArea.addEventListener('click', (e) => this.moveBee(e));
        this.gameArea.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.moveBee(e.touches[0]);
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    handleKeyboard(e) {
        if (!this.isPlaying || this.isPaused) return;

        const step = 30;
        const gameRect = this.gameArea.getBoundingClientRect();

        switch(e.key) {
            case 'ArrowUp':
            case 'w':
                this.beePosition.y = Math.max(0, this.beePosition.y - step);
                break;
            case 'ArrowDown':
            case 's':
                this.beePosition.y = Math.min(gameRect.height - 40, this.beePosition.y + step);
                break;
            case 'ArrowLeft':
            case 'a':
                this.beePosition.x = Math.max(0, this.beePosition.x - step);
                break;
            case 'ArrowRight':
            case 'd':
                this.beePosition.x = Math.min(gameRect.width - 40, this.beePosition.x + step);
                break;
        }

        this.updateBeePosition();
        this.checkCollisions();
    }

    moveBee(e) {
        if (!this.isPlaying || this.isPaused) return;

        const gameRect = this.gameArea.getBoundingClientRect();
        this.beePosition.x = e.clientX - gameRect.left - 20;
        this.beePosition.y = e.clientY - gameRect.top - 20;

        // Keep bee within bounds
        this.beePosition.x = Math.max(0, Math.min(gameRect.width - 40, this.beePosition.x));
        this.beePosition.y = Math.max(0, Math.min(gameRect.height - 40, this.beePosition.y));

        this.updateBeePosition();
        this.checkCollisions();
    }

    updateBeePosition() {
        this.bee.style.left = this.beePosition.x + 'px';
        this.bee.style.top = this.beePosition.y + 'px';
    }

    startGame() {
        this.score = 0;
        this.honey = 0;
        this.timeLeft = 60;
        this.isPlaying = true;
        this.isPaused = false;

        this.updateDisplay();
        this.startBtn.style.display = 'none';
        this.pauseBtn.style.display = 'block';

        // Clear existing flowers
        this.clearFlowers();

        // Start spawning flowers
        this.flowerInterval = setInterval(() => {
            if (!this.isPaused) this.spawnFlower();
        }, 1500);

        // Start spawning power-ups
        this.powerUpInterval = setInterval(() => {
            if (!this.isPaused && Math.random() > 0.7) this.spawnPowerUp();
        }, 5000);

        // Start timer
        this.timerInterval = setInterval(() => {
            if (!this.isPaused) {
                this.timeLeft--;
                this.timerElement.textContent = this.timeLeft;

                if (this.timeLeft <= 0) {
                    this.endGame();
                }
            }
        }, 1000);

        // Check collisions frequently
        this.collisionInterval = setInterval(() => {
            if (!this.isPaused) this.checkCollisions();
        }, 100);
    }

    togglePause() {
        if (!this.isPlaying) return;

        this.isPaused = !this.isPaused;
        this.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
    }

    spawnFlower() {
        const gameRect = this.gameArea.getBoundingClientRect();
        const flowerType = this.flowerTypes[Math.floor(Math.random() * this.flowerTypes.length)];

        const flower = document.createElement('div');
        flower.className = 'flower';
        flower.textContent = flowerType;
        flower.style.left = Math.random() * (gameRect.width - 35) + 'px';
        flower.style.top = Math.random() * (gameRect.height - 35) + 'px';

        this.gameArea.appendChild(flower);
        this.flowers.push(flower);

        // Remove flower after some time if not collected
        setTimeout(() => {
            if (flower.parentNode) {
                flower.remove();
                this.flowers = this.flowers.filter(f => f !== flower);
            }
        }, 8000);
    }

    spawnPowerUp() {
        const gameRect = this.gameArea.getBoundingClientRect();
        const powerUpTypes = ['⭐', '🍯', '💫', '🎯'];
        const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

        const powerUp = document.createElement('div');
        powerUp.className = 'power-up';
        powerUp.textContent = powerUpType;
        powerUp.style.left = Math.random() * (gameRect.width - 40) + 'px';
        powerUp.style.top = Math.random() * (gameRect.height - 40) + 'px';

        this.gameArea.appendChild(powerUp);
        this.powerUps.push(powerUp);

        // Remove power-up after 3 seconds
        setTimeout(() => {
            if (powerUp.parentNode) {
                powerUp.remove();
                this.powerUps = this.powerUps.filter(p => p !== powerUp);
            }
        }, 3000);
    }

    checkCollisions() {
        // Check flower collisions
        this.flowers.forEach((flower, index) => {
            if (this.isColliding(this.bee, flower)) {
                this.collectFlower(flower, index);
            }
        });

        // Check power-up collisions
        this.powerUps.forEach((powerUp, index) => {
            if (this.isColliding(this.bee, powerUp)) {
                this.collectPowerUp(powerUp, index);
            }
        });
    }

    isColliding(element1, element2) {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();

        return !(rect1.right < rect2.left ||
                rect1.left > rect2.right ||
                rect1.bottom < rect2.top ||
                rect1.top > rect2.bottom);
    }

    collectFlower(flower, index) {
        flower.classList.add('collected');

        // Different flowers give different points
        const flowerPoints = {
            '🌻': 10,
            '🌸': 15,
            '🌺': 20,
            '🌷': 12,
            '🌹': 25
        };

        const points = flowerPoints[flower.textContent] || 10;
        this.score += points;

        // Bonus honey every 50 points
        if (this.score % 50 === 0) {
            this.honey++;
            this.createHoneyDrop();
        }

        this.updateDisplay();

        setTimeout(() => {
            flower.remove();
            this.flowers.splice(index, 1);
        }, 500);
    }

    collectPowerUp(powerUp, index) {
        const powerUpEffects = {
            '⭐': () => { this.score += 30; this.showEffect('+30 points!'); },
            '🍯': () => { this.honey += 3; this.showEffect('+3 honey!'); },
            '💫': () => { this.timeLeft += 10; this.showEffect('+10 seconds!'); },
            '🎯': () => { this.score += 50; this.showEffect('BONUS +50!'); }
        };

        const effect = powerUpEffects[powerUp.textContent];
        if (effect) effect();

        powerUp.remove();
        this.powerUps.splice(index, 1);
        this.updateDisplay();
    }

    createHoneyDrop() {
        const honeyDrop = document.createElement('div');
        honeyDrop.className = 'honey-drop';
        honeyDrop.textContent = '🍯';
        honeyDrop.style.left = (this.beePosition.x + 5) + 'px';
        honeyDrop.style.top = (this.beePosition.y + 5) + 'px';

        this.gameArea.appendChild(honeyDrop);

        setTimeout(() => honeyDrop.remove(), 2000);
    }

    showEffect(text) {
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: absolute;
            top: ${this.beePosition.y - 20}px;
            left: ${this.beePosition.x}px;
            background: rgba(255, 215, 0, 0.9);
            color: #333;
            padding: 5px 10px;
            border-radius: 15px;
            font-weight: bold;
            z-index: 100;
            animation: fadeInOut 1.5s ease-out forwards;
        `;
        effect.textContent = text;

        this.gameArea.appendChild(effect);
        setTimeout(() => effect.remove(), 1500);
    }

    clearFlowers() {
        this.flowers.forEach(flower => flower.remove());
        this.powerUps.forEach(powerUp => powerUp.remove());
        this.flowers = [];
        this.powerUps = [];
    }

    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.honeyElement.textContent = this.honey;
    }

    endGame() {
        this.isPlaying = false;

        // Clear intervals
        clearInterval(this.flowerInterval);
        clearInterval(this.powerUpInterval);
        clearInterval(this.timerInterval);
        clearInterval(this.collisionInterval);

        // Update high score
        const highScore = this.getHighScore();
        if (this.score > highScore) {
            localStorage.setItem('beeGameHighScore', this.score);
            this.highScoreElement.textContent = this.score;
        }

        // Show game over screen
        this.showGameOver();

        // Send score to Telegram if available
        if (window.Telegram && window.Telegram.WebApp) {
            try {
                window.Telegram.WebApp.sendData(JSON.stringify({
                    type: 'game_result',
                    score: this.score,
                    honey: this.honey
                }));
            } catch (e) {
                console.log('Could not send data to Telegram');
            }
        }
    }

    showGameOver() {
        const gameOver = document.createElement('div');
        gameOver.className = 'game-over';
        gameOver.style.display = 'block';
        gameOver.innerHTML = `
            <h2>🐝 Game Over!</h2>
            <p>🌻 Score: ${this.score}</p>
            <p>🍯 Honey: ${this.honey}</p>
            <button class="tg-button" onclick="location.reload()">Play Again</button>
        `;

        this.gameArea.appendChild(gameOver);
    }

    loadHighScore() {
        const highScore = this.getHighScore();
        this.highScoreElement.textContent = highScore;
    }

    getHighScore() {
        return parseInt(localStorage.getItem('beeGameHighScore') || '0');
    }
}

// Add fade animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(0px); }
        50% { opacity: 1; transform: translateY(-10px); }
        100% { opacity: 0; transform: translateY(-20px); }
    }
`;
document.head.appendChild(style);

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new BeeGame();
});