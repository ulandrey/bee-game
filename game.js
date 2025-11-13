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
        this.initializeSounds();
        this.initializeEnhancements();
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

    initializeSounds() {
        this.sounds = new SoundManager();
    }

    initializeEnhancements() {
        this.enhancements = new GameEnhancements(this);
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => {
            this.enhancements.showModeSelection();
        });
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

        // Apply weather effects to movement
        const weatherEffect = this.enhancements.weatherEffects[this.enhancements.currentWeather];
        const speedMultiplier = weatherEffect.speedMultiplier * this.enhancements.upgrades.speed.multiplier;
        const step = 30 * speedMultiplier;
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
        this.sounds.playMoveSound();
        this.checkCollisions();
    }

    moveBee(e) {
        if (!this.isPlaying || this.isPaused) return;

        const gameRect = this.gameArea.getBoundingClientRect();
        const targetX = e.clientX - gameRect.left - 20;
        const targetY = e.clientY - gameRect.top - 20;

        // Apply weather effects to movement
        const weatherEffect = this.enhancements.weatherEffects[this.enhancements.currentWeather];
        const speedMultiplier = weatherEffect.speedMultiplier * this.enhancements.upgrades.speed.multiplier;

        // Move towards target with weather-adjusted speed
        this.beePosition.x += (targetX - this.beePosition.x) * 0.2 * speedMultiplier;
        this.beePosition.y += (targetY - this.beePosition.y) * 0.2 * speedMultiplier;

        // Keep bee within bounds
        this.beePosition.x = Math.max(0, Math.min(gameRect.width - 40, this.beePosition.x));
        this.beePosition.y = Math.max(0, Math.min(gameRect.height - 40, this.beePosition.y));

        this.updateBeePosition();
        this.sounds.playMoveSound();
        this.checkCollisions();
    }

    updateBeePosition() {
        this.bee.style.left = this.beePosition.x + 'px';
        this.bee.style.top = this.beePosition.y + 'px';
    }

    startGame() {
        this.score = 0;
        this.honey = 0;
        this.isPlaying = true;
        this.isPaused = false;

        // Reset enhancements
        this.enhancements.reset();

        // Apply mode-specific settings
        const settings = this.enhancements.modeSettings[this.enhancements.currentMode];
        this.timeLeft = settings.timeLimit || 60;

        // Show/hide hive button based on mode
        const hiveBtn = document.getElementById('hiveBtn');
        if (this.enhancements.currentMode === 'survival') {
            hiveBtn.style.display = 'inline-block';
        }

        this.sounds.playStartSound();
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

        // Start weather events
        this.weatherInterval = setInterval(() => {
            if (!this.isPaused) this.enhancements.changeWeather();
        }, 15000);

        // Start predator spawning
        this.predatorInterval = setInterval(() => {
            if (!this.isPaused) this.enhancements.spawnPredator();
        }, 8000);

        // Start wind gusts
        this.windInterval = setInterval(() => {
            if (!this.isPaused && Math.random() > 0.7) {
                this.enhancements.createWindGust();
            }
        }, 10000);

        // Start timer
        this.timerInterval = setInterval(() => {
            if (!this.isPaused) {
                // Update energy
                this.enhancements.updateEnergy();

                // Apply wind gusts
                this.enhancements.applyWindGust();

                this.timeLeft--;
                this.timerElement.textContent = this.timeLeft;

                // Warning sound when time is low (last 10 seconds, every 3 seconds)
                if (this.timeLeft <= 10 && this.timeLeft > 0 && this.timeLeft % 3 === 0) {
                    this.sounds.playTimerSound();
                }

                if (this.timeLeft <= 0) {
                    this.endGame();
                }
            }
        }, 1000);

        // Check collisions frequently
        this.collisionInterval = setInterval(() => {
            if (!this.isPaused) {
                this.checkCollisions();
                this.enhancements.checkPredatorCollisions();
            }
        }, 100);

        // Create pollen trails
        this.trailInterval = setInterval(() => {
            if (!this.isPaused) {
                this.enhancements.createPollenTrail();
            }
        }, 200);
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
        // Check flower collisions (with magnet)
        this.flowers.forEach((flower, index) => {
            const magnetRadius = this.enhancements.upgrades.magnet.radius;
            const distance = this.getDistance(this.bee, flower);

            if (distance < magnetRadius) {
                // Apply magnet pull
                if (distance > 40) {
                    this.applyMagnetPull(flower);
                } else if (this.isColliding(this.bee, flower)) {
                    this.collectFlower(flower, index);
                }
            }
        });

        // Check power-up collisions
        this.powerUps.forEach((powerUp, index) => {
            if (this.isColliding(this.bee, powerUp)) {
                this.collectPowerUp(powerUp, index);
            }
        });
    }

    getDistance(element1, element2) {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();

        const dx = (rect1.left + rect1.width / 2) - (rect2.left + rect2.width / 2);
        const dy = (rect1.top + rect1.height / 2) - (rect2.top + rect2.height / 2);

        return Math.sqrt(dx * dx + dy * dy);
    }

    applyMagnetPull(flower) {
        const flowerRect = flower.getBoundingClientRect();
        const beeRect = this.bee.getBoundingClientRect();

        const pullStrength = 0.1;
        const dx = (beeRect.left + beeRect.width / 2) - (flowerRect.left + flowerRect.width / 2);
        const dy = (beeRect.top + beeRect.height / 2) - (flowerRect.top + flowerRect.height / 2);

        const gameAreaRect = this.gameArea.getBoundingClientRect();
        const newX = parseInt(flower.style.left) + dx * pullStrength;
        const newY = parseInt(flower.style.top) + dy * pullStrength;

        flower.style.left = newX + 'px';
        flower.style.top = newY + 'px';
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        this.gameArea.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 3000);
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
        this.sounds.playCollectSound();

        // Different flowers give different points
        const flowerPoints = {
            '🌻': 10,
            '🌸': 15,
            '🌺': 20,
            '🌷': 12,
            '🌹': 25
        };

        // Get flower color for combo system
        const flowerColor = this.getFlowerColor(flower.textContent);
        this.enhancements.updateCombo(flowerColor);

        let points = flowerPoints[flower.textContent] || 10;
        points = Math.floor(points * this.enhancements.getComboMultiplier());

        // Apply speed multiplier
        points = Math.floor(points * this.enhancements.upgrades.speed.multiplier);

        this.score += points;

        // Add nectar
        const nectarAmount = Math.floor(points / 10);
        this.enhancements.addNectar(nectarAmount);

        // Energy restoration for certain flowers
        if (['🌺', '🌹'].includes(flower.textContent)) {
            this.enhancements.restoreEnergy(5);
        }

        // Update challenges
        this.enhancements.updateChallengeProgress('collect_flowers');
        this.enhancements.updateChallengeProgress('collect_nectar', nectarAmount);

        // Bonus honey every 50 points
        if (this.score % 50 === 0) {
            this.honey++;
            this.sounds.playHoneySound();
            this.createHoneyDrop();
        }

        this.updateDisplay();

        setTimeout(() => {
            flower.remove();
            this.flowers.splice(index, 1);
        }, 500);
    }

    getFlowerColor(flowerEmoji) {
        const flowerColors = {
            '🌻': 'yellow',
            '🌸': 'pink',
            '🌺': 'red',
            '🌷': 'purple',
            '🌹': 'rose'
        };
        return flowerColors[flowerEmoji] || 'unknown';
    }

    collectPowerUp(powerUp, index) {
        this.sounds.playPowerUpSound();

        const powerUpEffects = {
            '⭐': () => { this.score += 30; this.showEffect('+30 points!'); },
            '🍯': () => { this.honey += 3; this.sounds.playHoneySound(); this.showEffect('+3 honey!'); },
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
        this.enhancements.predators.forEach(predator => predator.remove());
        this.enhancements.pollenTrails.forEach(trail => trail.remove());

        this.flowers = [];
        this.powerUps = [];
        this.enhancements.predators = [];
        this.enhancements.pollenTrails = [];
    }

    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.honeyElement.textContent = this.honey;
        this.enhancements.updateAllDisplays();
    }

    endGame() {
        this.isPlaying = false;
        this.sounds.playGameOverSound();

        // Clear intervals
        clearInterval(this.flowerInterval);
        clearInterval(this.powerUpInterval);
        clearInterval(this.weatherInterval);
        clearInterval(this.predatorInterval);
        clearInterval(this.windInterval);
        clearInterval(this.timerInterval);
        clearInterval(this.collisionInterval);
        clearInterval(this.trailInterval);

        // Update high score
        const highScore = this.getHighScore();
        if (this.score > highScore) {
            localStorage.setItem('beeGameHighScore', this.score);
            this.highScoreElement.textContent = this.score;
        }

        // Update leaderboard
        this.enhancements.updateLeaderboard(this.score, this.enhancements.nectar);

        // Save enhancements data
        this.enhancements.saveSavedData();

        // Show game over screen
        this.showGameOver();

        // Send score to Telegram if available
        if (window.Telegram && window.Telegram.WebApp) {
            try {
                window.Telegram.WebApp.sendData(JSON.stringify({
                    type: 'game_result',
                    score: this.score,
                    honey: this.honey,
                    nectar: Math.floor(this.enhancements.nectar),
                    mode: this.enhancements.currentMode
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
            <p>🧪 Nectar: ${Math.floor(this.enhancements.nectar)}</p>
            <p>🎮 Mode: ${this.enhancements.currentMode.toUpperCase()}</p>
            <button class="tg-button" onclick="location.reload()">Play Again</button>
            <button class="tg-button" onclick="location.reload()">View Menu</button>
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