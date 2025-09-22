// Global Burger Menu and About Modal
document.addEventListener('DOMContentLoaded', function() {
    createBurgerMenu();
    createAboutModal();
    initializeBurgerMenu();
});

// Create burger menu HTML
function createBurgerMenu() {
    const burgerMenu = document.createElement('div');
    burgerMenu.className = 'burger-menu';
    burgerMenu.id = 'burgerMenu';

    burgerMenu.innerHTML = `
        <div class="burger-toggle" id="burgerToggle">
            <div class="burger-line"></div>
            <div class="burger-line"></div>
            <div class="burger-line"></div>
        </div>
        <div class="burger-menu-content" id="burgerMenuContent">
            <div class="burger-menu-item" onclick="showAbout()">
                <div class="burger-menu-link">
                    About NAVADA
                </div>
            </div>
            <div class="burger-menu-item">
                <a href="/landing.html" class="burger-menu-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    Home
                </a>
            </div>
            <div class="burger-menu-item">
                <a href="/music" class="burger-menu-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 18V5l12-2v13"/>
                        <circle cx="6" cy="18" r="3"/>
                        <circle cx="18" cy="16" r="3"/>
                    </svg>
                    SYNTHARA
                </a>
            </div>
            <div class="burger-menu-item">
                <a href="/elevenlabs" class="burger-menu-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                        <line x1="12" x2="12" y1="19" y2="22"/>
                    </svg>
                    LESLIE
                </a>
            </div>
        </div>
    `;

    document.body.appendChild(burgerMenu);
}

// Create About modal HTML
function createAboutModal() {
    const aboutModal = document.createElement('div');
    aboutModal.className = 'about-modal';
    aboutModal.id = 'aboutModal';

    aboutModal.innerHTML = `
        <div class="about-modal-content">
            <div class="about-modal-header">
                <h2 class="about-modal-title">About NAVADA</h2>
                <button class="about-modal-close" id="aboutModalClose">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="about-modal-body">
                <p>Welcome to the <span class="about-highlight">future of musical creation</span>.</p>

                <h3>Revolutionizing Creative Expression</h3>
                <p>NAVADA represents a <strong>paradigm shift</strong> in how we conceive, create, and experience music. We're not just building tools – we're <span class="about-highlight">engineering the future</span> where artificial intelligence and human creativity converge to unlock unprecedented artistic possibilities.</p>

                <h3>Transforming the Music Industry</h3>
                <p>Our revolutionary AI-powered platform is <span class="about-highlight">democratizing music creation</span>, breaking down traditional barriers between imagination and reality. Whether you're a seasoned composer or someone who's never touched an instrument, NAVADA empowers you to manifest your musical visions with nothing more than your voice and imagination.</p>

                <h3>The Next Evolution of Creativity</h3>
                <p>We believe that <strong>creativity is the essence of human expression</strong>, and technology should amplify, not replace, our creative potential. NAVADA's advanced neural networks understand the nuances of musical emotion, enabling you to:</p>
                <ul style="margin: 1rem 0; padding-left: 1.5rem; color: var(--color-text-secondary);">
                    <li>Generate professional-quality compositions in seconds</li>
                    <li>Transform spoken ideas into full orchestral arrangements</li>
                    <li>Explore infinite musical possibilities without technical barriers</li>
                    <li>Collaborate with AI that understands artistic intent</li>
                </ul>

                <h3>Synthara - AI Music Agent</h3>
                <p style="font-style: italic; color: var(--color-accent-primary); margin-bottom: 1rem;">
                    "Your Intelligent Creative Partner in Music."
                </p>
                <p>Synthara's AI Music Agent is our flagship intelligent assistant designed for the next generation of artists, producers, and dreamers. It combines the precision of artificial intelligence with the soul of human creativity—functioning as your personal music creation partner that understands your artistic vision.</p>
                <p>The AI Music Agent goes beyond simple generation, offering intelligent conversation, adaptive learning, and contextual understanding of your creative needs. Whether you're seeking inspiration, refining compositions, or exploring new musical territories, the AI Music Agent provides personalized guidance and creates music that evolves with your artistic journey.</p>

                <h3>Shaping Tomorrow's Soundscape</h3>
                <p>We're not just creating music software – we're <span class="about-highlight">pioneering a new era</span> where human creativity and artificial intelligence dance together in perfect harmony. Every note generated, every melody crafted, and every composition born from NAVADA is a step toward a future where <strong>anyone can be a composer</strong>.</p>

                <h3>Join the Creative Revolution</h3>
                <p>NAVADA is more than a platform – it's a <span class="about-highlight">movement</span>. A community of creators, dreamers, and innovators who believe that the future of music lies not in limiting creativity, but in <strong>exponentially expanding it</strong>.</p>

                <p style="margin-top: 2rem; font-weight: 600; color: var(--color-accent-primary);">
                    The future of music is here. The future is NAVADA.
                </p>

                <p style="margin-top: 2rem; font-size: 0.875rem; text-align: center; color: var(--color-text-tertiary);">
                    Designed & Developed by Lee Akpareva MBA, MA
                </p>
            </div>
        </div>
    `;

    document.body.appendChild(aboutModal);
}

// Initialize burger menu functionality
function initializeBurgerMenu() {
    const burgerToggle = document.getElementById('burgerToggle');
    const burgerMenuContent = document.getElementById('burgerMenuContent');
    const aboutModal = document.getElementById('aboutModal');
    const aboutModalClose = document.getElementById('aboutModalClose');

    // Toggle burger menu
    if (burgerToggle) {
        burgerToggle.addEventListener('click', function() {
            burgerToggle.classList.toggle('active');
            burgerMenuContent.classList.toggle('active');
        });
    }

    // Close burger menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.burger-menu')) {
            burgerToggle.classList.remove('active');
            burgerMenuContent.classList.remove('active');
        }
    });

    // Close about modal
    if (aboutModalClose) {
        aboutModalClose.addEventListener('click', closeAbout);
    }

    // Close modal when clicking outside
    if (aboutModal) {
        aboutModal.addEventListener('click', function(event) {
            if (event.target === aboutModal) {
                closeAbout();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && aboutModal.classList.contains('active')) {
            closeAbout();
        }
    });
}

// Show About modal
function showAbout() {
    const aboutModal = document.getElementById('aboutModal');
    const burgerToggle = document.getElementById('burgerToggle');
    const burgerMenuContent = document.getElementById('burgerMenuContent');

    // Close burger menu
    burgerToggle.classList.remove('active');
    burgerMenuContent.classList.remove('active');

    // Show about modal
    aboutModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Close About modal
function closeAbout() {
    const aboutModal = document.getElementById('aboutModal');
    aboutModal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

// Add global footer to pages
function addGlobalFooter() {
    // Check if footer already exists
    if (document.querySelector('.global-footer')) {
        return;
    }

    const footer = document.createElement('footer');
    footer.className = 'global-footer';

    footer.innerHTML = `
        <div class="global-footer-content">
            <div class="global-footer-brand">
                <h3 class="global-footer-title">NAVADA</h3>
                <p class="global-footer-subtitle">Transforming the Future of Music Creation</p>
            </div>
            <div class="global-footer-links">
                <a href="#" class="global-footer-link" onclick="showAbout(); return false;">About NAVADA</a>
                <span class="global-footer-text">Designed & Developed by Lee Akpareva MBA, MA</span>
                <span class="global-footer-year">© 2024 NAVADA</span>
            </div>
        </div>
    `;

    document.body.appendChild(footer);
}

// Initialize footer on load
document.addEventListener('DOMContentLoaded', function() {
    // Only add footer if we're not on the landing page
    const isLandingPage = window.location.pathname === '/' || window.location.pathname.includes('landing.html');

    if (!isLandingPage) {
        // Add a small delay to ensure all content is loaded
        setTimeout(addGlobalFooter, 100);
    }
});