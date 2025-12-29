// ==================== CONFIGURATION ====================
const CONFIG = {
    SYMMETRY_POINTS: 6, // 6-point rotational symmetry
    LINE_WIDTH: 2,
    TRAIL_LENGTH: 30,
    COLORS: [
        '#4facfe', // Blue
        '#43e97b', // Green
        '#f093fb', // Pink
        '#feca57', // Yellow
        '#ff6b6b', // Red
        '#a55eea', // Purple
        '#48dbfb', // Cyan
        '#ff9ff3'  // Light Pink
    ]
};

// ==================== STATE ====================
let state = {
    canvas: null,
    ctx: null,
    isDrawing: false,
    lastX: null,
    lastY: null,
    currentColorIndex: 0,
    particles: [],
    animationFrame: null,
    hasDrawn: false
};

// ==================== DOM ELEMENTS ====================
const elements = {
    canvas: document.getElementById('canvas'),
    colorBtn: document.getElementById('colorBtn'),
    colorIndicator: document.getElementById('colorIndicator'),
    menuBtn: document.getElementById('menuBtn'),
    menu: document.getElementById('menu'),
    clearBtn: document.getElementById('clearBtn'),
    saveBtn: document.getElementById('saveBtn'),
    backBtn: document.getElementById('backBtn'),
    welcomeMessage: document.getElementById('welcomeMessage')
};

// ==================== INITIALIZATION ====================
function init() {
    setupCanvas();
    setupEventListeners();
    updateColorIndicator();

    // Hide welcome message after first draw or 5 seconds
    setTimeout(() => {
        if (!state.hasDrawn) {
            hideWelcomeMessage();
        }
    }, 5000);

    // Start animation loop
    animate();
}

// ==================== CANVAS SETUP ====================
function setupCanvas() {
    state.canvas = elements.canvas;
    state.ctx = state.canvas.getContext('2d');

    // Set canvas size to window size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Set initial drawing properties
    state.ctx.lineCap = 'round';
    state.ctx.lineJoin = 'round';
    state.ctx.lineWidth = CONFIG.LINE_WIDTH;
}

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    state.canvas.width = window.innerWidth * dpr;
    state.canvas.height = window.innerHeight * dpr;
    state.canvas.style.width = window.innerWidth + 'px';
    state.canvas.style.height = window.innerHeight + 'px';
    state.ctx.scale(dpr, dpr);

    // Reapply drawing properties after resize
    state.ctx.lineCap = 'round';
    state.ctx.lineJoin = 'round';
    state.ctx.lineWidth = CONFIG.LINE_WIDTH;
}

// ==================== DRAWING FUNCTIONS ====================
function startDrawing(e) {
    state.isDrawing = true;
    const pos = getMousePos(e);
    state.lastX = pos.x;
    state.lastY = pos.y;

    if (!state.hasDrawn) {
        state.hasDrawn = true;
        hideWelcomeMessage();
    }
}

function draw(e) {
    if (!state.isDrawing) return;

    const pos = getMousePos(e);
    const currentX = pos.x;
    const currentY = pos.y;

    // Calculate velocity for varying line width
    const dx = currentX - state.lastX;
    const dy = currentY - state.lastY;
    const velocity = Math.sqrt(dx * dx + dy * dy);

    // Draw smooth bezier curves instead of straight lines
    drawSymmetricalBezier(state.lastX, state.lastY, currentX, currentY, velocity);

    // Create particles for trail effect
    createParticle(currentX, currentY);

    state.lastX = currentX;
    state.lastY = currentY;
}

function stopDrawing() {
    state.isDrawing = false;
}

function drawSymmetricalBezier(x1, y1, x2, y2, velocity) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const color = CONFIG.COLORS[state.currentColorIndex];

    // Calculate control points for smooth curves
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Add perpendicular offset for silk wave effect
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length < 1) return; // Skip very small movements

    // Perpendicular direction
    const perpX = -dy / length;
    const perpY = dx / length;

    // Wave amplitude based on velocity
    const amplitude = Math.min(velocity * 0.5, 50);

    const cpX = midX + perpX * amplitude;
    const cpY = midY + perpY * amplitude;

    for (let i = 0; i < CONFIG.SYMMETRY_POINTS; i++) {
        const angle = (Math.PI * 2 * i) / CONFIG.SYMMETRY_POINTS;

        // Rotate points around center
        const rotatedStart = rotatePoint(x1, y1, centerX, centerY, angle);
        const rotatedEnd = rotatePoint(x2, y2, centerX, centerY, angle);
        const rotatedCP = rotatePoint(cpX, cpY, centerX, centerY, angle);

        // Draw smooth bezier curve
        drawBezierCurve(
            rotatedStart.x, rotatedStart.y,
            rotatedCP.x, rotatedCP.y,
            rotatedEnd.x, rotatedEnd.y,
            color,
            Math.max(1, CONFIG.LINE_WIDTH - velocity * 0.1)
        );
    }
}

function drawSymmetricalLines(x1, y1, x2, y2) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const color = CONFIG.COLORS[state.currentColorIndex];

    for (let i = 0; i < CONFIG.SYMMETRY_POINTS; i++) {
        const angle = (Math.PI * 2 * i) / CONFIG.SYMMETRY_POINTS;

        // Rotate points around center
        const rotatedStart = rotatePoint(x1, y1, centerX, centerY, angle);
        const rotatedEnd = rotatePoint(x2, y2, centerX, centerY, angle);

        // Draw line with gradient
        drawLine(rotatedStart.x, rotatedStart.y, rotatedEnd.x, rotatedEnd.y, color);
    }
}

function rotatePoint(x, y, cx, cy, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const nx = cos * (x - cx) - sin * (y - cy) + cx;
    const ny = sin * (x - cx) + cos * (y - cy) + cy;
    return { x: nx, y: ny };
}


function drawBezierCurve(x1, y1, cpX, cpY, x2, y2, color, lineWidth) {
    state.ctx.beginPath();
    state.ctx.moveTo(x1, y1);
    state.ctx.quadraticCurveTo(cpX, cpY, x2, y2);

    // Create gradient for silky effect
    const gradient = state.ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, color + '60'); // More transparent at start
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, color + '40'); // Transparent at end for fade

    state.ctx.strokeStyle = gradient;
    state.ctx.lineWidth = lineWidth;
    state.ctx.stroke();
}


// ==================== PARTICLES ====================
function createParticle(x, y) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const color = CONFIG.COLORS[state.currentColorIndex];

    for (let i = 0; i < CONFIG.SYMMETRY_POINTS; i++) {
        const angle = (Math.PI * 2 * i) / CONFIG.SYMMETRY_POINTS;
        const rotated = rotatePoint(x, y, centerX, centerY, angle);

        state.particles.push({
            x: rotated.x,
            y: rotated.y,
            color: color,
            alpha: 0.8,
            size: 3,
            life: CONFIG.TRAIL_LENGTH
        });
    }

    // Limit particle count for performance
    if (state.particles.length > 1000) {
        state.particles = state.particles.slice(-1000);
    }
}

function updateParticles() {
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.life--;
        p.alpha = p.life / CONFIG.TRAIL_LENGTH * 0.8;

        if (p.life <= 0) {
            state.particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    state.particles.forEach(p => {
        state.ctx.beginPath();
        state.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        state.ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, '0');
        state.ctx.fill();
    });
}

// ==================== ANIMATION LOOP ====================
function animate() {
    updateParticles();
    drawParticles();
    state.animationFrame = requestAnimationFrame(animate);
}

// ==================== COLOR CONTROL ====================
function changeColor() {
    state.currentColorIndex = (state.currentColorIndex + 1) % CONFIG.COLORS.length;
    updateColorIndicator();
}

function updateColorIndicator() {
    elements.colorIndicator.style.background = CONFIG.COLORS[state.currentColorIndex];
}

// ==================== MENU CONTROLS ====================
function toggleMenu() {
    elements.menu.classList.toggle('hidden');
}

function clearCanvas() {
    state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
    state.particles = [];
    elements.menu.classList.add('hidden');
}

function saveCanvas() {
    const link = document.createElement('a');
    link.download = `aaru-silk-art-${Date.now()}.png`;
    link.href = state.canvas.toDataURL();
    link.click();
    elements.menu.classList.add('hidden');
}

function goBackToMenu() {
    window.location.href = 'menu.html';
}

function hideWelcomeMessage() {
    elements.welcomeMessage.classList.add('hidden');
}

// ==================== UTILITY FUNCTIONS ====================
function getMousePos(e) {
    const rect = state.canvas.getBoundingClientRect();

    // Handle both mouse and touch events
    const clientX = e.clientX !== undefined ? e.clientX : e.touches[0].clientX;
    const clientY = e.clientY !== undefined ? e.clientY : e.touches[0].clientY;

    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Drawing events - Mouse
    state.canvas.addEventListener('mousedown', startDrawing);
    state.canvas.addEventListener('mousemove', draw);
    state.canvas.addEventListener('mouseup', stopDrawing);
    state.canvas.addEventListener('mouseout', stopDrawing);

    // Drawing events - Touch
    state.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrawing(e);
    });
    state.canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw(e);
    });
    state.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        stopDrawing();
    });

    // Control buttons
    elements.colorBtn.addEventListener('click', changeColor);
    elements.menuBtn.addEventListener('click', toggleMenu);
    elements.clearBtn.addEventListener('click', clearCanvas);
    elements.saveBtn.addEventListener('click', saveCanvas);
    elements.backBtn.addEventListener('click', goBackToMenu);

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!elements.menu.classList.contains('hidden') &&
            !elements.menu.contains(e.target) &&
            !elements.menuBtn.contains(e.target)) {
            elements.menu.classList.add('hidden');
        }
    });
}

// ==================== START APPLICATION ====================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
