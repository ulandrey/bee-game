// Game Enhancements Module
class GameEnhancements {
    constructor(game) {
        this.game = game;

        // Energy System
        this.maxEnergy = 100;
        this.energy = this.maxEnergy;
        this.energyDrainRate = 0.5; // Energy per second
        this.lastEnergyUpdate = Date.now();

        // Combo System
        this.comboCount = 0;
        this.lastFlowerColor = null;
        this.comboTimer = null;
        this.comboTimeout = 3000; // 3 seconds to maintain combo

        // Weather System
        this.currentWeather = 'clear';
        this.weatherEffects = {
            clear: { speedMultiplier: 1, energyMultiplier: 1 },
            rain: { speedMultiplier: 0.7, energyMultiplier: 1.5 },
            wind: { speedMultiplier: 0.8, energyMultiplier: 1.2 }
        };

        // Nectar System
        this.nectar = 0;
        this.upgrades = {
            speed: { level: 1, cost: 10, multiplier: 1.2 },
            magnet: { level: 1, cost: 15, radius: 70 }, // Increased starting radius
            shield: { level: 0, cost: 20, duration: 0 }
        };

        // Game Modes
        this.currentMode = 'classic';
        this.modeSettings = {
            classic: { timeLimit: 60, energyEnabled: true, predatorsEnabled: false },
            rush: { timeLimit: 30, energyEnabled: false, predatorsEnabled: false },
            survival: { timeLimit: 0, energyEnabled: true, predatorsEnabled: true }
        };

        // Predators
        this.predators = [];
        this.predatorTypes = ['🕷️', '🦅'];

        // Wind Gusts
        this.windDirection = { x: 0, y: 0 };
        this.windGustActive = false;

        // Pollen Trails
        this.pollenTrails = [];
        this.maxTrails = 10;

        // Hive Banking
        this.unbankedNectar = 0;
        this.bankedNectar = 0;
        this.hivePosition = { x: 350, y: 200 };

        // Leaderboard
        this.leaderboardData = [];

        // Daily Challenges
        this.dailyChallenges = this.generateDailyChallenges();
        this.completedChallenges = [];

        // Bee Skins
        this.beeSkins = [
            { emoji: '🐝', name: 'Classic Bee', unlocked: true, cost: 0 },
            { emoji: '🤖', name: 'Cyber Bee', unlocked: false, cost: 50 },
            { emoji: '👻', name: 'Ghost Bee', unlocked: false, cost: 75 },
            { emoji: '⭐', name: 'Star Bee', unlocked: false, cost: 100 },
            { emoji: '🔥', name: 'Fire Bee', unlocked: false, cost: 150 },
            { emoji: '❄️', name: 'Ice Bee', unlocked: false, cost: 125 }
        ];
        this.currentSkin = this.beeSkins[0];

        this.loadSavedData();
        this.initializeEnhancements();
    }

    initializeEnhancements() {
        this.setupMenuButtons();
        this.setupUpgradeShop();
        this.setupChallenges();
        this.setupLeaderboard();
        this.setupSkins();
        this.setupGameModes();
    }

    // ENERGY SYSTEM
    updateEnergy() {
        if (!this.game.isPlaying || this.isPaused) return;

        const now = Date.now();
        const deltaTime = (now - this.lastEnergyUpdate) / 1000;
        this.lastEnergyUpdate = now;

        // Drain energy based on weather and movement
        const drainAmount = this.energyDrainRate * deltaTime * this.weatherEffects[this.currentWeather].energyMultiplier;
        this.energy = Math.max(0, this.energy - drainAmount);

        this.updateEnergyDisplay();

        if (this.energy <= 0) {
            this.game.showToast('⚡ Out of Energy!', 'warning');
            this.game.endGame();
        }
    }

    restoreEnergy(amount) {
        this.energy = Math.min(this.maxEnergy, this.energy + amount);
        this.updateEnergyDisplay();
        this.game.showToast(`⚡ +${amount} Energy`, 'success');
    }

    updateEnergyDisplay() {
        const energyFill = document.getElementById('energyFill');
        if (energyFill) {
            energyFill.style.width = `${(this.energy / this.maxEnergy) * 100}%`;
        }
    }

    // COMBO SYSTEM
    updateCombo(flowerColor) {
        if (this.lastFlowerColor === flowerColor) {
            this.comboCount++;
            this.showCombo();
        } else {
            this.comboCount = 1;
        }

        this.lastFlowerColor = flowerColor;

        clearTimeout(this.comboTimer);
        this.comboTimer = setTimeout(() => {
            this.comboCount = 0;
            this.hideCombo();
        }, this.comboTimeout);
    }

    getComboMultiplier() {
        return 1 + (this.comboCount * 0.2); // 20% bonus per combo level
    }

    showCombo() {
        const comboDisplay = document.getElementById('comboDisplay');
        const comboCount = document.getElementById('comboCount');

        if (this.comboCount > 1) {
            comboDisplay.style.display = 'block';
            comboCount.textContent = this.comboCount;
        }
    }

    hideCombo() {
        const comboDisplay = document.getElementById('comboDisplay');
        comboDisplay.style.display = 'none';
    }

    // WEATHER SYSTEM
    changeWeather() {
        const weatherTypes = ['clear', 'rain', 'wind'];
        const oldWeather = this.currentWeather;
        this.currentWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];

        if (oldWeather !== this.currentWeather) {
            this.updateWeatherDisplay();
            this.game.showToast(`🌤️ Weather: ${this.currentWeather}`, 'info');
        }
    }

    updateWeatherDisplay() {
        const weatherOverlay = document.getElementById('weatherOverlay');
        const gameArea = document.getElementById('gameArea');

        weatherOverlay.className = 'weather-overlay';

        if (this.currentWeather !== 'clear') {
            weatherOverlay.classList.add(this.currentWeather);
            weatherOverlay.style.display = 'block';
        } else {
            weatherOverlay.style.display = 'none';
        }
    }

    // NECTAR SYSTEM
    addNectar(amount) {
        this.nectar += amount;
        this.unbankedNectar += amount;
        this.updateNectarDisplay();
    }

    spendNectar(amount) {
        if (this.nectar >= amount) {
            this.nectar -= amount;
            this.updateNectarDisplay();
            return true;
        }
        return false;
    }

    updateNectarDisplay() {
        const nectarElement = document.getElementById('nectar');
        if (nectarElement) {
            nectarElement.textContent = Math.floor(this.nectar);
        }
    }

    // UPGRADE SYSTEM
    upgradeSpeed() {
        const upgrade = this.upgrades.speed;
        if (this.spendNectar(upgrade.cost)) {
            upgrade.level++;
            upgrade.cost = Math.floor(upgrade.cost * 1.5);
            this.updateUpgradeDisplay();
            this.game.showToast('⚡ Speed Upgraded!', 'success');
            this.game.sounds.playPowerUpSound();
        } else {
            this.game.showToast('Not enough nectar!', 'error');
        }
    }

    upgradeMagnet() {
        const upgrade = this.upgrades.magnet;
        if (this.spendNectar(upgrade.cost)) {
            upgrade.level++;
            upgrade.radius += 30; // Increased from 20 to 30 for better effect
            upgrade.cost = Math.floor(upgrade.cost * 1.6);
            this.updateUpgradeDisplay();
            this.game.showToast(`🧲 Magnet Upgraded! Radius: ${upgrade.radius}px`, 'success');
            this.game.sounds.playPowerUpSound();
        } else {
            this.game.showToast('Not enough nectar!', 'error');
        }
    }

    upgradeShield() {
        const upgrade = this.upgrades.shield;
        if (this.spendNectar(upgrade.cost)) {
            upgrade.level++;
            upgrade.duration += 2;
            upgrade.cost = Math.floor(upgrade.cost * 1.7);
            this.updateUpgradeDisplay();
            this.game.showToast('🛡️ Shield Upgraded!', 'success');
            this.game.sounds.playPowerUpSound();
        } else {
            this.game.showToast('Not enough nectar!', 'error');
        }
    }

    updateUpgradeDisplay() {
        // Update upgrade shop display
        const speedLevel = document.getElementById('upgradeSpeed');
        const magnetLevel = document.getElementById('upgradeMagnet');
        const shieldLevel = document.getElementById('upgradeShield');

        if (speedLevel) speedLevel.textContent = this.upgrades.speed.level;
        if (magnetLevel) magnetLevel.textContent = this.upgrades.magnet.level;
        if (shieldLevel) shieldLevel.textContent = this.upgrades.shield.level + 's';

        // Update game stats display
        const speedStat = document.getElementById('speedLevel');
        const magnetStat = document.getElementById('magnetLevel');

        if (speedStat) speedStat.textContent = this.upgrades.speed.level;
        if (magnetStat) magnetStat.textContent = this.upgrades.magnet.level;

        // Update costs
        const speedCost = document.getElementById('speedCost');
        const magnetCost = document.getElementById('magnetCost');
        const shieldCost = document.getElementById('shieldCost');

        if (speedCost) speedCost.textContent = this.upgrades.speed.cost;
        if (magnetCost) magnetCost.textContent = this.upgrades.magnet.cost;
        if (shieldCost) shieldCost.textContent = this.upgrades.shield.cost;
    }

    // GAME MODES
    setGameMode(mode) {
        this.currentMode = mode;
        const settings = this.modeSettings[mode];

        // Apply mode-specific settings
        if (settings.timeLimit > 0) {
            this.game.timeLeft = settings.timeLimit;
        }

        // Enable/disable features based on mode
        this.updateWeatherDisplay();

        this.game.showToast(`🎮 ${mode.toUpperCase()} Mode`, 'success');
    }

    // PREDATORS
    spawnPredator() {
        if (this.modeSettings[this.currentMode].predatorsEnabled && Math.random() > 0.8) {
            const predator = document.createElement('div');
            predator.className = 'predator';
            predator.textContent = this.predatorTypes[Math.floor(Math.random() * this.predatorTypes.length)];

            const gameRect = this.game.gameArea.getBoundingClientRect();
            predator.style.left = Math.random() * (gameRect.width - 35) + 'px';
            predator.style.top = Math.random() * (gameRect.height - 35) + 'px';

            this.game.gameArea.appendChild(predator);
            this.predators.push(predator);

            // Remove predator after some time
            setTimeout(() => {
                if (predator.parentNode) {
                    predator.remove();
                    this.predators = this.predators.filter(p => p !== predator);
                }
            }, 8000);
        }
    }

    checkPredatorCollisions() {
        const beeRect = this.game.bee.getBoundingClientRect();

        this.predators.forEach((predator, index) => {
            const predatorRect = predator.getBoundingClientRect();

            if (this.isColliding(beeRect, predatorRect)) {
                if (this.upgrades.shield.level > 0) {
                    this.activateShield();
                    predator.remove();
                    this.predators.splice(index, 1);
                } else {
                    this.energy -= 20;
                    this.game.showToast('💀 Predator hit! -20 Energy', 'error');
                    predator.remove();
                    this.predators.splice(index, 1);
                }
            }
        });
    }

    activateShield() {
        const shield = document.createElement('div');
        shield.className = 'shield';
        this.game.bee.appendChild(shield);

        setTimeout(() => {
            if (shield.parentNode) {
                shield.remove();
            }
        }, this.upgrades.shield.duration * 1000);
    }

    isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left ||
                rect1.left > rect2.right ||
                rect1.bottom < rect2.top ||
                rect1.top > rect2.bottom);
    }

    // WIND GUSTS
    createWindGust() {
        this.windGustActive = true;
        this.windDirection = {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2
        };

        this.game.showToast('💨 Wind Gust!', 'info');

        setTimeout(() => {
            this.windGustActive = false;
            this.windDirection = { x: 0, y: 0 };
        }, 3000);
    }

    applyWindGust() {
        if (this.windGustActive) {
            const gameRect = this.game.gameArea.getBoundingClientRect();
            const windForce = 3;

            this.game.beePosition.x += this.windDirection.x * windForce;
            this.game.beePosition.y += this.windDirection.y * windForce;

            // Keep bee within bounds
            this.game.beePosition.x = Math.max(0, Math.min(gameRect.width - 40, this.game.beePosition.x));
            this.game.beePosition.y = Math.max(0, Math.min(gameRect.height - 40, this.game.beePosition.y));

            this.game.updateBeePosition();
        }
    }

    // POLLEN TRAILS
    createPollenTrail() {
        const trail = document.createElement('div');
        trail.className = 'pollen-trail';
        trail.style.left = (this.game.beePosition.x + 17) + 'px';
        trail.style.top = (this.game.beePosition.y + 17) + 'px';

        this.game.gameArea.appendChild(trail);
        this.pollenTrails.push(trail);

        // Remove old trails
        if (this.pollenTrails.length > this.maxTrails) {
            const oldTrail = this.pollenTrails.shift();
            if (oldTrail.parentNode) {
                oldTrail.remove();
            }
        }

        // Remove trail after animation
        setTimeout(() => {
            if (trail.parentNode) {
                trail.remove();
            }
            this.pollenTrails = this.pollenTrails.filter(t => t !== trail);
        }, 2000);
    }

    // HIVE BANKING
    returnToHive() {
        const distance = Math.sqrt(
            Math.pow(this.game.beePosition.x - this.hivePosition.x, 2) +
            Math.pow(this.game.beePosition.y - this.hivePosition.y, 2)
        );

        if (distance < 50) {
            this.bankedNectar += this.unbankedNectar;
            this.game.showToast(`🏠 Banked 🧪${Math.floor(this.unbankedNectar)} nectar!`, 'success');
            this.unbankedNectar = 0;
            this.game.sounds.playPowerUpSound();
        } else {
            this.game.showToast('Too far from hive!', 'warning');
        }
    }

    // DAILY CHALLENGES
    generateDailyChallenges() {
        const challengeTypes = [
            { type: 'collect_flowers', target: 10, description: 'Collect 10 flowers', reward: 25 },
            { type: 'collect_nectar', target: 20, description: 'Collect 20 nectar', reward: 30 },
            { type: 'survive_time', target: 30, description: 'Survive for 30 seconds', reward: 20 },
            { type: 'combo_chain', target: 5, description: 'Get a 5x combo', reward: 35 },
            { type: 'avoid_predators', target: 3, description: 'Avoid 3 predators', reward: 40 }
        ];

        // Return 3 random challenges
        return challengeTypes.sort(() => Math.random() - 0.5).slice(0, 3);
    }

    updateChallengeProgress(type, amount = 1) {
        this.dailyChallenges.forEach((challenge, index) => {
            if (challenge.type === type && !this.completedChallenges.includes(index)) {
                challenge.progress = (challenge.progress || 0) + amount;

                if (challenge.progress >= challenge.target) {
                    this.completeChallenge(index);
                }

                this.updateChallengeDisplay();
            }
        });
    }

    completeChallenge(index) {
        this.completedChallenges.push(index);
        const challenge = this.dailyChallenges[index];
        this.addNectar(challenge.reward);
        this.game.showToast(`🎯 Challenge Complete! +🧪${challenge.reward}`, 'success');
        this.game.sounds.playPowerUpSound();
    }

    updateChallengeDisplay() {
        this.dailyChallenges.forEach((challenge, index) => {
            const element = document.getElementById(`challenge${index + 1}`);
            if (element) {
                const completed = this.completedChallenges.includes(index);
                element.className = `challenge-item ${completed ? 'completed' : ''}`;
                element.textContent = `${challenge.description} (${challenge.progress || 0}/${challenge.target}) - 🧪${challenge.reward}`;
            }
        });
    }

    // LEADERBOARD
    updateLeaderboard(score, nectar) {
        const entry = {
            name: this.username || 'Anonymous Bee',
            score: score,
            nectar: Math.floor(nectar),
            date: new Date().toLocaleDateString()
        };

        this.leaderboardData.push(entry);
        this.leaderboardData.sort((a, b) => b.score - a.score);
        this.leaderboardData = this.leaderboardData.slice(0, 10); // Top 10

        this.saveLeaderboard();
    }

    displayLeaderboard() {
        const leaderboardList = document.getElementById('leaderboardList');
        if (leaderboardList) {
            leaderboardList.innerHTML = '';

            this.leaderboardData.forEach((entry, index) => {
                const item = document.createElement('div');
                item.className = 'leaderboard-item';
                item.innerHTML = `
                    <span>${index + 1}. ${entry.name}</span>
                    <span>${entry.score} pts 🧪${entry.nectar}</span>
                `;
                leaderboardList.appendChild(item);
            });
        }
    }

    // BEE SKINS
    unlockSkin(index) {
        const skin = this.beeSkins[index];
        if (this.spendNectar(skin.cost)) {
            skin.unlocked = true;
            this.equipSkin(index);
            this.saveSkins();
            this.game.showToast(`🎨 ${skin.name} unlocked!`, 'success');
            this.game.sounds.playPowerUpSound();
        } else {
            this.game.showToast('Not enough nectar!', 'error');
        }
    }

    equipSkin(index) {
        const skin = this.beeSkins[index];
        if (skin.unlocked) {
            this.currentSkin = skin;
            this.game.bee.textContent = skin.emoji;
            this.updateSkinsDisplay();
        }
    }

    updateSkinsDisplay() {
        const skinGrid = document.getElementById('skinGrid');
        if (skinGrid) {
            skinGrid.innerHTML = '';

            this.beeSkins.forEach((skin, index) => {
                const skinItem = document.createElement('div');
                skinItem.className = `skin-item ${skin.unlocked ? '' : 'locked'} ${this.currentSkin === skin ? 'selected' : ''}`;

                skinItem.innerHTML = `
                    <div style="font-size: 30px;">${skin.emoji}</div>
                    <div class="skin-name">${skin.name}</div>
                    ${skin.unlocked ? '' : `<div style="font-size: 10px;">🧪${skin.cost}</div>`}
                `;

                skinItem.addEventListener('click', () => {
                    if (skin.unlocked) {
                        this.equipSkin(index);
                    } else {
                        this.unlockSkin(index);
                    }
                });

                skinGrid.appendChild(skinItem);
            });
        }
    }

    // UI SETUP METHODS
    setupMenuButtons() {
        const upgradeBtn = document.getElementById('upgradeBtn');
        const challengesBtn = document.getElementById('challengesBtn');
        const leaderboardBtn = document.getElementById('leaderboardBtn');
        const skinsBtn = document.getElementById('skinsBtn');
        const hiveBtn = document.getElementById('hiveBtn');

        upgradeBtn?.addEventListener('click', () => this.showUpgradeShop());
        challengesBtn?.addEventListener('click', () => this.showChallenges());
        leaderboardBtn?.addEventListener('click', () => this.showLeaderboard());
        skinsBtn?.addEventListener('click', () => this.showSkins());
        hiveBtn?.addEventListener('click', () => this.returnToHive());
    }

    setupUpgradeShop() {
        const closeShop = document.getElementById('closeShop');
        const upgradeButtons = document.querySelectorAll('.upgrade-btn');

        closeShop?.addEventListener('click', () => {
            document.getElementById('upgradeShop').style.display = 'none';
        });

        upgradeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const upgradeType = button.dataset.upgrade;
                switch(upgradeType) {
                    case 'speed': this.upgradeSpeed(); break;
                    case 'magnet': this.upgradeMagnet(); break;
                    case 'shield': this.upgradeShield(); break;
                }
            });
        });
    }

    setupChallenges() {
        const closeChallenges = document.getElementById('closeChallenges');
        closeChallenges?.addEventListener('click', () => {
            document.getElementById('dailyChallenges').style.display = 'none';
        });
        this.updateChallengeDisplay();
    }

    setupLeaderboard() {
        const closeLeaderboard = document.getElementById('closeLeaderboard');
        closeLeaderboard?.addEventListener('click', () => {
            document.getElementById('leaderboard').style.display = 'none';
        });
    }

    setupSkins() {
        const closeSkins = document.getElementById('closeSkins');
        closeSkins?.addEventListener('click', () => {
            document.getElementById('beeSkins').style.display = 'none';
        });
        this.updateSkinsDisplay();
    }

    setupGameModes() {
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const mode = button.dataset.mode;
                this.setGameMode(mode);
                document.getElementById('modeSelection').style.display = 'none';
                this.game.startGame();
            });
        });
    }

    showUpgradeShop() {
        document.getElementById('upgradeShop').style.display = 'block';
        this.updateUpgradeDisplay();
    }

    showChallenges() {
        document.getElementById('dailyChallenges').style.display = 'block';
        this.updateChallengeDisplay();
    }

    showLeaderboard() {
        document.getElementById('leaderboard').style.display = 'block';
        this.displayLeaderboard();
    }

    showSkins() {
        document.getElementById('beeSkins').style.display = 'block';
        this.updateSkinsDisplay();
    }

    showModeSelection() {
        document.getElementById('modeSelection').style.display = 'block';
    }

    // DATA PERSISTENCE
    saveSavedData() {
        const saveData = {
            upgrades: this.upgrades,
            nectar: this.nectar,
            beeSkins: this.beeSkins.map(skin => ({ ...skin })),
            currentSkinIndex: this.beeSkins.indexOf(this.currentSkin),
            leaderboardData: this.leaderboardData
        };
        localStorage.setItem('beeGameEnhancements', JSON.stringify(saveData));
    }

    loadSavedData() {
        const savedData = localStorage.getItem('beeGameEnhancements');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.upgrades = data.upgrades || this.upgrades;
            this.nectar = data.nectar || this.nectar;
            this.leaderboardData = data.leaderboardData || this.leaderboardData;

            if (data.beeSkins) {
                this.beeSkins = data.beeSkins;
                const currentSkinIndex = data.currentSkinIndex || 0;
                this.currentSkin = this.beeSkins[currentSkinIndex];
            }

            this.updateAllDisplays();
        }
    }

    saveLeaderboard() {
        localStorage.setItem('beeGameLeaderboard', JSON.stringify(this.leaderboardData));
    }

    saveSkins() {
        this.saveSavedData();
    }

    updateAllDisplays() {
        this.updateUpgradeDisplay();
        this.updateNectarDisplay();
        this.updateSkinsDisplay();
        this.displayLeaderboard();
    }

    // CLEANUP
    reset() {
        this.energy = this.maxEnergy;
        this.comboCount = 0;
        this.unbankedNectar = 0;
        this.lastEnergyUpdate = Date.now();
        this.hideCombo();
        this.updateEnergyDisplay();
    }
}

// Export for use in main game
window.GameEnhancements = GameEnhancements;