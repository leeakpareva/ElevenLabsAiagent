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
    const hero = document.getElementById('landing-hero');
    const choiceMenu = document.getElementById('choice-menu');

    if (hero && choiceMenu) {
        // Fade out hero
        hero.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        hero.style.opacity = '0';
        hero.style.transform = 'scale(0.95)';

        setTimeout(() => {
            hero.style.display = 'none';
            choiceMenu.style.display = 'flex';
            choiceMenu.style.opacity = '0';

            setTimeout(() => {
                choiceMenu.style.transition = 'opacity 0.5s ease-out';
                choiceMenu.style.opacity = '1';
            }, 50);
        }, 500);
    } else {
        // Fallback - go directly to voice assistant
        window.location.href = '/';
    }
}

// Navigate to selected app
function goToApp(path) {
    const choiceMenu = document.getElementById('choice-menu');

    if (choiceMenu) {
        choiceMenu.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        choiceMenu.style.opacity = '0';
        choiceMenu.style.transform = 'scale(1.05)';

        setTimeout(() => {
            window.location.href = path;
        }, 500);
    } else {
        // Fallback - direct navigation
        window.location.href = path;
    }
}

// Enhanced scroll functionality
function initScrollButton() {
    const scrollBtn = document.getElementById('scrollDownBtn');
    const hero = document.getElementById('landing-hero');
    const choiceMenu = document.getElementById('choice-menu');

    if (scrollBtn) {
        // Show scroll button initially
        scrollBtn.classList.add('show');

        scrollBtn.addEventListener('click', () => {
            if (choiceMenu && choiceMenu.style.display === 'flex') {
                // On choice menu - scroll back to hero or provide navigation
                backToHero();
            } else {
                // On hero - go to choice menu
                enterApp();
            }
        });
    }

    // Update scroll button based on current view
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.id === 'choice-menu' && scrollBtn) {
                updateScrollButtonIcon();
            }
        });
    });

    if (choiceMenu) {
        observer.observe(choiceMenu, {
            attributes: true,
            attributeFilter: ['style']
        });
    }

    // Add scroll-based visibility
    window.addEventListener('scroll', updateScrollButtonVisibility);
}

// Update scroll button icon based on current view
function updateScrollButtonIcon() {
    const scrollBtn = document.getElementById('scrollDownBtn');
    const choiceMenu = document.getElementById('choice-menu');

    if (scrollBtn) {
        const isOnChoiceMenu = choiceMenu && choiceMenu.style.display === 'flex';
        const icon = scrollBtn.querySelector('svg polyline');

        if (isOnChoiceMenu) {
            // Change to up arrow
            icon.setAttribute('points', '18 15 12 9 6 15');
            scrollBtn.setAttribute('title', 'Back to start');
        } else {
            // Change to down arrow
            icon.setAttribute('points', '6 9 12 15 18 9');
            scrollBtn.setAttribute('title', 'Choose experience');
        }
    }
}

// Scroll-based visibility for button
function updateScrollButtonVisibility() {
    const scrollBtn = document.getElementById('scrollDownBtn');
    if (scrollBtn) {
        if (window.scrollY > 100) {
            scrollBtn.classList.add('show');
        } else {
            scrollBtn.classList.add('show'); // Always show for navigation
        }
    }
}

// Back to hero function
function backToHero() {
    const hero = document.getElementById('landing-hero');
    const choiceMenu = document.getElementById('choice-menu');

    if (hero && choiceMenu) {
        // Fade out choice menu
        choiceMenu.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        choiceMenu.style.opacity = '0';
        choiceMenu.style.transform = 'scale(0.95)';

        setTimeout(() => {
            choiceMenu.style.display = 'none';
            hero.style.display = 'flex';
            hero.style.opacity = '0';

            setTimeout(() => {
                hero.style.transition = 'opacity 0.5s ease-out';
                hero.style.opacity = '1';
                hero.style.transform = 'scale(1)';
                updateScrollButtonIcon();
            }, 50);
        }, 500);
    }
}

// Initialize scroll indicator
function initScrollIndicator() {
    const indicator = document.getElementById('pageScrollIndicator');
    const dots = document.querySelectorAll('.scroll-dot');
    const hero = document.getElementById('landing-hero');
    const choiceMenu = document.getElementById('choice-menu');

    // Show indicator when choice menu is visible
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.id === 'choice-menu') {
                updateScrollIndicator();
            }
        });
    });

    if (choiceMenu) {
        observer.observe(choiceMenu, {
            attributes: true,
            attributeFilter: ['style']
        });
    }

    // Add click handlers to dots
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const section = dot.getAttribute('data-section');
            navigateToSection(section);
        });
    });

    updateScrollIndicator();
}

// Update scroll indicator based on current view
function updateScrollIndicator() {
    const indicator = document.getElementById('pageScrollIndicator');
    const dots = document.querySelectorAll('.scroll-dot');
    const choiceMenu = document.getElementById('choice-menu');

    if (indicator) {
        const isOnChoiceMenu = choiceMenu && choiceMenu.style.display === 'flex';

        if (isOnChoiceMenu) {
            indicator.classList.add('show');
            // Update active dot
            dots.forEach(dot => {
                dot.classList.remove('active');
                if (dot.getAttribute('data-section') === 'choice') {
                    dot.classList.add('active');
                }
            });
        } else {
            indicator.classList.add('show'); // Keep visible for navigation
            // Update active dot
            dots.forEach(dot => {
                dot.classList.remove('active');
                if (dot.getAttribute('data-section') === 'hero') {
                    dot.classList.add('active');
                }
            });
        }
    }
}

// Navigate to specific section
function navigateToSection(section) {
    if (section === 'hero') {
        backToHero();
    } else if (section === 'choice') {
        enterApp();
    }
}

// Initialize particles, scroll button, and scroll indicator on load
window.addEventListener('DOMContentLoaded', () => {
    createParticles();
    initScrollButton();
    initScrollIndicator();
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