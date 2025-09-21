// Global Theme Management
class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        this.initializeTheme();
        this.createGlobalToggle();
        this.setupToggleListeners();
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');

        document.documentElement.setAttribute('data-theme', theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Trigger custom event for other components to listen to
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
    }

    createGlobalToggle() {
        // Skip creating toggle on ElevenLabs page
        if (window.location.pathname === '/elevenlabs' || window.location.pathname.includes('elevenlabs')) {
            return;
        }

        // Remove any existing global toggle
        const existingToggle = document.querySelector('.global-theme-toggle-container');
        if (existingToggle) {
            existingToggle.remove();
        }

        // Create new global theme toggle with landing page design
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'global-theme-toggle-container';

        const toggle = document.createElement('div');
        toggle.className = 'ai-theme-toggle global-theme-toggle';
        toggle.title = 'Toggle dark/light mode';
        toggle.innerHTML = `
            <div class="ai-theme-toggle-slider">
                <svg class="ai-theme-toggle-icon ai-theme-toggle-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="5"/>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
                <svg class="ai-theme-toggle-icon ai-theme-toggle-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
            </div>
        `;

        toggleContainer.appendChild(toggle);

        document.body.appendChild(toggleContainer);
    }

    setupToggleListeners() {
        // Add click listeners to all theme toggles on the page
        document.addEventListener('click', (e) => {
            if (e.target.closest('.ai-theme-toggle') || e.target.closest('.global-theme-toggle')) {
                this.toggleTheme();
            }
        });
    }

    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}