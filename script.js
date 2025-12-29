// ==================== CONFIGURATION ====================
const CONFIG = {
    GRID_SIZE: 100, // Number of bubbles
    MESSAGES: {
        milestones: {
            10: "Great start, Aaru! Keep going! 💜",
            25: "You're doing amazing! ✨",
            50: "Halfway there! You're relieving so much stress! 🌟",
            75: "Almost done! Keep popping! 💫",
            90: "Just a few more! You've got this! 🎉",
            100: "All bubbles popped! You're a star, Aaru! 🌸💜"
        },
        encouragements: [
            "Each pop brings you peace 🌙",
            "Breathe and relax, Aaru 💜",
            "You're doing wonderfully! ✨",
            "Feel the stress melting away 🌊",
            "Keep going, you're amazing! 💫"
        ]
    }
};

// ==================== STATE ====================
let state = {
    poppedCount: 0,
    totalBubbles: CONFIG.GRID_SIZE,
    bubbles: []
};

// ==================== DOM ELEMENTS ====================
const elements = {
    bubbleGrid: document.getElementById('bubbleGrid'),
    poppedCount: document.getElementById('popped-count'),
    remainingCount: document.getElementById('remaining-count'),
    resetBtn: document.getElementById('resetBtn'),
    motivationalMessage: document.getElementById('motivationalMessage')
};

// ==================== INITIALIZATION ====================
function init() {
    createBubbles();
    updateStats();
    setupEventListeners();
}

// ==================== BUBBLE CREATION ====================
function createBubbles() {
    elements.bubbleGrid.innerHTML = '';
    state.bubbles = [];
    
    for (let i = 0; i < CONFIG.GRID_SIZE; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.dataset.index = i;
        bubble.style.setProperty('--bubble-index', i);
        
        bubble.addEventListener('click', () => popBubble(bubble, i));
        
        elements.bubbleGrid.appendChild(bubble);
        state.bubbles.push({
            element: bubble,
            popped: false
        });
    }
}

// ==================== POP BUBBLE ====================
function popBubble(bubbleElement, index) {
    if (state.bubbles[index].popped) return;
    
    // Mark as popped
    state.bubbles[index].popped = true;
    bubbleElement.classList.add('popped');
    
    // Play pop sound
    playPopSound();
    
    // Create particles effect
    createParticles(bubbleElement);
    
    // Update count
    state.poppedCount++;
    updateStats();
    
    // Check for milestone messages
    checkMilestone(state.poppedCount);
    
    // Show random encouragement occasionally
    if (state.poppedCount % 15 === 0 && state.poppedCount < CONFIG.GRID_SIZE) {
        showRandomEncouragement();
    }
}

// ==================== STATS UPDATE ====================
function updateStats() {
    const remaining = CONFIG.GRID_SIZE - state.poppedCount;
    
    // Animate number change
    animateValue(elements.poppedCount, parseInt(elements.poppedCount.textContent) || 0, state.poppedCount, 300);
    animateValue(elements.remainingCount, parseInt(elements.remainingCount.textContent) || 0, remaining, 300);
}

function animateValue(element, start, end, duration) {
    const startTime = performance.now();
    const difference = end - start;
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.floor(start + (difference * easeOutQuad(progress)));
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function easeOutQuad(t) {
    return t * (2 - t);
}

// ==================== MESSAGES ====================
function checkMilestone(count) {
    const message = CONFIG.MESSAGES.milestones[count];
    if (message) {
        showMessage(message);
    }
}

function showRandomEncouragement() {
    const messages = CONFIG.MESSAGES.encouragements;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    showMessage(randomMessage);
}

function showMessage(text) {
    elements.motivationalMessage.textContent = text;
    elements.motivationalMessage.classList.add('show');
    
    setTimeout(() => {
        elements.motivationalMessage.classList.remove('show');
    }, 3000);
}

// ==================== PARTICLE EFFECTS ====================
function createParticles(bubbleElement) {
    const rect = bubbleElement.getBoundingClientRect();
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = rect.left + rect.width / 2 + 'px';
        particle.style.top = rect.top + rect.height / 2 + 'px';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.borderRadius = '50%';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        particle.style.boxShadow = '0 0 10px currentColor';
        
        document.body.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / 8;
        const velocity = 50 + Math.random() * 50;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        
        particle.animate([
            {
                transform: 'translate(0, 0) scale(1)',
                opacity: 1
            },
            {
                transform: `translate(${tx}px, ${ty}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: 600,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }).onfinish = () => particle.remove();
    }
}

// ==================== SOUND EFFECTS ====================
function playPopSound() {
    // Create a simple pop sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// ==================== RESET FUNCTIONALITY ====================
function resetBubbles() {
    state.poppedCount = 0;
    createBubbles();
    updateStats();
    showMessage("Fresh bubbles for you, Aaru! 💜");
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    elements.resetBtn.addEventListener('click', resetBubbles);
}

// ==================== START APPLICATION ====================
// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Show welcome message after a short delay
setTimeout(() => {
    showMessage("Welcome, Aaru! Pop the bubbles to relieve stress 💜✨");
}, 500);
