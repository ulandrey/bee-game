const express = require('express');
const path = require('path');
const open = require('open');

const app = express();
const PORT = process.env.PORT || 8000;

// Serve static files
app.use(express.static(__dirname));

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Telegram mini app route
app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log('🐝 Bee Game Server Started!');
    console.log(`🌐 Open your browser and go to: http://localhost:${PORT}`);
    console.log('🎮 Click "Start Game" to begin playing!');
    console.log('⏹️  Press Ctrl+C to stop the server');
    console.log('');
    console.log('📱 For Telegram testing:');
    console.log(`   Set this URL in BotFather: http://localhost:${PORT}/game`);
    console.log('');

    // Auto-open browser
    open(`http://localhost:${PORT}`);
});