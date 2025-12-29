// ==================== CONFIGURATION ====================
const CONFIG = {
    MEDITATION_DURATION: 60, // seconds
    STARS_COUNT: 200,
    BUBBLE_START_SIZE: 400, // pixels
    BUBBLE_END_SIZE: 20, // pixels
    BREATHING_PROMPTS: [
        { time: 0, text: 'Take a deep breath in....' },
        { time: 10, text: '....and let that thought go' },
        { time: 25, text: '' }, // No text for a while
        { time: 40, text: 'Just relax and let it go' }
    ]
};

// ==================== STATE ====================
let state = {
    currentScreen: 'start',
    meditationTimer: null,
    startTime: null,
    userWorry: '',
    stars: [],
    animationFrame: null,
    backgroundMusic: null,
    currentPromptIndex: 0
};

// ==================== DOM ELEMENTS ====================
const elements = {
    // Screens
    startScreen: document.getElementById('startScreen'),
    meditationScreen: document.getElementById('meditationScreen'),
    endScreen: document.getElementById('endScreen'),

    // Start screen
    worryInput: document.getElementById('worryInput'),
    startBtn: document.getElementById('startBtn'),

    // Meditation screen
    starsCanvas: document.getElementById('starsCanvas'),
    thoughtBubble: document.getElementById('thoughtBubble'),
    thoughtText: document.getElementById('thoughtText'),
    timerDisplay: document.getElementById('timerDisplay'),
    breathingPrompt: document.getElementById('breathingPrompt'),

    // End screen
    restartBtn: document.getElementById('restartBtn'),
    backBtn: document.getElementById('backBtn')
};

// ==================== INITIALIZATION ====================
function init() {
    setupCanvas();
    createStars();
    setupEventListeners();
    setupBackgroundMusic();
    // Focus input on load
    elements.worryInput.focus();
}

// ==================== SCREEN TRANSITIONS ====================
function showScreen(screenName) {
    elements.startScreen.classList.add('hidden');
    elements.meditationScreen.classList.add('hidden');
    elements.endScreen.classList.add('hidden');

    switch (screenName) {
        case 'start':
            elements.startScreen.classList.remove('hidden');
            break;
        case 'meditation':
            elements.meditationScreen.classList.remove('hidden');
            break;
        case 'end':
            elements.endScreen.classList.remove('hidden');
            break;
    }

    state.currentScreen = screenName;
}

// ==================== CANVAS & STARS ====================
function setupCanvas() {
    const canvas = elements.starsCanvas;
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    state.ctx = ctx;
}

function createStars() {
    state.stars = [];
    for (let i = 0; i < CONFIG.STARS_COUNT; i++) {
        state.stars.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            radius: Math.random() * 2,
            alpha: Math.random(),
            twinkleSpeed: Math.random() * 0.02 + 0.01
        });
    }
}

function drawStars() {
    const ctx = state.ctx;
    ctx.clearRect(0, 0, elements.starsCanvas.width, elements.starsCanvas.height);

    state.stars.forEach(star => {
        // Twinkle effect
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 1 || star.alpha < 0.3) {
            star.twinkleSpeed *= -1;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();

        // Glow effect for larger stars
        if (star.radius > 1.5) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        } else {
            ctx.shadowBlur = 0;
        }
    });
}

function animateStars() {
    drawStars();
    state.animationFrame = requestAnimationFrame(animateStars);
}

// ==================== MEDITATION FLOW ====================
function startMeditation() {
    const worry = elements.worryInput.value.trim();

    if (!worry) {
        elements.worryInput.classList.add('shake');
        setTimeout(() => elements.worryInput.classList.remove('shake'), 500);
        return;
    }

    state.userWorry = worry;
    elements.thoughtText.textContent = worry;

    // Show meditation screen
    showScreen('meditation');

    // Start star animation
    animateStars();

    // Initialize bubble size
    elements.thoughtBubble.style.width = CONFIG.BUBBLE_START_SIZE + 'px';
    elements.thoughtBubble.style.height = CONFIG.BUBBLE_START_SIZE + 'px';

    // Play background music
    if (state.backgroundMusic) {
        state.backgroundMusic.play();
    }

    // Start timer
    state.startTime = Date.now();
    runMeditationTimer();
}

function runMeditationTimer() {
    const updateTimer = () => {
        const elapsed = (Date.now() - state.startTime) / 1000;
        const remaining = Math.max(0, CONFIG.MEDITATION_DURATION - elapsed);

        // Update timer display
        elements.timerDisplay.textContent = Math.ceil(remaining);

        // Update breathing prompts based on time
        updateBreathingPrompt(elapsed);

        // Calculate progress (0 to 1)
        const progress = Math.min(elapsed / CONFIG.MEDITATION_DURATION, 1);

        // Animate bubble shrinking
        const currentSize = CONFIG.BUBBLE_START_SIZE - (CONFIG.BUBBLE_START_SIZE - CONFIG.BUBBLE_END_SIZE) * easeInOutCubic(progress);
        elements.thoughtBubble.style.width = currentSize + 'px';
        elements.thoughtBubble.style.height = currentSize + 'px';

        // Fade out text as bubble shrinks
        const textOpacity = 1 - (progress * 0.7);
        elements.thoughtText.style.opacity = textOpacity;

        // Fade out bubble at the end
        if (progress > 0.9) {
            const fadeProgress = (progress - 0.9) / 0.1;
            elements.thoughtBubble.style.opacity = 1 - fadeProgress;
        }

        // Continue or end
        if (remaining > 0) {
            state.meditationTimer = requestAnimationFrame(updateTimer);
        } else {
            endMeditation();
        }
    };

    updateTimer();
}

function updateBreathingPrompt(elapsed) {
    // Find the appropriate prompt based on elapsed time
    for (let i = CONFIG.BREATHING_PROMPTS.length - 1; i >= 0; i--) {
        if (elapsed >= CONFIG.BREATHING_PROMPTS[i].time) {
            if (state.currentPromptIndex !== i) {
                state.currentPromptIndex = i;
                const promptText = CONFIG.BREATHING_PROMPTS[i].text;
                elements.breathingPrompt.textContent = promptText;

                // Fade in/out animation
                elements.breathingPrompt.style.opacity = '0';
                setTimeout(() => {
                    elements.breathingPrompt.style.opacity = '1';
                }, 50);
            }
            break;
        }
    }
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function endMeditation() {
    // Stop animations
    if (state.meditationTimer) {
        cancelAnimationFrame(state.meditationTimer);
    }
    if (state.animationFrame) {
        cancelAnimationFrame(state.animationFrame);
    }

    // Reset bubble opacity for next time
    elements.thoughtBubble.style.opacity = 1;

    // Show end screen
    showScreen('end');
}

// ==================== RESTART & NAVIGATION ====================
function restartMeditation() {
    // Reset input
    elements.worryInput.value = '';

    // Show start screen
    showScreen('start');

    // Focus input
    setTimeout(() => elements.worryInput.focus(), 300);
}

function goBackToMenu() {
    // Navigate to main menu
    window.location.href = 'menu.html';
}

// ==================== BACKGROUND MUSIC ====================
function setupBackgroundMusic() {
    // Create audio element for background music
    state.backgroundMusic = new Audio('aaru.mp3');
    state.backgroundMusic.loop = true;
    state.backgroundMusic.volume = 0.5; // 50% volume

    // Pre-load the audio
    state.backgroundMusic.load();
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Start button
    elements.startBtn.addEventListener('click', startMeditation);

    // Enter key on input
    elements.worryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startMeditation();
        }
    });

    // Input validation
    elements.worryInput.addEventListener('input', () => {
        const hasText = elements.worryInput.value.trim().length > 0;
        elements.startBtn.disabled = !hasText;
    });

    // End screen buttons
    elements.restartBtn.addEventListener('click', restartMeditation);
    elements.backBtn.addEventListener('click', goBackToMenu);

    // Resize handler for stars
    window.addEventListener('resize', () => {
        createStars();
    });
}

// ==================== START APPLICATION ====================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Add shake animation CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    .shake {
        animation: shake 0.3s ease-in-out;
    }
`;
document.head.appendChild(style);
