// ES6 Module for Balloonacy X - Circle Animation Experiment

// Canvas Setup
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Audio Setup
class Sound {
    constructor(src) {
        this.audio = document.createElement('audio');
        this.audio.src = src;
        this.audio.setAttribute('preload', 'auto');
        this.audio.setAttribute('controls', 'none');
        this.audio.style.display = 'none';
        document.body.appendChild(this.audio);
    }

    play() {
        this.audio.play();
    }

    stop() {
        this.audio.pause();
    }
}

// Initialize audio
const myMusic = new Sound('assets/audio/transformer-1.mp3');

// Circle Class
class Circle {
    constructor(x, y, r, color) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;
    }
}

// Color palette
const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'black', 'white'];

// Utility Functions
const randomizer = (min, max) => {
    return Math.random() * (max - min) + min;
};

// Circle Factory - Creates and draws circles
const circleFactory = (circleObj, clearScreen = false) => {
    const { x, y, r, color } = circleObj;
    
    const gx = Math.floor(x);
    const gy = Math.floor(y);
    const gr = Math.floor(r);
    
    // Create radial gradient
    const gradient = ctx.createRadialGradient(gx, gy, gr, gx, gy, 1);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.9, 'white');
    
    if (clearScreen) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw circle
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = gradient;
    
    // Add text marker
    ctx.font = '30px Arial';
    ctx.fillText('X', x, y);
    
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.closePath();
    
    return circleObj;
};

// Draw helper function
const draw = (circle) => {
    circleFactory(circle);
};

// Psycho Circle Animation - Creates random circles at a fixed position
const psychoCircle = (posX, posY, radiusMax) => {
    const c = new Circle(
        posX,
        posY,
        randomizer(0, radiusMax),
        colors[Math.floor(randomizer(0, colors.length - 1))]
    );
    myMusic.play();
    circleFactory(c);
};

// Universe Circle - Creates random circles anywhere on canvas
const universeCircle = () => {
    const c = new Circle(
        randomizer(0, canvas.width),
        randomizer(0, canvas.height),
        randomizer(0, 300),
        colors[Math.floor(randomizer(0, colors.length - 1))]
    );
    circleFactory(c);
};

// Balloon Animation Functions
const createBalloons = (balloons) => {
    for (let x = 0; x < 100; x++) {
        const c = new Circle(
            randomizer(0, canvas.width),
            randomizer(0, canvas.height),
            30,
            'purple'
        );
        balloons.push(c);
        console.log(`Balloon array count: ${balloons.length}`);
        draw(c);
    }
};

const moveBalloons = (balloonArray, distance, intervalObj, endless = false) => {
    console.log(`Moving balloons: ${balloonArray.length}`);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let x = 0; x < balloonArray.length - 1; x++) {
        balloonArray[x].y -= distance;
        
        if (balloonArray[x].y <= balloonArray[x].r) {
            if (endless) {
                balloonArray[x].y = canvas.height;
                balloonArray[x].x = randomizer(0 + balloonArray[x].r, canvas.width);
            } else {
                balloonArray.splice(x, 1); // Remove balloon when it reaches top
            }
        } else {
            draw(balloonArray[x]);
        }
        
        if (balloonArray.length === 1) {
            console.log('Canceling interval - all balloons gone');
            clearInterval(intervalObj);
        }
    }
};

class BalloonSeries {
    constructor(endless = false) {
        this.balloons = [];
        this.endless = endless;
        this.intervalObj = null;
    }
    
    start() {
        createBalloons(this.balloons);
        this.intervalObj = setInterval(
            () => moveBalloons(this.balloons, 2, this.intervalObj, this.endless),
            20
        );
    }
    
    stop() {
        if (this.intervalObj) {
            clearInterval(this.intervalObj);
            this.intervalObj = null;
        }
    }
}

// Animation Control
let intervalObj = null;

const stopInterval = () => {
    if (intervalObj) {
        clearInterval(intervalObj);
        intervalObj = null;
    }
    myMusic.stop();
};

const startInterval = () => {
    if (!intervalObj) {
        intervalObj = setInterval(() => psychoCircle(600, 300, 450), 10);
    }
};

// Event Listeners
const stopBtn = document.getElementById('stopBtn');
const startBtn = document.getElementById('startBtn');
const svgCircle = document.getElementById('svgCircle');

stopBtn.addEventListener('click', stopInterval);
startBtn.addEventListener('click', startInterval);
svgCircle.addEventListener('click', () => {
    alert('SVG circle clicked!');
});

// Initial Demo Circle
const initialCircle = new Circle(900, 300, 60, 'blue');
draw(initialCircle);

// Console welcome message
console.log('🎨 Balloonacy X loaded! Click Start Transmission to begin.');

// Export for potential use in other modules
export { Circle, circleFactory, randomizer, psychoCircle, universeCircle, BalloonSeries };

