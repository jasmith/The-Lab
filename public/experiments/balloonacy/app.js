// ES6 Module for Balloonacy - Balloon Popping Game

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const scoreElement = document.getElementById('score');
const poppedElement = document.getElementById('popped');
const missedElement = document.getElementById('missed');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

// Game State
let gameState = {
    score: 0,
    balloonsPopped: 0,
    balloonsMissed: 0,
    isRunning: false,
    balloons: [],
    particles: [],
    animationId: null
};

// Balloon colors - expanded palette
const balloonColors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Orange
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#EC7063', // Pink
    '#FF1744', // Hot Pink
    '#76FF03', // Lime Green
    '#00BCD4', // Cyan
    '#FF9800', // Deep Orange
    '#E91E63', // Magenta
    '#00E676'  // Bright Green
];

// Balloon size tiers - discrete sizes for clearer gameplay
const balloonSizes = {
    small: { radius: 30, speed: 2.5, points: 30, label: 'Small' },
    medium: { radius: 45, speed: 1.8, points: 45, label: 'Medium' },
    large: { radius: 60, speed: 1.2, points: 60, label: 'Large' }
};

// Special balloon types
const specialBalloonTypes = {
    gold: {
        color: '#FFD700',
        secondaryColor: '#FFA500',
        points: 100,
        label: '⭐',
        spawnChance: 0.1 // 10% chance
    },
    bomb: {
        color: '#2C3E50',
        secondaryColor: '#34495E',
        points: -50,
        label: '💣',
        spawnChance: 0.15 // 15% chance
    }
};

// Particle Class - for pop effects
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        
        // Random velocity for explosion effect
        const angle = randomRange(0, Math.PI * 2);
        const speed = randomRange(2, 8);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - randomRange(1, 3); // Slight upward bias
        
        // Particle properties
        this.size = randomRange(3, 8);
        this.life = 1.0; // 1.0 = full life, 0 = dead
        this.decay = randomRange(0.015, 0.03); // How fast it fades
        this.gravity = 0.15;
        this.rotation = randomRange(0, Math.PI * 2);
        this.rotationSpeed = randomRange(-0.2, 0.2);
        
        // Shape variation
        this.shape = Math.random() > 0.5 ? 'square' : 'circle';
    }

    update() {
        // Apply velocity
        this.x += this.vx;
        this.y += this.vy;
        
        // Apply gravity
        this.vy += this.gravity;
        
        // Apply air resistance
        this.vx *= 0.98;
        this.vy *= 0.98;
        
        // Rotate
        this.rotation += this.rotationSpeed;
        
        // Fade out
        this.life -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        }
        
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

// Balloon Class
class Balloon {
    constructor(x, y, radius, color, speed, type = 'normal', points = 0, label = '') {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.type = type; // 'normal', 'gold', 'bomb'
        this.points = points;
        this.label = label;
        this.isPopped = false;
        this.popAnimation = 0;
        this.stringLength = 50;
        this.wobble = 0; // For animation
    }

    // Draw the balloon
    draw() {
        if (this.isPopped && this.popAnimation < 1) {
            // Draw pop effect
            this.drawPopEffect();
            this.popAnimation += 0.1;
            return;
        }

        if (this.isPopped) return; // Don't draw if fully popped

        // Add wobble animation
        this.wobble += 0.05;
        const wobbleOffset = Math.sin(this.wobble) * 2;

        // Draw string
        ctx.beginPath();
        ctx.moveTo(this.x + wobbleOffset, this.y + this.radius);
        ctx.lineTo(this.x, this.y + this.radius + this.stringLength);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Create radial gradient for balloon
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3 + wobbleOffset,
            this.y - this.radius * 0.3,
            this.radius * 0.1,
            this.x + wobbleOffset,
            this.y,
            this.radius
        );
        
        // Special gradient for gold balloons
        if (this.type === 'gold') {
            gradient.addColorStop(0, '#FFFACD');
            gradient.addColorStop(0.4, this.color);
            gradient.addColorStop(0.8, specialBalloonTypes.gold.secondaryColor);
            gradient.addColorStop(1, this.darkenColor(this.color, 30));
        } else if (this.type === 'bomb') {
            gradient.addColorStop(0, this.lightenColor(this.color, 20));
            gradient.addColorStop(0.7, this.color);
            gradient.addColorStop(1, '#000000');
        } else {
            gradient.addColorStop(0, this.lightenColor(this.color, 40));
            gradient.addColorStop(0.7, this.color);
            gradient.addColorStop(1, this.darkenColor(this.color, 20));
        }

        // Draw balloon body
        ctx.beginPath();
        ctx.arc(this.x + wobbleOffset, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw balloon highlight
        ctx.beginPath();
        ctx.arc(
            this.x - this.radius * 0.25 + wobbleOffset,
            this.y - this.radius * 0.25,
            this.radius * 0.2,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();

        // Draw label for special balloons
        if (this.label) {
            ctx.font = `${this.radius * 0.8}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.label, this.x + wobbleOffset, this.y);
        }

        // Draw balloon knot
        ctx.beginPath();
        ctx.ellipse(
            this.x + wobbleOffset,
            this.y + this.radius,
            this.radius * 0.15,
            this.radius * 0.25,
            0,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = this.darkenColor(this.color, 30);
        ctx.fill();
        
        // Add glow effect for gold balloons
        if (this.type === 'gold') {
            ctx.save();
            ctx.globalAlpha = 0.3 + Math.sin(this.wobble * 2) * 0.2;
            ctx.beginPath();
            ctx.arc(this.x + wobbleOffset, this.y, this.radius + 5, 0, Math.PI * 2);
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
        }
    }

    // Draw pop effect
    drawPopEffect() {
        const alpha = 1 - this.popAnimation;
        const scale = 1 + this.popAnimation * 0.5;

        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Draw expanding circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * scale, 0, Math.PI * 2);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw "POP!" text
        ctx.font = `bold ${this.radius}px Arial`;
        ctx.fillStyle = this.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('POP!', this.x, this.y);

        ctx.restore();
    }

    // Move balloon upward
    update() {
        if (!this.isPopped) {
            this.y -= this.speed;
        }
    }

    // Check if balloon is clicked
    isClicked(mouseX, mouseY) {
        const distance = Math.sqrt(
            Math.pow(mouseX - this.x, 2) + Math.pow(mouseY - this.y, 2)
        );
        return distance <= this.radius;
    }

    // Helper: Lighten color
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }

    // Helper: Darken color
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }
}

// Utility: Random number generator
const randomRange = (min, max) => Math.random() * (max - min) + min;

// Utility: Random element from array
const randomElement = (array) => array[Math.floor(Math.random() * array.length)];

// Create particle explosion
const createParticleExplosion = (x, y, color, count = 20) => {
    for (let i = 0; i < count; i++) {
        gameState.particles.push(new Particle(x, y, color));
    }
};

// Create a new balloon with size tiers and special types
const createBalloon = () => {
    const x = randomRange(100, canvas.width - 100);
    const y = canvas.height + 100;
    
    // Determine if this is a special balloon
    const rand = Math.random();
    
    // Gold balloon (bonus)
    if (rand < specialBalloonTypes.gold.spawnChance) {
        const size = balloonSizes.medium; // Gold balloons are always medium
        return new Balloon(
            x, y, 
            size.radius, 
            specialBalloonTypes.gold.color, 
            size.speed,
            'gold',
            specialBalloonTypes.gold.points,
            specialBalloonTypes.gold.label
        );
    }
    
    // Bomb balloon (penalty)
    if (rand < specialBalloonTypes.gold.spawnChance + specialBalloonTypes.bomb.spawnChance) {
        const size = balloonSizes.small; // Bombs are always small (harder to avoid)
        return new Balloon(
            x, y,
            size.radius,
            specialBalloonTypes.bomb.color,
            size.speed * 1.3, // Bombs move faster!
            'bomb',
            specialBalloonTypes.bomb.points,
            specialBalloonTypes.bomb.label
        );
    }
    
    // Normal balloon - pick a size tier randomly
    const sizeKeys = Object.keys(balloonSizes);
    const sizeKey = randomElement(sizeKeys);
    const size = balloonSizes[sizeKey];
    
    const color = randomElement(balloonColors);
    
    return new Balloon(
        x, y,
        size.radius,
        color,
        size.speed,
        'normal',
        size.points,
        ''
    );
};

// Update UI
const updateUI = () => {
    scoreElement.textContent = gameState.score;
    poppedElement.textContent = gameState.balloonsPopped;
    missedElement.textContent = gameState.balloonsMissed;
};

// Game loop
const gameLoop = () => {
    if (!gameState.isRunning) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw balloons
    gameState.balloons.forEach((balloon, index) => {
        balloon.update();
        balloon.draw();

        // Remove balloons that are off screen or fully popped
        if (balloon.y + balloon.radius + balloon.stringLength < 0) {
            gameState.balloons.splice(index, 1);
            if (!balloon.isPopped) {
                gameState.balloonsMissed++;
                updateUI();
            }
        } else if (balloon.isPopped && balloon.popAnimation >= 1) {
            gameState.balloons.splice(index, 1);
        }
    });

    // Update and draw particles
    gameState.particles = gameState.particles.filter(particle => {
        particle.update();
        particle.draw();
        return !particle.isDead();
    });

    // Spawn new balloons randomly
    if (Math.random() < 0.02 && gameState.balloons.length < 15) {
        gameState.balloons.push(createBalloon());
    }

    gameState.animationId = requestAnimationFrame(gameLoop);
};

// Handle canvas click
const handleCanvasClick = (event) => {
    if (!gameState.isRunning) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    // Check if any balloon was clicked
    for (let i = gameState.balloons.length - 1; i >= 0; i--) {
        const balloon = gameState.balloons[i];
        if (!balloon.isPopped && balloon.isClicked(mouseX, mouseY)) {
            balloon.isPopped = true;
            
            // Update score based on balloon type and points
            gameState.score += balloon.points;
            
            // Only count as "popped" if it's not a bomb
            if (balloon.type !== 'bomb') {
                gameState.balloonsPopped++;
            }
            
            // Create particle explosion!
            const particleCount = Math.round(balloon.radius / 2);
            
            // Special particle effects for special balloons
            if (balloon.type === 'gold') {
                // Extra particles for gold
                createParticleExplosion(balloon.x, balloon.y, '#FFD700', particleCount * 2);
                createParticleExplosion(balloon.x, balloon.y, '#FFA500', particleCount);
            } else if (balloon.type === 'bomb') {
                // Dark explosion for bomb
                createParticleExplosion(balloon.x, balloon.y, '#FF0000', particleCount * 1.5);
                createParticleExplosion(balloon.x, balloon.y, '#000000', particleCount);
            } else {
                createParticleExplosion(balloon.x, balloon.y, balloon.color, particleCount);
            }
            
            updateUI();
            break; // Only pop one balloon per click
        }
    }
};

// Start game
const startGame = () => {
    if (gameState.isRunning) return;

    gameState.isRunning = true;
    startBtn.disabled = true;
    startBtn.textContent = 'Game Running...';
    gameLoop();
};

// Reset game
const resetGame = () => {
    // Cancel animation frame
    if (gameState.animationId) {
        cancelAnimationFrame(gameState.animationId);
    }

    // Reset state
    gameState = {
        score: 0,
        balloonsPopped: 0,
        balloonsMissed: 0,
        isRunning: false,
        balloons: [],
        particles: [],
        animationId: null
    };

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reset UI
    updateUI();
    startBtn.disabled = false;
    startBtn.textContent = 'Start Game';
};

// Event Listeners
canvas.addEventListener('click', handleCanvasClick);
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

// Initial UI update
updateUI();

// Console welcome message
console.log('🎈 Balloonacy loaded! Click Start Game to begin popping balloons!');

// Export for potential use in other modules
export { Balloon, Particle, createBalloon, createParticleExplosion, gameState };

