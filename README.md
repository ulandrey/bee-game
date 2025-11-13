# 🐝 Bee Flower Collector - Telegram Mini App

A fun bee game where you collect flowers and power-ups in a race against time!

## 🎮 How to Play

- **Move the bee**: Click/tap anywhere in the game area or use arrow keys/WASD
- **Collect flowers**: Different flowers give different points
- **Grab power-ups**: Bonus points, honey, time, and score multipliers
- **Beat the clock**: 60 seconds to get the highest score!

## 🚀 Local Development

### Option 1: Python (Easiest)
```bash
cd bee-game
python3 server.py
```

### Option 2: Node.js
```bash
cd bee-game
npm install
npm start
```

### Option 3: Any Python installation
```bash
cd bee-game
python3 -m http.server 8000
```

Then open your browser and go to: **http://localhost:8000**

## 🎯 Game Features

- **5 Flower Types**: 🌻🌸🌺🌷🌹 (10-25 points each)
- **Power-ups**: ⭐🍯💫🎯 (special bonuses)
- **Scoring System**: Points + honey collection
- **High Score Tracking**: Saves your best score locally
- **Keyboard Support**: Arrow keys or WASD for movement

## 📱 Telegram Integration

The game is ready for Telegram Mini App deployment:

1. Create a bot with @BotFather
2. Set your game URL in BotFather
3. Users can play directly in Telegram!

## 🛠️ Files Structure

```
bee-game/
├── index.html      # Main game HTML
├── style.css       # Game styling
├── game.js         # Game logic
├── server.py       # Python server
├── server.js       # Node.js server
├── package.json    # Node.js dependencies
└── README.md       # This file
```

## 🎨 Game Controls

### Mouse/Touch
- Click or tap to move the bee to that position

### Keyboard
- **Arrow Keys** or **WASD**: Move the bee
- **P**: Pause/Resume game

## 🏆 Scoring

- 🌻 Sunflower: 10 points
- 🌸 Cherry Blossom: 15 points
- 🌺 Hibiscus: 20 points
- 🌷 Tulip: 12 points
- 🌹 Rose: 25 points
- ⭐ Bonus: +30 points
- 🍯 Honey: +3 honey
- 💫 Time: +10 seconds
- 🎯 Target: +50 points

## 🔧 Customization

You can easily modify:
- Flower types and points in `game.js`
- Game duration and difficulty
- Visual colors and animations
- Sound effects (add audio files)

## 🌐 Deployment

For production deployment:
1. Upload files to a web server (GitHub Pages, Netlify, Vercel, etc.)
2. Configure your Telegram bot with the URL
3. Share your game with Telegram users!

Enjoy the game! 🐝🌻