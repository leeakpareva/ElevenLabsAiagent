// Create floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random size
        const size = Math.random() * 3 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random horizontal position
        particle.style.left = Math.random() * 100 + '%';
        
        // Random animation delay
        particle.style.animationDelay = Math.random() * 10 + 's';
        
        // Random animation duration
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        
        particlesContainer.appendChild(particle);
    }
}

// Enter the main app
function enterApp() {
    // Add fade out animation
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '0';

    // Redirect after animation
    setTimeout(() => {
        window.location.href = '/elevenlabs';
    }, 500);
}

// Initialize particles on load
window.addEventListener('DOMContentLoaded', () => {
    createParticles();
});

// Add touch feedback for mobile
document.addEventListener('touchstart', (e) => {
    // Don't prevent default - allow normal touch behavior
});

// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Handle orientation changes
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        // Force viewport height recalculation
        document.body.style.height = window.innerHeight + 'px';
        setTimeout(() => {
            document.body.style.height = '100%';
        }, 100);
    }, 100);
});