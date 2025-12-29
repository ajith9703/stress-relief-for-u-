// ==================== GAME NAVIGATION ====================
function openGame(gameUrl) {
    // Add a smooth fade-out transition
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';

    // Navigate after fade completes
    setTimeout(() => {
        window.location.href = gameUrl;
    }, 300);
}

// ==================== CARD INTERACTIONS ====================
document.addEventListener('DOMContentLoaded', () => {
    const gameCards = document.querySelectorAll('.game-card');

    gameCards.forEach(card => {
        // Add click handler to entire card
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking the button directly (let button handle it)
            if (!e.target.closest('.play-btn')) {
                const button = card.querySelector('.play-btn');
                button.click();
            }
        });

        // Add subtle parallax effect on mouse move
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `translateY(-10px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // Add entrance animation
    animateCardsOnLoad();
});

// ==================== ENTRANCE ANIMATIONS ====================
function animateCardsOnLoad() {
    const gameCards = document.querySelectorAll('.game-card');

    gameCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';

        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 + (index * 150));
    });
}

// ==================== KEYBOARD NAVIGATION ====================
document.addEventListener('keydown', (e) => {
    if (e.key === '1') {
        openGame('index.html');
    } else if (e.key === '2') {
        openGame('meditation.html');
    }
});

// ==================== ADD STARFIELD BACKGROUND ====================
function createStarfield() {
    const starfield = document.createElement('div');
    starfield.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
    `;

    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        const size = Math.random() * 3;
        const duration = 3 + Math.random() * 5;

        star.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: white;
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            opacity: ${0.3 + Math.random() * 0.7};
            animation: twinkle ${duration}s ease-in-out infinite;
            animation-delay: ${Math.random() * 3}s;
        `;

        starfield.appendChild(star);
    }

    document.body.appendChild(starfield);
}

// Add twinkle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes twinkle {
        0%, 100% {
            opacity: 0.3;
            transform: scale(1);
        }
        50% {
            opacity: 1;
            transform: scale(1.2);
        }
    }
`;
document.head.appendChild(style);

// Create starfield on load
createStarfield();
